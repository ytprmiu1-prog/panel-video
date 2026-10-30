import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';

// Semua video berdurasi tepat 59 detik: 59 x 30 fps = 1770 frame.
// Untuk video baru, cukup timpa file src/Video.tsx. File ini tidak perlu diubah lagi.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    durationInFrames={1770}
    fps={30}
    width={1080}
    height={1920}
  />
);
