// Outils partagés pour les scripts Gemini (TTS + images) : clé API, budget, journal des coûts.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';

export const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** Budget maximal par vidéo (voix + images), en dollars. */
export const BUDGET_USD = 0.5;

/** Tarifs payants officiels (ai.google.dev/gemini-api/docs/pricing, vérifiés le 2026-10-03). */
export const PRICES = {
  'gemini-3.8-flash-tts': {inputPerM: 0.5, outputPerM: 9.0},
  'gemini-3.8-flash-lite-tts': {inputPerM: 0.5, outputPerM: 6.0},
  // Nano Banana : 30 $/M jetons image en sortie (1 290 jetons ≈ 0,039 $ par image)
  'gemini-2.5-flash-image': {inputPerM: 0.3, outputPerM: 30.0},
};

/** Débit audio documenté par Google : 32 jetons par seconde d'audio. */
export const AUDIO_TOKENS_PER_SECOND = 32;

const LEDGER = 'out/couts-api.json';

/** Lit GEMINI_API_KEY depuis .env (sans jamais l'afficher). */
export const readApiKey = () => {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  if (!existsSync('.env')) return '';
  const line = readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('GEMINI_API_KEY='));
  return line ? line.slice('GEMINI_API_KEY='.length).trim().replace(/^["']|["']$/g, '') : '';
};

export const readLedger = () => {
  if (!existsSync(LEDGER)) return {totalUsd: 0, calls: []};
  return JSON.parse(readFileSync(LEDGER, 'utf8'));
};

export const addToLedger = (entry) => {
  const ledger = readLedger();
  ledger.calls.push({...entry, date: new Date().toISOString()});
  ledger.totalUsd = Math.round(ledger.calls.reduce((s, c) => s + c.costUsd, 0) * 1e6) / 1e6;
  mkdirSync('out', {recursive: true});
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
  return ledger;
};

export const usd = (x) => `${x.toFixed(4)} $`;

/** Extrait le dernier bloc audio (base64) d'une réponse de l'API Interactions. */
export const extractAudio = (json) => {
  const blocks = [];
  for (const step of json.steps ?? []) {
    if (step.type !== 'model_output') continue;
    for (const c of step.content ?? []) if (c.type === 'audio' && c.data) blocks.push(c);
  }
  if (json.output_audio?.data) blocks.push(json.output_audio);
  const last = blocks.at(-1);
  if (!last) return null;
  return {bytes: Buffer.from(last.data, 'base64'), mime: last.mime_type ?? last.mimeType ?? ''};
};

/** Enveloppe du PCM brut 16 bits dans un en-tête WAV si nécessaire. */
export const ensureWav = (bytes, sampleRate = 24000, channels = 1) => {
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF') return bytes;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + bytes.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(bytes.length, 40);
  return Buffer.concat([h, bytes]);
};

/** Durée (s) d'un WAV PCM. */
export const wavDuration = (buf) => {
  const channels = buf.readUInt16LE(22);
  const rate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'data') return size / (rate * channels * (bits / 8));
    off += 8 + size;
  }
  return 0;
};

/** Dépenses déjà enregistrées pour une vidéo (V0, L1…). */
export const spentFor = (video) => readLedger().calls.filter((c) => c.video === video).reduce((a, c) => a + c.costUsd, 0);
