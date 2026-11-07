import React from 'react';
import {Composition} from 'remotion';
import {plan, VideoId} from './lib/timing';
import {FPS, HEIGHT, WIDTH} from './theme';
import {L1, L2, L3, L4, L5} from './videos/L';
import {M1V, M2V, M3V, M4V, M5V, M6V} from './videos/M';
import {V0} from './videos/V0';

const VIDEOS: [VideoId, React.FC][] = [
  ['V0', V0],
  ['L1', L1],
  ['L2', L2],
  ['L3', L3],
  ['L4', L4],
  ['L5', L5],
  ['M1', M1V],
  ['M2', M2V],
  ['M3', M3V],
  ['M4', M4V],
  ['M5', M5V],
  ['M6', M6V],
];

export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.map(([id, Comp]) => (
      <Composition key={id} id={id} component={Comp} durationInFrames={plan(id).total} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
  </>
);
