// Lit les tableaux de VIDEOS_SPEC.md → src/data/scenes.json (une entrée par scène = une piste audio).
//   node scripts/parse-spec.mjs
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const md = readFileSync('VIDEOS_SPEC.md', 'utf8');
const style = md.match(/Style de voix \(TTS\)\s*\|\s*«\s*([\s\S]*?)\s*»/)[1];
const accent = md.match(/Accent \(TTS\)\s*\|\s*«\s*([\s\S]*?)\s*»/)[1];

const videos = {};
let current = null;
for (const line of md.split(/\r?\n/)) {
  const h = line.match(/^#{3,4} ((?:V0|L\d|M\d)) — (.+?)(?: \(cible .*\))?$/);
  if (h) {
    current = h[1];
    videos[current] = {id: current, titre: h[2].trim(), scenes: []};
    continue;
  }
  const row = line.match(/^\| ((?:V0|L\d|M\d)-S\d+) \| ([\d,.]+) s \| (.*) \| (.*) \|$/);
  if (row && current) {
    videos[current].scenes.push({id: row[1], maintien: Number(row[2].replace(',', '.')), ecran: row[3].trim(), voix: row[4].trim()});
  }
}

// Titres affichés : « L1 — Le condensateur (C1) » → « Le condensateur » ; M : texte entre guillemets.
for (const v of Object.values(videos)) v.titre = v.titre.replace(/\s*\((?:C\d[, C\d]*|erreur E\d)\)\s*$/, '').replace(/^«\s*|\s*»$/g, '');

mkdirSync('src/data', {recursive: true});
writeFileSync('src/data/scenes.json', JSON.stringify({style, accent, videos}, null, 2));
for (const v of Object.values(videos)) console.log(`${v.id.padEnd(3)} ${String(v.scenes.length).padStart(2)} scènes · ${v.titre}`);
