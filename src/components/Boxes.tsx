import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../theme';

/** Bloc positionné en absolu, qui apparaît (fondu + léger glissement) selon `show` (0 → 1). */
export const Pop: React.FC<{show: number; x: number; y: number; w?: number; center?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({
  show,
  x,
  y,
  w,
  center,
  children,
  style,
}) =>
  show <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: show,
        transform: `translateY(${(1 - show) * 18}px)${center ? ' translateX(-50%)' : ''}`,
        textAlign: center ? 'center' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );

/** Carte blanche à bord coloré. */
export const Card: React.FC<{color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({color = C.blue, children, style}) => (
  <div
    style={{
      background: C.card,
      borderRadius: 22,
      border: `3px solid ${color}`,
      boxShadow: '0 6px 24px rgba(20,30,50,0.08)',
      padding: '28px 36px',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Réponse de l'apprenant, barrée en rouge quand `strike` va de 0 à 1. */
export const Crossed: React.FC<{strike: number; children: React.ReactNode}> = ({strike, children}) => (
  <div style={{display: 'inline-block'}}>
    <div style={{fontSize: 30, color: C.dim, fontWeight: 600, marginBottom: 16}}>Réponse de l’apprenant</div>
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        background: C.card,
        borderRadius: 18,
        padding: '30px 48px',
        border: `2px dashed ${C.grey}`,
        fontSize: 58,
        fontStyle: 'italic',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1={3} y1={55} x2={3 + 94 * strike} y2={45 + 10 * (1 - strike)} stroke={C.red} strokeWidth={1.6} vectorEffect="non-scaling-stroke" style={{strokeWidth: 9}} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: -34,
          top: -34,
          width: 68,
          height: 68,
          borderRadius: 34,
          background: C.red,
          color: '#fff',
          fontSize: 46,
          fontWeight: 800,
          fontStyle: 'normal',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${interpolate(strike, [0.7, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
        }}
      >
        ✕
      </div>
    </div>
  </div>
);

/** Encadré « À retenir ». */
export const Retenir: React.FC<{children: React.ReactNode; width?: number}> = ({children, width = 1400}) => (
  <div
    style={{
      width,
      background: C.card,
      borderRadius: 26,
      border: `4px solid ${C.green}`,
      boxShadow: '0 10px 36px rgba(20,60,40,0.12)',
      overflow: 'hidden',
    }}
  >
    <div style={{background: C.green, color: '#fff', fontSize: 38, fontWeight: 800, padding: '16px 40px', letterSpacing: 0.5}}>À retenir</div>
    <div style={{padding: '40px 48px', fontSize: 50, lineHeight: 1.4, fontWeight: 600}}>{children}</div>
  </div>
);

/** Étiquette courte (texte gris ou coloré). */
export const Tag: React.FC<{color?: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({color = C.ink, size = 36, children, style}) => (
  <div style={{fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
