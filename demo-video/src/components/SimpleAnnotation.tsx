import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface Props {
  text: string;
  durationInFrames: number;
}

export const SimpleAnnotation: React.FC<Props> = ({text, durationInFrames}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        whiteSpace: 'nowrap',
        background: 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(6px)',
        borderRadius: 6,
        padding: '8px 18px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
        fontWeight: 400,
        color: 'rgba(255, 255, 255, 0.88)',
        letterSpacing: 0.3,
      }}
    >
      {text}
    </div>
  );
};
