import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 160, mass: 0.8},
  });

  const taglineFade = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subFade = interpolate(frame, [48, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const dividerScale = interpolate(frame, [42, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #080e1e 0%, #0f1c38 60%, #0d1530 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          display: 'flex',
          alignItems: 'baseline',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily:
              '"Georgia", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: 120,
            color: '#17408b',
            letterSpacing: -6,
            textShadow: '0 0 60px rgba(23,64,139,0.4)',
          }}
        >
          PER
        </span>
        <span
          style={{
            fontFamily:
              '"Georgia", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: 120,
            color: '#c8102e',
            letterSpacing: -6,
            textShadow: '0 0 60px rgba(200,16,46,0.4)',
          }}
        >
          75
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 200 * dividerScale,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          marginTop: 8,
        }}
      />

      {/* Tagline */}
      <p
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 18,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: 10,
          textTransform: 'uppercase',
          margin: '16px 0 0',
          opacity: taglineFade,
        }}
      >
        Possessions
      </p>

      {/* Sub-tagline */}
      <p
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 13,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          margin: '10px 0 0',
          opacity: subFade,
        }}
      >
        A Chrome Extension for NBA.com
      </p>
    </AbsoluteFill>
  );
};
