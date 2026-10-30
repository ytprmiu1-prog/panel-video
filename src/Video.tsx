import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* Video contoh untuk menguji alur render (59 detik).
   Nanti file ini ditimpa oleh video yang sebenarnya. */

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const detik = Math.min(59, Math.floor(frame / fps));
  const masuk = spring({frame, fps, config: {damping: 10}});
  const lebar = interpolate(frame, [0, durationInFrames], [0, 100]);
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(175deg, #f7f0e4, #efe3d0)',
        fontFamily: 'sans-serif',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 380,
          height: 380,
          borderRadius: 90,
          background: 'white',
          padding: 40,
          boxSizing: 'border-box',
          boxShadow: '0 30px 90px rgba(217,43,34,0.3)',
          transform: `scale(${masuk})`,
        }}
      >
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{fontSize: 96, fontWeight: 900, color: '#2a0f0c', marginTop: 70}}>Alur render siap</div>
      <div style={{fontSize: 56, fontWeight: 800, color: '#d92b22', marginTop: 24}}>
        Detik ke-{detik} dari 59
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 12, width: `${lebar}%`, background: '#d92b22'}} />
    </AbsoluteFill>
  );
};
