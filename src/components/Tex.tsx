import katex from 'katex';
import React, {useMemo} from 'react';
import {C} from '../theme';

/**
 * Formule KaTeX qui « s'écrit » de gauche à droite : `reveal` va de 0 (invisible) à 1 (complète).
 */
export const Tex: React.FC<{
  tex: string;
  size?: number;
  color?: string;
  reveal?: number;
  style?: React.CSSProperties;
}> = ({tex, size = 64, color = C.ink, reveal = 1, style}) => {
  const html = useMemo(() => katex.renderToString(tex, {displayMode: false, throwOnError: false, output: 'html', strict: false}), [tex]);
  const r = Math.max(0, Math.min(1, reveal));
  return (
    <div
      style={{
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
        display: 'inline-block',
        opacity: r > 0 ? 1 : 0,
        clipPath: `inset(-20% ${(1 - r) * 100}% -20% -2%)`,
        ...style,
      }}
      dangerouslySetInnerHTML={{__html: html}}
    />
  );
};
