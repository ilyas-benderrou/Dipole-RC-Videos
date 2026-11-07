// Rendu final d'une ou plusieurs vidéos :
//   1. rendu Remotion (1920 × 1080, 30 i/s, H.264)        → out/<id>-brut.mp4
//   2. normalisation du son à −16 LUFS (2 passes)          → out/<id>.mp4 (vidéo copiée sans réencodage)
//   3. contrôle : durée du fichier = durée prévue (voix + maintiens + titre)
//
//   node scripts/render.mjs V0 L1 L2
import {spawnSync} from 'node:child_process';
import {readFileSync, unlinkSync} from 'node:fs';

const CIBLE = {I: -16, TP: -1.5, LRA: 11};
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {stdio: 'inherit', shell: process.platform === 'win32'});
  if (r.status !== 0) {
    console.error(`⛔ Échec : ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
};
const stderr = (args) => spawnSync('ffmpeg', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}).stderr;
const {videos} = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));
const T = JSON.parse(readFileSync('src/data/timings.json', 'utf8'));

for (const id of process.argv.slice(2)) {
  const BRUT = `out/${id}-brut.mp4`;
  const FINAL = `out/${id}.mp4`;
  console.log(`\n=== ${id} : rendu ===`);
  run('npx', ['remotion', 'render', id, BRUT, '--log=error', '--gl=angle']);
  const m0 = stderr(['-hide_banner', '-nostats', '-i', BRUT, '-vn', '-af', `loudnorm=I=${CIBLE.I}:TP=${CIBLE.TP}:LRA=${CIBLE.LRA}:print_format=json`, '-f', 'null', '-']);
  const m = JSON.parse(m0.slice(m0.lastIndexOf('{'), m0.lastIndexOf('}') + 1));
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', BRUT, '-c:v', 'copy',
    '-af', `loudnorm=I=${CIBLE.I}:TP=${CIBLE.TP}:LRA=${CIBLE.LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', FINAL,
  ]);
  unlinkSync(BRUT);
  const v = videos[id];
  let prevue = 1 + v.scenes.reduce((a, s) => a + T[s.id].dur + s.maintien, 0);
  if (id.startsWith('M')) prevue = Math.max(prevue, 60.5);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height,r_frame_rate', '-of', 'csv=p=0', FINAL], {encoding: 'utf8'}).stdout.trim().replace(/\r?\n/g, ' | ');
  const duree = Number(probe.split(' | ').at(-1));
  const ok = Math.abs(duree - prevue) < 0.5;
  console.log(`${ok ? '✅' : '⚠️'} ${FINAL} · ${probe} · durée ${duree.toFixed(1)} s (prévue ${prevue.toFixed(1)} s)`);
}
