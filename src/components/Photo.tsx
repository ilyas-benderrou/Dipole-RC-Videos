import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';
import {C} from '../theme';

type Kind = 'flash' | 'defibrillateur' | 'carte';

/** Illustrations vectorielles de secours (viewBox 1600 × 900), utilisées tant que la photo n'existe pas. */
const Illustration: React.FC<{kind: Kind; flash?: number}> = ({kind, flash = 0}) => (
  <svg viewBox="0 0 1600 900" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bgL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eef1f4" />
        <stop offset="1" stopColor="#d9dee4" />
      </linearGradient>
      <radialGradient id="burst">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.35" stopColor="#fffbe6" stopOpacity="0.85" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bgL)" />
    {kind === 'flash' ? (
      <g>
        <rect x="380" y="760" width="840" height="40" rx="20" fill="#c9b79c" opacity="0.6" />
        <rect x="430" y="300" width="740" height="460" rx="60" fill="#2a2e35" />
        <rect x="470" y="250" width="200" height="80" rx="20" fill="#2a2e35" />
        <rect x="990" y="250" width="120" height="60" rx="14" fill="#3a3f47" />
        <rect x="520" y="230" width="120" height="34" rx="8" fill="#e8ecf0" />
        <circle cx="800" cy="540" r="185" fill="#1a1d22" stroke="#555b64" strokeWidth="18" />
        <circle cx="800" cy="540" r="120" fill="#0d1a2b" />
        <circle cx="760" cy="500" r="34" fill="#4c6a8f" opacity="0.7" />
        <rect x="1020" y="350" width="110" height="55" rx="10" fill="#f5f5f0" />
        <circle cx="1075" cy="378" r={60 + 520 * flash} fill="url(#burst)" opacity={flash} />
      </g>
    ) : null}
    {kind === 'defibrillateur' ? (
      <g>
        <rect x="420" y="220" width="760" height="520" rx="70" fill="#2fa36b" />
        <rect x="470" y="270" width="660" height="420" rx="44" fill="#f4f6f5" />
        <circle cx="800" cy="470" r="110" fill="#2fa36b" />
        <path d="M 800 420 l 0 100 M 750 470 l 100 0" stroke="#fff" strokeWidth="26" strokeLinecap="round" />
        <path d="M 520 620 l 80 0 l 30 -60 l 40 110 l 35 -80 l 25 30 l 90 0" fill="none" stroke="#d62828" strokeWidth="10" strokeLinejoin="round" />
        <rect x="900" y="590" width="180" height="60" rx="30" fill="#e8740c" />
        <rect x="1220" y="380" width="200" height="270" rx="26" fill="#f1f1f1" stroke="#c6c6c6" strokeWidth="6" />
        <rect x="1260" y="430" width="200" height="270" rx="26" fill="#fafafa" stroke="#c6c6c6" strokeWidth="6" />
        <path d="M 1180 520 C 1220 520 1210 470 1240 450" fill="none" stroke="#333" strokeWidth="8" />
        <path d="M 1180 560 C 1240 580 1250 530 1280 500" fill="none" stroke="#333" strokeWidth="8" />
      </g>
    ) : null}
    {kind === 'carte' ? (
      <g>
        <rect x="120" y="110" width="1360" height="680" rx="24" fill="#1f6b3a" />
        {Array.from({length: 14}, (_, k) => (
          <path key={k} d={`M ${160 + k * 95} 140 v ${120 + (k % 4) * 60} h ${40 + (k % 3) * 30} v ${300 - (k % 5) * 40}`} fill="none" stroke="#d9b45a" strokeWidth="6" opacity="0.7" />
        ))}
        {[
          [300, 300],
          [600, 520],
          [900, 300],
          [1150, 560],
          [420, 640],
        ].map(([x, y], k) => (
          <g key={k} transform={`translate(${x} ${y})`}>
            <line x1="-120" y1="0" x2="120" y2="0" stroke="#c4cad1" strokeWidth="8" />
            <rect x="-70" y="-26" width="140" height="52" rx="24" fill="#e3cfa2" />
            {['#7b4a1e', '#151515', '#c62828', '#c9a227'].map((c, j) => (
              <rect key={c} x={-46 + j * 22 + (j === 3 ? 18 : 0)} y="-26" width="11" height="52" fill={c} />
            ))}
          </g>
        ))}
        {[
          [1180, 260],
          [780, 700],
        ].map(([x, y], k) => (
          <g key={`c${k}`}>
            <rect x={x - 60} y={y - 80} width="120" height="160" rx="16" fill="#1c3578" />
            <rect x={x - 60} y={y - 80} width="30" height="160" fill="#d9dde3" opacity="0.8" />
          </g>
        ))}
        <rect x="650" y="160" width="160" height="110" rx="8" fill="#22252a" />
      </g>
    ) : null}
  </svg>
);

/** Photo cadrée, avec un zoom très lent (`t` de 0 à 1) ; illustration vectorielle si le fichier manque. */
export const Photo: React.FC<{src: string; w: number; h: number; t: number; opacity?: number; radius?: number; flash?: number}> = ({
  src,
  w,
  h,
  t,
  opacity = 1,
  radius = 24,
  flash = 0,
}) => {
  if (opacity <= 0) return null;
  const exists = getStaticFiles().some((f) => f.name.replace(/\\/g, '/') === src);
  const kind = src.replace(/^images\/|\.\w+$/g, '') as Kind;
  return (
    <div style={{width: w, height: h, overflow: 'hidden', borderRadius: radius, opacity, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', position: 'relative', background: C.card}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${1.02 + 0.06 * t})`}}>
        {exists ? <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Illustration kind={kind} flash={flash} />}
      </div>
      {exists && flash > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: flash, background: 'radial-gradient(circle at 50% 40%, #fff 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0) 65%)'}} />
      ) : null}
    </div>
  );
};
