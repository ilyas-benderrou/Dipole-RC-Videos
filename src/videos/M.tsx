import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Card, Crossed, Pop, Retenir, Tag} from '../components/Boxes';
import {Circuit} from '../components/Circuit';
import {charge, decharge, Graph} from '../components/Graph';
import {Cutaway3D, Stage3D} from '../components/Models3D';
import {Shell} from '../components/Shell';
import {Tex} from '../components/Tex';
import {lin, ramp} from '../lib/anim';
import {Scene, VideoId} from '../lib/timing';
import {C} from '../theme';

type SceneFn = (f: number, sc: Scene) => React.ReactNode;

/** Formule qui s'écrit pendant que la voix la prononce. */
const write = (f: number, sc: Scene, from: string, to: string, opts?: {nth?: number}) =>
  lin(f, sc.at(from) - 3, Math.max(12, sc.at(to, {end: true, nth: opts?.nth}) - sc.at(from)));
const physT = (f: number, start: number, end: number, span = 4.5) => Math.max(0, ((f - start) / (end - start)) * span);

const Local: React.FC<{fn: SceneFn; sc: Scene}> = ({fn, sc}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>{fn(f, sc)}</AbsoluteFill>;
};

const makeVideo = (video: VideoId, scenes: SceneFn[]): React.FC => {
  const Comp: React.FC = () => <Shell video={video} render={(sc) => <Local fn={scenes[Number(sc.id.split('-S')[1]) - 1]} sc={sc} />} />;
  return Comp;
};

/** Scène 1 commune : la réponse de l'apprenant, barrée en rouge. */
const wrong = (content: React.ReactNode, strikeAt: string, note?: {at: string; text: React.ReactNode}): SceneFn => (f, sc) => (
  <>
    <Pop show={ramp(f, 0)} x={960} y={330} center>
      <Crossed strike={lin(f, sc.at(strikeAt), 18)}>{content}</Crossed>
    </Pop>
    {note ? (
      <Pop show={ramp(f, sc.at(note.at))} x={960} y={720} center>
        {note.text}
      </Pop>
    ) : null}
  </>
);

/** Encadré « À retenir » centré. */
const retenir = (show: number, children: React.ReactNode, y = 300, width = 1500) => (
  <Pop show={show} x={960} y={y} center>
    <div style={{display: 'inline-block', textAlign: 'left'}}>
      <Retenir width={width}>{children}</Retenir>
    </div>
  </Pop>
);

// ───────────────────────────── M1 ─────────────────────────────
/** Électron qui monte vers B, rebondit sur le diélectrique et reste sur B. */
const electronOnB = (f: number, start: number, xEnd: number) => {
  const d = f - start;
  if (d < 0) return null;
  const up = interpolate(d, [0, 22], [760, 492], {extrapolateRight: 'clamp'});
  const bounce = d < 22 ? up : 492 + 26 * Math.sin(Math.min(1, (d - 22) / 10) * Math.PI) + interpolate(d, [22, 34], [0, 20], {extrapolateRight: 'clamp'});
  const x = interpolate(d, [22, 40], [960, xEnd], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <circle key={start} cx={x} cy={bounce} r={14} fill="#6c3fc4" />;
};

const M1: SceneFn[] = [
  wrong('« les électrons traversent le condensateur »', "C'est une erreur", {
    at: 'très fréquente',
    text: (
      <Tag size={40} color={C.dim}>
        erreur très fréquente
      </Tag>
    ),
  }),
  (f, sc) => {
    const e0 = sc.at('Les électrons qui arrivent');
    const starts = [sc.at('ne peuvent pas'), e0, e0 + 14, e0 + 28, e0 + 42, e0 + 56];
    const xs = [960, 760, 1160, 860, 1060, 660];
    return (
      <>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={960} y1={120} x2={960} y2={292} stroke={C.line} strokeWidth={8} />
          <line x1={960} y1={508} x2={960} y2={800} stroke={C.line} strokeWidth={8} />
          <rect x={560} y={292} width={800} height={24} fill={C.metal} />
          <rect x={560} y={316} width={800} height={168} fill={C.yellow} opacity={ramp(f, sc.at('il y a un isolant'))} />
          <rect x={560} y={484} width={800} height={24} fill={C.metal} />
          <text x={1390} y={312} fontSize={36} fontWeight={700} fill={C.dim} fontFamily="Arial">armature A</text>
          <text x={1390} y={504} fontSize={36} fontWeight={700} fill={C.dim} fontFamily="Arial">armature B</text>
          <text x={960} y={412} fontSize={40} fontWeight={700} fill="#8a6500" textAnchor="middle" fontFamily="Arial" opacity={ramp(f, sc.at('le diélectrique'))}>
            diélectrique (isolant)
          </text>
          {starts.map((s, k) => electronOnB(f, s, xs[k]))}
          <g opacity={ramp(f, sc.at('ne peuvent pas') + 30)} stroke={C.red} strokeWidth={10} strokeLinecap="round">
            <line x1={500} y1={360} x2={540} y2={440} />
            <line x1={540} y1={360} x2={500} y2={440} />
          </g>
        </svg>
        <Pop show={ramp(f, sc.at('ne peuvent pas') + 30)} x={120} y={380} w={360}>
          <Tag size={36} color={C.red} style={{whiteSpace: 'normal'}}>
            aucune charge ne le traverse
          </Tag>
        </Pop>
        <Pop show={ramp(f, sc.at("s'y accumulent"))} x={960} y={860} center>
          <Tag size={42}>les électrons s’accumulent sur B</Tag>
        </Pop>
      </>
    );
  },
  (f, sc) => {
    const e0 = sc.at('Pendant la charge');
    const t = physT(f, e0, sc.frames, 3.5);
    const q = f < e0 ? 0 : charge(t);
    return (
      <>
        <div style={{position: 'absolute', left: 150, top: 160}}>
          <Circuit width={880} kAngle={180} q={q} electrons={{mode: 'charge', travel: 1700 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10)}} wireGlow={ramp(f, sc.at('dans les fils'))} crossC={ramp(f, sc.at('pas à travers lui'))} />
        </div>
        <Pop show={ramp(f, sc.at("d'où vient le courant"))} x={1180} y={200}>
          <Tag size={48} style={{fontWeight: 800}}>D’où vient le courant ?</Tag>
        </Pop>
        <Pop show={ramp(f, e0)} x={1180} y={360}>
          <Card color={C.blue} style={{fontSize: 64, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>
            q = {Math.round(100 * q)} µC
          </Card>
        </Pop>
        <Pop show={ramp(f, sc.at('dans les fils'))} x={1180} y={580} w={640}>
          <Tag size={40} color={C.orange} style={{whiteSpace: 'normal'}}>
            le courant circule dans les fils, de part et d’autre du condensateur
          </Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('pas à travers lui'))} x={1180} y={760}>
          <Tag size={40} color={C.red}>… mais pas à travers lui</Tag>
        </Pop>
      </>
    );
  },
  (f, sc) => (
    <>
      <div style={{position: 'absolute', left: 260, top: 110}}>
        <Circuit width={620} kAngle={180} q={1} />
      </div>
      <Pop show={ramp(f, sc.at("le courant s'arrête"))} x={1150} y={300}>
        <Tex tex="i = 0" size={110} color={C.orange} />
        <Tag size={36} color={C.dim}>condensateur chargé</Tag>
      </Pop>
      {retenir(ramp(f, sc.at('Retiens')), <>Le courant circule dans le circuit, jamais à travers l’isolant.</>, 690)}
    </>
  ),
];

// ───────────────────────────── M2 ─────────────────────────────
const cell: React.CSSProperties = {padding: '18px 40px', fontSize: 50, textAlign: 'center', borderBottom: `2px solid #e3e5e8`};

const M2: SceneFn[] = [
  wrong('« si U augmente, C augmente »', 'Voyons pourquoi'),
  (f, sc) => {
    const r1 = sc.at('Sous cinq volts');
    const r2 = sc.at('Sous dix volts');
    const ratio = sc.at('le rapport q sur u');
    const dblU = sc.at('Quand la tension double');
    const dblQ = sc.at("c'est la charge qui double");
    const hl = (k: number) => ramp(f, ratio + k * 18);
    return (
      <>
        <Pop show={ramp(f, sc.at('dix microfarads'))} x={960} y={150} center>
          <Card color={C.blue} style={{fontSize: 60, fontWeight: 800, padding: '18px 48px'}}>C = 10 µF</Card>
        </Pop>
        <Pop show={ramp(f, r1)} x={960} y={360} center>
          <table style={{borderCollapse: 'collapse', background: C.card, borderRadius: 20, boxShadow: '0 6px 24px rgba(20,30,50,0.08)'}}>
            <thead>
              <tr>
                <th style={{...cell, color: C.blue}}>tension u</th>
                <th style={cell}>charge q</th>
                <th style={{...cell, color: C.green}}>q / u</th>
              </tr>
            </thead>
            <tbody>
              {[
                {s: r1, u: '5 V', q: '50 µC', qs: sc.at('cinquante')},
                {s: r2, u: '10 V', q: '100 µC', qs: sc.at('cent microcoulombs')},
              ].map((r, k) => (
                <tr key={k} style={{opacity: ramp(f, r.s)}}>
                  <td style={{...cell, color: C.blue}}>{r.u}</td>
                  <td style={{...cell, opacity: ramp(f, r.qs)}}>{r.q}</td>
                  <td style={{...cell, color: C.green, fontWeight: 800, background: `rgba(35,145,90,${0.16 * hl(k)})`, opacity: hl(k)}}>10 µF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Pop>
        <Pop show={ramp(f, dblU)} x={440} y={540}>
          <Tag size={46} color={C.blue} style={{fontWeight: 800}}>× 2</Tag>
        </Pop>
        <Pop show={ramp(f, dblQ)} x={1380} y={540}>
          <Tag size={46} style={{fontWeight: 800}}>× 2 ← c’est q qui double</Tag>
        </Pop>
        <Pop show={ramp(f, ratio + 36)} x={960} y={800} center>
          <Tag size={44} color={C.green}>le rapport q / u reste égal à 10 µF</Tag>
        </Pop>
      </>
    );
  },
  (f, sc) => {
    const labels = [
      {at: 'la surface des armatures', text: 'surface des armatures', color: C.metal},
      {at: 'la distance entre elles', text: 'distance entre les armatures', color: C.ink},
      {at: "la nature de l'isolant", text: 'nature de l’isolant (diélectrique)', color: C.yellow},
    ];
    return (
      <>
        <div style={{position: 'absolute', left: 40, top: 180, opacity: ramp(f, 0, 20)}}>
          <Stage3D width={860} height={760} z={8}>
            <Cutaway3D rot={f * 0.01} tilt={0.6} />
          </Stage3D>
        </div>
        <Pop show={ramp(f, 0)} x={960} y={190} w={880}>
          <Tag size={46} style={{whiteSpace: 'normal', fontWeight: 800}}>C : une caractéristique du condensateur</Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('comme la résistance R'))} x={960} y={270} w={880}>
          <Tag size={38} color={C.dim} style={{whiteSpace: 'normal'}}>comme R pour un conducteur ohmique</Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('Elle dépend de sa fabrication'))} x={960} y={420}>
          <Tag size={40}>Elle dépend de sa fabrication :</Tag>
        </Pop>
        {labels.map((l, k) => (
          <Pop key={l.at} show={ramp(f, sc.at(l.at))} x={1000} y={510 + k * 110} w={860}>
            <Card color={l.color === C.yellow ? '#d9a800' : l.color} style={{padding: '18px 30px', fontSize: 40, fontWeight: 700}}>
              {k + 1}. {l.text}
            </Card>
          </Pop>
        ))}
      </>
    );
  },
  (f, sc) =>
    retenir(
      ramp(f, 0),
      <>
        <Tex tex="C = \dfrac{q}{u_C}" size={80} /> est constante :<br />
        si <Tex tex="u_C" size={56} /> change, c’est <Tex tex="q" size={56} /> qui change.
      </>,
      280,
    ),
];

// ───────────────────────────── M3 ─────────────────────────────
const valueRows = (f: number, rows: {tex: string; at: number; color: string}[]) =>
  rows.map((r, k) => (
    <Pop key={k} show={ramp(f, r.at)} x={800} y={220 + k * 130}>
      <Tex tex={r.tex} size={66} color={r.color} />
    </Pop>
  ));

const miniGraphs = (f: number, end: boolean, show: {uc: number; i: number}) => (
  <>
    <div style={{position: 'absolute', left: 1280, top: 150}}>
      <Graph
        w={600}
        h={400}
        tMax={6}
        yMin={0}
        yMax={1.2}
        yLabel="u_C"
        yColor={C.blue}
        yTicks={[{y: 1, label: 'E'}]}
        curves={[{f: charge, color: C.blue, progress: 1, opacity: 0.45}]}
        vLines={end ? [{t: 5, label: '5τ', opacity: 1, y: 1}] : []}
        points={[{t: end ? 5 : 0, y: end ? charge(5) : 0, opacity: show.uc, color: C.blue}]}
      />
    </div>
    <div style={{position: 'absolute', left: 1280, top: 580}}>
      <Graph
        w={600}
        h={400}
        tMax={6}
        yMin={0}
        yMax={1.2}
        yLabel="i"
        yColor={C.orange}
        yTicks={[{y: 1, label: 'E/R'}]}
        curves={[{f: decharge, color: C.orange, progress: 1, opacity: 0.45}]}
        vLines={end ? [{t: 5, label: '5τ', opacity: 1, y: 0.4}] : []}
        points={[{t: end ? 5 : 0, y: end ? decharge(5) : 1, opacity: show.i, color: C.orange}]}
      />
    </div>
  </>
);

const M3: SceneFn[] = [
  wrong(<Tex tex="\text{à } t = 0,\ u_C = E" size={64} />, 'Regardons'),
  (f, sc) => {
    const uc = sc.at('u c vaut zéro');
    const i0 = sc.at('le courant est maximal');
    return (
      <>
        <Pop show={ramp(f, 0)} x={80} y={130}>
          <Tag size={48} style={{fontWeight: 800}}>
            à t = 0 <span style={{color: C.dim, fontWeight: 600}}>(on ferme K)</span>
          </Tag>
        </Pop>
        <div style={{position: 'absolute', left: 20, top: 220}}>
          <Circuit width={740} kAngle={180} q={0} iGlow={ramp(f, i0)} />
        </div>
        {valueRows(f, [
          {tex: 'u_C = 0', at: uc, color: C.blue},
          {tex: 'u_R = E', at: sc.at('Toute la tension E'), color: C.ink},
          {tex: 'i = \\dfrac{E}{R}', at: sc.at('égal à E sur R'), color: C.orange},
        ])}
        <Pop show={ramp(f, sc.at('ne peut pas sauter'))} x={800} y={720} w={440}>
          <Tag size={34} color={C.green} style={{whiteSpace: 'normal'}}>
            u<sub>C</sub> ne peut pas sauter d’un coup
          </Tag>
        </Pop>
        {miniGraphs(f, false, {uc: ramp(f, uc), i: ramp(f, i0)})}
      </>
    );
  },
  (f, sc) => {
    const uc = sc.at('u c a rejoint E');
    const i0 = sc.at('le courant est nul');
    return (
      <>
        <Pop show={ramp(f, 0)} x={80} y={130}>
          <Tag size={48} style={{fontWeight: 800}}>
            après 5τ <span style={{color: C.dim, fontWeight: 600}}>(fin de la charge)</span>
          </Tag>
        </Pop>
        <div style={{position: 'absolute', left: 20, top: 220}}>
          <Circuit width={740} kAngle={180} q={1} />
        </div>
        {valueRows(f, [
          {tex: 'u_C = E', at: uc, color: C.blue},
          {tex: 'u_R = 0', at: sc.at('Il ne reste plus'), color: C.ink},
          {tex: 'i = 0', at: i0, color: C.orange},
        ])}
        <Pop show={ramp(f, sc.at('interrupteur ouvert'))} x={800} y={640} w={440}>
          <Tag size={34} color={C.dim} style={{whiteSpace: 'normal'}}>
            le condensateur se comporte comme un interrupteur ouvert
          </Tag>
        </Pop>
        {miniGraphs(f, true, {uc: ramp(f, uc), i: ramp(f, i0)})}
      </>
    );
  },
  (f, sc) => {
    const row: React.CSSProperties = {padding: '14px 34px', fontSize: 44, borderBottom: '2px solid #e3e5e8'};
    return retenir(
      ramp(f, 0),
      <>
        <div>
          <Tex tex="u_C" size={54} /> ne saute jamais ; <Tex tex="i" size={54} /> peut sauter.
        </div>
        <table style={{borderCollapse: 'collapse', marginTop: 20}}>
          <tbody>
            <tr style={{opacity: ramp(f, sc.at('Au début'))}}>
              <td style={{...row, fontWeight: 800}}>début</td>
              <td style={row}>
                <Tex tex="u_C = 0" size={50} color={C.blue} />
              </td>
              <td style={row}>
                <Tex tex="i = E/R" size={50} color={C.orange} />
              </td>
            </tr>
            <tr style={{opacity: ramp(f, sc.at('À la fin'))}}>
              <td style={{...row, fontWeight: 800}}>fin</td>
              <td style={row}>
                <Tex tex="u_C = E" size={50} color={C.blue} />
              </td>
              <td style={row}>
                <Tex tex="i = 0" size={50} color={C.orange} />
              </td>
            </tr>
          </tbody>
        </table>
      </>,
      200,
    );
  },
];

// ───────────────────────────── M4 ─────────────────────────────
const step = (f: number, n: number, title: React.ReactNode) => (
  <Pop show={ramp(f, 0)} x={80} y={130}>
    <Tag size={48} style={{fontWeight: 800}}>
      <span style={{color: C.blue}}>Étape {n}</span> · {title}
    </Tag>
  </Pop>
);

const M4: SceneFn[] = [
  (f, sc) => (
    <>
      {wrong(<Tex tex="u_R = R\,\dfrac{du_C}{dt}" size={72} />, 'Voici une méthode')(f, sc)}
      <Pop show={ramp(f, sc.at('trois étapes'))} x={960} y={720} center>
        <div style={{display: 'flex', gap: 30}}>
          {['1 · additivité des tensions', '2 · exprimer u_R', '3 · remplacer'].map((t, k) => (
            <Card key={t} color={C.blue} style={{fontSize: 36, fontWeight: 700, padding: '16px 28px', opacity: ramp(f, sc.at('trois étapes') + k * 8)}}>
              {t.includes('u_R') ? <>2 · exprimer u<sub>R</sub></> : t}
            </Card>
          ))}
        </div>
      </Pop>
    </>
  ),
  (f, sc) => {
    const d = sc.at('Pendant la décharge');
    return (
      <>
        {step(f, 1, 'loi d’additivité des tensions')}
        <Pop show={ramp(f, sc.at('Pendant la charge'))} x={120} y={210}>
          <Tag size={40} color={C.blue}>Charge (K en 1)</Tag>
          <Circuit width={640} kAngle={180} q={0.5} />
        </Pop>
        <Pop show={1} x={170} y={850}>
          <Tex tex="u_R + u_C = E" size={76} reveal={write(f, sc, 'u R plus u c égale E', 'u R plus u c égale E')} />
        </Pop>
        <Pop show={ramp(f, d)} x={1060} y={210}>
          <Tag size={40} color={C.blue}>Décharge (K en 2)</Tag>
          <Circuit width={640} kAngle={0} q={0.5} genGrey={ramp(f, sc.at('le générateur est retiré'))} />
        </Pop>
        <Pop show={1} x={1110} y={850}>
          <Tex tex="u_R + u_C = 0" size={76} reveal={write(f, sc, 'u R plus u c égale zéro', 'u R plus u c égale zéro')} />
        </Pop>
      </>
    );
  },
  (f, sc) => {
    const oublie = sc.at("N'oublie pas le C");
    return (
      <>
        {step(f, 2, <>exprimer u<sub>R</sub></>)}
        <Pop show={1} x={300} y={260}>
          <Tex tex="u_R = R\,i" size={84} reveal={write(f, sc, 'u R égale R', 'fois i')} />
          <Tag size={34} color={C.dim} style={{opacity: ramp(f, sc.at("La loi d'Ohm"))}}>
            loi d’Ohm
          </Tag>
        </Pop>
        <Pop show={1} x={300} y={460}>
          <div style={{position: 'relative'}}>
            <Tex tex="i = C\,\dfrac{du_C}{dt}" size={84} reveal={write(f, sc, 'i égale C', 'sur dé t')} style={{opacity: 1 - ramp(f, oublie, 8)}} />
            <Tex tex="i = {\color{#d62828}\boxed{C}}\,\dfrac{du_C}{dt}" size={84} style={{position: 'absolute', left: 0, top: 0, opacity: ramp(f, oublie, 8)}} />
          </div>
          <Tag size={34} color={C.dim} style={{opacity: ramp(f, sc.at('pour le condensateur'))}}>
            condensateur
          </Tag>
        </Pop>
        <Pop show={ramp(f, oublie)} x={1050} y={500}>
          <Tag size={46} color={C.red} style={{fontWeight: 800}}>N’oublie pas le C !</Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('Donc u R'))} x={300} y={730}>
          <Card color={C.blue}>
            <Tex tex="u_R = RC\,\dfrac{du_C}{dt}" size={84} reveal={write(f, sc, 'Donc u R', 'sur dé t', {nth: 1})} />
          </Card>
        </Pop>
      </>
    );
  },
  (f, sc) => (
    <>
      {step(f, 3, 'on remplace')}
      <Pop show={ramp(f, sc.at('En charge'))} x={200} y={300}>
        <Tag size={40} color={C.blue}>Charge</Tag>
      </Pop>
      <Pop show={1} x={200} y={370}>
        <Tex tex="RC\,\dfrac{du_C}{dt} + u_C = E" size={84} reveal={write(f, sc, 'En charge', 'égale E')} />
      </Pop>
      <Pop show={ramp(f, sc.at('En décharge'))} x={200} y={620}>
        <Tag size={40} color={C.blue}>Décharge</Tag>
      </Pop>
      <Pop show={1} x={200} y={690}>
        <Tex tex="RC\,\dfrac{du_C}{dt} + u_C = 0" size={84} reveal={write(f, sc, 'En décharge', 'égale zéro')} />
      </Pop>
    </>
  ),
  (f, sc) =>
    retenir(
      ramp(f, 0),
      <>
        <div>Condition initiale :</div>
        <div style={{opacity: ramp(f, sc.at('en charge')), marginTop: 16}}>
          charge : <Tex tex="u_C(0) = 0" size={60} color={C.blue} /> <span style={{color: C.dim, fontSize: 40}}>(part vide)</span>
        </div>
        <div style={{opacity: ramp(f, sc.at('en décharge')), marginTop: 16}}>
          décharge : <Tex tex="u_C(0) = E" size={60} color={C.blue} /> <span style={{color: C.dim, fontSize: 40}}>(part chargé)</span>
        </div>
      </>,
      240,
    ),
];

// ───────────────────────────── M5 ─────────────────────────────
const M5: SceneFn[] = [
  wrong('« en charge, τ lu à 0,37E »', 'Voici comment'),
  (f, sc) => {
    const p = sc.at('à tau');
    return (
      <>
        <Pop show={ramp(f, 0)} x={80} y={130}>
          <Tag size={48} style={{fontWeight: 800}}>En charge</Tag>
        </Pop>
        <div style={{position: 'absolute', left: 40, top: 220}}>
          <Graph
            w={980}
            h={760}
            tMax={5}
            yMin={0}
            yMax={1.15}
            yLabel="u_C"
            yColor={C.blue}
            yTicks={[{y: 1, label: 'E'}]}
            hLines={[{y: 1, label: '', opacity: 1}, {y: 0.632, label: '0,63E', opacity: ramp(f, p), tEnd: 1}]}
            vLines={[{t: 1, label: 'τ', opacity: ramp(f, p), y: 0.632}]}
            curves={[{f: charge, color: C.blue, progress: lin(f, 0, 50)}]}
            points={[{t: 1, y: 0.632, opacity: ramp(f, p), color: C.blue}]}
          />
        </div>
        <Pop show={ramp(f, sc.at('remplace t par tau'))} x={1080} y={240}>
          <Tag size={40} color={C.dim}>t = τ :</Tag>
        </Pop>
        <Pop show={1} x={1060} y={310}>
          <Tex tex="u_C(\tau) = E\left(1 - e^{-1}\right) \approx 0{,}63\,E" size={48} reveal={write(f, sc, 'u c égale E', 'soixante-trois E')} />
        </Pop>
        <Pop show={ramp(f, sc.at('La tension monte'))} x={1080} y={500} w={760}>
          <Card color={C.blue} style={{fontSize: 44, fontWeight: 700}}>
            u<sub>C</sub> monte : à τ, elle a atteint <span style={{color: C.blue}}>63 %</span> de E
          </Card>
        </Pop>
      </>
    );
  },
  (f, sc) => {
    const p = sc.at('à tau');
    const bar = ramp(f, sc.at('elle a perdu'), 25);
    return (
      <>
        <Pop show={ramp(f, 0)} x={80} y={130}>
          <Tag size={48} style={{fontWeight: 800}}>En décharge</Tag>
        </Pop>
        <div style={{position: 'absolute', left: 40, top: 220}}>
          <Graph
            w={980}
            h={760}
            tMax={5}
            yMin={0}
            yMax={1.15}
            yLabel="u_C"
            yColor={C.blue}
            yTicks={[{y: 1, label: 'E'}]}
            hLines={[{y: 0.368, label: '0,37E', opacity: ramp(f, p), tEnd: 1}]}
            vLines={[{t: 1, label: 'τ', opacity: ramp(f, p), y: 0.368}]}
            curves={[{f: decharge, color: C.blue, progress: lin(f, 0, 50)}]}
            points={[{t: 1, y: 0.368, opacity: ramp(f, p), color: C.blue}]}
          />
        </div>
        <Pop show={1} x={1080} y={300}>
          <Tex tex="u_C(\tau) = E\,e^{-1} \approx 0{,}37\,E" size={58} reveal={write(f, sc, 'u c égale E', 'trente-sept E')} />
        </Pop>
        <Pop show={bar} x={1080} y={500}>
          <Tag size={36} color={C.dim}>à t = τ :</Tag>
          <div style={{display: 'flex', width: 760, height: 90, marginTop: 14, borderRadius: 14, overflow: 'hidden', border: `3px solid ${C.line}`}}>
            <div style={{width: `${63 * bar}%`, background: '#d9dce1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: C.dim}}>63 % perdus</div>
            <div style={{flex: 1, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#fff', opacity: ramp(f, sc.at('il en reste'))}}>37 %</div>
          </div>
        </Pop>
        <Pop show={ramp(f, sc.at('il en reste'))} x={1080} y={680} w={760}>
          <Tag size={40} style={{whiteSpace: 'normal'}}>il reste 37 % de E</Tag>
        </Pop>
      </>
    );
  },
  (f, sc) => (
    <>
      {retenir(ramp(f, 0), <>À t = τ, 63 % du changement est fait.</>, 140, 1500)}
      <div style={{position: 'absolute', left: 420, top: 470, opacity: ramp(f, 0)}}>
        <Graph
          w={1080}
          h={540}
          tMax={6}
          yMin={0}
          yMax={1.15}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          hLines={[{y: 1, label: '', opacity: 1}, {y: 0.632, label: '0,63E', opacity: 1, tEnd: 1}]}
          vLines={[
            {t: 1, label: 'τ', opacity: 1, y: 0.632},
            {t: 5, label: '5τ', opacity: ramp(f, sc.at('cinq tau')), y: 1},
          ]}
          curves={[{f: charge, color: C.blue, progress: 1}]}
          points={[{t: 5, y: charge(5), opacity: ramp(f, sc.at('cinq tau')), color: C.blue}]}
        />
      </div>
      <Pop show={ramp(f, sc.at("ce n'est pas fini"))} x={1530} y={600} w={360}>
        <Tag size={36} style={{whiteSpace: 'normal'}}>fin de la charge : environ 5τ</Tag>
      </Pop>
    </>
  ),
];

// ───────────────────────────── M6 ─────────────────────────────
const M6: SceneFn[] = [
  wrong(<Tex tex="\text{décharge : } i = +\dfrac{E}{R}\,e^{-t/\tau}" size={66} />, 'Voyons pourquoi'),
  (f, sc) => {
    const e0 = sc.at('les charges repartent');
    const t = physT(f, e0, sc.frames, 3.5);
    return (
      <>
        <Pop show={ramp(f, 0)} x={80} y={130}>
          <Tag size={48} style={{fontWeight: 800}}>Décharge (K en 2)</Tag>
        </Pop>
        <div style={{position: 'absolute', left: 120, top: 200}}>
          <Circuit width={880} kAngle={0} genGrey={1} q={f < e0 ? 1 : decharge(t)} iGlow={ramp(f, sc.at('même orientation'))} electrons={{mode: 'decharge', travel: 1700 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10)}} realArrow={ramp(f, sc.at('le courant réel'))} />
        </div>
        <Pop show={ramp(f, sc.at('même orientation'))} x={1150} y={260} w={700}>
          <Tag size={40} style={{whiteSpace: 'normal'}}>
            flèche de <i>i</i> : même orientation que pendant la charge
          </Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('le courant réel'))} x={1150} y={440} w={700}>
          <Tag size={40} color={C.orange} style={{whiteSpace: 'normal'}}>
            courant réel : opposé à la flèche
          </Tag>
        </Pop>
        <Pop show={ramp(f, sc.at('Donc i est négatif'))} x={1150} y={620}>
          <Tex tex="i < 0" size={110} color={C.orange} />
        </Pop>
      </>
    );
  },
  (f, sc) => (
    <>
      <Pop show={1} x={300} y={200}>
        <Tex tex="i = C\,\dfrac{du_C}{dt}" size={84} reveal={write(f, sc, 'i égale C', 'sur dé t')} />
      </Pop>
      <Pop show={1} x={300} y={430}>
        <Tex tex="u_C \text{ diminue} \;\Rightarrow\; \dfrac{du_C}{dt} < 0" size={72} color={C.blue} reveal={write(f, sc, 'Comme u c diminue', 'est négative')} />
      </Pop>
      <Pop show={ramp(f, sc.at('On obtient'))} x={300} y={680}>
        <Card color={C.orange}>
          <Tex tex="i = -\dfrac{E}{R}\,e^{-t/\tau}" size={84} reveal={write(f, sc, 'i égale moins', 'sur tau')} />
        </Card>
      </Pop>
    </>
  ),
  (f, sc) => (
    <>
      <div style={{position: 'absolute', left: 60, top: 220, opacity: ramp(f, 0)}}>
        <Graph w={900} h={620} tMax={5} yMin={-1.2} yMax={0.3} yLabel="i" yColor={C.orange} yTicks={[{y: -1, label: '−E/R'}]} curves={[{f: (x) => -decharge(x), color: C.orange, progress: lin(f, 0, 45)}]} />
      </div>
      <Pop show={ramp(f, sc.at('Retiens'))} x={1000} y={300}>
        <Retenir width={850}>
          En décharge, <Tex tex="i < 0" size={60} color={C.orange} />.
          <div style={{fontSize: 38, fontWeight: 500, marginTop: 18, opacity: ramp(f, sc.at('Le signe moins'))}}>
            Le signe − : le courant circule dans le sens inverse de la charge.
          </div>
        </Retenir>
      </Pop>
    </>
  ),
];

export const M1V = makeVideo('M1', M1);
export const M2V = makeVideo('M2', M2);
export const M3V = makeVideo('M3', M3);
export const M4V = makeVideo('M4', M4);
export const M5V = makeVideo('M5', M5);
export const M6V = makeVideo('M6', M6);
