// Images clés d'une vidéo pour contrôle visuel : début de chaque scène + fractions de scène.
//   node scripts/frames.mjs V0 0.3,0.7   → liste « scène:image »
import {readFileSync} from 'node:fs';

const {videos} = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));
const T = JSON.parse(readFileSync('src/data/timings.json', 'utf8'));
const [vid, fr = '0.5'] = process.argv.slice(2);
const fracs = fr.split(',').map(Number);
let from = 30;
const v = videos[vid];
const out = [];
v.scenes.forEach((s, k) => {
  let frames = Math.ceil((T[s.id].dur + s.maintien) * 30);
  if (k === v.scenes.length - 1 && vid.startsWith('M')) frames = Math.max(frames, Math.ceil(60.5 * 30) - from);
  for (const f of fracs) out.push(`${s.id}:${from + Math.floor(frames * f)}`);
  from += frames;
});
console.log(out.join(' '));
