import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface Props {
  durationInFrames: number;
}

export const Outro: React.FC<Props> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const logoScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: {damping: 14, stiffness: 160, mass: 0.8},
  });

  const taglineFade = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaSlide = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: {damping: 18, stiffness: 180},
  });
  const ctaY = interpolate(ctaSlide, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #080e1e 0%, #0f1c38 60%, #0d1530 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      {/* Grid overlay */}
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
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: 88,
            color: '#17408b',
            letterSpacing: -4,
            textShadow: '0 0 50px rgba(23,64,139,0.35)',
          }}
        >
          PER
        </span>
        <span
          style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontWeight: 900,
            fontSize: 88,
            color: '#c8102e',
            letterSpacing: -4,
            textShadow: '0 0 50px rgba(200,16,46,0.35)',
          }}
        >
          75
        </span>
      </div>

      <p
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: 2,
          margin: '16px 0 0',
          opacity: taglineFade,
        }}
      >
        Adds a Per 75 Poss option to nba.com/stats
      </p>

      {/* CTA box */}
      <div
        style={{
          marginTop: 40,
          opacity: taglineFade,
          transform: `translateY(${ctaY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            background: 'rgba(200,16,46,0.12)',
            border: '1px solid rgba(200,16,46,0.4)',
            borderRadius: 10,
            padding: '14px 32px',
          }}
        >
          <p
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              margin: '0 0 6px',
              textAlign: 'center',
            }}
          >
            Free & Open Source
          </p>
          <p
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 15,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              textAlign: 'center',
              letterSpacing: 0.5,
            }}
          >
            github.com/FNoonan720/Per75Poss-View
          </p>
        </div>

        <p
          style={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Free · Open Source · Chrome Extension
        </p>
      </div>
    </AbsoluteFill>
  );
};
