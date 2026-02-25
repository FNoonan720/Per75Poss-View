import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface Props {
  chapterNum: number;
  title: string;
  subtext?: string;
  durationInFrames: number;
  accentColor?: string;
}

export const ChapterLabel: React.FC<Props> = ({
  chapterNum,
  title,
  subtext,
  durationInFrames,
  accentColor = '#c8102e',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const FADE_IN_END = 18;
  const HOLD_END = durationInFrames - 18;
  const FADE_OUT_END = durationInFrames;

  const opacity = interpolate(
    frame,
    [0, FADE_IN_END, HOLD_END, FADE_OUT_END],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const slideProgress = spring({
    frame,
    fps,
    config: {damping: 22, stiffness: 220, mass: 0.6},
    durationInFrames: FADE_IN_END,
  });

  const translateX = interpolate(slideProgress, [0, 1], [-260, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 52,
        left: 0,
        opacity,
        transform: `translateX(${translateX}px)`,
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: '0 8px 8px 0',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        maxWidth: 420,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 4,
          background: accentColor,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          background: 'rgba(8, 14, 30, 0.88)',
          backdropFilter: 'blur(10px)',
          padding: '10px 18px',
        }}
      >
        <div
          style={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          {`Ch. ${chapterNum}`}
        </div>
        <div
          style={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
