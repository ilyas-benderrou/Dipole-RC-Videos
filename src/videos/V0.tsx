import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Card, Pop, Tag} from '../components/Boxes';
import {Circuit} from '../components/Circuit';
import {charge, decharge, Graph} from '../components/Graph';
import {Ceramic3D, Cutaway3D, Electrolytic3D, Resistor3D, Stage3D} from '../components/Models3D';
import {Photo} from '../components/Photo';
import {Shell} from '../components/Shell';
import {Tex} from '../components/Tex';
import {lin, ramp, steps, window_} from '../lib/anim';
import {plan, Scene} from '../lib/timing';
import {C} from '../theme';
import data from '../data/scenes.json';

/** Formule qui s'écrit pendant que la voix la prononce (de `from` à la fin de `to`). */
const writeOn = (f: number, sc: Scene, from: string, to: string) => lin(f, sc.at(from) - 3, Math.max(12, sc.at(to, {end: true}) - sc.at(from)));

const S1: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const a = sc.at('Tous ont besoin');
  const big = 1 - ramp(f, a, 15);
  const photos = [
    {src: 'images/flash.png', cap: 'Flash d’appareil photo', start: 0},
    {src: 'images/defibrillateur.png', cap: 'Défibrillateur', start: sc.at('un défibrillateur')},
    {src: 'images/carte.png', cap: 'Mémoire d’ordinateur', start: sc.at("la mémoire d'un ordinateur")},
  ];
  const burst = window_(f, sc.at('flash') + 4, sc.at('flash') + 18, 5);
  return (
    <AbsoluteFill>
      {photos.map((p, k) => {
        const next = photos[k + 1]?.start ?? 1e9;
        const op = big * (k === 0 ? 1 : ramp(f, p.start, 12)) * (k < 2 ? 1 - ramp(f, next + 12, 1) : 1);
        return (
          <div key={p.src} style={{position: 'absolute', left: 200, top: 130, opacity: op}}>
            <Photo src={p.src} w={1520} h={855} t={lin(f, p.start, 240)} flash={k === 0 ? burst : 0} />
            <div style={{position: 'absolute', left: 32, bottom: 32, background: 'rgba(255,255,255,0.92)', padding: '14px 28px', borderRadius: 14, fontSize: 40, fontWeight: 700}}>
              {p.cap}
            </div>

          </div>
        );
      })}
      {photos.map((p, k) => (
        <Pop key={`t${k}`} show={ramp(f, a + k * 4, 15)} x={130 + k * 570} y={150}>
          <Photo src={p.src} w={520} h={292} t={0.5} radius={18} />
          <Tag size={30} color={C.dim} style={{marginTop: 12}}>
            {p.cap}
          </Tag>
        </Pop>
      ))}
      <Pop show={ramp(f, sc.at('stocke'))} x={960} y={560} center>
        <Tag size={50}>stocke l’énergie électrique…</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('et la libère'))} x={960} y={640} center>
        <Tag size={50}>… et la libère au bon moment</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('le condensateur'))} x={960} y={740} center>
        <Tag size={86} color={C.blue} style={{fontWeight: 800}}>
          le condensateur
        </Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('il se charge'))} x={760} y={880} center>
        <Tag size={44} color={C.blue}>charge</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('il se décharge'))} x={1160} y={880} center>
        <Tag size={44} color={C.blue}>décharge</Tag>
      </Pop>
    </AbsoluteFill>
  );
};

const S2: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: ramp(f, 0, 12), textAlign: 'center'}}>
        <div style={{fontSize: 120, fontWeight: 800}}>Le dipôle RC</div>
        <div style={{fontSize: 56, color: C.dim, marginTop: 10}}>charge et décharge d’un condensateur</div>
      </div>
      <div style={{display: 'flex', gap: 40, marginTop: 70, opacity: ramp(f, sc.at('deux composants'))}}>
        <Card color={C.ink} style={{fontSize: 40, fontWeight: 700}}>conducteur ohmique</Card>
        <Card color={C.blue} style={{fontSize: 40, fontWeight: 700}}>condensateur</Card>
      </div>
    </AbsoluteFill>
  );
};

/** Symbole du conducteur ohmique avec i et u_R en convention récepteur. */
const ResistorSymbol: React.FC<{arrows: number}> = ({arrows}) => (
  <svg width={800} height={300} viewBox="0 0 800 300">
    <line x1={60} y1={120} x2={300} y2={120} stroke={C.line} strokeWidth={6} />
    <rect x={300} y={85} width={200} height={70} fill={C.bg} stroke={C.line} strokeWidth={6} />
    <line x1={500} y1={120} x2={740} y2={120} stroke={C.line} strokeWidth={6} />
    <circle cx={60} cy={120} r={9} fill={C.line} />
    <circle cx={740} cy={120} r={9} fill={C.line} />
    <text x={400} y={60} fontSize={40} textAnchor="middle" fontStyle="italic" fontFamily="KaTeX_Math, serif">R</text>
    <g opacity={arrows}>
      <line x1={130} y1={120} x2={215} y2={120} stroke={C.orange} strokeWidth={7} />
      <polygon points="240,120 212,106 212,134" fill={C.orange} />
      <text x={185} y={95} fontSize={40} textAnchor="middle" fill={C.orange} fontStyle="italic" fontFamily="KaTeX_Math, serif">i</text>
      <line x1={530} y1={215} x2={300} y2={215} stroke={C.ink} strokeWidth={5} />
      <polygon points="272,215 302,201 302,229" fill={C.ink} />
      <text x={400} y={272} fontSize={40} textAnchor="middle" fontFamily="KaTeX_Math, serif">
        <tspan fontStyle="italic">u</tspan>
        <tspan dy={10} fontSize={28}>R</tspan>
      </text>
    </g>
  </svg>
);

const S3: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const schema = sc.at('Sur un schéma');
  return (
    <AbsoluteFill>
      <Pop show={ramp(f, 0)} x={80} y={130}>
        <Tag size={46} style={{fontWeight: 800}}>Le conducteur ohmique</Tag>
      </Pop>
      <div style={{position: 'absolute', left: 40, top: 200, opacity: ramp(f, 0, 20)}}>
        <Stage3D width={920} height={560} z={6.5}>
          <Resistor3D rot={0.6 * Math.sin(f / 45)} />
        </Stage3D>
      </div>
      <Pop show={ramp(f, sc.at('deux bornes'))} x={100} y={790}>
        <Tag size={40}>• un dipôle : 2 bornes</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('sa résistance R'))} x={100} y={850}>
        <Tag size={40}>• résistance R en ohms (Ω)</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('ses anneaux'))} x={100} y={910}>
        <Tag size={40}>• anneaux de couleur → valeur de R</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('cartes électroniques')) * (1 - ramp(f, schema - 6, 12))} x={1020} y={190}>
        <Photo src="images/carte.png" w={820} h={461} t={lin(f, sc.at('cartes électroniques'), 300)} />
      </Pop>
      <Pop show={ramp(f, sc.at('un rectangle'))} x={1020} y={210}>
        <ResistorSymbol arrows={ramp(f, sc.at('En convention récepteur'))} />
      </Pop>
      <Pop show={1} x={1060} y={560}>
        <Tex tex="u_R = R \cdot i" size={96} reveal={writeOn(f, sc, 'u R égale', 'R fois i')} />
      </Pop>
      <Pop show={ramp(f, sc.at('Attention'))} x={1020} y={760} w={830}>
        <Card color={C.orange} style={{fontSize: 36, lineHeight: 1.5}}>
          <b>conducteur ohmique</b> → le composant
          <br />
          <b>résistance R</b> → sa grandeur
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

/** Deux plaques face à face séparées par le diélectrique. */
const Plates: React.FC<{labels: number; cross: number}> = ({labels, cross}) => (
  <svg width={820} height={330} viewBox="0 0 820 330">
    <rect x={370} y={40} width={80} height={240} fill={C.yellow} opacity={0.7} />
    <rect x={345} y={30} width={25} height={260} fill={C.metal} />
    <rect x={450} y={30} width={25} height={260} fill={C.metal} />
    <line x1={120} y1={160} x2={345} y2={160} stroke={C.line} strokeWidth={6} />
    <line x1={475} y1={160} x2={700} y2={160} stroke={C.line} strokeWidth={6} />
    <g opacity={labels} fontFamily="Arial" fontSize={28} fontWeight={700}>
      <text x={330} y={316} textAnchor="end" fill={C.dim}>armature</text>
      <text x={490} y={316} fill={C.dim}>armature</text>
      <text x={410} y={22} textAnchor="middle" fill="#b8860b">diélectrique (isolant)</text>
    </g>
    <g opacity={cross}>
      <line x1={250} y1={110} x2={540} y2={110} stroke={C.red} strokeWidth={6} />
      <polygon points="570,110 540,96 540,124" fill={C.red} />
      <line x1={385} y1={70} x2={435} y2={150} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
      <line x1={435} y1={70} x2={385} y2={150} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
    </g>
  </svg>
);

const CapSymbol: React.FC = () => (
  <svg width={820} height={170} viewBox="0 0 820 170">
    <line x1={150} y1={85} x2={385} y2={85} stroke={C.line} strokeWidth={6} />
    <line x1={385} y1={25} x2={385} y2={145} stroke={C.line} strokeWidth={9} />
    <line x1={435} y1={25} x2={435} y2={145} stroke={C.line} strokeWidth={9} />
    <line x1={435} y1={85} x2={670} y2={85} stroke={C.line} strokeWidth={6} />
    <text x={410} y={170} textAnchor="middle" fontSize={34} fontStyle="italic" fontFamily="KaTeX_Math, serif">C</text>
  </svg>
);

const S4: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const inside = sc.at("À l'intérieur");
  const polar = sc.at('Le condensateur électrolytique');
  const caps = 1 - ramp(f, inside - 6, 12);
  const cut = ramp(f, inside, 15) * (1 - ramp(f, polar - 6, 12));
  const elec = ramp(f, polar, 15);
  return (
    <AbsoluteFill>
      <Pop show={ramp(f, 0)} x={80} y={130}>
        <Tag size={46} style={{fontWeight: 800}}>Le condensateur</Tag>
      </Pop>
      {caps > 0 ? (
        <div style={{position: 'absolute', left: 40, top: 200, opacity: caps}}>
          <Stage3D width={920} height={640} z={7.5}>
            <Electrolytic3D rot={f * 0.015} position={[-1.1, 0.9, 0]} scale={0.8} />
            <Ceramic3D rot={f * 0.015} position={[1.3, 1.0, 0]} scale={0.9} />
          </Stage3D>
          <div style={{position: 'absolute', left: 150, top: 560, fontSize: 34, color: C.dim, fontWeight: 600}}>électrolytique</div>
          <div style={{position: 'absolute', left: 580, top: 560, fontSize: 34, color: C.dim, fontWeight: 600}}>céramique</div>
        </div>
      ) : null}
      {cut > 0 ? (
        <div style={{position: 'absolute', left: 40, top: 200, opacity: cut}}>
          <Stage3D width={920} height={600} z={8}>
            <Cutaway3D rot={f * 0.01} tilt={0.6} />
          </Stage3D>
          <div style={{position: 'absolute', left: 60, top: 600, fontSize: 32, fontWeight: 600, display: 'flex', gap: 40}}>
            <span style={{opacity: ramp(f, sc.at('deux armatures'))}}>
              <span style={{color: C.metal}}>■</span> armatures (métal)
            </span>
            <span style={{opacity: ramp(f, sc.at('le diélectrique'))}}>
              <span style={{color: C.yellow}}>■</span> diélectrique (isolant)
            </span>
          </div>
          <div style={{position: 'absolute', left: 60, top: 660, fontSize: 36, fontWeight: 700, color: C.blue, opacity: ramp(f, sc.at('enroulées'))}}>
            vue en coupe : feuilles enroulées
          </div>
        </div>
      ) : null}
      {elec > 0 ? (
        <div style={{position: 'absolute', left: 40, top: 200, opacity: elec}}>
          <Stage3D width={920} height={680} z={7}>
            <Electrolytic3D rot={-0.55 + 0.1 * Math.sin(f / 40)} position={[0, 0.8, 0]} scale={0.95} />
          </Stage3D>
          <div style={{position: 'absolute', left: 530, top: 585, fontSize: 64, fontWeight: 800, color: C.red, opacity: ramp(f, sc.at('une borne plus'))}}>+</div>
          <div style={{position: 'absolute', left: 350, top: 485, fontSize: 70, fontWeight: 800, color: C.blue, opacity: ramp(f, sc.at('une borne moins'))}}>−</div>
          <div style={{position: 'absolute', left: 120, top: 720, fontSize: 34, fontWeight: 700, color: C.orange, opacity: ramp(f, sc.at('il faut respecter'))}}>
            respecter le sens de branchement
          </div>
        </div>
      ) : null}
      <Pop show={ramp(f, sc.at('enroulées'))} x={1010} y={130}>
        <Tag size={32} color={C.dim}>simplification : deux plaques face à face</Tag>
      </Pop>
      <Pop show={ramp(f, sc.at('enroulées'))} x={1010} y={180}>
        <Plates labels={ramp(f, sc.at('enroulées') + 10)} cross={ramp(f, sc.at('aucune charge'))} />
      </Pop>
      <Pop show={ramp(f, sc.at('deux traits parallèles'))} x={1010} y={540}>
        <Tag size={32} color={C.dim}>symbole</Tag>
        <CapSymbol />
      </Pop>
      <Pop show={ramp(f, sc.at('sa capacité C'))} x={1010} y={790} w={840}>
        <Card color={C.blue} style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <Tex tex="C \text{ en farads (F)}" size={54} />
          <Tex tex="\text{— } \mu\text{F},\ \text{nF}" size={54} reveal={ramp(f, sc.at('microfarads'), 20)} />
        </Card>
      </Pop>
    </AbsoluteFill>
  );
};

const S5: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const gen = sc.at('un générateur');
  const k = sc.at('un interrupteur');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 520, top: 170}}>
        <Circuit
          width={880}
          kAngle={140}
          showR={ramp(f, 0)}
          showC={ramp(f, 8)}
          rcBrace={window_(f, sc.at('dipôle R C') - 4, k + 10)}
          showGen={ramp(f, gen)}
          showK={ramp(f, k)}
          showArrows={ramp(f, sc.at('deux positions', {end: true}) + 6)}
          q={0}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Temps physique (en τ) qui avance de 0 à `span` entre `start` et `end`. */
const phys = (f: number, start: number, end: number, span = 4.5) => Math.max(0, ((f - start) / (end - start)) * span);

const S6: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const kOn = sc.at('K en position un');
  const e0 = sc.at('Les électrons');
  const t = phys(f, e0, sc.frames);
  const graphs = sc.at('Au début');
  const uc0 = sc.at('Puis u c monte');
  const i0 = sc.at('et le courant diminue');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 30, top: 170}}>
        <Circuit
          width={860}
          kAngle={steps(f, [[0, 140], [kOn, 180]], 10)}
          q={f < e0 ? 0 : charge(t)}
          electrons={{mode: 'charge', travel: 1500 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10) * (1 - ramp(f, uc0 + 120, 40))}}
          iGlow={window_(f, graphs, i0 + 30)}
        />
      </div>
      <Pop show={ramp(f, sc.at('la tension passe')) * (1 - ramp(f, e0 - 8, 12))} x={960} y={200}>
        <Graph w={880} h={420} tMax={5} yMin={0} yMax={1.25} yLabel="u" curves={[{f: (x) => (x < 1 ? 0 : 1), color: C.ink, progress: 1}]} yTicks={[{y: 1, label: 'E'}]} />
        <Tag size={40} color={C.dim} style={{marginLeft: 120, opacity: ramp(f, sc.at('un échelon'))}}>
          échelon de tension montant : 0 → E
        </Tag>
      </Pop>
      <Pop show={ramp(f, e0 + 10) * (1 - ramp(f, graphs - 8, 12))} x={980} y={420} w={860}>
        <Tag size={42} style={{whiteSpace: 'normal', opacity: ramp(f, sc.at('A devient positive'))}}>
          A devient positive <span style={{color: C.red}}>(+)</span>, B négative <span style={{color: C.blue}}>(−)</span> : le condensateur se charge.
        </Tag>
      </Pop>
      <Pop show={ramp(f, graphs)} x={960} y={150}>
        <Graph
          w={900}
          h={420}
          tMax={5}
          yMin={0}
          yMax={1.2}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          hLines={[{y: 1, label: '', opacity: ramp(f, uc0)}]}
          curves={[{f: charge, color: C.blue, progress: lin(f, uc0, sc.at('vers E', {end: true}) - uc0)}]}
          points={[{t: 0, y: 0, opacity: window_(f, sc.at('u c est nulle'), uc0 + 20), color: C.blue}]}
        />
      </Pop>
      <Pop show={ramp(f, graphs)} x={960} y={600}>
        <Graph
          w={900}
          h={420}
          tMax={5}
          yMin={0}
          yMax={1.2}
          yLabel="i"
          yColor={C.orange}
          yTicks={[{y: 1, label: 'E/R'}]}
          curves={[{f: decharge, color: C.orange, progress: lin(f, i0, sc.at('jusqu', {end: true}) + 25 - i0)}]}
          points={[{t: 0, y: 1, opacity: window_(f, sc.at('le courant est maximal'), i0 + 20), color: C.orange}]}
        />
      </Pop>
    </AbsoluteFill>
  );
};

const S7: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const kOn = sc.at('K en position deux');
  const e0 = sc.at('Les électrons de B');
  const t = phys(f, e0, sc.frames);
  const neg = sc.at('il est donc négatif');
  const uc0 = sc.at('Et u c diminue');
  const gr = sc.at("c'est la décharge");
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 30, top: 170}}>
        <Circuit
          width={860}
          kAngle={steps(f, [[0, 180], [kOn, 0]], 18)}
          genGrey={ramp(f, sc.at('le générateur est retiré'))}
          q={f < e0 ? 1 : decharge(t)}
          electrons={{mode: 'decharge', travel: 1500 * (1 - Math.exp(-t)), opacity: ramp(f, e0, 10) * (1 - ramp(f, uc0 + 150, 40))}}
          realArrow={ramp(f, sc.at('Le courant circule'))}
        />
      </div>
      <Pop show={ramp(f, gr)} x={960} y={150}>
        <Graph
          w={900}
          h={420}
          tMax={5}
          yMin={0}
          yMax={1.2}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          curves={[{f: decharge, color: C.blue, progress: lin(f, uc0, sc.at('lentement', {end: true}) + 20 - uc0)}]}
        />
      </Pop>
      <Pop show={ramp(f, gr)} x={960} y={600}>
        <Graph
          w={900}
          h={420}
          tMax={5}
          yMin={-1.2}
          yMax={0.35}
          yLabel="i"
          yColor={C.orange}
          yTicks={[{y: -1, label: '−E/R'}]}
          curves={[{f: (x) => -decharge(x), color: C.orange, progress: lin(f, neg, 70)}]}
        />
      </Pop>
      <Pop show={ramp(f, neg)} x={1560} y={900}>
        <Tag size={44} color={C.orange} style={{fontWeight: 800}}>
          i &lt; 0
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};

const S8: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const slow = sc.at('Plus tau est grande');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 160, top: 220, opacity: ramp(f, 0)}}>
        <Graph
          w={1150}
          h={720}
          tMax={8}
          yMin={0}
          yMax={1.2}
          yLabel="u_C"
          yColor={C.blue}
          yTicks={[{y: 1, label: 'E'}]}
          hLines={[{y: 1, label: '', opacity: 1}]}
          curves={[
            {f: charge, color: C.blue, progress: lin(f, 0, sc.at('dépend') + 10), label: 'C', labelT: 2.2},
            {f: (x) => charge(x / 2), color: C.blueLight, progress: lin(f, slow, sc.at('lent', {end: true}) + 20 - slow), label: '2C', labelT: 5},
          ]}
        />
      </div>
      <Pop show={1} x={1380} y={330}>
        <Tex tex="\tau = RC" size={110} reveal={writeOn(f, sc, 'la constante de temps', 'R fois C')} />
      </Pop>
      <Pop show={ramp(f, slow)} x={1380} y={520} w={460}>
        <Tag size={40} style={{whiteSpace: 'normal', lineHeight: 1.35}}>
          τ plus grand
          <br />→ charge plus lente
        </Tag>
      </Pop>
    </AbsoluteFill>
  );
};

const S9: React.FC<{sc: Scene}> = ({sc}) => {
  const f = useCurrentFrame();
  const next = sc.at('Dans les leçons');
  const cards = [
    {show: sc.at('en position un'), title: 'K en 1 : charge', tex: 'u_C \\to E'},
    {show: sc.at('En position deux'), title: 'K en 2 : décharge', tex: 'u_C \\to 0'},
    {show: next - 24, title: 'τ = RC', tex: '\\text{fixe la vitesse}'},
  ];
  const lessons = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
  return (
    <AbsoluteFill>
      {cards.map((c, k) => (
        <Pop key={k} show={ramp(f, c.show)} x={110 + k * 580} y={180} w={540}>
          <Card color={k === 2 ? C.grey : C.blue} style={{height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24}}>
            <div style={{fontSize: 46, fontWeight: 800}}>{c.title}</div>
            <Tex tex={c.tex} size={60} color={k === 2 ? C.ink : C.blue} />
          </Card>
        </Pop>
      ))}
      {lessons.map((l, k) => (
        <Pop key={l} show={ramp(f, next + k * 6)} x={110 + k * 344} y={620} w={320}>
          <Card color={C.ink} style={{height: 210, padding: '24px 26px'}}>
            <div style={{fontSize: 34, fontWeight: 800, color: C.blue}}>{l}</div>
            <div style={{fontSize: 32, fontWeight: 600, marginTop: 12, lineHeight: 1.25}}>{data.videos[l].titre}</div>
          </Card>
        </Pop>
      ))}
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{sc: Scene}>> = {'V0-S1': S1, 'V0-S2': S2, 'V0-S3': S3, 'V0-S4': S4, 'V0-S5': S5, 'V0-S6': S6, 'V0-S7': S7, 'V0-S8': S8, 'V0-S9': S9};

export const V0: React.FC = () => (
  <Shell
    video="V0"
    render={(sc) => {
      const S = SCENES[sc.id];
      return <S sc={sc} />;
    }}
  />
);

export const V0_FRAMES = () => plan('V0').total;
