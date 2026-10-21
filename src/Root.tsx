import React from 'react';
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Props = {title: string; subtitle: string; bgColor: string};

const MyComp: React.FC<Props> = ({title, subtitle, bgColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          transform: `scale(${scale})`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 56,
          color: 'white',
          marginTop: 40,
          textAlign: 'center',
          opacity,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyComp"
    component={MyComp}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{
      title: 'Halo Dunia',
      subtitle: 'Video pertamaku',
      bgColor: '#111827',
    }}
  />
);
