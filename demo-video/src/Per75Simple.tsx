import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  Video,
} from 'remotion';
import {SimpleAnnotation} from './components/SimpleAnnotation';

const FPS = 30;
const INTRO_FRAMES = Math.round(1.5 * FPS); // 45 frames
const VIDEO_FRAMES = Math.round(26.8 * FPS); // 804 frames
const OUTRO_FRAMES = Math.round(2.5 * FPS);  // 75 frames
export const SIMPLE_TOTAL_FRAMES = INTRO_FRAMES + VIDEO_FRAMES + OUTRO_FRAMES; // 924

// Annotation timing relative to start of video sequence
const ANNOTATIONS = [
  {from: 0,   duration: 75,  text: 'default per game view'},
  {from: 75,  duration: 90,  text: "selecting 'Per 75 Poss' from the per mode dropdown"},
  {from: 150, duration: 240, text: 'stats recalculated per 75 possessions'},
  {from: 390, duration: VIDEO_FRAMES - 390, text: 'sorting any column — values stay accurate'},
];

const SimpleIntro: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 10, INTRO_FRAMES - 10, INTRO_FRAMES],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 22,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        Per 75 Poss
      </span>
    </AbsoluteFill>
  );
};

const SimpleOutro: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 12, OUTRO_FRAMES - 10, OUTRO_FRAMES],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 15,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 1,
        }}
      >
        github.com/FNoonan720/Per75Poss-View
      </span>
    </AbsoluteFill>
  );
};

// Simple crossfade between two scenes
const Fade: React.FC<{durationInFrames: number; fromColor: string}> = ({
  durationInFrames,
  fromColor,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background: fromColor, opacity, pointerEvents: 'none'}} />
  );
};

export const Per75Simple: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <SimpleIntro />
      </Sequence>

      {/* Crossfade intro → video */}
      <Sequence from={INTRO_FRAMES} durationInFrames={15}>
        <Fade durationInFrames={15} fromColor="#000" />
      </Sequence>

      {/* Video with annotations */}
      <Sequence from={INTRO_FRAMES} durationInFrames={VIDEO_FRAMES}>
        <Video
          src={staticFile('raw_demo_h264.mp4')}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        {ANNOTATIONS.map((a, i) => (
          <Sequence key={i} from={a.from} durationInFrames={a.duration}>
            <SimpleAnnotation text={a.text} durationInFrames={a.duration} />
          </Sequence>
        ))}
      </Sequence>

      {/* Fade video → outro */}
      <Sequence from={INTRO_FRAMES + VIDEO_FRAMES - 12} durationInFrames={24}>
        {(() => {
          const FadeToBlack: React.FC = () => {
            const frame = useCurrentFrame();
            const opacity = interpolate(frame, [0, 12, 24], [0, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return <AbsoluteFill style={{background: '#000', opacity}} />;
          };
          return <FadeToBlack />;
        })()}
      </Sequence>

      {/* Outro */}
      <Sequence from={INTRO_FRAMES + VIDEO_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <SimpleOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
