// Génère la voix off avec Gemini TTS : un fichier WAV par scène (une ligne de tableau de VIDEOS_SPEC.md).
//
//   node scripts/tts.mjs --video=V0 --dry-run   → estimation du coût, AUCUN appel API
//   node scripts/tts.mjs --video=V0             → génère les scènes manquantes de V0
//   node scripts/tts.mjs --video=L1 --only=L1-S2 --force
//
// Voix : Bodi (absente de la liste documentée : l'API tranche) ; secours automatique : Achird.
// Sortie : public/audio/<vidéo>/<scène>.wav · coûts : out/couts-api.json (champ `video`).
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {
  API_URL,
  AUDIO_TOKENS_PER_SECOND,
  BUDGET_USD,
  PRICES,
  addToLedger,
  ensureWav,
  extractAudio,
  readApiKey,
  spentFor,
  usd,
  wavDuration,
} from './gemini-common.mjs';

const VOICES = ['Bodi', 'Achird'];
const WORDS_PER_SECOND = 2.0; // débit lent → surestime la durée
const SAFETY = 1.3;
const BILLED_TOKENS_PER_SECOND = 25;
const MIN_INPUT_TOKENS = 2100;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const model = args.model ?? 'gemini-3.8-flash-tts';
const price = PRICES[model];
const {style, accent, videos} = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));
const video = videos[args.video];
if (!video) throw new Error(`Vidéo inconnue : ${args.video}`);
const OUT_DIR = `public/audio/${video.id}`;

const estimate = (text) => {
  const words = text.split(/\s+/).filter(Boolean).length;
  const seconds = (words / WORDS_PER_SECOND) * SAFETY;
  const inTok = Math.max(MIN_INPUT_TOKENS, Math.ceil((text.length + style.length + accent.length) / 2.5));
  return (inTok * price.inputPerM + Math.ceil(seconds * BILLED_TOKENS_PER_SECOND) * price.outputPerM) / 1e6;
};

const only = args.only ? String(args.only).split(',') : null;
const targets = video.scenes.filter((s) => (!only || only.includes(s.id)) && (args.force || !existsSync(`${OUT_DIR}/${s.id}.wav`)));
const thisRun = targets.reduce((a, s) => a + estimate(s.voix), 0);
console.log(`${video.id} · ${targets.length} scène(s) à générer · estimation ${usd(thisRun)} · déjà dépensé ${usd(spentFor(video.id))} / ${usd(BUDGET_USD)}`);
if (args['dry-run'] || targets.length === 0) process.exit(0);

const key = readApiKey();
if (!key) throw new Error('GEMINI_API_KEY est vide.');
mkdirSync(OUT_DIR, {recursive: true});

const call = async (text, voice) => {
  const body = {
    model,
    input: [
      {
        type: 'user_input',
        content: [{type: 'text', text, annotations: [{type: 'speech_metadata', style: `${style} Accent : ${accent}.`}]}],
      },
    ],
    response_format: {type: 'audio', mime_type: 'audio/wav'},
    generation_config: {speech_config: [{voice}]},
  };
  for (let essai = 1; ; essai++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if ((res.status === 429 || res.status >= 500) && essai < 4) {
      const wait = Number((JSON.stringify(json).match(/retry in (\d+)/i) ?? [])[1] ?? 30) + 3;
      process.stdout.write(`(HTTP ${res.status}, nouvel essai dans ${wait} s) `);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    return {res, json};
  }
};

for (const s of targets) {
  // Garde-fou à chaque appel, sur les dépenses réelles du journal.
  if (spentFor(video.id) + estimate(s.voix) > BUDGET_USD) {
    console.error(`\n⛔ ${s.id} ferait dépasser le budget de ${video.id}. Version existante conservée.`);
    process.exit(2);
  }
  process.stdout.write(`→ ${s.id} … `);
  let out = null;
  let voice = null;
  for (const v of VOICES) {
    const {res, json} = await call(s.voix, v);
    const audio = res.ok ? extractAudio(json) : null;
    if (audio) {
      out = {json, audio};
      voice = v;
      break;
    }
    process.stdout.write(`voix ${v} refusée (HTTP ${res.status} : ${JSON.stringify(json.error ?? json).slice(0, 200)}) · `);
  }
  if (!out) {
    console.error('aucune voix disponible.');
    process.exit(1);
  }
  const wav = ensureWav(out.audio.bytes);
  writeFileSync(`${OUT_DIR}/${s.id}.wav`, wav);
  const dur = wavDuration(wav);
  const u = out.json.usage ?? out.json.usage_metadata ?? out.json.usageMetadata ?? {};
  const inTok = u.input_tokens ?? u.total_input_tokens ?? u.promptTokenCount ?? MIN_INPUT_TOKENS;
  const outTok = u.output_tokens ?? u.total_output_tokens ?? u.candidatesTokenCount ?? Math.ceil(dur * AUDIO_TOKENS_PER_SECOND);
  const cost = (inTok * price.inputPerM + outTok * price.outputPerM) / 1e6;
  addToLedger({kind: 'tts', video: video.id, model, voice, section: s.id, seconds: dur, inTok, outTok, costUsd: cost});
  console.log(`ok · ${voice} · ${dur.toFixed(1)} s · ${usd(cost)} (${video.id} : ${usd(spentFor(video.id))})`);
}
