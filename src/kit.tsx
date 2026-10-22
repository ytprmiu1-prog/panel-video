import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ===== PERANGKAT BANGUN VIDEO (dipakai ulang di banyak video) ===== */

export const warna = {
  biru: '#0061ff',
  gelap: '#0f2027',
  malam: '#070b14',
  hijau: '#00b09b',
  merah: '#ff416c',
  oranye: '#f5af19',
  wa: '#25d366',
};

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// 1250000 -> "1.250.000"
export const titik = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Efek mengetik: tampilkan huruf satu per satu
export const ketik = (teks: string, frame: number, mulai: number, laju = 2) =>
  teks.slice(0, Math.max(0, Math.floor((frame - mulai) / laju)));

// Latar gradasi gelap + dua cahaya bergerak pelan
export const Latar: React.FC<{glow?: string; children?: React.ReactNode}> = ({
  glow = warna.biru,
  children,
}) => {
  const frame = useCurrentFrame();
  const geser = Math.sin(frame / 60) * 60;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${warna.gelap} 0%, ${warna.malam} 100%)`,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: 450,
          left: -200 + geser,
          top: -150,
          background: glow,
          opacity: 0.28,
          filter: 'blur(140px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: 400,
          right: -250 - geser,
          bottom: 100,
          background: warna.oranye,
          opacity: 0.12,
          filter: 'blur(150px)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// Pembungkus adegan: muncul pelan di awal, memudar di akhir
const Pudar: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const o = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    clamp
  );
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Adegan: React.FC<{
  dari: number;
  durasi: number;
  children: React.ReactNode;
}> = ({dari, durasi, children}) => (
  <Sequence from={dari} durationInFrames={durasi}>
    <Pudar>{children}</Pudar>
  </Sequence>
);

// Teks besar yang muncul kata demi kata (kata tertentu disorot)
export const KataPop: React.FC<{
  kata: string[];
  sorot?: number[];
  ukuran?: number;
  mulai?: number;
  jeda?: number;
}> = ({kata, sorot = [], ukuran = 84, mulai = 4, jeda = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px 18px',
        padding: '0 56px',
      }}
    >
      {kata.map((k, i) => {
        const s = spring({
          frame: Math.max(0, frame - (mulai + i * jeda)),
          fps,
          config: {damping: 11},
        });
        const hi = sorot.includes(i);
        return (
          <span
            key={i}
            style={{
              fontSize: ukuran,
              fontWeight: 900,
              padding: '0 20px',
              borderRadius: 18,
              background: hi ? warna.oranye : 'transparent',
              color: hi ? warna.gelap : 'white',
              textShadow: hi ? 'none' : '0 4px 24px rgba(0,0,0,0.7)',
              opacity: s,
              transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})`,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

// Angka yang naik dari 0 ke nilai akhir
export const AngkaNaik: React.FC<{
  nilai: number;
  mulai?: number;
  durasi?: number;
  awalan?: string;
}> = ({nilai, mulai = 0, durasi = 45, awalan = 'Rp '}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [mulai, mulai + durasi], [0, 1], clamp);
  const e = 1 - Math.pow(1 - p, 3);
  return <>{awalan + titik(nilai * e)}</>;
};

// Bingkai HP: isi layar aplikasi ditaruh sebagai children
export const BingkaiHp: React.FC<{
  children: React.ReactNode;
  lebar?: number;
  atas?: number;
}> = ({children, lebar = 700, atas = 230}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 14}});
  const tinggi = Math.round(lebar * 1.65);
  return (
    <div
      style={{
        position: 'absolute',
        top: atas,
        left: (1080 - lebar) / 2,
        width: lebar,
        height: tinggi,
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * 180}px)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: 64,
          border: '12px solid #1c2433',
          background: '#f4f7fe',
          overflow: 'hidden',
          position: 'relative',
          boxShadow:
            '0 0 140px rgba(0,97,255,0.35), 0 50px 120px rgba(0,0,0,0.6)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Ikon bulat sederhana: centang (ok) atau silang (x)
export const IkonBulat: React.FC<{jenis: 'ok' | 'x'; ukuran?: number}> = ({
  jenis,
  ukuran = 84,
}) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill={jenis === 'ok' ? warna.hijau : warna.merah} />
    <path
      d={jenis === 'ok' ? 'M28 52 L44 68 L74 34' : 'M32 32 L68 68 M68 32 L32 68'}
      stroke="white"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Garis kemajuan tipis di dasar video (menahan penonton sampai habis)
export const Progres: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 10,
        width: `${(frame / durationInFrames) * 100}%`,
        background: warna.oranye,
      }}
    />
  );
};

// Catatan kecil di bawah layar (mis. "Data contoh")
export const Catatan: React.FC<{teks: string}> = ({teks}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 50,
      textAlign: 'center',
      fontSize: 28,
      color: 'rgba(255,255,255,0.5)',
    }}
  >
    {teks}
  </div>
);
