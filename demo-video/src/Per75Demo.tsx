import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  Video,
} from 'remotion';
import {ChapterLabel} from './components/ChapterLabel';
import {Intro} from './components/Intro';
import {Outro} from './components/Outro';
import {ProgressBar} from './components/ProgressBar';

// Timing constants (all at 30fps)
const FPS = 30;
const INTRO_FRAMES = 3 * FPS; // 90 frames
const VIDEO_FRAMES = Math.round(26.8 * FPS); // 804 frames
const OUTRO_FRAMES = 4 * FPS; // 120 frames
export const TOTAL_FRAMES = INTRO_FRAMES + VIDEO_FRAMES + OUTRO_FRAMES; // 1014

// Chapter timing relative to the start of the video section (frame 0 = video t=0)
// Based on recorded content:
//   t=0-2.5s : Standard Per Game view (Luka #1 in PTS)
//   t=2.5-5s : Dropdown being selected → Per 75 Poss loads (Giannis #1)
//   t=5-13s  : Per 75 active, exploring stats
//   t=13-27s : Sorting multiple columns, values persist
const CHAPTERS = [
  {
    from: 0,
    duration: 75,
    num: 1,
    title: 'Standard Per Game View',
    subtext: 'per game stats, sorted by points',
    accent: '#17408b',
  },
  {
    from: 75,
    duration: 90,
    num: 2,
    title: 'Selecting Per 75 Poss',
    subtext: 'a new option added to the per mode dropdown',
    accent: '#c8102e',
  },
  {
    from: 150,
    duration: 240,
    num: 3,
    title: 'Normalized Per 75 Possessions',
    subtext: 'stats normalized per 75 possessions',
    accent: '#c8102e',
  },
  {
    from: 390,
    duration: VIDEO_FRAMES - 390,
    num: 4,
    title: 'Sort Persistence',
    subtext: 'column sorting works as usual',
    accent: '#17408b',
  },
];

// Crossfade overlay between intro and video
const CrossFade: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{background: '#080e1e', opacity, pointerEvents: 'none'}}
    />
  );
};

// Vignette for the video section
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
      pointerEvents: 'none',
    }}
  />
);

export const Per75Demo: React.FC = () => {
  const frame = useCurrentFrame();

  // Progress bar chapter data — relative to the video section (from = offset within video seq)
  const progressChapters = CHAPTERS.map((ch) => ({
    label: ch.title,
    startFrame: ch.from,
    endFrame: ch.from + ch.duration,
  }));

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* ── INTRO ─────────────────────────────────── */}
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <Intro />
      </Sequence>

      {/* ── VIDEO SECTION ─────────────────────────── */}
      <Sequence from={INTRO_FRAMES} durationInFrames={VIDEO_FRAMES}>
        {/* Raw demo video */}
        <Video
          src={staticFile('raw_demo_h264.mp4')}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />

        {/* Vignette */}
        <Vignette />

        {/* Chapter labels */}
        {CHAPTERS.map((ch) => (
          <Sequence key={ch.num} from={ch.from} durationInFrames={ch.duration}>
            <ChapterLabel
              chapterNum={ch.num}
              title={ch.title}
              subtext={ch.subtext}
              durationInFrames={ch.duration}
              accentColor={ch.accent}
            />
          </Sequence>
        ))}

        {/* Progress bar */}
        <ProgressBar chapters={progressChapters} totalFrames={VIDEO_FRAMES} />
      </Sequence>

      {/* Crossfade intro → video */}
      <Sequence from={INTRO_FRAMES} durationInFrames={20}>
        <CrossFade durationInFrames={20} />
      </Sequence>

      {/* ── OUTRO ─────────────────────────────────── */}
      <Sequence from={INTRO_FRAMES + VIDEO_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <Outro durationInFrames={OUTRO_FRAMES} />
      </Sequence>

      {/* Fade to black before outro */}
      <Sequence from={INTRO_FRAMES + VIDEO_FRAMES - 15} durationInFrames={30}>
        {(() => {
          const f = frame - (INTRO_FRAMES + VIDEO_FRAMES - 15);
          const op = interpolate(f, [0, 15, 30], [0, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return <AbsoluteFill style={{background: '#000', opacity: op}} />;
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
