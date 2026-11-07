import React from 'react';
import {Card, Pop, Tag} from '../components/Boxes';
import {Circuit} from '../components/Circuit';
import {charge, decharge, Graph} from '../components/Graph';
import {MotorLift, Parallel, Series} from '../components/Mini';
import {Shell} from '../components/Shell';
import {Tex} from '../components/Tex';
import {lin, ramp, steps} from '../lib/anim';
import {Scene} from '../lib/timing';
import {C} from '../theme';

/** Image globale où `needle` est prononcé dans la scène `sc`. */
const g = (sc: Scene, needle: string, opts?: {end?: boolean; nth?: number}) => sc.from + sc.at(needle, opts);
/** Écriture d'une formule pendant que la voix la dit. */
const write = (f: number, sc: Scene, from: string, to: string) => lin(f, g(sc, from) - 3, Math.max(12, g(sc, to, {end: true}) - g(sc, from)));
const physT = (f: number, start: number, end: number, span = 4.5) => Math.max(0, ((f - start) / (end - start)) * span);

const L1Screen = (f: number, [s1, s2, s3]: Scene[]) => {
  const ch = g(s1, 'Pendant la charge');
  const e0 = g(s1, 'les électrons quittent');
  const t = physT(f, e0, s3.from + s3.frames, 6);
  return (
    <>
      <div style={{position: 'absolute', left: 30, top: 170}}>
        <Circuit width={780} kAngle={steps(f, [[0, 140], [ch, 180]], 12)} q={f < e0 ? 0 : charge(t)} electrons={{mode: 'charge', travel: 1500 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10) * (1 - ramp(f, s2.from + 60, 30))}} dielectric={1} />
      </div>
      <Pop show={ramp(f, g(s1, 'séparées par un isolant'))} x={120} y={880}>
        <Tag size={34} color="#a07800">armatures A et B séparées par un isolant</Tag>
      </Pop>
      <Pop show={ramp(f, g(s1, "sans traverser l'isolant"))} x={120} y={940}>
        <Tag size={34} color={C.red}>aucun électron ne traverse l’isolant</Tag>
      </Pop>
      <Pop show={1} x={900} y={150}>
        <Tex tex="q = q_A = -q_B" size={70} reveal={ramp(f, g(s2, 'La charge q'), 20)} />
      </Pop>
      <Pop show={1} x={900} y={260}>
        <Tex tex="q = C \cdot u_C" size={70} reveal={write(f, s2, 'q égale C', 'fois u c')} />
      </Pop>
      <Pop show={1} x={900} y={370}>
        <Tex tex="i = \dfrac{dq}{dt}" size={70} reveal={write(f, s2, 'i égale', 'sur dé t')} />
      </Pop>
      <Pop show={ramp(f, g(s3, 'En série'))} x={900} y={580}>
        <Tag size={34} color={C.dim}>en série</Tag>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 10}}>
          <Series />
          <Tex tex="\dfrac{1}{C_e} = \dfrac{1}{C_1} + \dfrac{1}{C_2}" size={62} />
        </div>
      </Pop>
      <Pop show={ramp(f, g(s3, 'En parallèle'))} x={900} y={800}>
        <Tag size={34} color={C.dim}>en parallèle</Tag>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 10}}>
          <Parallel />
          <Tex tex="C_e = C_1 + C_2" size={62} />
        </div>
      </Pop>
    </>
  );
};

const L2Screen = (f: number, [s1, s2, s3]: Scene[]) => {
  const k1 = g(s1, 'K en position un');
  const e0 = g(s1, 'se charge');
  const t = physT(f, e0, s3.from + s3.frames, 5);
  const eq2 = g(s2, 'R C, dé u c');
  const uc0 = g(s3, 'La tension monte');
  const i0 = g(s3, 'et le courant tombe');
  return (
    <>
      <div style={{position: 'absolute', left: 20, top: 190}}>
        <Circuit width={720} kAngle={steps(f, [[0, 140], [k1, 180]], 12)} iGlow={ramp(f, e0)} q={f < e0 ? 0 : charge(t)} electrons={{mode: 'charge', travel: 1500 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10) * 0.8}} />
      </div>
      <Pop show={1 - ramp(f, eq2 - 8, 10)} x={800} y={125}>
        <Tex tex="u_R + u_C = E" size={72} reveal={ramp(f, g(s2, "La loi d'additivité"), 25)} />
      </Pop>
      <Pop show={1} x={800} y={125}>
        <Tex tex="RC\,\dfrac{du_C}{dt} + u_C = E" size={72} reveal={write(f, s2, 'R C, dé u c', 'égale E')} />
      </Pop>
      <Pop show={1} x={800} y={350}>
        <Tex tex="u_C = E\left(1 - e^{-t/\tau}\right)" size={46} color={C.blue} reveal={write(f, s3, 'u c égale E', 'sur tau')} />
      </Pop>
      <Pop show={ramp(f, g(s3, 'Solution'))} x={780} y={500}>
        <Graph w={540} h={430} tMax={5} yMin={0} yMax={1.2} yLabel="u_C" yColor={C.blue} yTicks={[{y: 1, label: 'E'}]} hLines={[{y: 1, label: '', opacity: ramp(f, uc0)}]} curves={[{f: charge, color: C.blue, progress: lin(f, uc0, g(s3, 'vers E', {end: true}) + 20 - uc0)}]} />
      </Pop>
      <Pop show={1} x={1390} y={350}>
        <Tex tex="i = \dfrac{E}{R}\,e^{-t/\tau}" size={46} color={C.orange} reveal={ramp(f, i0, 20)} />
      </Pop>
      <Pop show={ramp(f, i0)} x={1340} y={500}>
        <Graph w={540} h={430} tMax={5} yMin={0} yMax={1.2} yLabel="i" yColor={C.orange} yTicks={[{y: 1, label: 'E/R'}]} curves={[{f: decharge, color: C.orange, progress: lin(f, i0, g(s3, 'zéro', {end: true}) + 20 - i0)}]} />
      </Pop>
    </>
  );
};

const L3Screen = (f: number, [s1, s2, s3]: Scene[]) => {
  const c0 = g(s2, 'Sur la courbe');
  const p63 = g(s2, 'soixante-trois');
  const tan = g(s2, 'la tangente');
  const dbl = g(s3, 'Si R ou C double');
  const five = g(s3, 'cinq tau');
  return (
    <>
      <Pop show={1} x={90} y={170}>
        <Tex tex="\tau = RC" size={110} reveal={write(f, s1, 'Tau égale', 'fois C')} />
      </Pop>
      <Pop show={1} x={90} y={330}>
        <Tex tex="[\tau] = \text{s}" size={80} reveal={ramp(f, g(s1, "C'est un temps"), 20)} />
      </Pop>
      <Pop show={ramp(f, p63)} x={90} y={500} w={600}>
        <Tex tex="u_C(\tau) = 0{,}63\,E" size={52} color={C.blue} />
      </Pop>
      <Pop show={ramp(f, tan)} x={90} y={590} w={600}>
        <Tag size={36} style={{whiteSpace: 'normal'}}>tangente à l’origine ∩ asymptote → τ</Tag>
      </Pop>
      <Pop show={ramp(f, dbl)} x={90} y={720} w={600}>
        <Tag size={38}>R ou C × 2 ⇒ τ × 2</Tag>
      </Pop>
      <Pop show={ramp(f, five)} x={90} y={800} w={600}>
        <Tag size={38}>charge terminée après 5τ</Tag>
      </Pop>
      <Pop show={ramp(f, c0 - 10)} x={680} y={150}>
        <Graph
          w={1180}
          h={840}
          tMax={7}
          yMin={0}
          yMax={1.15}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          hLines={[
            {y: 1, label: '', opacity: 1},
            {y: 0.632, label: '0,63E', opacity: ramp(f, p63), tEnd: 1},
          ]}
          vLines={[
            {t: 1, label: 'τ', opacity: ramp(f, p63 + 25), y: 0.632},
            {t: 2, label: '2τ', opacity: ramp(f, dbl + 20), y: charge(1)},
            {t: 5, label: '5τ', opacity: ramp(f, five), y: 1},
          ]}
          segments={[
            {t0: 1, y0: 0.632, t1: 1, y1: 0, progress: lin(f, p63 + 12, 18)},
            {t0: 0, y0: 0, t1: 1.15, y1: 1.15, progress: lin(f, tan, g(s2, "l'asymptote", {end: true}) - tan)},
            {t0: 1, y0: 1, t1: 1, y1: 0.632, progress: lin(f, g(s2, "l'asymptote"), 15)},
          ]}
          points={[
            {t: 1, y: 0.632, opacity: ramp(f, p63), color: C.blue},
            {t: 1, y: 1, opacity: ramp(f, g(s2, "l'asymptote")), color: C.grey, r: 9},
            {t: 5, y: charge(5), opacity: ramp(f, five), color: C.blue, r: 9},
          ]}
          curves={[
            {f: charge, color: C.blue, progress: lin(f, c0, 45), label: 'C', labelT: 3},
            {f: (x) => charge(x / 2), color: C.blueLight, progress: lin(f, dbl, 50), label: '2C', labelT: 4.4},
          ]}
        />
      </Pop>
    </>
  );
};

const L4Screen = (f: number, [s1, s2, s3]: Scene[]) => {
  const k2 = g(s1, 'K en position deux');
  const e0 = g(s1, 'se décharge');
  const t = physT(f, e0, s3.from + s3.frames, 5);
  const uc0 = g(s2, 'Donc u c');
  const p37 = g(s2, 'À tau');
  const sens = g(s3, 'Le courant change');
  const neg = g(s3, 'i est négatif');
  const jump = g(s3, 'ne saute jamais');
  return (
    <>
      <div style={{position: 'absolute', left: 20, top: 190}}>
        <Circuit
          width={720}
          kAngle={steps(f, [[0, 180], [k2, 0]], 18)}
          genGrey={ramp(f, e0)}
          q={f < e0 ? 1 : decharge(t)}
          electrons={{mode: 'decharge', travel: 1500 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10) * 0.8}}
          realArrow={ramp(f, sens)}
        />
      </div>
      <Pop show={1} x={800} y={125}>
        <Tex tex="RC\,\dfrac{du_C}{dt} + u_C = 0" size={72} reveal={write(f, s2, 'R C, dé', 'égale zéro')} />
      </Pop>
      <Pop show={1} x={800} y={350}>
        <Tex tex="u_C = E\,e^{-t/\tau}" size={46} color={C.blue} reveal={write(f, s2, 'u c égale E', 'sur tau')} />
      </Pop>
      <Pop show={ramp(f, uc0)} x={780} y={500}>
        <Graph
          w={540}
          h={430}
          tMax={5}
          yMin={0}
          yMax={1.2}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          hLines={[{y: 0.368, label: '0,37E', opacity: ramp(f, p37), tEnd: 1}]}
          vLines={[{t: 1, label: 'τ', opacity: ramp(f, p37), y: 0.368}]}
          curves={[{f: decharge, color: C.blue, progress: lin(f, uc0 + 10, p37 - uc0 - 10)}]}
          points={[
            {t: 1, y: 0.368, opacity: ramp(f, p37), color: C.blue},
            {t: 0, y: 1, opacity: ramp(f, jump), color: C.green},
          ]}
        />
      </Pop>
      <Pop show={ramp(f, jump)} x={900} y={930}>
        <Tag size={34} color={C.green}>
          u<sub>C</sub> ne saute jamais
        </Tag>
      </Pop>
      <Pop show={1} x={1390} y={350}>
        <Tex tex="i = -\dfrac{E}{R}\,e^{-t/\tau}" size={46} color={C.orange} reveal={ramp(f, neg, 20)} />
      </Pop>
      <Pop show={ramp(f, sens)} x={1340} y={500}>
        <Graph w={540} h={430} tMax={5} yMin={-1.2} yMax={0.3} yLabel="i" yColor={C.orange} yTicks={[{y: -1, label: '−E/R'}]} curves={[{f: (x) => -decharge(x), color: C.orange, progress: lin(f, neg, 45)}]} />
      </Pop>
    </>
  );
};

const L5Screen = (f: number, [s1, s2, s3]: Scene[]) => {
  const m0 = g(s1, 'relié à un moteur');
  const lift = lin(f, g(s1, 'il soulève'), s1.from + s1.frames - g(s1, 'il soulève'));
  return (
    <>
      <div style={{position: 'absolute', left: 40, top: 200}}>
        <MotorLift spin={f < m0 ? 0 : (f - m0) * 14 * (1 - 0.7 * lift)} lift={lift} q={1 - 0.8 * lift} />
      </div>
      <Pop show={ramp(f, g(s1, 'stocke'))} x={100} y={150}>
        <Tag size={38}>Un condensateur chargé stocke de l’énergie.</Tag>
      </Pop>
      <Pop show={1} x={1000} y={300}>
        <Tex tex="E_e = \tfrac{1}{2}\,C\,u_C^2" size={100} reveal={write(f, s2, 'un demi', 'au carré')} />
      </Pop>
      <Pop show={ramp(f, g(s2, 'en joules'))} x={1000} y={470}>
        <Tex tex="E_e\ \text{en J} \quad C\ \text{en F} \quad u_C\ \text{en V}" size={48} color={C.dim} />
      </Pop>
      <Pop show={ramp(f, g(s3, 'En fin de charge'))} x={960} y={640} w={900}>
        <Card color={C.blue}>
          <Tag size={34} color={C.dim}>en fin de charge : énergie maximale</Tag>
          <div style={{marginTop: 14}}>
            <Tex tex="u_C = E \;\Rightarrow\; E_e = \tfrac{1}{2}\,C\,E^2" size={56} reveal={lin(f, g(s3, 'En fin de charge'), g(s3, 'au carré', {end: true}) - g(s3, 'En fin de charge'))} />
          </div>
        </Card>
      </Pop>
    </>
  );
};

export const L1: React.FC = () => <Shell video="L1" persistent={L1Screen} />;
export const L2: React.FC = () => <Shell video="L2" persistent={L2Screen} />;
export const L3: React.FC = () => <Shell video="L3" persistent={L3Screen} />;
export const L4: React.FC = () => <Shell video="L4" persistent={L4Screen} />;
export const L5: React.FC = () => <Shell video="L5" persistent={L5Screen} />;
