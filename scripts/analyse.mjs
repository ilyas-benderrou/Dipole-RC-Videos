// Calage des animations sur la voix : pour chaque piste, les pauses détectées (ffmpeg silencedetect)
// sont alignées sur la ponctuation du texte ; entre deux repères, le temps est interpolé au prorata
// des caractères. Sortie : src/data/timings.json (lu par les compositions Remotion).
//   node scripts/analyse.mjs
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {wavDuration} from './gemini-common.mjs';

const {videos} = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));

const silences = (file) => {
  const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-'], {
    encoding: 'utf8',
  }).stderr;
  const out = [];
  let start = null;
  for (const line of log.split(/\r?\n/)) {
    const s = line.match(/silence_start: (-?[\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (s) start = Math.max(0, parseFloat(s[1]));
    if (e && start !== null) {
      out.push({start, end: parseFloat(e[1])});
      start = null;
    }
  }
  return {out, ouverte: start};
};

/** Alignement ordonné (programmation dynamique) des frontières de ponctuation sur les pauses. */
const aligner = (est, pauses, saut) => {
  const K = est.length;
  const P = pauses.length;
  const dp = Array.from({length: K + 1}, () => new Array(P + 1).fill(Infinity));
  const ch = Array.from({length: K + 1}, () => new Array(P + 1).fill(null));
  dp[0].fill(0);
  for (let k = 0; k < K; k++) {
    for (let j = 0; j <= P; j++) {
      if (dp[k][j] === Infinity) continue;
      if (dp[k][j] + saut[k] < dp[k + 1][j]) {
        dp[k + 1][j] = dp[k][j] + saut[k];
        ch[k + 1][j] = {from: j, pause: -1};
      }
      for (let i = j; i < P; i++) {
        const mid = (pauses[i].start + pauses[i].end) / 2;
        const c = Math.abs(mid - est[k]) - 0.6 * (pauses[i].end - pauses[i].start);
        if (Math.abs(mid - est[k]) > 2.5) continue;
        if (dp[k][j] + c < dp[k + 1][i + 1]) {
          dp[k + 1][i + 1] = dp[k][j] + c;
          ch[k + 1][i + 1] = {from: j, pause: i};
        }
      }
    }
  }
  let j = dp[K].indexOf(Math.min(...dp[K]));
  const res = new Array(K).fill(-1);
  for (let k = K; k > 0; k--) {
    const c = ch[k][j];
    res[k - 1] = c.pause;
    j = c.from;
  }
  return res;
};

const timings = {};
for (const v of Object.values(videos)) {
  for (const s of v.scenes) {
    const file = `public/audio/${v.id}/${s.id}.wav`;
    if (!existsSync(file)) continue;
    const dur = wavDuration(readFileSync(file));
    const {out, ouverte} = silences(file);
    const speechStart = out.length && out[0].start < 0.05 ? out[0].end : 0;
    const speechEnd = ouverte !== null ? ouverte : out.length && out.at(-1).end > dur - 0.05 ? out.at(-1).start : dur;
    const pauses = out.filter((p) => p.start > speechStart + 0.05 && p.end < speechEnd - 0.05);
    const text = s.voix;
    // Frontières : après chaque signe de ponctuation suivi d'un espace.
    const bounds = [];
    for (const m of text.matchAll(/[.,;:!?…]+\s+/g)) bounds.push({punct: m.index, next: m.index + m[0].length, fort: /[.:!?…]/.test(m[0])});
    const lenParle = text.length;
    const est = bounds.map((b) => speechStart + ((b.punct + 0.5) / lenParle) * (speechEnd - speechStart));
    const choix = aligner(
      est,
      pauses,
      bounds.map((b) => (b.fort ? 1.2 : 0.4)),
    );
    const anchors = [{c: 0, t: speechStart}];
    bounds.forEach((b, k) => {
      if (choix[k] < 0) return;
      anchors.push({c: b.punct + 1, t: pauses[choix[k]].start});
      anchors.push({c: b.next, t: pauses[choix[k]].end});
    });
    anchors.push({c: text.length, t: speechEnd});
    timings[s.id] = {dur: Math.round(dur * 1000) / 1000, anchors: anchors.map((a) => ({c: a.c, t: Math.round(a.t * 1000) / 1000}))};
  }
}
writeFileSync('src/data/timings.json', JSON.stringify(timings, null, 1));
for (const v of Object.values(videos)) {
  const ok = v.scenes.filter((s) => timings[s.id]);
  const total = 1 + ok.reduce((a, s) => a + timings[s.id].dur + s.maintien, 0);
  console.log(`${v.id.padEnd(3)} ${ok.length}/${v.scenes.length} pistes · durée prévue ${total.toFixed(1)} s`);
}
