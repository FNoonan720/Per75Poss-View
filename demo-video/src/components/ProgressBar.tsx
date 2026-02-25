import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface Chapter {
  label: string;
  startFrame: number;
  endFrame: number;
}

interface Props {
  chapters: Chapter[];
  totalFrames: number;
}

export const ProgressBar: React.FC<Props> = ({chapters, totalFrames}) => {
  const frame = useCurrentFrame();

  const barOpacity = interpolate(frame, [0, 15, totalFrames - 15, totalFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        display: 'flex',
        gap: 2,
        opacity: barOpacity,
      }}
    >
      {chapters.map((chapter, i) => {
        const chapterProgress = Math.min(
          1,
          Math.max(0, (frame - chapter.startFrame) / (chapter.endFrame - chapter.startFrame))
        );

        const isActive = frame >= chapter.startFrame && frame < chapter.endFrame;
        const isDone = frame >= chapter.endFrame;

        return (
          <div
            key={i}
            style={{
              flex: chapter.endFrame - chapter.startFrame,
              height: '100%',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isDone
                  ? 'rgba(200,16,46,0.6)'
                  : isActive
                  ? '#c8102e'
                  : 'transparent',
                transform: `scaleX(${isDone ? 1 : chapterProgress})`,
                transformOrigin: 'left',
                transition: 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
