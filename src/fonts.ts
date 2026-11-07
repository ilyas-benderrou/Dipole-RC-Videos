import 'katex/dist/katex.min.css';
import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Police Inter chargée localement depuis public/fonts (aucun accès réseau au rendu).
 * Les polices KaTeX (embarquées par le paquet katex) sont préchargées pour que les formules
 * ne s'affichent jamais avec une police de secours.
 */
export const inter = 'RC Inter';

const KATEX_FONTS = [
  '400 1em KaTeX_Main',
  '700 1em KaTeX_Main',
  'italic 400 1em KaTeX_Main',
  'italic 400 1em KaTeX_Math',
  '400 1em KaTeX_Size1',
  '400 1em KaTeX_Size2',
  '400 1em KaTeX_AMS',
];

let loaded = false;

export const loadLocalFonts = () => {
  if (loaded || typeof document === 'undefined' || typeof FontFace === 'undefined') return;
  loaded = true;
  const handle = delayRender('Chargement des polices locales', {timeoutInMilliseconds: 30000});
  const face = new FontFace(inter, `url('${staticFile('fonts/Inter-Variable.ttf')}') format('truetype')`, {
    weight: '100 900',
    style: 'normal',
    display: 'block',
  });
  Promise.all([
    face.load().then((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f)),
    ...KATEX_FONTS.map((f) => document.fonts.load(f, 'x∑').catch(() => undefined)),
  ])
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Échec du chargement des polices', err);
      continueRender(handle);
    });
};

loadLocalFonts();
