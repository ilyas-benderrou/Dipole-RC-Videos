import data from '../data/scenes.json';
import timings from '../data/timings.json';
import {FPS} from '../theme';

export const TITLE_FRAMES = FPS; // titre de la vidéo : 1 s
const MIN_M_SECONDS = 60.5;

type Anchor = {c: number; t: number};
type SceneSpec = {id: string; maintien: number; ecran: string; voix: string};
export type VideoId = keyof typeof data.videos;

export type Scene = {
  id: string;
  video: string;
  /** Première image de la scène dans la vidéo. */
  from: number;
  /** Durée de la scène : voix + maintien. */
  frames: number;
  voiceFrames: number;
  text: string;
  /** Image (relative au début de la scène) où le passage `needle` commence (ou se termine) dans la voix. */
  at: (needle: string, opts?: {end?: boolean; nth?: number}) => number;
};

const T = timings as Record<string, {dur: number; anchors: Anchor[]}>;

const charTime = (anchors: Anchor[], c: number) => {
  for (let k = 1; k < anchors.length; k++) {
    const a = anchors[k - 1];
    const b = anchors[k];
    if (c <= b.c) return b.c === a.c ? a.t : a.t + ((c - a.c) / (b.c - a.c)) * (b.t - a.t);
  }
  return anchors.at(-1)!.t;
};

export const plan = (video: VideoId) => {
  const v = data.videos[video];
  let from = TITLE_FRAMES;
  const scenes: Scene[] = (v.scenes as SceneSpec[]).map((s) => {
    const t = T[s.id];
    if (!t) throw new Error(`Voix manquante : ${s.id}`);
    const frames = Math.ceil((t.dur + s.maintien) * FPS);
    const scene: Scene = {
      id: s.id,
      video,
      from,
      frames,
      voiceFrames: Math.ceil(t.dur * FPS),
      text: s.voix,
      at: (needle, opts = {}) => {
        let idx = -1;
        for (let n = 0; n <= (opts.nth ?? 0); n++) idx = s.voix.indexOf(needle, idx + 1);
        if (idx < 0) throw new Error(`« ${needle} » introuvable dans ${s.id}`);
        return Math.round(charTime(t.anchors, opts.end ? idx + needle.length : idx) * FPS);
      },
    };
    from += frames;
    return scene;
  });
  // Micro-vidéos M : 60 s minimum. L'encadré « À retenir » final reste affiché plus longtemps si besoin.
  const min = video.startsWith('M') ? Math.ceil(MIN_M_SECONDS * FPS) : 0;
  if (from < min) {
    scenes[scenes.length - 1].frames += min - from;
    from = min;
  }
  return {id: video, titre: v.titre, scenes, total: from};
};
