import React from 'react';
import {C} from '../theme';

const capV = (x: number, y: number, label: string) => (
  <g key={label}>
    <line x1={x - 14} y1={y - 34} x2={x - 14} y2={y + 34} stroke={C.line} strokeWidth={7} />
    <line x1={x + 14} y1={y - 34} x2={x + 14} y2={y + 34} stroke={C.line} strokeWidth={7} />
    <text x={x} y={y - 48} fontSize={30} textAnchor="middle" fontFamily="KaTeX_Math, serif" fontStyle="italic">
      {label[0]}
      <tspan dy={8} fontSize={20} fontStyle="normal">{label[1]}</tspan>
    </text>
  </g>
);

/** Deux condensateurs en série. */
export const Series: React.FC = () => (
  <svg width={360} height={130} viewBox="0 0 360 130" style={{overflow: 'visible'}}>
    <line x1={10} y1={80} x2={106} y2={80} stroke={C.line} strokeWidth={5} />
    <line x1={134} y1={80} x2={226} y2={80} stroke={C.line} strokeWidth={5} />
    <line x1={254} y1={80} x2={350} y2={80} stroke={C.line} strokeWidth={5} />
    {capV(120, 80, 'C1')}
    {capV(240, 80, 'C2')}
  </svg>
);

/** Deux condensateurs en parallèle. */
export const Parallel: React.FC = () => (
  <svg width={360} height={200} viewBox="0 0 360 200" style={{overflow: 'visible'}}>
    <polyline points="10,100 90,100 90,50 166,50" fill="none" stroke={C.line} strokeWidth={5} />
    <polyline points="90,100 90,160 166,160" fill="none" stroke={C.line} strokeWidth={5} />
    <polyline points="194,50 270,50 270,100 350,100" fill="none" stroke={C.line} strokeWidth={5} />
    <polyline points="194,160 270,160 270,100" fill="none" stroke={C.line} strokeWidth={5} />
    {capV(180, 50, 'C1')}
    <g>
      <line x1={166} y1={130} x2={166} y2={190} stroke={C.line} strokeWidth={7} />
      <line x1={194} y1={130} x2={194} y2={190} stroke={C.line} strokeWidth={7} />
      <text x={230} y={130} fontSize={30} fontFamily="KaTeX_Math, serif" fontStyle="italic">
        C<tspan dy={8} fontSize={20} fontStyle="normal">2</tspan>
      </text>
    </g>
  </svg>
);

/** Condensateur chargé relié à un moteur qui soulève une masse m. */
export const MotorLift: React.FC<{spin: number; lift: number; q: number}> = ({spin, lift, q}) => {
  const n = Math.round(q * 5);
  const my = 560 - 260 * lift;
  return (
    <svg width={860} height={760} viewBox="0 0 860 760">
      {/* condensateur (plaques horizontales) */}
      <line x1={110} y1={430} x2={250} y2={430} stroke={C.line} strokeWidth={9} />
      <line x1={110} y1={470} x2={250} y2={470} stroke={C.line} strokeWidth={9} />
      <rect x={116} y={436} width={128} height={28} fill={C.yellow} opacity={0.5} />
      {Array.from({length: n}, (_, k) => (
        <text key={`p${k}`} x={125 + k * 28} y={420} fontSize={30} fontWeight={800} fill={C.red} fontFamily="Arial">+</text>
      ))}
      {Array.from({length: n}, (_, k) => (
        <text key={`m${k}`} x={127 + k * 28} y={505} fontSize={34} fontWeight={800} fill={C.blue} fontFamily="Arial">−</text>
      ))}
      <polyline points="180,430 180,330 420,330 420,590" fill="none" stroke={C.line} strokeWidth={5} />
      <polyline points="180,470 180,700 420,700 420,690" fill="none" stroke={C.line} strokeWidth={5} />
      {/* moteur */}
      <circle cx={420} cy={640} r={58} fill={C.card} stroke={C.line} strokeWidth={6} />
      <text x={420} y={655} fontSize={44} textAnchor="middle" fontWeight={800} fontFamily="Arial">M</text>
      <line x1={478} y1={640} x2={560} y2={640} stroke={C.line} strokeWidth={10} />
      <g transform={`rotate(${spin} 590 640)`}>
        <circle cx={590} cy={640} r={34} fill={C.metal} stroke={C.line} strokeWidth={4} />
        <line x1={590} y1={608} x2={590} y2={672} stroke={C.line} strokeWidth={4} />
        <line x1={558} y1={640} x2={622} y2={640} stroke={C.line} strokeWidth={4} />
      </g>
      {/* poulie et masse */}
      <line x1={560} y1={120} x2={820} y2={120} stroke={C.line} strokeWidth={10} />
      <line x1={690} y1={120} x2={690} y2={170} stroke={C.line} strokeWidth={5} />
      <circle cx={690} cy={200} r={34} fill={C.card} stroke={C.line} strokeWidth={5} />
      <line x1={624} y1={640} x2={656} y2={200} stroke={C.ink} strokeWidth={3} />
      <line x1={724} y1={200} x2={724} y2={my} stroke={C.ink} strokeWidth={3} />
      <rect x={674} y={my} width={100} height={90} rx={8} fill="#5b6472" />
      <text x={724} y={my + 58} fontSize={40} textAnchor="middle" fill="#fff" fontStyle="italic" fontFamily="KaTeX_Math, serif">m</text>
      {lift > 0.02 ? (
        <g opacity={Math.min(1, lift * 3)}>
          <line x1={810} y1={my + 140} x2={810} y2={my + 30} stroke={C.green} strokeWidth={5} />
          <polygon points={`810,${my + 10} 798,${my + 34} 822,${my + 34}`} fill={C.green} />
        </g>
      ) : null}
    </svg>
  );
};
