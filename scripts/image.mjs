// Génère les images « réelles » avec Nano Banana (gemini-2.5-flash-image), faute de clé Pixabay.
//   node scripts/image.mjs            → génère les images manquantes de public/images/
// Coûts imputés à la vidéo qui les utilise (out/couts-api.json).
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {BUDGET_USD, PRICES, addToLedger, readApiKey, spentFor, usd} from './gemini-common.mjs';

const MODEL = 'gemini-2.5-flash-image';
const COMMUN =
  'Photorealistic photograph, 16:9 landscape, soft natural light, light neutral background, sharp focus, no text, no logo, no brand name, no watermark, no people faces.';
const IMAGES = [
  {file: 'flash', video: 'V0', prompt: 'Close-up of a generic black digital camera with its built-in flash firing a bright white burst, on a light wooden table.'},
  {file: 'defibrillateur', video: 'V0', prompt: 'A generic automated external defibrillator (AED) open on a light surface, two electrode pads with cables, green and white device, clean medical setting.'},
  {file: 'carte', video: 'V0', prompt: 'Macro photograph of a green printed circuit board with several through-hole resistors (beige body with four color bands) soldered on it, and a few blue electrolytic capacitors.'},
];

const key = readApiKey();
mkdirSync('public/images', {recursive: true});
const price = PRICES[MODEL];
for (const img of IMAGES) {
  const path = `public/images/${img.file}.png`;
  if (existsSync(path)) continue;
  if (spentFor(img.video) + 0.045 > BUDGET_USD) {
    console.error(`⛔ ${img.file} : budget de ${img.video} atteint.`);
    continue;
  }
  process.stdout.write(`→ ${img.file} … `);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{parts: [{text: `${img.prompt} ${COMMUN}`}]}],
      generationConfig: {responseModalities: ['IMAGE'], imageConfig: {aspectRatio: '16:9'}},
    }),
  });
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!res.ok || !part) {
    console.error(`échec HTTP ${res.status} : ${JSON.stringify(json.error ?? json).slice(0, 300)}`);
    continue;
  }
  writeFileSync(path, Buffer.from(part.inlineData.data, 'base64'));
  const u = json.usageMetadata ?? {};
  const cost = ((u.promptTokenCount ?? 50) * price.inputPerM + (u.candidatesTokenCount ?? 1290) * price.outputPerM) / 1e6;
  addToLedger({kind: 'image', video: img.video, model: MODEL, section: img.file, costUsd: cost});
  console.log(`ok · ${usd(cost)}`);
}
