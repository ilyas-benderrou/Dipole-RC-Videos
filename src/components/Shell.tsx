import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ramp} from '../lib/anim';
import {plan, Scene, TITLE_FRAMES, VideoId} from '../lib/timing';
import {C, inter} from '../theme';

/**
 * Habillage commun : titre de la vidéo pendant 1 s, puis les scènes (une piste audio chacune).
 * `render(scene)` dessine le contenu d'une scène ; `persistent` (facultatif) dessine un écran
 * qui se construit sur toute la vidéo (leçons L1 à L5) à partir de l'image globale.
 */
export const Shell: React.FC<{
  video: VideoId;
  label?: string;
  render?: (scene: Scene) => React.ReactNode;
  persistent?: (frame: number, scenes: Scene[]) => React.ReactNode;
  header?: boolean;
}> = ({video, label, render, persistent, header = true}) => {
  const p = plan(video);
  const frame = useCurrentFrame();
  const titleOut = 1 - ramp(frame, TITLE_FRAMES - 8, 8);
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: inter, color: C.ink}}>
      {p.scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
          <Audio src={staticFile(`audio/${s.video}/${s.id}.wav`)} />
          {render ? render(s) : null}
        </Sequence>
      ))}
      {persistent && frame >= TITLE_FRAMES ? persistent(frame, p.scenes) : null}
      {header && frame >= TITLE_FRAMES ? (
        <div style={{position: 'absolute', left: 64, top: 36, fontSize: 28, color: C.dim, fontWeight: 600, letterSpacing: 0.3}}>
          {label ?? video} · {p.titre}
        </div>
      ) : null}
      {frame < TITLE_FRAMES ? (
        <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center', opacity: titleOut}}>
          <div style={{fontSize: 34, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 18}}>{label ?? video}</div>
          <div style={{fontSize: 76, fontWeight: 800, textAlign: 'center', maxWidth: 1600, lineHeight: 1.15}}>{p.titre}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
