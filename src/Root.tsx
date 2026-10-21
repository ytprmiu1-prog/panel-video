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

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

const base: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  padding: 80,
  fontFamily: 'sans-serif',
};

const Klasik: React.FC<Props> = ({title, subtitle, bgColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [20, 50], [0, 1], clamp);
  return (
    <AbsoluteFill style={{...base, backgroundColor: bgColor}}>
      <div style={{fontSize: 110, fontWeight: 800, color: 'white', textAlign: 'center', transform: `scale(${scale})`}}>
        {title}
      </div>
      <div style={{fontSize: 56, color: 'white', marginTop: 40, textAlign: 'center', opacity}}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

const Gradasi: React.FC<Props> = ({title, subtitle, bgColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const naik = spring({frame, fps, config: {damping: 14}});
  const geser = interpolate(naik, [0, 1], [120, 0]);
  const garis = interpolate(frame, [15, 45], [0, 400], clamp);
  const opacity = interpolate(frame, [30, 60], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{...base, background: `linear-gradient(160deg, ${bgColor} 0%, #000000 100%)`}}
    >
      <div style={{fontSize: 110, fontWeight: 800, color: 'white', textAlign: 'center', transform: `translateY(${geser}px)`, opacity: naik}}>
        {title}
      </div>
      <div style={{width: garis, height: 8, background: 'white', marginTop: 48, borderRadius: 4}} />
      <div style={{fontSize: 56, color: 'white', marginTop: 48, textAlign: 'center', opacity}}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

const Kartu: React.FC<Props> = ({title, subtitle, bgColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const skala = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [25, 55], [0, 1], clamp);
  return (
    <AbsoluteFill style={{...base, backgroundColor: bgColor}}>
      <div
        style={{
          width: 880,
          padding: 80,
          background: 'white',
          borderRadius: 48,
          boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
          textAlign: 'center',
          transform: `scale(${skala})`,
        }}
      >
        <div style={{fontSize: 100, fontWeight: 800, color: '#111827'}}>{title}</div>
        <div style={{fontSize: 52, color: '#4b5563', marginTop: 32, opacity}}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

const Kinetik: React.FC<Props> = ({title, subtitle, bgColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kata = title.split(' ');
  const mulai = kata.length * 8 + 10;
  const opacity = interpolate(frame, [mulai, mulai + 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{...base, backgroundColor: bgColor}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 32px'}}>
        {kata.map((k, i) => {
          const s = spring({frame: Math.max(0, frame - i * 8), fps, config: {damping: 10}});
          return (
            <span
              key={i}
              style={{
                fontSize: 130,
                fontWeight: 900,
                color: 'white',
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 80}px) scale(${s})`,
                opacity: s,
              }}
            >
              {k}
            </span>
          );
        })}
      </div>
      <div style={{fontSize: 56, color: 'white', marginTop: 48, textAlign: 'center', opacity}}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

const ukuran = {durationInFrames: 150, fps: 30, width: 1080, height: 1920};
const awal = {
  title: 'Halo Dunia',
  subtitle: 'Video pertamaku',
  bgColor: '#111827',
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MyComp" component={Klasik} {...ukuran} defaultProps={awal} />
    <Composition id="Gradasi" component={Gradasi} {...ukuran} defaultProps={awal} />
    <Composition id="Kartu" component={Kartu} {...ukuran} defaultProps={awal} />
    <Composition id="Kinetik" component={Kinetik} {...ukuran} defaultProps={awal} />
  </>
);
