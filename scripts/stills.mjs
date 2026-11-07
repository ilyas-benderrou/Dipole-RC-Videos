// Contrôle visuel : images fixes de plusieurs vidéos (un seul bundle) → planche contact out/controle/<vidéo>-planche.jpg
//   node scripts/stills.mjs V0=176,382 L1=100,500
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {spawnSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const arg of process.argv.slice(2)) {
  const [vid, list] = arg.split('=');
  const frames = list.split(',').map(Number);
  const dir = `out/controle/${vid}`;
  rmSync(dir, {recursive: true, force: true});
  mkdirSync(dir, {recursive: true});
  const composition = await selectComposition({serveUrl, id: vid, inputProps: {}});
  for (const [k, frame] of frames.entries()) {
    await renderStill({composition, serveUrl, output: `${dir}/${String(k).padStart(2, '0')}.jpg`, frame: Math.min(frame, composition.durationInFrames - 1), imageFormat: 'jpeg', scale: 0.5, chromiumOptions: {gl: 'angle'}});
  }
  const cols = Math.min(3, frames.length);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/%02d.jpg`, '-vf', `tile=${cols}x${Math.ceil(frames.length / cols)}:padding=6:color=black`, '-frames:v', '1', `out/controle/${vid}-planche.jpg`]);
  console.log(`out/controle/${vid}-planche.jpg (${frames.length} images)`);
}
