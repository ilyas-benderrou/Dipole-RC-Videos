import React from 'react';
import {C} from '../theme';
import {Lbl} from './Circuit';

/** Unités réduites : E = 1, E/R = 1, τ = 1. */
export const charge = (t: number) => 1 - Math.exp(-t);
export const decharge = (t: number) => Math.exp(-t);

export type Curve = {f: (t: number) => number; color: string; progress: number; width?: number; dash?: string; label?: string; labelT?: number; opacity?: number};

type Props = {
  w: number;
  h: number;
  tMax: number;
  yMin: number;
  yMax: number;
  yLabel: string;
  yColor?: string;
  curves: Curve[];
  /** Repères horizontaux (gris pointillé), de l'axe jusqu'à `tEnd` (par défaut toute la largeur). */
  hLines?: {y: number; label: string; opacity: number; tEnd?: number; color?: string}[];
  /** Repères verticaux (gris pointillé), de l'axe des temps jusqu'à `y`. */
  vLines?: {t: number; label: string; opacity: number; y?: number; color?: string}[];
  points?: {t: number; y: number; opacity: number; color?: string; r?: number}[];
  segments?: {t0: number; y0: number; t1: number; y1: number; progress: number; color?: string; dash?: string; width?: number}[];
  yTicks?: {y: number; label: string; opacity?: number}[];
  opacity?: number;
};

const M = {l: 110, r: 50, t: 40, b: 64};

export const Graph: React.FC<Props> = ({
  w,
  h,
  tMax,
  yMin,
  yMax,
  yLabel,
  yColor = C.ink,
  curves,
  hLines = [],
  vLines = [],
  points = [],
  segments = [],
  yTicks = [],
  opacity = 1,
}) => {
  const X = (t: number) => M.l + (t / tMax) * (w - M.l - M.r);
  const Y = (y: number) => M.t + ((yMax - y) / (yMax - yMin)) * (h - M.t - M.b);
  const y0 = Y(0);
  const dashGrey = '10 9';
  return (
    <svg width={w} height={h} style={{overflow: 'visible', opacity}}>
      {/* Axes */}
      <line x1={M.l} y1={y0} x2={w - M.r + 10} y2={y0} stroke={C.line} strokeWidth={3} />
      <polygon points={`${w - M.r + 24},${y0} ${w - M.r + 8},${y0 - 8} ${w - M.r + 8},${y0 + 8}`} fill={C.line} />
      <line x1={M.l} y1={Y(yMin) + 4} x2={M.l} y2={M.t - 14} stroke={C.line} strokeWidth={3} />
      <polygon points={`${M.l},${M.t - 28} ${M.l - 8},${M.t - 12} ${M.l + 8},${M.t - 12}`} fill={C.line} />
      <Lbl x={w - M.r + 26} y={y0 + 32} t="t" size={32} />
      <Lbl x={M.l + 34} y={M.t - 22} t={yLabel} size={32} color={yColor} />
      <text x={M.l - 14} y={y0 + 30} fontSize={24} fill={C.dim} textAnchor="end" fontFamily="Arial">0</text>
      {yTicks.map((k) => (
        <g key={k.label} opacity={k.opacity ?? 1}>
          <line x1={M.l - 8} y1={Y(k.y)} x2={M.l + 8} y2={Y(k.y)} stroke={C.line} strokeWidth={3} />
          <Lbl x={M.l - 16} y={Y(k.y)} t={k.label} size={28} anchor="end" />
        </g>
      ))}
      {hLines.map((l) =>
        l.opacity > 0 ? (
          <g key={l.label} opacity={l.opacity}>
            <line x1={M.l} y1={Y(l.y)} x2={X(l.tEnd ?? tMax)} y2={Y(l.y)} stroke={l.color ?? C.grey} strokeWidth={3} strokeDasharray={dashGrey} />
            <text x={M.l - 14} y={Y(l.y) + 9} fontSize={26} fill={l.color ?? C.grey} textAnchor="end" fontFamily="Arial" fontWeight={700}>
              {l.label}
            </text>
          </g>
        ) : null,
      )}
      {vLines.map((l) =>
        l.opacity > 0 ? (
          <g key={l.label} opacity={l.opacity}>
            <line x1={X(l.t)} y1={y0} x2={X(l.t)} y2={Y(l.y ?? yMax)} stroke={l.color ?? C.grey} strokeWidth={3} strokeDasharray={dashGrey} />
            <text x={X(l.t)} y={yMin < 0 ? Y(yMin) + 34 : y0 + 36} fontSize={28} fill={l.color ?? C.grey} textAnchor="middle" fontFamily="KaTeX_Main, serif" fontWeight={700}>
              {l.label}
            </text>
          </g>
        ) : null,
      )}
      {segments.map((s, k) => {
        if (s.progress <= 0) return null;
        const t1 = s.t0 + (s.t1 - s.t0) * s.progress;
        const yy = s.y0 + (s.y1 - s.y0) * s.progress;
        return <line key={k} x1={X(s.t0)} y1={Y(s.y0)} x2={X(t1)} y2={Y(yy)} stroke={s.color ?? C.grey} strokeWidth={s.width ?? 3} strokeDasharray={s.dash ?? dashGrey} />;
      })}
      {curves.map((c, k) => {
        if (c.progress <= 0) return null;
        const N = 160;
        const pts: string[] = [];
        for (let j = 0; j <= N; j++) {
          const t = (j / N) * tMax * c.progress;
          pts.push(`${X(t).toFixed(1)},${Y(c.f(t)).toFixed(1)}`);
        }
        const lt = c.labelT ?? tMax * 0.92;
        return (
          <g key={k} opacity={c.opacity ?? 1}>
            <polyline points={pts.join(' ')} fill="none" stroke={c.color} strokeWidth={c.width ?? 6} strokeDasharray={c.dash} strokeLinejoin="round" strokeLinecap="round" />
            {c.label && c.progress * tMax >= lt ? <Lbl x={X(lt)} y={Y(c.f(lt)) - 30} t={c.label} size={30} color={c.color} weight={700} /> : null}
          </g>
        );
      })}
      {points.map((p, k) =>
        p.opacity > 0 ? (
          <g key={k} opacity={p.opacity}>
            <circle cx={X(p.t)} cy={Y(p.y)} r={(p.r ?? 11) + 10} fill={p.color ?? C.blue} opacity={0.2} />
            <circle cx={X(p.t)} cy={Y(p.y)} r={p.r ?? 11} fill={p.color ?? C.blue} />
          </g>
        ) : null,
      )}
    </svg>
  );
};
