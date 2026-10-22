import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
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
  kiri?: number;
  desain?: number;
}> = ({children, lebar = 760, atas = 330, kiri, desain = 676}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 14}});
  const tinggi = Math.round(lebar * 1.5);
  // isi layar dirancang pada lebar "desain" lalu diskalakan agar pas di dalam bingkai
  const skala = (lebar - 24) / desain;
  const tinggiDesain = (tinggi - 24) / skala;
  return (
    <div
      style={{
        position: 'absolute',
        top: atas,
        left: kiri !== undefined ? kiri : (1080 - lebar) / 2,
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
        <div
          style={{
            width: desain,
            height: tinggiDesain,
            transform: `scale(${skala})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {children}
        </div>
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


/* ===== KARTUN: tokoh dan properti bergerak (SVG) ===== */

export type Mood = 'pusing' | 'senang' | 'kaget' | 'netral';

// Tokoh kartun penjual/pelanggan. Bergerak sendiri: naik-turun, berkedip, lengan mengayun.
// lengan: turun | lambai | tunjuk | angkat (dua tangan). hadap: 1 = ke kanan, -1 = cermin.
export const Orang: React.FC<{
  x: number;
  y: number;
  tinggi?: number;
  mood?: Mood;
  baju?: string;
  topi?: string;
  kulit?: string;
  lengan?: 'turun' | 'lambai' | 'tunjuk' | 'angkat';
  hadap?: 1 | -1;
  tunda?: number;
}> = ({
  x,
  y,
  tinggi = 480,
  mood = 'netral',
  baju = warna.biru,
  topi = warna.oranye,
  kulit = '#f2c9a0',
  lengan = 'turun',
  hadap = 1,
  tunda = 0,
}) => {
  const frame = useCurrentFrame() + tunda;
  const bob = Math.sin(frame / 7) * 6;
  const kedip = frame % 96 < 4 ? 0.1 : 1;
  const ayun = Math.sin(frame / 6);
  let kiriTangan = [38, 214 + ayun * 3];
  let kananTangan = [162, 214 - ayun * 3];
  if (lengan === 'lambai') kananTangan = [176 + ayun * 8, 70 + ayun * 6];
  if (lengan === 'tunjuk') kananTangan = [214, 150 + ayun * 4];
  if (lengan === 'angkat') {
    kiriTangan = [24 - ayun * 6, 66 + ayun * 5];
    kananTangan = [176 + ayun * 6, 66 - ayun * 5];
  }
  const alisKiri =
    mood === 'pusing' ? 'M66 60 L92 52' : mood === 'kaget' ? 'M66 52 Q80 44 94 52' : 'M66 58 Q80 51 94 58';
  const alisKanan =
    mood === 'pusing' ? 'M108 52 L134 60' : mood === 'kaget' ? 'M106 52 Q120 44 134 52' : 'M106 58 Q120 51 134 58';
  const putar = frame / 10;
  return (
    <svg
      viewBox="0 0 200 320"
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        width: tinggi * 0.625,
        height: tinggi,
        overflow: 'visible',
        transform: hadap === -1 ? 'scaleX(-1)' : undefined,
      }}
    >
      {/* kaki */}
      <rect x="72" y="232" width="24" height="70" rx="10" fill="#2b3a55" />
      <rect x="104" y="232" width="24" height="70" rx="10" fill="#2b3a55" />
      <ellipse cx="82" cy="306" rx="22" ry="10" fill="#1b2438" />
      <ellipse cx="118" cy="306" rx="22" ry="10" fill="#1b2438" />
      {/* lengan (di belakang badan) */}
      <line x1="60" y1="140" x2={kiriTangan[0]} y2={kiriTangan[1]} stroke={baju} strokeWidth="20" strokeLinecap="round" />
      <line x1="140" y1="140" x2={kananTangan[0]} y2={kananTangan[1]} stroke={baju} strokeWidth="20" strokeLinecap="round" />
      {/* badan + celemek */}
      <rect x="54" y="116" width="92" height="126" rx="30" fill={baju} />
      <rect x="72" y="152" width="56" height="90" rx="14" fill="white" opacity="0.92" />
      <rect x="84" y="196" width="32" height="22" rx="6" fill="#dfe6f3" />
      {/* tangan */}
      <circle cx={kiriTangan[0]} cy={kiriTangan[1]} r="12" fill={kulit} />
      <circle cx={kananTangan[0]} cy={kananTangan[1]} r="12" fill={kulit} />
      {/* kepala */}
      <rect x="90" y="106" width="20" height="18" fill={kulit} />
      <circle cx="54" cy="76" r="9" fill={kulit} />
      <circle cx="146" cy="76" r="9" fill={kulit} />
      <circle cx="100" cy="70" r="46" fill={kulit} />
      <path d="M52 44 Q100 -14 148 44 Z" fill={topi} />
      <ellipse cx="124" cy="46" rx="42" ry="8" fill={topi} />
      <ellipse cx="124" cy="49" rx="42" ry="5" fill="rgba(0,0,0,0.18)" />
      {/* wajah */}
      <ellipse cx="82" cy="78" rx="6" ry={7 * kedip} fill="#1b2438" />
      <ellipse cx="118" cy="78" rx="6" ry={7 * kedip} fill="#1b2438" />
      <path d={alisKiri} stroke="#1b2438" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d={alisKanan} stroke="#1b2438" strokeWidth="4" strokeLinecap="round" fill="none" />
      {mood === 'senang' && (
        <>
          <path d="M78 96 Q100 122 122 96 Z" fill="#7a2230" stroke="#1b2438" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="68" cy="94" r="8" fill="#ff8aa1" opacity="0.5" />
          <circle cx="132" cy="94" r="8" fill="#ff8aa1" opacity="0.5" />
        </>
      )}
      {mood === 'pusing' && (
        <>
          <path d="M80 104 Q90 94 100 104 T120 104" stroke="#1b2438" strokeWidth="4" fill="none" strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={100 + Math.cos(putar + i * 2.1) * 62}
              cy={14 + Math.sin(putar + i * 2.1) * 10}
              r="7"
              fill={warna.oranye}
            />
          ))}
          <path
            d={`M150 ${40 + ((frame * 3) % 50)} q8 12 0 18 q-8 -6 0 -18 z`}
            fill="#6cc4ff"
            opacity="0.9"
          />
        </>
      )}
      {mood === 'kaget' && <ellipse cx="100" cy="106" rx="11" ry="14" fill="#7a2230" stroke="#1b2438" strokeWidth="3" />}
      {mood === 'netral' && <path d="M84 102 L116 102" stroke="#1b2438" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
};

// Gelembung ucapan kartun
export const Gelembung: React.FC<{
  teks: string;
  x: number;
  y: number;
  lebar?: number;
  mulai?: number;
  ukuran?: number;
  ekor?: 'kiri' | 'kanan';
  latar?: string;
  tulisan?: string;
}> = ({teks, x, y, lebar = 460, mulai = 0, ukuran = 40, ekor = 'kiri', latar = 'white', tulisan = '#0f2027'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 10}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: lebar,
        boxSizing: 'border-box',
        padding: '24px 30px',
        borderRadius: 36,
        background: latar,
        color: tulisan,
        fontSize: ukuran,
        fontWeight: 800,
        lineHeight: 1.2,
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        opacity: s,
        transform: `scale(${0.6 + 0.4 * s})`,
        transformOrigin: ekor === 'kiri' ? 'bottom left' : 'bottom right',
      }}
    >
      {teks}
      <div
        style={{
          position: 'absolute',
          bottom: -16,
          [ekor]: 54,
          width: 34,
          height: 34,
          background: latar,
          transform: 'rotate(45deg)',
          borderRadius: 6,
        }}
      />
    </div>
  );
};

// Koin emas melayang
export const Koin: React.FC<{x: number; y: number; ukuran?: number; fase?: number}> = ({
  x,
  y,
  ukuran = 90,
  fase = 0,
}) => {
  const frame = useCurrentFrame();
  const naik = Math.sin((frame + fase) / 9) * 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + naik,
        width: ukuran,
        height: ukuran,
        borderRadius: ukuran / 2,
        background: `radial-gradient(circle at 35% 30%, #ffe37a, ${warna.oranye})`,
        border: '5px solid #d98f00',
        boxSizing: 'border-box',
        color: '#8a5a00',
        fontSize: ukuran * 0.36,
        fontWeight: 900,
        textAlign: 'center',
        lineHeight: `${ukuran - 10}px`,
        transform: `rotateY(${Math.sin((frame + fase) / 12) * 40}deg)`,
      }}
    >
      Rp
    </div>
  );
};

// Tumpukan kertas bon yang berantakan dan berkibar
export const TumpukanBon: React.FC<{x: number; y: number; skala?: number; jumlah?: number}> = ({
  x,
  y,
  skala = 1,
  jumlah = 5,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${skala})`, transformOrigin: 'top left'}}>
      {Array.from({length: jumlah}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: i * 26 - 40,
            top: -i * 18,
            width: 200,
            height: 250,
            borderRadius: 10,
            background:
              'repeating-linear-gradient(#fffdf5 0px, #fffdf5 30px, #cfd8ea 30px, #cfd8ea 32px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            transform: `rotate(${(i - 2) * 9 + Math.sin(frame / 14 + i) * 4}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Printer kartun: kertas struk keluar pelan-pelan (progres 0..1)
export const Printer: React.FC<{x: number; y: number; progres: number; baris?: string[]}> = ({
  x,
  y,
  progres,
  baris = [],
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 420, height: 520}}>
    <div
      style={{
        position: 'absolute',
        left: 60,
        bottom: 150,
        width: 300,
        height: 320 * progres,
        background: 'white',
        borderRadius: '10px 10px 0 0',
        overflow: 'hidden',
        padding: '18px 20px',
        boxSizing: 'border-box',
        color: '#0f2027',
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1.5,
      }}
    >
      {baris.map((b, i) => (
        <div key={i}>{b}</div>
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 420,
        height: 190,
        borderRadius: 36,
        background: `linear-gradient(180deg, #3b4a6b, ${warna.gelap})`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 50,
        bottom: 150,
        width: 320,
        height: 18,
        borderRadius: 9,
        background: '#0b1220',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 40,
        bottom: 50,
        width: 22,
        height: 22,
        borderRadius: 11,
        background: progres < 1 ? warna.oranye : warna.hijau,
      }}
    />
  </div>
);

// Logo dari public/logo.png di dalam kartu putih (aman untuk logo warna apa pun)
export const LogoKartu: React.FC<{ukuran?: number; x?: number; y?: number}> = ({
  ukuran = 320,
  x,
  y,
}) => (
  <div
    style={{
      position: x !== undefined ? 'absolute' : 'relative',
      left: x,
      top: y,
      width: ukuran,
      height: ukuran,
      borderRadius: ukuran * 0.24,
      background: 'white',
      padding: ukuran * 0.1,
      boxSizing: 'border-box',
      boxShadow: '0 0 120px rgba(0,97,255,0.55), 0 30px 80px rgba(0,0,0,0.5)',
    }}
  >
    <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
  </div>
);
