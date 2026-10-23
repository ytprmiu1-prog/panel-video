import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* =====================================================================
   PROMO KASIR & KATALOG UMKM (NUYAPAY) - 96 detik, 30 fps, 1080x1920
   Gaya terang & bersih, palet dari logo. Tanpa domain. Logo: public/logo.png
   Semua data adalah data tiruan ("Warung Berkah").
   ===================================================================== */

export type PromoProps = {alamat?: string};
export const promoDefaultProps: PromoProps = {};

// Durasi adegan (frame): hook, masalah, kenal, katalog, pesanan, kasir, scan,
// poin, bayar+struk, produk+stok, dasbor, laporan, pengaturan, ajakan
const D = [120, 180, 150, 210, 270, 210, 210, 180, 360, 210, 210, 240, 180, 150];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_PROMO = D.reduce((a, b) => a + b, 0);

const C = {
  maroon: '#6e0f14',
  merah: '#d6232b',
  merahTua: '#a3161d',
  krem: '#fbf6f1',
  perak: '#c9ced6',
  emas: '#c9a24b',
  teks: '#2a1416',
  abu: '#6b6f78',
  hijau: '#16a34a',
  biru: '#2563eb',
  garis: '#eadfd8',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const titik = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ketik = (t: string, f: number, m: number, l = 2) =>
  t.slice(0, Math.max(0, Math.floor((f - m) / l)));
const gerak = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
const pop = (f: number, fps: number, at: number, damping = 11) =>
  spring({frame: f - at, fps, config: {damping}});

/* ---------- Latar, adegan, sapuan merah ---------- */

const Bg: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = Math.sin(frame / 50) * 50;
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg,#fffaf6 0%,#f4e9e2 100%)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', width: 900, height: 900, borderRadius: 450, left: -300 + g, top: -250, background: C.merah, opacity: 0.12, filter: 'blur(130px)'}} />
      <div style={{position: 'absolute', width: 800, height: 800, borderRadius: 400, right: -300 - g, bottom: -100, background: C.emas, opacity: 0.2, filter: 'blur(140px)'}} />
      {children}
    </AbsoluteFill>
  );
};

const Ad: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => (
  <Sequence from={DARI[i]} durationInFrames={D[i]}>
    <Bg>{children}</Bg>
  </Sequence>
);

const SapuanIsi: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 9, 18], [-1400, 0, 1400], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: -300,
          top: 0,
          width: 1680,
          height: 1920,
          transform: `translateX(${x}px) skewX(-8deg)`,
          background: `linear-gradient(90deg, ${C.maroon}, ${C.merah} 60%, ${C.merahTua})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile('logo.png')}
          style={{width: 260, height: 260, borderRadius: 58, opacity: interpolate(f, [4, 9, 14], [0, 1, 0], clamp)}}
        />
      </div>
    </AbsoluteFill>
  );
};

const Sapuan: React.FC<{di: number}> = ({di}) => (
  <Sequence from={DARI[di] - 9} durationInFrames={18}>
    <SapuanIsi />
  </Sequence>
);

/* ---------- Teks ---------- */

const Kata: React.FC<{
  kata: string[];
  sorot?: number[];
  ukuran?: number;
  mulai?: number;
  jeda?: number;
  atas?: number;
}> = ({kata, sorot = [], ukuran = 76, mulai = 2, jeda = 5, atas = 80}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        top: atas,
        left: 0,
        right: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 16px',
        padding: '0 50px',
      }}
    >
      {kata.map((k, i) => {
        const s = spring({frame: Math.max(0, frame - (mulai + i * jeda)), fps, config: {damping: 11}});
        const hi = sorot.includes(i);
        return (
          <span
            key={i}
            style={{
              fontSize: ukuran,
              fontWeight: 900,
              padding: '0 18px',
              borderRadius: 18,
              background: hi ? C.merah : 'transparent',
              color: hi ? '#fff' : C.teks,
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

const Cap: React.FC<{isi: {a: number; b: number; t: string}[]}> = ({isi}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aktif = isi.find((x) => f >= x.a && f < x.b);
  if (!aktif) return null;
  const s = pop(f, fps, aktif.a, 12);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1730,
        textAlign: 'center',
        fontSize: 48,
        fontWeight: 900,
        color: C.maroon,
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      {aktif.t}
    </div>
  );
};

/* ---------- Ponsel miring 3D dengan kamera zoom ---------- */

const PW = 536;
const PH = 1136;
type Kam = [number, number, number, number]; // [frame, pusatX, pusatY, zoom]

const Ponsel: React.FC<{
  kamera?: Kam[];
  getar?: [number, number];
  atas?: number;
  k?: number;
  tilt?: number;
  children: React.ReactNode;
}> = ({kamera = [[0, PW / 2, PH / 2, 1], [1, PW / 2, PH / 2, 1]], getar, atas = 400, k = 1.18, tilt = -9, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 14}});
  const ry = interpolate(frame, [0, 50], [-24, tilt], {...clamp, easing: Easing.out(Easing.cubic)}) + Math.sin(frame / 45) * 1.5;
  const rx = 5 + Math.sin(frame / 60);
  const sh = getar && frame >= getar[0] && frame < getar[1] ? Math.sin(frame * 2.4) * 10 : 0;
  const tiap = (i: 1 | 2 | 3) =>
    interpolate(
      frame,
      kamera.map((c) => c[0]),
      kamera.map((c) => c[i]),
      {...clamp, easing: Easing.inOut(Easing.cubic)}
    );
  const cx = tiap(1);
  const cy = tiap(2);
  const s = tiap(3);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 2400}}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - 560) / 2,
          top: atas,
          width: 560,
          height: 1160,
          opacity: masuk,
          borderRadius: 70,
          background: '#1b1b1f',
          boxShadow: '0 70px 130px rgba(110,15,20,0.35), 0 0 0 3px #3a3a42',
          transform: `translateX(${sh}px) translateY(${(1 - masuk) * 220}px) scale(${k}) rotateY(${ry}deg) rotateX(${rx}deg)`,
        }}
      >
        <div style={{position: 'absolute', left: 12, top: 12, width: PW, height: PH, borderRadius: 58, overflow: 'hidden', background: '#fff'}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: PW,
              height: PH,
              transformOrigin: '0 0',
              transform: `translate(${PW / 2 - cx * s}px, ${PH / 2 - cy * s}px) scale(${s})`,
            }}
          >
            {children}
          </div>
          <div style={{position: 'absolute', left: PW / 2 - 70, top: 12, width: 140, height: 30, borderRadius: 15, background: '#101014'}} />
        </div>
      </div>
    </div>
  );
};

/* ---------- Bahan UI di dalam layar ponsel ---------- */

const Abs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', ...style}}>{children}</div>
);

const Header: React.FC<{t: string; kanan?: React.ReactNode}> = ({t, kanan}) => (
  <Abs
    x={0}
    y={0}
    w={PW}
    h={112}
    style={{
      background: `linear-gradient(135deg,${C.merahTua},${C.merah})`,
      color: '#fff',
      padding: '56px 28px 0',
      fontSize: 34,
      fontWeight: 900,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <span>{t}</span>
    {kanan}
  </Abs>
);

const Tombol: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  t: string;
  bg?: string;
  tc?: string;
  ukuran?: number;
  tebal?: boolean;
}> = ({x, y, w, h = 84, t, bg = C.merah, tc = '#fff', ukuran = 30}) => (
  <Abs
    x={x}
    y={y}
    w={w}
    h={h}
    style={{
      background: bg,
      color: tc,
      borderRadius: h / 2.6,
      fontSize: ukuran,
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    {t}
  </Abs>
);

const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  const p = (f - at) / 22;
  const jari = interpolate(f, [at - 8, at - 2, at + 10, at + 16], [0, 1, 1, 0], clamp);
  return (
    <>
      {p >= 0 && p <= 1 ? (
        <div
          style={{
            position: 'absolute',
            left: x - (30 + p * 70),
            top: y - (30 + p * 70),
            width: 60 + p * 140,
            height: 60 + p * 140,
            borderRadius: '50%',
            border: `7px solid ${C.merah}`,
            opacity: 1 - p,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - 24,
          top: y - 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(30,20,20,0.35)',
          border: '4px solid rgba(255,255,255,0.9)',
          opacity: jari,
          transform: `scale(${1 - 0.25 * (p >= 0 && p < 0.3 ? 1 : 0)})`,
        }}
      />
    </>
  );
};

const Muncul: React.FC<{a: number; b: number; naik?: boolean; bg?: string; children: React.ReactNode}> = ({a, b, naik = true, bg = '#fff', children}) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  const p = gerak(f, a, a + 14);
  const q = interpolate(f, [b - 6, b], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: PW,
        height: PH,
        background: bg,
        opacity: p * q,
        transform: naik ? `translateY(${(1 - p) * 240}px)` : 'none',
      }}
    >
      {children}
    </div>
  );
};

const Thumb: React.FC<{h: string; s: number; a: string; b: string}> = ({h, s, a, b}) => (
  <div
    style={{
      width: s,
      height: s,
      borderRadius: s * 0.2,
      background: `linear-gradient(135deg,${a},${b})`,
      color: '#fff',
      fontSize: s * 0.42,
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {h}
  </div>
);

const PRODUK = [
  {n: 'Nasi Goreng', h: 'NG', a: '#f59e0b', b: '#b45309', hrg: 15000},
  {n: 'Ayam Bakar', h: 'AB', a: '#ef4444', b: '#991b1b', hrg: 18000},
  {n: 'Es Teh Manis', h: 'ET', a: '#22c55e', b: '#166534', hrg: 5000},
  {n: 'Mie Goreng', h: 'MG', a: '#f97316', b: '#9a3412', hrg: 14000},
  {n: 'Sate Ayam', h: 'SA', a: '#a16207', b: '#422006', hrg: 20000},
  {n: 'Kopi Susu', h: 'KS', a: '#78350f', b: '#292524', hrg: 8000},
];

const Rp: React.FC<{n: number}> = ({n}) => <>{'Rp ' + titik(n)}</>;

/* ---------- Adegan 1: hook ---------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const notif = [
    ['Bu Sari', 'Nasi goreng 2 bungkus'],
    ['Pak Joko', 'Ayam bakar ready?'],
    ['Mbak Rina', 'Es teh 5 gelas'],
    ['Kak Ayu', 'Bisa antar sore?'],
    ['Pak Budi', 'Sate 20 tusuk'],
    ['Bu Wati', 'Kok belum dibalas?'],
    ['Mas Dani', 'Kopi susu masih ada?'],
  ];
  const angka = Math.round(interpolate(frame, [0, 80], [0, 27], clamp));
  return (
    <Ad i={0}>
      <Abs x={90} y={150} w={900} h={110} style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{fontSize: 56, fontWeight: 900, color: C.teks}}>Pesan belum dibalas</div>
        <div
          style={{
            minWidth: 110,
            height: 90,
            borderRadius: 45,
            background: C.merah,
            color: '#fff',
            fontSize: 56,
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: '90px',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}
        >
          {angka}
        </div>
      </Abs>
      {notif.map((n, i) => {
        const s = pop(frame, fps, 6 + i * 7, 9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 90 + (i % 2 === 0 ? 0 : 20),
              top: 300 + i * 150,
              width: 880,
              height: 128,
              borderRadius: 30,
              background: '#fff',
              boxShadow: '0 16px 40px rgba(110,15,20,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              padding: '0 30px',
              boxSizing: 'border-box',
              opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * -300}px) rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)`,
            }}
          >
            <div style={{width: 76, height: 76, borderRadius: 38, background: '#25d366', color: '#fff', fontSize: 34, fontWeight: 900, textAlign: 'center', lineHeight: '76px'}}>
              {n[0][0]}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 38, fontWeight: 900, color: C.teks}}>{n[0]}</div>
              <div style={{fontSize: 32, color: C.abu}}>{n[1]}</div>
            </div>
            <div style={{fontSize: 26, color: C.abu}}>baru saja</div>
          </div>
        );
      })}
      <Kata kata={['Pesanan', 'numpuk,', 'stok', 'tak', 'jelas?']} sorot={[4]} ukuran={84} atas={1440} mulai={46} />
    </Ad>
  );
};

/* ---------- Adegan 2: masalah ---------- */

const IkonMasalah: React.FC<{jenis: number; f: number}> = ({jenis, f}) => {
  if (jenis === 0) {
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" style={{transform: `rotate(${Math.sin(f / 4) * 14}deg)`, transformOrigin: '50% 15%'}}>
        <path d="M50 10 C30 10 24 28 24 44 C24 60 16 66 12 72 H88 C84 66 76 60 76 44 C76 28 70 10 50 10 Z" fill={C.merah} />
        <circle cx="50" cy="82" r="9" fill={C.maroon} />
        <circle cx="78" cy="20" r="14" fill={C.emas} />
      </svg>
    );
  }
  if (jenis === 1) {
    const lid = Math.abs(Math.sin(f / 10)) * 14;
    return (
      <svg width="150" height="150" viewBox="0 0 100 100">
        <rect x="14" y="40" width="72" height="46" rx="6" fill={C.perak} />
        <rect x="10" y={26 - lid} width="80" height="16" rx="6" fill={C.merah} />
        <text x="50" y="72" textAnchor="middle" fontSize="24" fontWeight="900" fill={C.maroon}>0</text>
      </svg>
    );
  }
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" style={{transform: `translateY(${Math.sin(f / 7) * 8}px)`}}>
      <circle cx="50" cy="50" r="40" fill={C.emas} />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" />
      <text x="50" y="66" textAnchor="middle" fontSize="48" fontWeight="900" fill="#fff">?</text>
    </svg>
  );
};

const Masalah: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kartu = [
    ['Pesanan kelewat', 'Chat tenggelam, pembeli kabur'],
    ['Stok habis baru sadar', 'Pembeli kecewa, omzet hilang'],
    ['Laba tak diketahui', 'Untung atau rugi? Cuma kira-kira'],
  ];
  return (
    <Ad i={1}>
      <Kata kata={['Tiga', 'masalah', 'UMKM']} sorot={[1]} atas={110} />
      {kartu.map((k, i) => {
        const s = pop(frame, fps, 20 + i * 30, 12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 340 + i * 330,
              left: 80,
              width: 920,
              height: 290,
              boxSizing: 'border-box',
              padding: '0 50px',
              borderRadius: 44,
              background: '#fff',
              borderLeft: `16px solid ${C.merah}`,
              boxShadow: '0 20px 50px rgba(110,15,20,0.14)',
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              opacity: s,
              transform: `translateX(${(1 - s) * 500}px)`,
            }}
          >
            <IkonMasalah jenis={i} f={frame} />
            <div>
              <div style={{fontSize: 58, fontWeight: 900, color: C.teks}}>{k[0]}</div>
              <div style={{fontSize: 38, color: C.abu, marginTop: 10}}>{k[1]}</div>
            </div>
          </div>
        );
      })}
      <Kata kata={['Ada', 'solusinya']} sorot={[1]} atas={1400} ukuran={96} mulai={120} />
    </Ad>
  );
};

/* ---------- Adegan 3: perkenalan ---------- */

const Kenal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = pop(frame, fps, 4, 9);
  const nama = pop(frame, fps, 24, 12);
  const sub = pop(frame, fps, 40, 12);
  const chips = ['Katalog Online', 'Kasir Pintar', 'Laporan Otomatis'];
  return (
    <Ad i={2}>
      {[0, 1, 2].map((k) => {
        const fase = ((frame - k * 30 + 90) % 90) / 90;
        const d = 400 + fase * 560;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 540 - d / 2,
              top: 640 - d / 2,
              width: d,
              height: d,
              borderRadius: '50%',
              border: `5px solid ${C.merah}`,
              opacity: (1 - fase) * 0.45,
            }}
          />
        );
      })}
      <Img
        src={staticFile('logo.png')}
        style={{
          position: 'absolute',
          top: 440,
          left: 340,
          width: 400,
          height: 400,
          borderRadius: 88,
          boxShadow: '0 40px 100px rgba(110,15,20,0.45)',
          transform: `scale(${logo}) rotate(${(1 - logo) * -30}deg)`,
        }}
      />
      <Abs x={0} y={930} w={1080} style={{textAlign: 'center', fontSize: 150, fontWeight: 900, letterSpacing: 4, color: C.maroon, opacity: nama, transform: `translateY(${(1 - nama) * 60}px)`}}>
        NUYAPAY
      </Abs>
      <Abs x={0} y={1120} w={1080} style={{textAlign: 'center', fontSize: 66, fontWeight: 800, color: C.merah, opacity: sub}}>
        Kasir & Katalog UMKM
      </Abs>
      <Abs x={40} y={1270} w={1000} style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24}}>
        {chips.map((c, i) => {
          const s = pop(frame, fps, 62 + i * 14);
          return (
            <div key={i} style={{padding: '18px 36px', borderRadius: 60, background: '#fff', border: `3px solid ${C.perak}`, fontSize: 40, fontWeight: 800, color: C.maroon, opacity: s, transform: `scale(${0.6 + 0.4 * s})`}}>
              {c}
            </div>
          );
        })}
      </Abs>
      <Kata kata={['Semua', 'dalam', 'satu', 'aplikasi']} sorot={[2]} ukuran={76} atas={1500} mulai={94} />
    </Ad>
  );
};

/* ---------- Adegan 4: katalog online ---------- */

const LayarAdmin: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const on = pop(f, fps, 52, 9);
  return (
    <>
      <Header t="Warung Berkah" />
      <Abs x={28} y={140} w={480} h={170} style={{borderRadius: 28, background: C.krem, border: `2px solid ${C.garis}`, padding: 26}}>
        <div style={{fontSize: 26, color: C.abu, fontWeight: 700}}>Status Toko</div>
        <div style={{marginTop: 18, display: 'inline-block', padding: '12px 30px', borderRadius: 40, background: 'rgba(22,163,74,0.15)', color: C.hijau, fontSize: 38, fontWeight: 900, transform: `scale(${on})`, transformOrigin: 'left center', opacity: on}}>
          ONLINE
        </div>
      </Abs>
      <Tombol x={28} y={340} w={480} h={96} t="Salin Link Toko" ukuran={34} />
      <Tap x={268} y={388} at={34} />
      {f >= 40 && f < 98 ? (
        <Abs x={48} y={470} w={440} h={80} style={{borderRadius: 20, background: C.hijau, color: '#fff', fontSize: 30, fontWeight: 800, textAlign: 'center', lineHeight: '80px', opacity: gerak(f, 40, 48)}}>
          Link toko disalin
        </Abs>
      ) : null}
      <Abs x={28} y={590} w={480} h={110} style={{borderRadius: 28, background: '#fff', border: `2px solid ${C.garis}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 32, fontWeight: 800, color: C.teks}}>
        <span>Toko Buka</span>
        <div style={{width: 96, height: 52, borderRadius: 26, background: C.hijau, position: 'relative'}}>
          <div style={{position: 'absolute', right: 5, top: 5, width: 42, height: 42, borderRadius: 21, background: '#fff'}} />
        </div>
      </Abs>
    </>
  );
};

const LayarKatalog: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const keranjang = pop(f, fps, 156, 10);
  return (
    <>
      <Header t="Warung Berkah" kanan={<span style={{fontSize: 24, background: 'rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: 20}}>ONLINE</span>} />
      <Abs x={20} y={130} w={500} h={60} style={{display: 'flex', gap: 12}}>
        {['Semua', 'Makanan', 'Minuman'].map((c, i) => (
          <div key={i} style={{padding: '12px 26px', borderRadius: 30, fontSize: 26, fontWeight: 800, background: i === 0 ? C.merah : C.krem, color: i === 0 ? '#fff' : C.abu}}>
            {c}
          </div>
        ))}
      </Abs>
      {PRODUK.slice(0, 4).map((p, i) => {
        const habis = i === 3;
        const s = pop(f, fps, 110 + i * 6, 12);
        return (
          <Abs key={i} x={20 + (i % 2) * 252} y={220 + Math.floor(i / 2) * 330} w={240} h={310} style={{borderRadius: 26, background: '#fff', border: `2px solid ${C.garis}`, padding: 14, opacity: s, transform: `scale(${0.85 + 0.15 * s})`}}>
            <div style={{position: 'relative'}}>
              <Thumb h={p.h} s={212} a={p.a} b={p.b} />
              {habis ? <div style={{position: 'absolute', left: 0, top: 0, width: 212, height: 212, borderRadius: 42, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 40, fontWeight: 900, textAlign: 'center', lineHeight: '212px'}}>HABIS</div> : null}
            </div>
            <div style={{fontSize: 26, fontWeight: 900, color: C.teks, marginTop: 8}}>{p.n}</div>
            <div style={{fontSize: 24, fontWeight: 800, color: C.merah}}>
              <Rp n={p.hrg} />
            </div>
          </Abs>
        );
      })}
      <Tap x={118} y={470} at={150} />
      <Abs x={20} y={1040} w={496} h={80} style={{borderRadius: 40, background: '#25d366', color: '#fff', fontSize: 30, fontWeight: 900, textAlign: 'center', lineHeight: '80px', opacity: keranjang, transform: `translateY(${(1 - keranjang) * 80}px)`}}>
        1 item · Pesan via WhatsApp
      </Abs>
    </>
  );
};

const Katalog: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Ad i={3}>
      <Kata kata={['Toko', 'online', 'siap', 'dibagikan']} sorot={[1]} />
      <Ponsel
        kamera={[
          [0, 268, 420, 1.35],
          [60, 268, 420, 1.35],
          [100, 268, 568, 1.0],
          [210, 268, 568, 1.0],
        ]}
      >
        {f < 100 ? <LayarAdmin /> : <LayarKatalog />}
        <Abs x={0} y={0} w={PW} h={PH} style={{background: '#fff', opacity: interpolate(f, [94, 100, 108], [0, 1, 0], clamp)}} />
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 100, t: 'Salin link, bagikan ke pelanggan'},
          {a: 108, b: 210, t: 'Pelanggan pilih & pesan sendiri'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 5: pesanan masuk ---------- */

const Pesanan: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const jumlah = f >= 46 ? 3 : f >= 36 ? 2 : f >= 24 ? 1 : 0;
  const at = f >= 46 ? 46 : f >= 36 ? 36 : 24;
  const badge = pop(f, fps, at, 8);
  const proses = f >= 114;
  const ongkir = ketik('5000', f, 144, 4);
  const pin = pop(f, fps, 214, 7);
  return (
    <Ad i={4}>
      <Kata kata={['Pesanan', 'masuk', 'langsung', 'terpantau']} sorot={[1]} />
      <Ponsel
        getar={[20, 52]}
        kamera={[
          [0, 268, 568, 1],
          [78, 268, 568, 1],
          [98, 268, 600, 1.2],
          [134, 268, 600, 1.2],
          [150, 268, 568, 1],
          [270, 268, 568, 1],
        ]}
      >
        <Header t="Warung Berkah" />
        <Abs x={28} y={140} w={480} h={170} style={{borderRadius: 28, background: `linear-gradient(135deg,${C.maroon},${C.merahTua})`, color: '#fff', padding: 28}}>
          <div style={{fontSize: 24, opacity: 0.8, fontWeight: 700}}>Omset Hari Ini</div>
          <div style={{fontSize: 56, fontWeight: 900, marginTop: 10}}><Rp n={1250000} /></div>
        </Abs>
        <Abs x={28} y={340} w={480} h={100} style={{borderRadius: 28, background: '#fff', border: `2px solid ${C.garis}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 34, fontWeight: 900, color: C.teks}}>
          <span>Pesanan Masuk</span>
          {jumlah > 0 ? (
            <div style={{minWidth: 58, height: 58, borderRadius: 29, background: C.merah, color: '#fff', fontSize: 34, fontWeight: 900, textAlign: 'center', lineHeight: '58px', transform: `scale(${badge})`}}>{jumlah}</div>
          ) : null}
        </Abs>

        <Muncul a={70} b={200}>
          <Header t="Pesanan Masuk" />
          <Abs x={24} y={140} w={488} h={340} style={{borderRadius: 28, background: C.krem, border: `2px solid ${C.merah}`, padding: 20}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: 26, fontWeight: 800, color: C.abu}}>#J5U7KE · 22 Okt</span>
              <span style={{fontSize: 24, fontWeight: 900, padding: '4px 16px', borderRadius: 20, background: proses ? C.hijau : C.biru, color: '#fff'}}>{proses ? 'DIPROSES' : 'BARU'}</span>
            </div>
            <div style={{fontSize: 36, fontWeight: 900, color: C.teks, marginTop: 10}}>Bu Sari</div>
            <div style={{fontSize: 26, color: C.abu}}>1x Nasi Goreng · 2x Es Teh Manis</div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 900, marginTop: 16, color: C.teks}}>
              <span>Total (belum ongkir)</span>
              <span><Rp n={25000} /></span>
            </div>
          </Abs>
          <Tombol x={40} y={376} w={130} h={64} t="Proses" ukuran={26} bg={proses ? C.hijau : C.merah} />
          <Tombol x={178} y={376} w={120} h={64} t="Chat WA" ukuran={24} bg="#dcfce7" tc={C.hijau} />
          <Tombol x={306} y={376} w={90} h={64} t="Peta" ukuran={24} bg="#dbeafe" tc={C.biru} />
          <Tombol x={404} y={376} w={90} h={64} t="Batal" ukuran={24} bg="#fee2e2" tc={C.merah} />
          <Tap x={105} y={408} at={106} />
        </Muncul>

        <Muncul a={136} b={200} bg="rgba(20,10,10,0.55)">
          <Abs x={40} y={330} w={456} h={440} style={{borderRadius: 36, background: '#fff', padding: 30}}>
            <div style={{fontSize: 36, fontWeight: 900, color: C.teks}}>Tambah Ongkir</div>
            <Abs x={30} y={90} w={396} h={84} style={{borderRadius: 20, border: `3px solid ${C.merah}`, padding: '0 24px', display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 900, color: C.teks}}>
              Rp {ongkir ? titik(Number(ongkir)) : ''}
              {f % 16 < 8 ? '|' : ''}
            </Abs>
            <Abs x={30} y={210} w={396} style={{fontSize: 30, color: C.abu, display: 'flex', justifyContent: 'space-between'}}>
              <span>Subtotal</span><span><Rp n={25000} /></span>
            </Abs>
            <Abs x={30} y={260} w={396} style={{fontSize: 30, color: C.abu, display: 'flex', justifyContent: 'space-between'}}>
              <span>Ongkir</span><span>{ongkir.length >= 4 ? 'Rp 5.000' : '-'}</span>
            </Abs>
            <Abs x={30} y={320} w={396} style={{fontSize: 40, fontWeight: 900, color: C.merah, display: 'flex', justifyContent: 'space-between'}}>
              <span>Total</span><span>{ongkir.length >= 4 ? 'Rp 30.000' : '-'}</span>
            </Abs>
          </Abs>
        </Muncul>

        <Muncul a={200} b={270}>
          <Header t="Lokasi Pelanggan" />
          <Abs x={0} y={112} w={PW} h={640} style={{background: '#e9efe4', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 250, width: PW, height: 44, background: '#fff'}} />
            <div style={{position: 'absolute', left: 300, top: 0, width: 40, height: 640, background: '#fff'}} />
            <div style={{position: 'absolute', left: -100, top: 420, width: 800, height: 34, background: '#fff', transform: 'rotate(-18deg)'}} />
            <div style={{position: 'absolute', left: 40, top: 60, width: 220, height: 150, background: '#d3e3cc', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 360, top: 330, width: 150, height: 220, background: '#cfe0ef', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 80, top: 480, width: 180, height: 120, background: '#e2d9cf', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 290 - 40, top: 300 - 40, width: 80 + Math.sin(f / 5) * 10, height: 80 + Math.sin(f / 5) * 10, borderRadius: '50%', background: 'rgba(214,35,43,0.25)', marginLeft: 20, marginTop: 20}} />
            <svg width="90" height="120" viewBox="0 0 80 100" style={{position: 'absolute', left: 275, top: 160 + (1 - Math.min(1, pin)) * -260}}>
              <path d="M40 4 C22 4 12 18 12 32 C12 52 40 92 40 92 C40 92 68 52 68 32 C68 18 58 4 40 4 Z" fill={C.merah} />
              <circle cx="40" cy="32" r="12" fill="#fff" />
            </svg>
          </Abs>
          <Abs x={28} y={780} w={480} h={110} style={{borderRadius: 28, background: C.krem, border: `2px solid ${C.garis}`, padding: '16px 26px'}}>
            <div style={{fontSize: 34, fontWeight: 900, color: C.teks}}>Rumah Bu Sari</div>
            <div style={{fontSize: 28, color: C.abu}}>Jarak 1,2 km dari toko</div>
          </Abs>
          <Tombol x={28} y={920} w={480} h={90} t="Buka di Aplikasi Peta" bg={C.biru} />
          <Tombol x={28} y={1030} w={480} h={80} t="Salin Lokasi" bg={C.krem} tc={C.maroon} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 70, t: 'HP bergetar, pesanan baru masuk'},
          {a: 72, b: 135, t: 'Ketuk Proses, beres'},
          {a: 138, b: 200, t: 'Tambah ongkir dengan mudah'},
          {a: 204, b: 270, t: 'Lokasi pelanggan di peta'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 6: kasir ---------- */

const Kasir: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aktif = f >= 44 ? 2 : 0;
  const kerang = pop(f, fps, 152, 10);
  const geser = f >= 176 && f < 200 ? Math.sin(f * 2.5) * 8 : 0;
  const sheet = gerak(f, 80, 96);
  return (
    <Ad i={5}>
      <Kata kata={['Kasir', 'lengkap', 'dengan', 'varian']} sorot={[1]} />
      <Ponsel
        kamera={[
          [0, 268, 568, 1],
          [76, 268, 568, 1],
          [96, 268, 800, 1.25],
          [146, 268, 800, 1.25],
          [164, 268, 568, 1],
          [210, 268, 568, 1],
        ]}
      >
        <Header t="Kasir" />
        <Abs x={20} y={126} w={496} h={68} style={{borderRadius: 34, background: C.krem, border: `2px solid ${C.garis}`, padding: '0 28px', display: 'flex', alignItems: 'center', fontSize: 28, color: C.abu}}>
          Cari produk...
        </Abs>
        <Abs x={20} y={212} w={496} h={56} style={{display: 'flex', gap: 10}}>
          {['Semua', 'Makanan', 'Minuman', 'Camilan'].map((c, i) => (
            <div key={i} style={{padding: '10px 20px', borderRadius: 28, fontSize: 24, fontWeight: 800, background: i === aktif ? C.merah : C.krem, color: i === aktif ? '#fff' : C.abu}}>{c}</div>
          ))}
        </Abs>
        {PRODUK.map((p, i) => {
          const habis = i === 3;
          const s = pop(f, fps, 8 + i * 5, 12);
          return (
            <Abs key={i} x={20 + (i % 2) * 252} y={290 + Math.floor(i / 2) * 282} w={240} h={266} style={{borderRadius: 26, background: '#fff', border: `2px solid ${C.garis}`, padding: 12, opacity: s, transform: `scale(${0.85 + 0.15 * s}) translateX(${habis ? geser : 0}px)`}}>
              <div style={{position: 'relative'}}>
                <Thumb h={p.h} s={170} a={p.a} b={p.b} />
                {habis ? <div style={{position: 'absolute', left: 0, top: 0, width: 170, height: 170, borderRadius: 34, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center', lineHeight: '170px'}}>HABIS</div> : null}
              </div>
              <div style={{fontSize: 25, fontWeight: 900, color: C.teks, marginTop: 6}}>{p.n}</div>
              <div style={{fontSize: 24, fontWeight: 800, color: C.merah}}><Rp n={p.hrg} /></div>
            </Abs>
          );
        })}
        <Tap x={120} y={400} at={66} />
        <Tap x={380} y={680} at={174} />
        {f >= 178 && f < 208 ? (
          <Abs x={36} y={600} w={464} h={70} style={{borderRadius: 20, background: C.merah, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', lineHeight: '70px', opacity: gerak(f, 178, 184)}}>
            Stok habis, tidak bisa dipilih
          </Abs>
        ) : null}
        <Abs x={20} y={1040} w={496} h={80} style={{borderRadius: 40, background: C.maroon, color: '#fff', fontSize: 30, fontWeight: 900, textAlign: 'center', lineHeight: '80px', opacity: kerang, transform: `translateY(${(1 - kerang) * 80}px)`}}>
          1 item · Rp 17.000 · Bayar
        </Abs>

        <Muncul a={78} b={150} naik={false} bg="rgba(20,10,10,0.5)">
          <Abs x={0} y={560 + (1 - sheet) * 500} w={PW} h={576} style={{background: '#fff', borderRadius: '44px 44px 0 0', padding: '34px 30px'}}>
            <div style={{fontSize: 36, fontWeight: 900, color: C.teks}}>Pilih Varian Produk</div>
            {[
              ['Biasa', 15000],
              ['Pedas', 17000],
              ['Jumbo', 20000],
            ].map((v, i) => {
              const pilih = i === 1 && f >= 118;
              return (
                <Abs key={i} x={30} y={90 + i * 96} w={476} h={80} style={{borderRadius: 22, border: `3px solid ${pilih ? C.merah : C.garis}`, background: pilih ? '#fff1f1' : '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 32, fontWeight: 800, color: C.teks}}>
                  <span>{v[0]}</span>
                  <span style={{color: C.merah}}><Rp n={v[1] as number} /></span>
                </Abs>
              );
            })}
            <Tombol x={30} y={400} w={476} h={90} t="Tambah ke Keranjang" ukuran={32} />
          </Abs>
          <Tap x={268} y={720} at={112} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 76, t: 'Foto produk & kategori rapi'},
          {a: 80, b: 150, t: 'Pilih varian & harga'},
          {a: 160, b: 210, t: 'Tanda HABIS otomatis'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 7: scan barcode ---------- */

const POLA = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1, 4, 1, 2, 1, 1, 3];

const Barcode: React.FC<{w: number; h: number; geser: number}> = ({w, h, geser}) => {
  const batang: React.ReactNode[] = [];
  let x = 0;
  let i = 0;
  while (x < w) {
    const lebar = POLA[(i + geser) % POLA.length] * 5;
    if (i % 2 === 0) {
      batang.push(<rect key={i} x={x} y={0} width={Math.min(lebar, w - x)} height={h} fill="#111" />);
    }
    x += lebar;
    i += 1;
  }
  return (
    <svg width={w} height={h}>
      {batang}
    </svg>
  );
};

const Scan: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const garis = 230 + (Math.sin(f / 7) * 0.5 + 0.5) * 280;
  const kode2 = f >= 104;
  const masuk1 = pop(f, fps, 12, 11);
  const ok = f >= 60 && f < 100;
  const gagal = f >= 148 && f < 210;
  const geserKode = f >= 104 ? 5 : 0;
  const barisItem = pop(f, fps, 62, 10);
  const geserGagal = gagal ? Math.sin(f * 2.5) * 6 : 0;
  return (
    <Ad i={6}>
      <Kata kata={['Scan', 'barcode,', 'langsung', 'masuk']} sorot={[1]} />
      <Ponsel
        kamera={[
          [0, 268, 568, 1],
          [40, 268, 420, 1.2],
          [100, 268, 800, 1.2],
          [170, 268, 568, 1],
          [210, 268, 568, 1],
        ]}
      >
        <Header t="Scan Barcode" />
        <Abs x={0} y={112} w={PW} h={560} style={{background: 'linear-gradient(180deg,#17171d,#0b0b10)'}} />
        {[
          [60, 180],
          [420, 180],
          [60, 560],
          [420, 560],
        ].map((p, i) => (
          <div key={i} style={{position: 'absolute', left: p[0], top: p[1], width: 56, height: 56, borderTop: i < 2 ? `8px solid #fff` : 'none', borderBottom: i >= 2 ? `8px solid #fff` : 'none', borderLeft: i % 2 === 0 ? `8px solid #fff` : 'none', borderRight: i % 2 === 1 ? `8px solid #fff` : 'none', borderRadius: 8}} />
        ))}
        <Abs x={100} y={290 + (1 - masuk1) * -200} w={336} h={200} style={{background: '#fff', borderRadius: 16, padding: '20px 18px', transform: `translateX(${geserGagal}px)`, opacity: masuk1}}>
          <Barcode w={300} h={110} geser={geserKode} />
          <div style={{textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#333', letterSpacing: 4, marginTop: 8}}>{kode2 ? '8991234000019' : '8991234000002'}</div>
        </Abs>
        <div style={{position: 'absolute', left: 50, top: garis, width: 436, height: 6, borderRadius: 3, background: C.merah, boxShadow: `0 0 24px 6px ${C.merah}`}} />
        {ok ? <Abs x={0} y={112} w={PW} h={560} style={{background: 'rgba(22,163,74,0.35)', opacity: interpolate(f, [60, 66, 98], [0, 1, 0], clamp)}} /> : null}
        {gagal ? <Abs x={0} y={112} w={PW} h={560} style={{background: 'rgba(214,35,43,0.35)', opacity: interpolate(f, [148, 154, 205], [0, 1, 0.4], clamp)}} /> : null}
        <Abs x={0} y={672} w={PW} h={464} style={{background: '#fff', borderRadius: '36px 36px 0 0', padding: '28px 28px', marginTop: -20}}>
          <div style={{fontSize: 34, fontWeight: 900, color: C.teks}}>Keranjang</div>
          {f >= 62 ? (
            <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 20, opacity: barisItem, transform: `translateX(${(1 - barisItem) * 120}px)`}}>
              <Thumb h="ET" s={84} a="#22c55e" b="#166534" />
              <div style={{flex: 1}}>
                <div style={{fontSize: 30, fontWeight: 900, color: C.teks}}>Es Teh Botol</div>
                <div style={{fontSize: 26, color: C.abu}}>1 x Rp 6.000</div>
              </div>
              <div style={{fontSize: 32, fontWeight: 900, color: C.merah}}>Rp 6.000</div>
            </div>
          ) : (
            <div style={{marginTop: 30, fontSize: 28, color: C.abu}}>Belum ada produk. Arahkan kamera ke barcode.</div>
          )}
        </Abs>
        {f >= 62 && f < 104 ? (
          <Abs x={36} y={620} w={464} h={70} style={{borderRadius: 20, background: C.hijau, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', lineHeight: '70px'}}>
            Es Teh Botol ditambahkan
          </Abs>
        ) : null}
        {gagal ? (
          <Abs x={36 + geserGagal} y={620} w={464} h={70} style={{borderRadius: 20, background: C.merahTua, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', lineHeight: '70px'}}>
            Stok habis, barcode ditolak
          </Abs>
        ) : null}
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 100, t: 'Arahkan kamera, produk masuk keranjang'},
          {a: 106, b: 210, t: 'Stok habis? Otomatis ditolak'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 8: poin member ---------- */

const Poin: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nomor = ketik('081234567890', f, 14, 2);
  const poin = Math.round(interpolate(f, [62, 92], [0, 52], clamp));
  const info = pop(f, fps, 62, 12);
  const diskon = pop(f, fps, 116, 10);
  const pakai = f >= 116;
  return (
    <Ad i={7}>
      <Kata kata={['Poin', 'member,', 'pelanggan', 'betah']} sorot={[0]} />
      <Ponsel
        kamera={[
          [0, 268, 400, 1.25],
          [56, 268, 520, 1.25],
          [100, 268, 640, 1.25],
          [180, 268, 760, 1.25],
        ]}
      >
        <Header t="Kasir" />
        {[
          ['Nasi Goreng x2', 30000],
          ['Es Teh Manis x2', 10000],
          ['Kerupuk x1', 2000],
        ].map((r, i) => (
          <Abs key={i} x={28} y={140 + i * 62} w={480} h={56} style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, color: C.teks, fontWeight: 700}}>
            <span>{r[0]}</span>
            <span><Rp n={r[1] as number} /></span>
          </Abs>
        ))}
        <Abs x={28} y={340} w={480} h={2} style={{background: C.garis}} />
        <Abs x={28} y={362} w={480} style={{fontSize: 24, fontWeight: 800, color: C.abu}}>No. WA Member (Opsional)</Abs>
        <Abs x={28} y={402} w={480} h={80} style={{borderRadius: 20, border: `3px solid ${C.merah}`, padding: '0 22px', display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 800, color: C.teks}}>
          {nomor}
          {f % 16 < 8 && f < 62 ? '|' : ''}
        </Abs>
        {f >= 62 ? (
          <Abs x={28} y={500} w={480} h={76} style={{borderRadius: 20, background: '#e7f8ef', color: C.hijau, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', padding: '0 22px', opacity: info, transform: `scale(${0.9 + 0.1 * info})`}}>
            Halo Member | Poin Saat Ini: {poin}
          </Abs>
        ) : null}
        <Tombol x={28} y={600} w={480} h={84} t="Gunakan Poin" bg={pakai ? C.emas : C.maroon} />
        <Tap x={268} y={642} at={108} />
        {pakai ? (
          <Abs x={28} y={716} w={480} h={60} style={{fontSize: 30, fontWeight: 800, color: C.hijau, display: 'flex', justifyContent: 'space-between', opacity: diskon, transform: `translateX(${(1 - diskon) * 100}px)`}}>
            <span>Diskon Poin</span>
            <span>- Rp 5.000</span>
          </Abs>
        ) : null}
        <Abs x={28} y={790} w={480} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 900, color: C.teks}}>
          <span style={{fontSize: 34}}>Total</span>
          <span style={{fontSize: 56, color: C.merah}}>
            {pakai ? <><span style={{fontSize: 30, color: C.abu, textDecoration: 'line-through', marginRight: 14}}>42.000</span>Rp 37.000</> : 'Rp 42.000'}
          </span>
        </Abs>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 60, t: 'Ketik nomor WA pelanggan'},
          {a: 62, b: 110, t: 'Poin member langsung terbaca'},
          {a: 112, b: 180, t: 'Tukar poin jadi diskon'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 9: bayar & struk ---------- */

const POLA_QR = (r: number, c: number): boolean => {
  const finder = (a: number, b: number) =>
    (a < 7 && b < 7) || (a < 7 && b > 13) || (a > 13 && b < 7);
  if (finder(r, c)) {
    const rr = r > 13 ? r - 14 : r;
    const cc = c > 13 ? c - 14 : c;
    return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
  }
  return (r * 7 + c * 13 + r * c) % 5 < 2;
};

const BayarStruk: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kembali = Math.round(interpolate(f, [56, 82], [0, 13000], clamp));
  const sapu = 190 + (Math.sin(f / 6) * 0.5 + 0.5) * 300;
  const sukses = pop(f, fps, 156, 8);
  const rev = interpolate(f, [206, 258], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const centang = (a: number) => f >= a;
  const kotak: React.ReactNode[] = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if (POLA_QR(r, c)) kotak.push(<rect key={r * 21 + c} x={c * 15} y={r * 15} width={15} height={15} fill="#111" />);
    }
  }
  return (
    <Ad i={8}>
      <Kata kata={['Bayar', 'cepat,', 'struk', 'langsung']} sorot={[1]} />
      <Ponsel
        kamera={[
          [0, 268, 420, 1.2],
          [56, 268, 520, 1.2],
          [108, 268, 568, 1],
          [330, 268, 568, 1],
        ]}
      >
        <Header t="Bayar Tunai" />
        <Abs x={28} y={150} w={480} style={{fontSize: 28, color: C.abu, fontWeight: 700}}>Total Tagihan</Abs>
        <Abs x={28} y={186} w={480} style={{fontSize: 84, fontWeight: 900, color: C.merah}}>Rp 37.000</Abs>
        {['Uang Pas', '20.000', '50.000', '100.000'].map((t, i) => (
          <Tombol key={i} x={28 + (i % 2) * 248} y={320 + Math.floor(i / 2) * 100} w={232} h={84} t={t} bg={i === 2 && f >= 50 ? C.maroon : C.krem} tc={i === 2 && f >= 50 ? '#fff' : C.maroon} ukuran={32} />
        ))}
        <Tap x={392} y={462} at={46} />
        <Abs x={28} y={560} w={480} style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 800, color: C.teks}}>
          <span>Uang Diterima</span>
          <span>{f >= 50 ? 'Rp 50.000' : '-'}</span>
        </Abs>
        <Abs x={28} y={630} w={480} style={{fontSize: 28, color: C.abu, fontWeight: 700}}>Kembalian</Abs>
        <Abs x={28} y={664} w={480} style={{fontSize: 80, fontWeight: 900, color: C.hijau}}>Rp {titik(kembali)}</Abs>
        <Tombol x={28} y={830} w={480} h={92} t="Selesaikan" ukuran={34} />
        <Tap x={268} y={876} at={96} />

        <Muncul a={110} b={192}>
          <Header t="Bayar via QRIS" />
          <Abs x={88} y={170} w={360} h={360} style={{background: '#fff', border: `3px solid ${C.garis}`, borderRadius: 24, padding: 22, overflow: 'hidden'}}>
            <svg width="315" height="315" viewBox="0 0 315 315">{kotak}</svg>
          </Abs>
          <div style={{position: 'absolute', left: 80, top: sapu - 20, width: 376, height: 6, borderRadius: 3, background: C.merah, boxShadow: `0 0 20px 5px ${C.merah}`, opacity: f < 150 ? 1 : 0}} />
          <Abs x={28} y={570} w={480} style={{textAlign: 'center', fontSize: 28, color: C.abu, fontWeight: 700}}>Scan dengan e-wallet atau m-banking</Abs>
          <Abs x={28} y={630} w={480} style={{textAlign: 'center', fontSize: 60, fontWeight: 900, color: C.merah}}>Rp 37.000</Abs>
          {f >= 156 ? (
            <Abs x={0} y={0} w={PW} h={PH} style={{background: 'rgba(255,255,255,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 200, height: 200, borderRadius: 100, background: C.hijau, transform: `scale(${sukses})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="110" height="110" viewBox="0 0 100 100"><path d="M24 54 L42 72 L78 30" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              <div style={{fontSize: 44, fontWeight: 900, color: C.hijau, marginTop: 30, opacity: sukses}}>Pembayaran diterima</div>
            </Abs>
          ) : null}
        </Muncul>

        <Muncul a={192} b={360}>
          <Abs x={0} y={0} w={PW} h={PH} style={{background: C.krem}} />
          <Abs x={48} y={60} w={440} h={36} style={{borderRadius: 18, background: '#2b2b33'}} />
          <Abs
            x={68}
            y={84}
            w={400}
            style={{
              background: '#fffdf6',
              padding: '26px 28px',
              fontFamily: 'monospace',
              clipPath: `inset(0 0 ${(1 - rev) * 100}% 0)`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#111'}}>WARUNG BERKAH</div>
            <div style={{textAlign: 'center', fontSize: 22, color: '#666', marginBottom: 10}}>Jl. Contoh No. 1 · 0812-xxxx</div>
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            {[
              ['Nasi Goreng x2', '30.000'],
              ['Es Teh Manis x2', '10.000'],
              ['Kerupuk x1', '2.000'],
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, color: '#222', margin: '4px 0'}}><span>{r[0]}</span><span>{r[1]}</span></div>
            ))}
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            {[
              ['Diskon Poin', '-5.000', false],
              ['TOTAL', '37.000', true],
              ['Tunai', '50.000', false],
              ['Kembali', '13.000', false],
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: r[2] ? 30 : 25, fontWeight: r[2] ? 900 : 500, color: '#222', margin: '4px 0'}}><span>{r[0]}</span><span>{r[1]}</span></div>
            ))}
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            <div style={{textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#111'}}>TERIMA KASIH</div>
          </Abs>
          <Tombol x={36} y={850} w={464} h={76} t={centang(300) ? 'Berhasil dicetak' : 'Cetak Bluetooth'} bg={C.biru} ukuran={30} />
          <Tombol x={36} y={940} w={464} h={76} t={centang(326) ? 'Gambar terkirim' : 'Bagikan Gambar'} bg="#25d366" ukuran={30} />
          <Tombol x={36} y={1030} w={464} h={76} t={centang(350) ? 'Tersimpan di galeri' : 'Simpan ke Galeri'} bg={C.maroon} ukuran={30} />
          <Tap x={268} y={888} at={292} />
          <Tap x={268} y={978} at={318} />
          <Tap x={268} y={1068} at={342} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 108, t: 'Tunai: kembalian dihitung otomatis'},
          {a: 112, b: 192, t: 'Atau bayar lewat QRIS'},
          {a: 196, b: 360, t: 'Cetak, bagikan, atau simpan struk'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 10: produk & stok ---------- */

const Kolom: React.FC<{y: number; label: string; isi: string; aktif?: boolean; w?: number; kanan?: React.ReactNode}> = ({y, label, isi, aktif, w = 480, kanan}) => (
  <>
    <Abs x={28} y={y} w={w} style={{fontSize: 22, fontWeight: 800, color: C.abu}}>{label}</Abs>
    <Abs x={28} y={y + 30} w={w} h={66} style={{borderRadius: 18, border: `3px solid ${aktif ? C.merah : C.garis}`, background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 30, fontWeight: 800, color: C.teks}}>
      <span>{isi}{aktif ? '|' : ''}</span>
      {kanan}
    </Abs>
  </>
);

const ProdukStok: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nama = ketik('Es Teh Manis', f, 6, 2);
  const jual = ketik('5000', f, 34, 3);
  const modal = ketik('2000', f, 50, 3);
  const kode = ketik('8991234500017', f, 62, 2);
  const varian = pop(f, fps, 90, 10);
  const stokAwal = f >= 98;
  const terjual = f >= 186 ? 3 : f >= 158 ? 2 : f >= 130 ? 1 : 0;
  const lastAt = f >= 186 ? 186 : f >= 158 ? 158 : 130;
  const angka = pop(f, fps, lastAt, 7);
  return (
    <Ad i={9}>
      <Kata kata={['Produk', '&', 'stok', 'terkontrol']} sorot={[2]} />
      <Ponsel
        kamera={[
          [0, 268, 330, 1.2],
          [60, 268, 460, 1.2],
          [100, 268, 640, 1.2],
          [118, 268, 568, 1],
          [210, 268, 568, 1],
        ]}
      >
        <Header t="Tambah Produk" />
        <Kolom y={134} label="Nama Produk" isi={nama} aktif={f < 30} />
        <Kolom y={236} label="Harga Jual (Wajib)" isi={jual ? 'Rp ' + titik(Number(jual)) : ''} aktif={f >= 30 && f < 48} />
        <Kolom y={338} label="Harga Modal / Beli" isi={modal ? 'Rp ' + titik(Number(modal)) : ''} aktif={f >= 48 && f < 60} />
        <Kolom
          y={440}
          label="Kode Barcode"
          isi={kode}
          aktif={f >= 60 && f < 90}
          kanan={<div style={{width: 46, height: 46, borderRadius: 12, background: '#dbeafe', color: C.biru, fontSize: 22, fontWeight: 900, textAlign: 'center', lineHeight: '46px'}}>SCAN</div>}
        />
        <Abs x={28} y={548} w={480} style={{fontSize: 22, fontWeight: 800, color: C.abu}}>Varian & Harga</Abs>
        <Abs x={28} y={580} w={480} h={64} style={{opacity: varian, transform: `scale(${0.8 + 0.2 * varian})`, transformOrigin: 'left center'}}>
          <div style={{display: 'inline-block', padding: '14px 28px', borderRadius: 32, background: '#fff1f1', border: `3px solid ${C.merah}`, color: C.merah, fontSize: 28, fontWeight: 900}}>Jumbo + Rp 3.000</div>
        </Abs>
        <Kolom y={668} label="Jumlah Stok" isi={stokAwal ? '24' : ''} aktif={f >= 90 && f < 98} />
        <Abs x={28} y={788} w={480} h={90} style={{borderRadius: 22, background: C.krem, border: `2px solid ${C.garis}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26, fontWeight: 800, color: C.teks}}>
          <span>Tampil di Kasir & Website</span>
          <div style={{width: 84, height: 46, borderRadius: 23, background: f >= 104 ? C.hijau : C.perak, position: 'relative'}}>
            <div style={{position: 'absolute', top: 4, left: f >= 104 ? 42 : 4, width: 38, height: 38, borderRadius: 19, background: '#fff'}} />
          </div>
        </Abs>
        <Tombol x={28} y={920} w={480} h={90} t="Simpan Produk" ukuran={34} />

        <Muncul a={112} b={210}>
          <Header t="Stok Produk" />
          <Abs x={24} y={140} w={488} h={340} style={{borderRadius: 30, background: C.krem, border: `2px solid ${C.garis}`, padding: 24}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <Thumb h="ET" s={110} a="#22c55e" b="#166534" />
              <div>
                <div style={{fontSize: 36, fontWeight: 900, color: C.teks}}>Es Teh Manis</div>
                <div style={{fontSize: 28, color: C.merah, fontWeight: 800}}>Rp 5.000</div>
              </div>
            </div>
            <div style={{fontSize: 26, color: C.abu, fontWeight: 700, marginTop: 20}}>Stok tersisa</div>
            <div style={{fontSize: 110, fontWeight: 900, color: C.maroon, lineHeight: 1, transform: `scale(${terjual > 0 ? 0.9 + 0.1 * angka : 1})`, transformOrigin: 'left center'}}>
              {24 - terjual}
            </div>
          </Abs>
          {terjual > 0 ? (
            <Abs x={300} y={420 - Math.min(1, (f - lastAt) / 24) * 120} w={190} h={64} style={{borderRadius: 32, background: C.merah, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', lineHeight: '64px', opacity: interpolate(f - lastAt, [0, 6, 22, 28], [0, 1, 1, 0], clamp)}}>
              -1 Terjual
            </Abs>
          ) : null}
          <Abs x={24} y={520} w={488} h={120} style={{borderRadius: 30, background: '#fff', border: `2px solid ${C.garis}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <div style={{fontSize: 32, fontWeight: 900, color: C.teks}}>Mie Goreng</div>
              <div style={{fontSize: 24, color: C.abu}}>Stok 0</div>
            </div>
            <div style={{padding: '10px 24px', borderRadius: 24, background: '#fee2e2', color: C.merah, fontSize: 28, fontWeight: 900}}>HABIS</div>
          </Abs>
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 112, t: 'Foto, modal, barcode & varian'},
          {a: 116, b: 210, t: 'Stok turun otomatis tiap terjual'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 11: dasbor & catat keluar ---------- */

const Dasbor: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const omset = Math.round(interpolate(f, [10, 60], [0, 1250000], {...clamp, easing: Easing.out(Easing.cubic)}));
  const laba = Math.round(interpolate(f, [16, 66], [0, 430000], {...clamp, easing: Easing.out(Easing.cubic)}));
  const trx = Math.round(interpolate(f, [16, 66], [0, 37], clamp));
  const nominal = ketik('250000', f, 136, 4);
  const simpan = f >= 184;
  const menu = ['Kasir', 'Catat Keluar', 'Laporan', 'Setelan'];
  const warnaMenu = [C.merah, C.emas, C.biru, C.hijau];
  return (
    <Ad i={10}>
      <Kata kata={['Dasbor', 'omset', '&', 'laba']} sorot={[1, 3]} />
      <Ponsel
        kamera={[
          [0, 268, 400, 1.2],
          [66, 268, 560, 1.2],
          [84, 268, 600, 1.0],
          [210, 268, 568, 1],
        ]}
      >
        <Header t="Warung Berkah" kanan={<span style={{fontSize: 22, background: 'rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: 20}}>ONLINE</span>} />
        <Abs x={24} y={140} w={488} h={190} style={{borderRadius: 30, background: `linear-gradient(135deg,${C.maroon},${C.merahTua})`, color: '#fff', padding: 28}}>
          <div style={{fontSize: 26, opacity: 0.8, fontWeight: 700}}>Omset Hari Ini</div>
          <div style={{fontSize: 66, fontWeight: 900, marginTop: 12}}>Rp {titik(omset)}</div>
        </Abs>
        <Abs x={24} y={350} w={238} h={150} style={{borderRadius: 26, background: '#e7f8ef', padding: 22}}>
          <div style={{fontSize: 24, fontWeight: 800, color: C.hijau}}>Laba</div>
          <div style={{fontSize: 36, fontWeight: 900, color: C.teks, marginTop: 10}}>Rp {titik(laba)}</div>
        </Abs>
        <Abs x={274} y={350} w={238} h={150} style={{borderRadius: 26, background: '#eaf1ff', padding: 22}}>
          <div style={{fontSize: 24, fontWeight: 800, color: C.biru}}>Transaksi</div>
          <div style={{fontSize: 56, fontWeight: 900, color: C.teks}}>{trx}</div>
        </Abs>
        <Abs x={28} y={530} w={480} style={{fontSize: 26, fontWeight: 900, color: C.abu}}>Menu Cepat</Abs>
        {menu.map((m, i) => {
          const s = pop(f, fps, 30 + i * 6, 12);
          return (
            <Abs key={i} x={28 + i * 122} y={570} w={112} h={140} style={{borderRadius: 24, background: C.krem, border: `2px solid ${C.garis}`, textAlign: 'center', opacity: s, transform: `scale(${0.8 + 0.2 * s})`}}>
              <div style={{width: 60, height: 60, borderRadius: 18, background: warnaMenu[i], margin: '18px auto 10px'}} />
              <div style={{fontSize: 20, fontWeight: 900, color: C.teks}}>{m}</div>
            </Abs>
          );
        })}
        <Tap x={206} y={640} at={80} />
        <Abs x={24} y={760} w={488} h={130} style={{borderRadius: 26, background: '#fff', border: `2px solid ${C.garis}`, padding: '24px 28px'}}>
          <div style={{fontSize: 24, fontWeight: 800, color: C.abu}}>Total Keluar Hari Ini</div>
          <div style={{fontSize: 48, fontWeight: 900, color: C.merah}}>{simpan ? 'Rp 250.000' : 'Rp 0'}</div>
        </Abs>

        <Muncul a={88} b={206} naik={false} bg="rgba(20,10,10,0.5)">
          <Abs x={0} y={440 + (1 - gerak(f, 88, 104)) * 500} w={PW} h={700} style={{background: '#fff', borderRadius: '44px 44px 0 0', padding: '34px 30px'}}>
            <div style={{fontSize: 38, fontWeight: 900, color: C.teks}}>Catat Keluar</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26}}>
              {['Bahan Baku', 'Ongkir kulakan', 'Servis alat'].map((c, i) => {
                const p = i === 0 && f >= 122;
                return (
                  <div key={i} style={{padding: '14px 26px', borderRadius: 30, fontSize: 26, fontWeight: 800, background: p ? C.merah : C.krem, color: p ? '#fff' : C.abu, border: `2px solid ${p ? C.merah : C.garis}`}}>{c}</div>
                );
              })}
            </div>
            <Abs x={30} y={190} w={476} h={90} style={{borderRadius: 22, border: `3px solid ${C.merah}`, padding: '0 26px', display: 'flex', alignItems: 'center', fontSize: 44, fontWeight: 900, color: C.teks}}>
              Rp {nominal ? titik(Number(nominal)) : ''}
              {f % 16 < 8 && f < 160 ? '|' : ''}
            </Abs>
            <Tombol x={30} y={330} w={476} h={92} t="Simpan" ukuran={34} />
          </Abs>
          <Tap x={116} y={620} at={118} />
          <Tap x={268} y={820} at={178} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 80, t: 'Omset & laba hari ini, sekali lihat'},
          {a: 84, b: 210, t: 'Catat pengeluaran per kategori'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 12: laporan ---------- */

const Laporan: React.FC = () => {
  const f = useCurrentFrame();
  const aktif = f < 30 ? 0 : f < 60 ? 1 : f < 90 ? 2 : f < 120 ? 3 : 1;
  const tab = ['Harian', 'Mingguan', 'Bulanan', 'Tahunan'];
  const gambar = interpolate(f, [40, 130], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const top5 = [
    ['Nasi Goreng', 48],
    ['Ayam Bakar', 36],
    ['Es Teh Manis', 33],
    ['Sate Ayam', 21],
    ['Mie Goreng', 17],
  ] as const;
  const jalurOmset = 'M10 150 C60 120 90 60 140 90 C190 120 220 40 270 70 C320 100 350 60 460 50';
  const jalurLaba = 'M10 170 C60 160 90 120 140 140 C190 150 220 100 270 120 C320 130 350 110 460 100';
  return (
    <Ad i={11}>
      <Kata kata={['Laporan', 'lengkap', 'tiap', 'periode']} sorot={[1]} />
      <Ponsel
        kamera={[
          [0, 268, 420, 1.15],
          [60, 268, 500, 1.15],
          [120, 268, 700, 1.15],
          [180, 268, 960, 1.15],
          [240, 268, 1000, 1.15],
        ]}
      >
        <Header t="Laporan Analitik" />
        <Abs x={20} y={128} w={496} h={64} style={{borderRadius: 32, background: C.krem, padding: 6, display: 'flex'}}>
          {tab.map((t, i) => (
            <div key={i} style={{flex: 1, borderRadius: 26, textAlign: 'center', lineHeight: '52px', fontSize: 23, fontWeight: 900, background: i === aktif ? '#fff' : 'transparent', color: i === aktif ? C.merah : C.abu, boxShadow: i === aktif ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'}}>{t}</div>
          ))}
        </Abs>
        {[
          ['Laba Bersih', 'Rp 301.500', C.hijau],
          ['Total Transaksi', '41', C.biru],
          ['% Margin Laba', '23,3%', C.emas],
          ['Rata-rata / Transaksi', 'Rp 31.000', C.merah],
        ].map((s, i) => (
          <Abs key={i} x={20 + (i % 2) * 252} y={214 + Math.floor(i / 2) * 140} w={244} h={128} style={{borderRadius: 24, background: '#fff', border: `2px solid ${C.garis}`, padding: 18}}>
            <div style={{fontSize: 21, fontWeight: 800, color: s[2] as string}}>{s[0]}</div>
            <div style={{fontSize: 36, fontWeight: 900, color: C.teks, marginTop: 14}}>{s[1]}</div>
          </Abs>
        ))}
        <Abs x={20} y={506} w={496} h={330} style={{borderRadius: 26, background: '#fff', border: `2px solid ${C.garis}`, padding: 20}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 900, color: C.teks}}>
            <span>Tren Pendapatan</span>
            <span style={{fontSize: 20, color: C.abu}}>Omset vs Laba</span>
          </div>
          <svg width="456" height="230" viewBox="0 0 470 200" style={{marginTop: 14}}>
            <path d={jalurOmset + ' L460 200 L10 200 Z'} fill="rgba(214,35,43,0.08)" opacity={gambar} />
            <path d={jalurOmset} fill="none" stroke={C.merah} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - gambar} />
            <path d={jalurLaba} fill="none" stroke={C.hijau} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - gambar} />
          </svg>
        </Abs>
        <Abs x={20} y={860} w={496} h={330} style={{borderRadius: 26, background: '#fff', border: `2px solid ${C.garis}`, padding: 20}}>
          <div style={{fontSize: 26, fontWeight: 900, color: C.teks}}>Top 5 Terlaris</div>
          {top5.map((t, i) => {
            const lebar = interpolate(f, [126 + i * 8, 156 + i * 8], [0, (t[1] / 48) * 250], clamp);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
                <div style={{width: 34, fontSize: 24, fontWeight: 900, color: C.emas}}>{i + 1}</div>
                <div style={{width: 150, fontSize: 22, fontWeight: 800, color: C.teks}}>{t[0]}</div>
                <div style={{height: 24, width: lebar, borderRadius: 12, background: i === 0 ? C.merah : C.perak}} />
                <div style={{fontSize: 22, fontWeight: 900, color: C.abu}}>{t[1]}</div>
              </div>
            );
          })}
        </Abs>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 125, t: 'Harian sampai tahunan, satu sentuhan'},
          {a: 130, b: 240, t: 'Grafik omset vs laba & Top 5 terlaris'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 13: pengaturan & cloud ---------- */

const Pengaturan: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const baris = [
    ['Nama Toko', 'Warung Berkah'],
    ['Alamat di Struk', 'Jl. Contoh No. 1'],
    ['Nomor WhatsApp', '0812-xxxx-xxxx'],
    ['QRIS Toko', 'Sudah terpasang'],
    ['Program Poin Member', 'Aktif'],
  ];
  const sinkron = interpolate(f, [70, 110], [0, 1], clamp);
  const kode = pop(f, fps, 122, 10);
  return (
    <Ad i={12}>
      <Kata kata={['Data', 'aman', 'di', 'cloud']} sorot={[3]} />
      <Ponsel
        kamera={[
          [0, 268, 420, 1.1],
          [60, 268, 560, 1.1],
          [110, 268, 800, 1.1],
          [180, 268, 840, 1.1],
        ]}
      >
        <Header t="Pengaturan" />
        {baris.map((b, i) => {
          const s = pop(f, fps, 6 + i * 7, 12);
          return (
            <Abs key={i} x={24} y={136 + i * 104} w={488} h={92} style={{borderRadius: 24, background: C.krem, border: `2px solid ${C.garis}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: s, transform: `translateX(${(1 - s) * 120}px)`}}>
              <div>
                <div style={{fontSize: 20, fontWeight: 800, color: C.abu}}>{b[0]}</div>
                <div style={{fontSize: 28, fontWeight: 900, color: C.teks}}>{b[1]}</div>
              </div>
              {i === 4 ? (
                <div style={{width: 80, height: 44, borderRadius: 22, background: C.hijau, position: 'relative'}}>
                  <div style={{position: 'absolute', right: 4, top: 4, width: 36, height: 36, borderRadius: 18, background: '#fff'}} />
                </div>
              ) : null}
            </Abs>
          );
        })}
        <Tombol x={24} y={680} w={488} h={84} t={sinkron >= 1 ? 'Sinkron berhasil' : 'Sinkron ke Cloud'} bg={sinkron >= 1 ? C.hijau : C.merah} ukuran={32} />
        <Abs x={44} y={776} w={448} h={14} style={{borderRadius: 7, background: C.garis, overflow: 'hidden'}}>
          <div style={{width: `${sinkron * 100}%`, height: '100%', background: C.hijau}} />
        </Abs>
        <Tap x={268} y={722} at={64} />
        <Tombol x={24} y={812} w={488} h={84} t="Pulihkan Data dari Cloud" bg={C.krem} tc={C.maroon} ukuran={30} />
        <Abs x={24} y={930} w={488} h={190} style={{borderRadius: 28, background: `linear-gradient(135deg,${C.maroon},${C.merahTua})`, color: '#fff', padding: 26, opacity: kode, transform: `scale(${0.9 + 0.1 * kode})`}}>
          <div style={{fontSize: 24, opacity: 0.85, fontWeight: 700}}>Kode Pengaman · untuk HP kedua</div>
          <div style={{fontSize: 64, fontWeight: 900, letterSpacing: 6, marginTop: 14, color: '#f3d98b'}}>7K4M-2Q9X</div>
        </Abs>
      </Ponsel>
      <Cap
        isi={[
          {a: 10, b: 66, t: 'Atur toko, QRIS & program poin'},
          {a: 70, b: 120, t: 'Sinkron & pulihkan dari cloud'},
          {a: 124, b: 180, t: 'Kode pengaman untuk HP kedua'},
        ]}
      />
    </Ad>
  );
};

/* ---------- Adegan 14: ajakan ---------- */

const Ajakan: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = pop(f, fps, 4, 9);
  const nama = pop(f, fps, 18, 12);
  const lencana = pop(f, fps, 60, 9);
  const denyut = 1 + Math.sin(f / 8) * 0.02;
  return (
    <Ad i={13}>
      {[0, 1, 2].map((k) => {
        const fase = ((f - k * 30 + 90) % 90) / 90;
        const d = 360 + fase * 520;
        return <div key={k} style={{position: 'absolute', left: 540 - d / 2, top: 480 - d / 2, width: d, height: d, borderRadius: '50%', border: `5px solid ${C.merah}`, opacity: (1 - fase) * 0.4}} />;
      })}
      <Img src={staticFile('logo.png')} style={{position: 'absolute', top: 300, left: 370, width: 340, height: 340, borderRadius: 76, boxShadow: '0 40px 100px rgba(110,15,20,0.45)', transform: `scale(${logo})`}} />
      <Abs x={0} y={690} w={1080} style={{textAlign: 'center', fontSize: 140, fontWeight: 900, letterSpacing: 4, color: C.maroon, opacity: nama}}>NUYAPAY</Abs>
      <Abs x={0} y={870} w={1080} style={{textAlign: 'center', fontSize: 60, fontWeight: 800, color: C.merah, opacity: nama}}>Kasir & Katalog UMKM</Abs>
      <Kata kata={['Kelola', 'usaha', 'lebih', 'mudah,', 'lebih', 'untung']} sorot={[5]} ukuran={72} atas={1010} mulai={30} />
      <div
        style={{
          position: 'absolute',
          top: 1360,
          left: 150,
          width: 780,
          height: 230,
          boxSizing: 'border-box',
          borderRadius: 40,
          background: '#000',
          border: '4px solid #8a8f99',
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          padding: '0 50px',
          opacity: lencana,
          transform: `scale(${lencana * denyut})`,
        }}
      >
        <svg width="120" height="132" viewBox="0 0 100 110">
          <polygon points="10,6 56,55 10,104" fill="#2196f3" />
          <polygon points="10,6 74,42 56,55" fill="#4caf50" />
          <polygon points="74,42 96,55 74,68 56,55" fill="#ffc107" />
          <polygon points="10,104 56,55 74,68" fill="#f44336" />
        </svg>
        <div>
          <div style={{fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 3}}>UNDUH DI</div>
          <div style={{fontSize: 80, fontWeight: 700, color: '#fff', lineHeight: 1.05}}>Play Store</div>
        </div>
      </div>
    </Ad>
  );
};

/* ---------- Susunan video ---------- */

const Progres: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, bottom: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: `linear-gradient(90deg,${C.merah},${C.emas})`}} />
  );
};

export const PromoNuyaPay: React.FC<PromoProps> = () => (
  <AbsoluteFill style={{background: '#fffaf6'}}>
    <Hook />
    <Masalah />
    <Kenal />
    <Katalog />
    <Pesanan />
    <Kasir />
    <Scan />
    <Poin />
    <BayarStruk />
    <ProdukStok />
    <Dasbor />
    <Laporan />
    <Pengaturan />
    <Ajakan />
    {D.slice(1).map((_, i) => (
      <Sapuan key={i} di={i + 1} />
    ))}
    <Progres />
  </AbsoluteFill>
);
