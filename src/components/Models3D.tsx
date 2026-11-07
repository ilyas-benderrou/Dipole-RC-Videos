import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import * as THREE from 'three';

/** Scène 3D transparente, éclairage doux. */
export const Stage3D: React.FC<{width: number; height: number; z?: number; children: React.ReactNode}> = ({width, height, z = 7, children}) => (
  <ThreeCanvas width={width} height={height} camera={{position: [0, 0.6, z], fov: 32}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
    <ambientLight intensity={0.75} />
    <directionalLight position={[4, 6, 6]} intensity={1.6} />
    <directionalLight position={[-5, -2, 3]} intensity={0.5} />
    {children}
  </ThreeCanvas>
);

const metal = {color: '#c4cad1', metalness: 0.7, roughness: 0.3};

/** Conducteur ohmique axial : corps beige, 4 anneaux (marron, noir, rouge, or = 1 kΩ), 2 pattes. */
export const Resistor3D: React.FC<{rot: number}> = ({rot}) => {
  const body = useMemo(() => {
    const p: THREE.Vector2[] = [];
    for (let k = 0; k <= 40; k++) {
      const y = -1 + (2 * k) / 40;
      const bulge = Math.abs(y) > 0.62 ? 0.07 * Math.cos(((Math.abs(y) - 0.81) / 0.19) * (Math.PI / 2)) : 0;
      const end = Math.abs(y) > 0.94 ? Math.sqrt(Math.max(0, 1 - ((Math.abs(y) - 0.94) / 0.06) ** 2)) : 1;
      p.push(new THREE.Vector2((0.33 + Math.max(0, bulge)) * end + 0.001, y));
    }
    return new THREE.LatheGeometry(p, 48);
  }, []);
  const rings = ['#7b4a1e', '#151515', '#c62828', '#c9a227'];
  const ringY = [-0.55, -0.3, -0.05, 0.6];
  return (
    <group rotation={[0.25, rot, Math.PI / 2]}>
      <mesh geometry={body}>
        <meshStandardMaterial color="#e3cfa2" roughness={0.6} />
      </mesh>
      {rings.map((c, k) => (
        <mesh key={k} position={[0, ringY[k], 0]}>
          <cylinderGeometry args={[0.345, 0.345, 0.11, 48]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={k === 3 ? 0.6 : 0} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * 1.75, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.5, 16]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
    </group>
  );
};

const stripeTexture = () => {
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 512;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#d9dde3';
  g.fillRect(0, 0, 128, 512);
  g.fillStyle = '#1d2a55';
  for (let k = 0; k < 4; k++) g.fillRect(34, 60 + k * 115, 60, 22);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Condensateur électrolytique : cylindre bleu foncé, bande « − », pattes de longueurs différentes. */
export const Electrolytic3D: React.FC<{rot: number; position?: [number, number, number]; scale?: number}> = ({rot, position = [0, 0, 0], scale = 1}) => {
  const tex = useMemo(stripeTexture, []);
  return (
    <group position={position} scale={scale} rotation={[0.18, rot, 0]}>
      <mesh>
        <cylinderGeometry args={[0.62, 0.62, 1.9, 64]} />
        <meshStandardMaterial color="#1c3578" roughness={0.45} />
      </mesh>
      <mesh rotation={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.625, 0.625, 1.86, 32, 1, true, 0, 0.7]} />
        <meshStandardMaterial map={tex} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.955, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.02, 64]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.97, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.9, 0.012, 0.04]} />
        <meshStandardMaterial color="#7d858e" />
      </mesh>
      <mesh position={[0, 0.97, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.9, 0.012, 0.04]} />
        <meshStandardMaterial color="#7d858e" />
      </mesh>
      {/* Patte + (longue) et patte − (courte), côté bande */}
      <mesh position={[0.25, -1.95, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.1, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[-0.25, -1.65, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  );
};

/** Condensateur céramique : disque orangé, 2 pattes. */
export const Ceramic3D: React.FC<{rot: number; position?: [number, number, number]; scale?: number}> = ({rot, position = [0, 0, 0], scale = 1}) => (
  <group position={position} scale={scale} rotation={[0, rot, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.55, 0.55, 0.2, 64]} />
      <meshStandardMaterial color="#d4893a" roughness={0.55} />
    </mesh>
    {[-0.22, 0.22].map((x) => (
      <mesh key={x} position={[x, -1.25, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.7, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    ))}
  </group>
);

/** Bande enroulée en spirale (extrudée), décalée de `phase` (fraction du pas). */
const spiralBand = (phase: number, thick: number) => {
  const pitch = 0.18;
  const r0 = 0.12;
  const turns = 5.2;
  const N = 400;
  const outer: THREE.Vector2[] = [];
  const inner: THREE.Vector2[] = [];
  for (let k = 0; k <= N; k++) {
    const th = (k / N) * turns * 2 * Math.PI;
    const r = r0 + pitch * (th / (2 * Math.PI) + phase);
    outer.push(new THREE.Vector2((r + thick / 2) * Math.cos(th), (r + thick / 2) * Math.sin(th)));
    inner.push(new THREE.Vector2((r - thick / 2) * Math.cos(th), (r - thick / 2) * Math.sin(th)));
  }
  const shape = new THREE.Shape([...outer, ...inner.reverse()]);
  return new THREE.ExtrudeGeometry(shape, {depth: 1.8, bevelEnabled: false, curveSegments: 1});
};

/** Vue en coupe : deux feuilles métalliques enroulées, séparées par une feuille isolante (jaune). */
export const Cutaway3D: React.FC<{rot: number; tilt?: number}> = ({rot, tilt = 1.0}) => {
  const geo = useMemo(() => [spiralBand(0, 0.04), spiralBand(0.25, 0.035), spiralBand(0.5, 0.04), spiralBand(0.75, 0.035)], []);
  return (
    <group rotation={[tilt, 0, rot]}>
      <group position={[0, 0, -0.9]}>
        <mesh geometry={geo[0]}>
          <meshStandardMaterial color="#b8c0c8" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh geometry={geo[1]}>
          <meshStandardMaterial color="#f2c94c" roughness={0.6} />
        </mesh>
        <mesh geometry={geo[2]}>
          <meshStandardMaterial color="#8d969f" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh geometry={geo[3]}>
          <meshStandardMaterial color="#f2c94c" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
