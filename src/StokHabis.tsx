import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type Chat = {
  inisial: string;
  nama: string;
  pesan: string;
  jam: string;
  warna: string;
};

export type StokHabisProps = {
  jumlah: number;
  label: string;
  chats: Chat[];
  stempel: string;
  kalimat: string;
  kataSorot: string;
  warnaSorot: string;
};

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// Waktu kemunculan (dalam frame, 30 fps)
const MULAI_KARTU = 25;
const JEDA_KARTU = 10;
const FRAME_STEMPEL = 100;
const FRAME_KALIMAT = 125;

export const stokHabisDefaultProps: StokHabisProps = {
  jumlah: 12,
  label: 'belum dibalas',
  chats: [
    {inisial: 'BS', nama: 'Bu Sari', pesan: 'Beras 5kg', jam: '', warna: '#8a5a44'},
    {inisial: 'PJ', nama: 'Pak Joko', pesan: 'Telur 1kg ready?', jam: '08.04', warna: '#3f6b66'},
    {inisial: 'MR', nama: 'Mbak Rina', pesan: 'Gula 2kg berapa?', jam: '08.05', warna: '#7a3b5a'},
    {inisial: 'KA', nama: 'Kak Ayu', pesan: 'Bisa antar sore?', jam: '08.06', warna: '#3d6a45'},
    {inisial: 'PB', nama: 'Pak Budi', pesan: 'Mie instan 1 dus', jam: '08.07', warna: '#5a4a2e'},
  ],
  stempel: 'HABIS',
  kalimat: 'stoknya',
  kataSorot: 'habis',
  warnaSorot: '#d7ff3a',
};

const Kartu: React.FC<{chat: Chat; index: number; redup: number}> = ({
  chat,
  index,
  redup,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({
    frame: frame - (MULAI_KARTU + index * JEDA_KARTU),
    fps,
    config: {damping: 14},
  });
  const geser = interpolate(masuk, [0, 1], [90, 0]);

  return (
    <div
      style={{
        width: 880,
        height: 160,
        borderRadius: 28,
        background: 'rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 28,
        position: 'relative',
        opacity: masuk * redup,
        transform: `translateY(${geser}px)`,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          background: chat.warna,
          color: 'white',
          fontSize: 34,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {chat.inisial}
      </div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 36, color: 'rgba(255,255,255,0.55)', fontWeight: 600}}>
          {chat.nama}
        </div>
        <div style={{fontSize: 58, color: 'white', fontWeight: 800, marginTop: 2}}>
          {chat.pesan}
        </div>
      </div>
      {chat.jam ? (
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{fontSize: 32, color: 'rgba(255,255,255,0.4)'}}>{chat.jam}</span>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: '#dc2626',
              color: 'white',
              fontSize: 30,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            1
          </span>
        </div>
      ) : null}
    </div>
  );
};

export const StokHabis: React.FC<StokHabisProps> = ({
  jumlah,
  label,
  chats,
  stempel,
  kalimat,
  kataSorot,
  warnaSorot,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Angka naik 0 -> jumlah
  const angka = Math.round(interpolate(frame, [0, 40], [0, jumlah], clamp));
  const judulMasuk = spring({frame, fps, config: {damping: 14}});

  // Stempel menghantam
  const hantam = spring({
    frame: frame - FRAME_STEMPEL,
    fps,
    config: {damping: 9, stiffness: 180},
  });
  const skalaStempel = interpolate(hantam, [0, 1], [3.2, 1]);
  const opasStempel = interpolate(frame, [FRAME_STEMPEL, FRAME_STEMPEL + 4], [0, 1], clamp);

  // Getar singkat saat stempel mendarat
  const dt = frame - (FRAME_STEMPEL + 4);
  const getar = dt >= 0 && dt < 10 ? Math.sin(dt * 2.2) * (10 - dt) * 1.2 : 0;

  // Kartu pertama meredup setelah distempel
  const redup0 = interpolate(frame, [FRAME_STEMPEL, FRAME_STEMPEL + 15], [1, 0.75], clamp);

  // Kalimat bawah
  const k1 = spring({frame: frame - FRAME_KALIMAT, fps, config: {damping: 12}});
  const k2 = spring({frame: frame - (FRAME_KALIMAT + 10), fps, config: {damping: 10}});

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 30%, #1a1d2b 0%, #07080d 75%)',
        fontFamily: 'sans-serif',
        alignItems: 'center',
      }}
    >
      {/* Judul: angka + label */}
      <div
        style={{
          marginTop: 150,
          display: 'flex',
          alignItems: 'baseline',
          gap: 28,
          opacity: judulMasuk,
          transform: `translateY(${(1 - judulMasuk) * -40}px)`,
        }}
      >
        <span style={{fontSize: 260, fontWeight: 900, color: '#ef4444', lineHeight: 1}}>
          {angka}
        </span>
        <span style={{fontSize: 90, fontWeight: 800, color: 'white'}}>{label}</span>
      </div>

      {/* Daftar chat */}
      <div
        style={{
          marginTop: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          position: 'relative',
          transform: `translateX(${getar}px)`,
        }}
      >
        {chats.map((c, i) => (
          <Kartu key={i} chat={c} index={i} redup={i === 0 ? redup0 : 1} />
        ))}

        {/* Stempel di atas kartu pertama */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: -30,
            padding: '6px 36px',
            border: '10px solid #dc2626',
            borderRadius: 18,
            color: '#dc2626',
            background: 'rgba(60,10,10,0.55)',
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: 4,
            opacity: opasStempel,
            transform: `rotate(-6deg) scale(${skalaStempel})`,
          }}
        >
          {stempel}
        </div>
      </div>

      {/* Kalimat penutup */}
      <div
        style={{
          marginTop: 110,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: warnaSorot,
            opacity: k1,
            transform: `translateY(${(1 - k1) * 50}px)`,
          }}
        >
          {kalimat}
        </span>
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#111827',
            background: warnaSorot,
            padding: '0 24px',
            borderRadius: 20,
            opacity: k2,
            transform: `scale(${k2})`,
          }}
        >
          {kataSorot}
        </span>
      </div>
    </AbsoluteFill>
  );
};
