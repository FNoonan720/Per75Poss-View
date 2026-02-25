import React from 'react';
import {Composition} from 'remotion';
import {Per75Demo, TOTAL_FRAMES} from './Per75Demo';
import {Per75Simple, SIMPLE_TOTAL_FRAMES} from './Per75Simple';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Per75Demo"
        component={Per75Demo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="Per75Simple"
        component={Per75Simple}
        durationInFrames={SIMPLE_TOTAL_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
