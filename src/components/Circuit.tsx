import React from 'react';
import {C, serif} from '../theme';

/**
 * Libellé SVG avec indice : « u_C » → u en italique, C en indice.
 */
export const Lbl: React.FC<{x: number; y: number; t: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number; weight?: number}> = ({
  x,
  y,
  t,
  color = C.ink,
  size = 30,
  anchor = 'middle',
  opacity = 1,
  weight = 400,
}) => {
  const [base, sub] = t.split('_');
  const italic = /^[a-zA-Zτ]+$/.test(base) && base.length <= 2;
  return (
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} opacity={opacity} fontFamily={serif} fontWeight={weight} dominantBaseline="middle">
      <tspan fontStyle={italic ? 'italic' : 'normal'}>{base}</tspan>
      {sub ? (
        <tspan dy={size * 0.28} fontSize={size * 0.68} fontStyle="normal" fontFamily={serif}>
          {sub}
        </tspan>
      ) : null}
    </text>
  );
};

type Pt = [number, number];

const pathLength = (pts: Pt[]) => pts.slice(1).reduce((a, p, k) => a + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const pointAt = (pts: Pt[], s: number): Pt => {
  for (let k = 1; k < pts.length; k++) {
    const seg = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (s <= seg) return [pts[k - 1][0] + ((pts[k][0] - pts[k - 1][0]) * s) / seg, pts[k - 1][1] + ((pts[k][1] - pts[k - 1][1]) * s) / seg];
    s -= seg;
  }
  return pts.at(-1)!;
};
const poly = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');

// Géométrie (viewBox 720 × 620)
const GX = 110; // générateur
const GY = 340;
const GR = 42;
const PX = 360; // pivot de K, branche R–C
const KY = 110;
const C1: Pt = [285, KY];
const C2: Pt = [435, KY];
const RX = 600; // branche (2) qui contourne le générateur
const BOT = 560;
const R_TOP = 190;
const R_BOT = 290;
const A_Y = 390;
const B_Y = 440;

/** Trajets des électrons : charge (A → générateur → B) ; décharge (B → branche (2) → R → A). */
export const PATH_CHARGE: Pt[] = [[PX, A_Y - 4], [PX, KY], C1, [GX, KY], [GX, BOT], [PX, BOT], [PX, B_Y + 4]];
export const PATH_DECHARGE: Pt[] = [[PX, B_Y + 4], [PX, BOT], [RX, BOT], [RX, KY], C2, [PX, KY], [PX, A_Y - 4]];

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color: string; w?: number; head?: number; opacity?: number}> = ({
  x1,
  y1,
  x2,
  y2,
  color,
  w = 4,
  head = 16,
  opacity = 1,
}) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - head * Math.cos(a);
  const hy = y2 - head * Math.sin(a);
  const p1: Pt = [hx + (head / 2) * Math.sin(a), hy - (head / 2) * Math.cos(a)];
  const p2: Pt = [hx - (head / 2) * Math.sin(a), hy + (head / 2) * Math.cos(a)];
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={poly([[x2, y2], p1, p2])} fill={color} />
    </g>
  );
};

export type CircuitProps = {
  /** Angle de la lame de K (degrés) : 180 = position (1), 0 = position (2), ~140 = ouvert. */
  kAngle?: number;
  showGen?: number;
  showK?: number;
  showR?: number;
  showC?: number;
  showArrows?: number;
  /** 0 → 1 : le générateur passe en gris. */
  genGrey?: number;
  /** Intensité de « l'allumage » de la flèche de i. */
  iGlow?: number;
  /** Flèche du sens réel du courant (décharge), vers le haut dans R. */
  realArrow?: number;
  /** Charge du condensateur, 0 → 1 (signes + sur A, − sur B). */
  q?: number;
  /** Électrons en mouvement. */
  electrons?: {mode: 'charge' | 'decharge'; travel: number; opacity: number};
  dielectric?: number;
  /** Fils parcourus par le courant mis en valeur (orange translucide). */
  wireGlow?: number;
  /** Croix rouge sur l'isolant (« pas à travers lui »). */
  crossC?: number;
  /** Accolade « dipôle RC ». */
  rcBrace?: number;
  width?: number;
};

export const Circuit: React.FC<CircuitProps> = ({
  kAngle = 140,
  showGen = 1,
  showK = 1,
  showR = 1,
  showC = 1,
  showArrows = 1,
  genGrey = 0,
  iGlow = 0,
  realArrow = 0,
  q = 0,
  electrons,
  dielectric = 1,
  wireGlow = 0,
  crossC = 0,
  rcBrace = 0,
  width = 720,
}) => {
  const L = C.line;
  const genOp = showGen * (1 - 0.6 * genGrey);
  const genCol = genGrey > 0.5 ? C.grey : L;
  const rad = (kAngle * Math.PI) / 180;
  const blade: Pt = [PX + 75 * Math.cos(rad), KY - 75 * Math.sin(rad)];
  const n = Math.round(Math.max(0, Math.min(1, q)) * 6);
  const signX = [322, 336, 350, 370, 384, 398];
  const elecPath = electrons?.mode === 'decharge' ? PATH_DECHARGE : PATH_CHARGE;
  const elecLen = pathLength(elecPath);
  const spacing = 36;
  const dots: Pt[] = [];
  if (electrons && electrons.opacity > 0) {
    const off = ((electrons.travel % spacing) + spacing) % spacing;
    for (let s = off; s < elecLen - 6; s += spacing) dots.push(pointAt(elecPath, s));
  }
  return (
    <svg width={width} height={(width * 620) / 720} viewBox="0 0 720 620" style={{overflow: 'visible'}}>
      {wireGlow > 0 ? (
        <polyline points={poly(PATH_CHARGE)} fill="none" stroke={C.orange} strokeWidth={22} strokeOpacity={0.28 * wireGlow} strokeLinejoin="round" />
      ) : null}
      {/* Générateur et ses fils */}
      <g opacity={genOp} stroke={genCol} strokeWidth={5} fill="none">
        <polyline points={poly([[GX, GY - GR], [GX, KY], C1])} />
        <polyline points={poly([[GX, GY + GR], [GX, BOT], [PX, BOT]])} />
        <circle cx={GX} cy={GY} r={GR} fill={C.bg} />
        <line x1={GX} y1={GY - GR + 10} x2={GX} y2={GY + GR - 10} strokeWidth={4} />
      </g>
      <g opacity={genOp}>
        <Arrow x1={44} y1={GY + 46} x2={44} y2={GY - 46} color={genCol} w={4} />
        <Lbl x={20} y={GY} t="E" size={36} color={genCol} />
      </g>
      {/* Interrupteur K et branche (2) */}
      <g opacity={showK}>
        <polyline points={poly([C2, [RX, KY], [RX, BOT], [PX, BOT]])} fill="none" stroke={L} strokeWidth={5} />
        <line x1={PX} y1={KY} x2={blade[0]} y2={blade[1]} stroke={L} strokeWidth={6} strokeLinecap="round" />
        <circle cx={PX} cy={KY} r={8} fill={L} />
        <circle cx={C1[0]} cy={C1[1]} r={8} fill={C.bg} stroke={L} strokeWidth={4} />
        <circle cx={C2[0]} cy={C2[1]} r={8} fill={C.bg} stroke={L} strokeWidth={4} />
        <text x={C1[0]} y={KY - 34} fontSize={28} textAnchor="middle" fill={C.dim} fontFamily={serif}>(1)</text>
        <text x={C2[0]} y={KY - 34} fontSize={28} textAnchor="middle" fill={C.dim} fontFamily={serif}>(2)</text>
        <Lbl x={PX} y={KY - 70} t="K" size={34} />
      </g>
      {/* Conducteur ohmique */}
      <g opacity={showR}>
        <line x1={PX} y1={KY} x2={PX} y2={R_TOP} stroke={L} strokeWidth={5} />
        <rect x={PX - 18} y={R_TOP} width={36} height={R_BOT - R_TOP} fill={C.bg} stroke={L} strokeWidth={5} />
        <line x1={PX} y1={R_BOT} x2={PX} y2={A_Y} stroke={L} strokeWidth={5} />
        <Lbl x={PX - 82} y={(R_TOP + R_BOT) / 2} t="R" size={34} />
      </g>
      {/* Condensateur */}
      <g opacity={showC}>
        <rect x={318} y={A_Y + 4} width={84} height={B_Y - A_Y - 8} fill={C.yellow} opacity={0.55 * dielectric} />
        <line x1={312} y1={A_Y} x2={408} y2={A_Y} stroke={L} strokeWidth={7} />
        <line x1={312} y1={B_Y} x2={408} y2={B_Y} stroke={L} strokeWidth={7} />
        <line x1={PX} y1={B_Y} x2={PX} y2={BOT} stroke={L} strokeWidth={5} />
        <Lbl x={290} y={A_Y - 4} t="A" size={28} color={C.dim} />
        <Lbl x={290} y={B_Y + 6} t="B" size={28} color={C.dim} />
        <Lbl x={248} y={(A_Y + B_Y) / 2} t="C" size={34} />
        {signX.slice(0, n).map((x) => (
          <text key={`p${x}`} x={x} y={A_Y - 16} fontSize={26} fontWeight={800} textAnchor="middle" fill={C.red} fontFamily="Arial">+</text>
        ))}
        {signX.slice(0, n).map((x) => (
          <text key={`m${x}`} x={x} y={B_Y + 34} fontSize={30} fontWeight={800} textAnchor="middle" fill={C.blue} fontFamily="Arial">−</text>
        ))}
      </g>
      {crossC > 0 ? (
        <g opacity={crossC} stroke={C.red} strokeWidth={8} strokeLinecap="round">
          <line x1={330} y1={A_Y - 6} x2={390} y2={B_Y + 6} />
          <line x1={390} y1={A_Y - 6} x2={330} y2={B_Y + 6} />
        </g>
      ) : null}
      {/* Flèches : convention récepteur */}
      <g opacity={showArrows}>
        {iGlow > 0 ? <circle cx={PX} cy={152} r={30} fill={C.orange} opacity={0.22 * iGlow} /> : null}
        <Arrow x1={PX} y1={128} x2={PX} y2={176} color={C.orange} w={6} head={22} />
        <Lbl x={PX + 26} y={150} t="i" size={34} color={C.orange} />
        <Arrow x1={408} y1={R_BOT - 4} x2={408} y2={R_TOP + 4} color={C.ink} w={4} />
        <Lbl x={440} y={(R_TOP + R_BOT) / 2} t="u_R" size={32} />
        <Arrow x1={444} y1={B_Y + 4} x2={444} y2={A_Y - 4} color={C.blue} w={5} />
        <Lbl x={480} y={(A_Y + B_Y) / 2} t="u_C" size={32} color={C.blue} />
      </g>
      {realArrow > 0 ? (
        <g opacity={realArrow}>
          <Arrow x1={322} y1={R_BOT - 6} x2={322} y2={R_TOP + 6} color={C.orange} w={9} head={26} />
          <text x={300} y={R_TOP - 22} fontSize={24} textAnchor="end" fill={C.orange} fontWeight={700} fontFamily="Arial">sens réel</text>
        </g>
      ) : null}
      {rcBrace > 0 ? (
        <g opacity={rcBrace}>
          <rect x={222} y={R_TOP - 20} width={300} height={B_Y - R_TOP + 85} rx={18} fill="none" stroke={C.blue} strokeWidth={4} strokeDasharray="12 9" />
          <text x={378} y={B_Y + 98} fontSize={28} fill={C.blue} fontWeight={700} fontFamily="Arial">dipôle RC</text>
        </g>
      ) : null}
      {dots.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={7} fill="#6c3fc4" opacity={electrons!.opacity} />
      ))}
    </svg>
  );
};
