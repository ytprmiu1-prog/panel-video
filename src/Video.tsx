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
   VIDEO: TUTORIAL TERIMA PESANAN ONLINE (NUYAPAY) - tepat 59 detik
   30 fps, 1080x1920 (1770 frame). Gaya terang, tanpa domain, logo.png.
   Semua data adalah data tiruan ("Warung Berkah").
   Cukup timpa file ini untuk video baru; Root.tsx tidak perlu diubah.
   ===================================================================== */

// Durasi adegan (frame): hook, langkah 1-5, penutup  (jumlah = 1770)
const D = [150, 240, 240, 270, 300, 300, 270];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));

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

/* ---------- Bahan bersama ---------- */

const StepBar: React.FC<{aktif: number}> = ({aktif}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      <Abs x={0} y={64} w={1080} h={84} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const s = pop(f, fps, 2 + i * 3, 12);
          const selesai = i < aktif;
          const kini = i === aktif;
          return (
            <React.Fragment key={i}>
              {i > 0 ? <div style={{width: 46, height: 6, borderRadius: 3, background: i <= aktif ? C.merah : C.perak}} /> : null}
              <div
                style={{
                  width: kini ? 84 : 68,
                  height: kini ? 84 : 68,
                  boxSizing: 'border-box',
                  borderRadius: '50%',
                  background: kini ? C.merah : selesai ? C.maroon : '#fff',
                  border: `4px solid ${kini || selesai ? 'transparent' : C.perak}`,
                  color: kini || selesai ? '#fff' : C.abu,
                  fontSize: kini ? 42 : 34,
                  fontWeight: 900,
                  textAlign: 'center',
                  lineHeight: kini ? '76px' : '60px',
                  boxShadow: kini ? '0 10px 30px rgba(214,35,43,0.45)' : 'none',
                  transform: `scale(${s})`,
                }}
              >
                {i + 1}
              </div>
            </React.Fragment>
          );
        })}
      </Abs>
      <Abs x={0} y={158} w={1080} style={{textAlign: 'center', fontSize: 28, fontWeight: 800, color: C.abu, letterSpacing: 3}}>
        LANGKAH {aktif + 1} DARI 5
      </Abs>
    </>
  );
};

const Judul: React.FC<{kata: string[]; sorot?: number[]}> = ({kata, sorot}) => (
  <Kata kata={kata} sorot={sorot} ukuran={72} atas={200} />
);

const Sheet: React.FC<{proses: boolean}> = ({proses}) => (
  <>
    <Header t="Pesanan Masuk" />
    <Abs x={24} y={140} w={488} h={340} style={{borderRadius: 28, background: C.krem, border: `2px solid ${C.merah}`, padding: 20}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 26, fontWeight: 800, color: C.abu}}>#J5U7KE · 22 Okt</span>
        <span style={{fontSize: 24, fontWeight: 900, padding: '4px 16px', borderRadius: 20, background: proses ? C.hijau : C.biru, color: '#fff'}}>
          {proses ? 'DIPROSES' : 'BARU'}
        </span>
      </div>
      <div style={{fontSize: 36, fontWeight: 900, color: C.teks, marginTop: 10}}>Bu Sari</div>
      <div style={{fontSize: 26, color: C.abu}}>1x Nasi Goreng · 2x Es Teh Manis</div>
      <div style={{fontSize: 24, color: C.abu, marginTop: 4}}>Catatan: pedas sedang</div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 900, marginTop: 12, color: C.teks}}>
        <span>Total (belum ongkir)</span>
        <span><Rp n={25000} /></span>
      </div>
    </Abs>
    <Tombol x={40} y={376} w={130} h={64} t="Proses" ukuran={26} bg={proses ? C.hijau : C.merah} />
    <Tombol x={178} y={376} w={120} h={64} t="Chat WA" ukuran={24} bg="#dcfce7" tc={C.hijau} />
    <Tombol x={306} y={376} w={90} h={64} t="Peta" ukuran={24} bg="#dbeafe" tc={C.biru} />
    <Tombol x={404} y={376} w={90} h={64} t="Batal" ukuran={24} bg="#fee2e2" tc={C.merah} />
    <Abs x={28} y={510} w={480} style={{fontSize: 26, color: C.abu, lineHeight: 1.35}}>
      Pesanan dari katalog online. Ketuk Proses untuk mengisi keranjang kasir, tambahkan ongkir bila perlu, lalu bayar seperti biasa.
    </Abs>
  </>
);

const POLA_QR = (r: number, c: number): boolean => {
  const finder = (a: number, b: number) => (a < 7 && b < 7) || (a < 7 && b > 13) || (a > 13 && b < 7);
  if (finder(r, c)) {
    const rr = r > 13 ? r - 14 : r;
    const cc = c > 13 ? c - 14 : c;
    return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
  }
  return (r * 7 + c * 13 + r * c) % 5 < 2;
};

/* ---------- Adegan 0: hook ---------- */

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bel = pop(f, fps, 6, 9);
  const badge = pop(f, fps, 34, 8);
  const goyang = f >= 20 && f < 110 ? Math.sin(f / 2.6) * 14 : 0;
  return (
    <>
      <Kata kata={['Terima', 'pesanan', 'online']} sorot={[2]} ukuran={96} atas={150} />
      <Abs x={340} y={420} w={400} h={400} style={{transform: `scale(${bel}) rotate(${goyang}deg)`, transformOrigin: '50% 12%'}}>
        <svg width="400" height="400" viewBox="0 0 100 100">
          <path d="M50 10 C30 10 24 28 24 44 C24 60 16 66 12 72 H88 C84 66 76 60 76 44 C76 28 70 10 50 10 Z" fill={C.merah} />
          <circle cx="50" cy="82" r="9" fill={C.maroon} />
        </svg>
        <div style={{position: 'absolute', left: 270, top: 10, width: 124, height: 124, borderRadius: 62, background: C.maroon, border: '8px solid #fff', color: '#fff', fontSize: 70, fontWeight: 900, textAlign: 'center', lineHeight: '108px', boxSizing: 'border-box', transform: `scale(${badge})`}}>
          1
        </div>
      </Abs>
      <Abs x={205} y={930} w={670} h={120} style={{display: 'flex', justifyContent: 'space-between'}}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const s = pop(f, fps, 50 + i * 10, 10);
          return (
            <div key={i} style={{width: 110, height: 110, borderRadius: 55, background: i === 4 ? C.merah : '#fff', border: `5px solid ${i === 4 ? C.merah : C.perak}`, color: i === 4 ? '#fff' : C.maroon, fontSize: 56, fontWeight: 900, textAlign: 'center', lineHeight: '100px', boxSizing: 'border-box', transform: `scale(${s})`}}>
              {n}
            </div>
          );
        })}
      </Abs>
      <Abs x={0} y={1090} w={1080} style={{textAlign: 'center', fontSize: 68, fontWeight: 900, color: C.maroon, opacity: pop(f, fps, 100, 12)}}>
        5 langkah, kelar!
      </Abs>
      <Kata kata={['Gampang', 'banget!']} sorot={[1]} ukuran={104} atas={1300} mulai={90} />
    </>
  );
};

/* ---------- Langkah 1: pelanggan pesan lewat WhatsApp ---------- */

const Langkah1: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bar = pop(f, fps, 10, 10);
  const baris = [
    'Halo WARUNG BERKAH, saya mau pesan:',
    '1x Nasi Goreng - Rp 15.000',
    '2x Es Teh Manis - Rp 10.000',
    'Total Tagihan: Rp 25.000',
    'Nama: Bu Sari',
    'Alamat: Jl. Melati No. 5',
    'Catatan: pedas sedang',
    'Kode Pesanan: 957MX7',
  ];
  return (
    <>
      <StepBar aktif={0} />
      <Judul kata={['Pesan', 'lewat', 'WhatsApp']} sorot={[2]} />
      <Ponsel
        atas={470}
        k={1.1}
        kamera={[
          [0, 268, 568, 1],
          [70, 268, 820, 1.25],
          [94, 268, 568, 1],
          [170, 268, 420, 1.2],
          [240, 268, 520, 1.2],
        ]}
      >
        <Header t="Warung Berkah" kanan={<span style={{fontSize: 22, background: 'rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: 20}}>ONLINE</span>} />
        <Abs x={20} y={130} w={500} h={60} style={{display: 'flex', gap: 12}}>
          {['Semua', 'Makanan', 'Minuman'].map((c, i) => (
            <div key={i} style={{padding: '12px 26px', borderRadius: 30, fontSize: 26, fontWeight: 800, background: i === 0 ? C.merah : C.krem, color: i === 0 ? '#fff' : C.abu}}>{c}</div>
          ))}
        </Abs>
        {PRODUK.slice(0, 4).map((p, i) => {
          const s = pop(f, fps, 2 + i * 5, 12);
          const qty = i === 0 ? 1 : i === 2 ? 2 : 0;
          return (
            <Abs key={i} x={20 + (i % 2) * 252} y={220 + Math.floor(i / 2) * 330} w={240} h={310} style={{borderRadius: 26, background: '#fff', border: `2px solid ${qty ? C.merah : C.garis}`, padding: 14, opacity: s, transform: `scale(${0.85 + 0.15 * s})`}}>
              <Thumb h={p.h} s={212} a={p.a} b={p.b} />
              <div style={{fontSize: 26, fontWeight: 900, color: C.teks, marginTop: 8}}>{p.n}</div>
              <div style={{fontSize: 24, fontWeight: 800, color: C.merah}}><Rp n={p.hrg} /></div>
              {qty ? <div style={{position: 'absolute', right: 10, top: 10, width: 50, height: 50, borderRadius: 25, background: C.merah, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', lineHeight: '50px'}}>{qty}</div> : null}
            </Abs>
          );
        })}
        <Abs x={20} y={1040} w={496} h={80} style={{borderRadius: 40, background: '#25d366', color: '#fff', fontSize: 30, fontWeight: 900, textAlign: 'center', lineHeight: '80px', opacity: bar, transform: `translateY(${(1 - bar) * 80}px)`}}>
          3 item · Pesan via WhatsApp
        </Abs>
        <Tap x={268} y={1080} at={78} />

        <Muncul a={96} b={240} bg="#efe7dd">
          <Abs x={0} y={0} w={PW} h={112} style={{background: '#075e54', color: '#fff', padding: '56px 28px 0', fontSize: 32, fontWeight: 900}}>WARUNG BERKAH</Abs>
          <Abs x={60} y={150} w={456} style={{background: '#d9fdd3', borderRadius: '24px 24px 6px 24px', padding: '22px 24px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)'}}>
            {baris.map((b, i) => {
              const s = pop(f, fps, 100 + i * 9, 14);
              const kode = i === baris.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 25,
                    fontWeight: i === 0 || kode ? 900 : 600,
                    color: '#111',
                    margin: '6px 0',
                    opacity: s,
                    padding: kode && f >= 190 ? '6px 10px' : 0,
                    border: kode && f >= 190 ? `3px solid ${C.merah}` : '3px solid transparent',
                    borderRadius: 12,
                    background: kode && f >= 190 ? 'rgba(214,35,43,0.1)' : 'transparent',
                  }}
                >
                  {b}
                </div>
              );
            })}
          </Abs>
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 92, t: 'Pelanggan pilih menu & pesan'},
          {a: 98, b: 240, t: 'Data & kode pesanan terisi sendiri'},
        ]}
      />
    </>
  );
};

/* ---------- Langkah 2: HP bergetar, angka merah ---------- */

const Langkah2: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badge = pop(f, fps, 26, 8);
  const masukToast = gerak(f, 20, 32);
  const toast = masukToast * (1 - gerak(f, 96, 108));
  return (
    <>
      <StepBar aktif={1} />
      <Judul kata={['HP', 'bergetar!']} sorot={[1]} />
      <Ponsel
        atas={470}
        k={1.1}
        getar={[16, 52]}
        kamera={[
          [0, 268, 568, 1],
          [100, 268, 420, 1.3],
          [150, 268, 420, 1.3],
          [158, 268, 568, 1],
          [240, 268, 568, 1],
        ]}
      >
        <Header t="Warung Berkah" />
        <Abs x={28} y={140} w={480} h={170} style={{borderRadius: 28, background: `linear-gradient(135deg,${C.maroon},${C.merahTua})`, color: '#fff', padding: 28}}>
          <div style={{fontSize: 24, opacity: 0.8, fontWeight: 700}}>Omset Hari Ini</div>
          <div style={{fontSize: 56, fontWeight: 900, marginTop: 10}}><Rp n={1250000} /></div>
        </Abs>
        <Abs x={28} y={340} w={480} h={100} style={{borderRadius: 28, background: '#fff', border: `2px solid ${C.garis}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 34, fontWeight: 900, color: C.teks}}>
          <span>Pesanan Masuk</span>
          {f >= 26 ? (
            <div style={{minWidth: 58, height: 58, borderRadius: 29, background: C.merah, color: '#fff', fontSize: 34, fontWeight: 900, textAlign: 'center', lineHeight: '58px', transform: `scale(${badge})`}}>1</div>
          ) : null}
        </Abs>
        <Abs x={28} y={124} w={480} h={84} style={{borderRadius: 24, background: '#1f1f24', color: '#fff', fontSize: 30, fontWeight: 800, padding: '0 26px', display: 'flex', alignItems: 'center', gap: 16, opacity: toast, transform: `translateY(${(1 - masukToast) * -140}px)`}}>
          <div style={{width: 18, height: 18, borderRadius: 9, background: C.merah}} />
          Pesanan baru masuk!
        </Abs>
        <Tap x={268} y={390} at={146} />
        <Muncul a={156} b={240}>
          <Sheet proses={false} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 92, t: 'HP bergetar, ada pesanan baru'},
          {a: 96, b: 152, t: 'Angka merah di Pesanan Masuk'},
          {a: 158, b: 240, t: 'Ketuk untuk membuka'},
        ]}
      />
    </>
  );
};

/* ---------- Langkah 3: cek, Chat WA, Peta ---------- */

const Langkah3: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pin = pop(f, fps, 190, 7);
  const b1 = pop(f, fps, 92, 11);
  const b2 = pop(f, fps, 120, 11);
  return (
    <>
      <StepBar aktif={2} />
      <Judul kata={['Cek', 'pesanannya']} sorot={[1]} />
      <Ponsel
        atas={470}
        k={1.1}
        kamera={[
          [0, 268, 430, 1.3],
          [62, 268, 430, 1.3],
          [80, 268, 568, 1],
          [165, 268, 568, 1],
          [172, 268, 430, 1.3],
          [184, 268, 568, 1],
          [270, 268, 568, 1],
        ]}
      >
        <Sheet proses={false} />
        <Tap x={238} y={408} at={70} />
        <Tap x={351} y={408} at={176} />

        <Muncul a={78} b={166} bg="#efe7dd">
          <Abs x={0} y={0} w={PW} h={112} style={{background: '#075e54', color: '#fff', padding: '56px 28px 0', fontSize: 32, fontWeight: 900}}>Bu Sari</Abs>
          <Abs x={110} y={160} w={400} style={{background: '#d9fdd3', borderRadius: '24px 24px 6px 24px', padding: '18px 22px', fontSize: 27, fontWeight: 700, color: '#111', opacity: b1, transform: `scale(${0.8 + 0.2 * b1})`, transformOrigin: 'right top'}}>
            Halo Bu Sari, pesanannya kami proses ya!
          </Abs>
          <Abs x={26} y={310} w={300} style={{background: '#fff', borderRadius: '24px 24px 24px 6px', padding: '18px 22px', fontSize: 27, fontWeight: 700, color: '#111', opacity: b2, transform: `scale(${0.8 + 0.2 * b2})`, transformOrigin: 'left top'}}>
            Siap kak, makasih!
          </Abs>
        </Muncul>

        <Muncul a={182} b={270}>
          <Header t="Lokasi Pelanggan" />
          <Abs x={0} y={112} w={PW} h={640} style={{background: '#e9efe4', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 250, width: PW, height: 44, background: '#fff'}} />
            <div style={{position: 'absolute', left: 300, top: 0, width: 40, height: 640, background: '#fff'}} />
            <div style={{position: 'absolute', left: -100, top: 420, width: 800, height: 34, background: '#fff', transform: 'rotate(-18deg)'}} />
            <div style={{position: 'absolute', left: 40, top: 60, width: 220, height: 150, background: '#d3e3cc', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 360, top: 330, width: 150, height: 220, background: '#cfe0ef', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 80, top: 480, width: 180, height: 120, background: '#e2d9cf', borderRadius: 20}} />
            <div style={{position: 'absolute', left: 270, top: 280, width: 80 + Math.sin(f / 5) * 10, height: 80 + Math.sin(f / 5) * 10, borderRadius: '50%', background: 'rgba(214,35,43,0.25)'}} />
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
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 76, t: 'Lihat detail pesanan'},
          {a: 80, b: 166, t: 'Chat WA: konfirmasi ke pembeli'},
          {a: 176, b: 270, t: 'Peta: lihat lokasi pengantaran'},
        ]}
      />
    </>
  );
};

/* ---------- Langkah 4: Proses, keranjang kasir, ongkir ---------- */

const Langkah4: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ongkir = ketik('5000', f, 172, 4);
  const sudahOngkir = ongkir.length >= 4;
  const total = Math.round(interpolate(f, [186, 206], [25000, 30000], clamp));
  return (
    <>
      <StepBar aktif={3} />
      <Judul kata={['Ketuk', 'Proses']} sorot={[1]} />
      <Ponsel
        atas={470}
        k={1.1}
        kamera={[
          [0, 268, 430, 1.3],
          [60, 268, 430, 1.3],
          [72, 268, 568, 1],
          [140, 268, 568, 1],
          [155, 268, 520, 1.2],
          [230, 268, 560, 1.1],
          [300, 268, 568, 1],
        ]}
      >
        <Sheet proses={f >= 40} />
        <Tap x={105} y={408} at={34} />

        <Muncul a={70} b={300}>
          <Header t="Kasir" />
          <Abs x={24} y={130} w={488} h={70} style={{borderRadius: 22, background: '#e7f8ef', color: C.hijau, fontSize: 26, fontWeight: 900, padding: '0 22px', display: 'flex', alignItems: 'center'}}>
            Dari pesanan #J5U7KE · Bu Sari
          </Abs>
          {[
            ['Nasi Goreng x1', 15000],
            ['Es Teh Manis x2', 10000],
          ].map((r, i) => {
            const s = pop(f, fps, 82 + i * 12, 12);
            return (
              <Abs key={i} x={28} y={230 + i * 70} w={480} h={60} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30, fontWeight: 800, color: C.teks, opacity: s, transform: `translateX(${(1 - s) * 120}px)`}}>
                <span>{r[0]}</span>
                <span><Rp n={r[1] as number} /></span>
              </Abs>
            );
          })}
          <Abs x={28} y={384} w={480} h={2} style={{background: C.garis}} />
          <Abs x={28} y={400} w={480} style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, color: C.abu, fontWeight: 700}}>
            <span>Subtotal</span>
            <span>Rp 25.000</span>
          </Abs>
          <Abs x={28} y={456} w={480} h={90} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontSize: 30, fontWeight: 800, color: C.teks}}>Ongkir</div>
            {f < 168 ? (
              <div style={{padding: '14px 30px', borderRadius: 30, background: C.krem, border: `3px solid ${C.merah}`, color: C.merah, fontSize: 28, fontWeight: 900}}>+ Ongkir</div>
            ) : (
              <div style={{padding: '10px 26px', borderRadius: 20, border: `3px solid ${C.merah}`, fontSize: 34, fontWeight: 900, color: C.teks, minWidth: 190, textAlign: 'right'}}>
                Rp {ongkir ? titik(Number(ongkir)) : ''}
                {f % 16 < 8 && !sudahOngkir ? '|' : ''}
              </div>
            )}
          </Abs>
          <Tap x={430} y={500} at={158} />
          <Abs x={28} y={600} w={480} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 900, color: C.teks}}>
            <span style={{fontSize: 34}}>Total</span>
            <span style={{fontSize: 60, color: C.merah}}>Rp {titik(total)}</span>
          </Abs>
          <Tombol x={28} y={740} w={480} h={92} t="Bayar" ukuran={36} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 68, t: 'Ketuk Proses, beres'},
          {a: 74, b: 152, t: 'Langsung masuk keranjang kasir'},
          {a: 158, b: 300, t: 'Ongkir tinggal ditambahin'},
        ]}
      />
    </>
  );
};

/* ---------- Langkah 5: bayar & struk ---------- */

const Langkah5: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kembali = Math.round(interpolate(f, [56, 82], [0, 20000], clamp));
  const sapu = 190 + (Math.sin(f / 6) * 0.5 + 0.5) * 300;
  const sukses = pop(f, fps, 156, 8);
  const rev = interpolate(f, [196, 246], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const kotak: React.ReactNode[] = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if (POLA_QR(r, c)) kotak.push(<rect key={r * 21 + c} x={c * 15} y={r * 15} width={15} height={15} fill="#111" />);
    }
  }
  return (
    <>
      <StepBar aktif={4} />
      <Judul kata={['Bayar', '&', 'selesai']} sorot={[2]} />
      <Ponsel
        atas={470}
        k={1.1}
        kamera={[
          [0, 268, 420, 1.2],
          [56, 268, 520, 1.2],
          [104, 268, 568, 1],
          [300, 268, 568, 1],
        ]}
      >
        <Header t="Bayar Tunai" />
        <Abs x={28} y={150} w={480} style={{fontSize: 28, color: C.abu, fontWeight: 700}}>Total Tagihan</Abs>
        <Abs x={28} y={186} w={480} style={{fontSize: 84, fontWeight: 900, color: C.merah}}>Rp 30.000</Abs>
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
          <Abs x={28} y={630} w={480} style={{textAlign: 'center', fontSize: 60, fontWeight: 900, color: C.merah}}>Rp 30.000</Abs>
          {f >= 156 ? (
            <Abs x={0} y={0} w={PW} h={PH} style={{background: 'rgba(255,255,255,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 200, height: 200, borderRadius: 100, background: C.hijau, transform: `scale(${sukses})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="110" height="110" viewBox="0 0 100 100"><path d="M24 54 L42 72 L78 30" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              <div style={{fontSize: 44, fontWeight: 900, color: C.hijau, marginTop: 30, opacity: sukses}}>Pembayaran diterima</div>
            </Abs>
          ) : null}
        </Muncul>

        <Muncul a={192} b={300}>
          <Abs x={0} y={0} w={PW} h={PH} style={{background: C.krem}} />
          <Abs x={48} y={60} w={440} h={36} style={{borderRadius: 18, background: '#2b2b33'}} />
          <Abs x={68} y={84} w={400} style={{background: '#fffdf6', padding: '26px 28px', fontFamily: 'monospace', clipPath: `inset(0 0 ${(1 - rev) * 100}% 0)`, boxShadow: '0 20px 50px rgba(0,0,0,0.25)'}}>
            <div style={{textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#111'}}>WARUNG BERKAH</div>
            <div style={{textAlign: 'center', fontSize: 22, color: '#666', marginBottom: 10}}>Jl. Contoh No. 1 · 0812-xxxx</div>
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            {[
              ['Nasi Goreng x1', '15.000'],
              ['Es Teh Manis x2', '10.000'],
              ['Ongkir', '5.000'],
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, color: '#222', margin: '4px 0'}}><span>{r[0]}</span><span>{r[1]}</span></div>
            ))}
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            {[
              ['TOTAL', '30.000', true],
              ['Tunai', '50.000', false],
              ['Kembali', '20.000', false],
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: r[2] ? 30 : 25, fontWeight: r[2] ? 900 : 500, color: '#222', margin: '4px 0'}}><span>{r[0]}</span><span>{r[1]}</span></div>
            ))}
            <div style={{borderTop: '3px dashed #999', margin: '8px 0'}} />
            <div style={{textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#111'}}>TERIMA KASIH</div>
          </Abs>
          <Tombol x={36} y={900} w={464} h={80} t={f >= 262 ? 'Berhasil dicetak' : 'Cetak Bluetooth'} bg={C.biru} ukuran={30} />
          <Tombol x={36} y={996} w={464} h={80} t={f >= 284 ? 'Gambar terkirim' : 'Bagikan Gambar'} bg="#25d366" ukuran={30} />
          <Tap x={268} y={940} at={254} />
          <Tap x={268} y={1036} at={276} />
        </Muncul>
      </Ponsel>
      <Cap
        isi={[
          {a: 8, b: 108, t: 'Tunai: kembalian dihitung otomatis'},
          {a: 112, b: 192, t: 'Atau bayar pakai QRIS'},
          {a: 196, b: 300, t: 'Struk siap dicetak atau dibagikan'},
        ]}
      />
    </>
  );
};

/* ---------- Penutup ---------- */

const Penutup: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = pop(f, fps, 4, 9);
  const lencana = pop(f, fps, 150, 9);
  const denyut = 1 + Math.sin(f / 8) * 0.02;
  const daftar = [
    'Pelanggan pesan lewat WhatsApp',
    'HP bergetar, angka merah muncul',
    'Cek detail, Chat WA, atau Peta',
    'Ketuk Proses, masuk keranjang kasir',
    'Bayar tunai atau QRIS, struk siap',
  ];
  return (
    <>
      <Img src={staticFile('logo.png')} style={{position: 'absolute', top: 120, left: 400, width: 280, height: 280, borderRadius: 64, boxShadow: '0 40px 100px rgba(110,15,20,0.45)', transform: `scale(${logo})`}} />
      <Kata kata={['Pesanan', 'online', 'beres!']} sorot={[2]} ukuran={84} atas={450} mulai={14} />
      {daftar.map((t, i) => {
        const s = pop(f, fps, 50 + i * 14, 12);
        const gambar = interpolate(f, [58 + i * 14, 72 + i * 14], [0, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: 90, right: 50, top: 730 + i * 100, display: 'flex', alignItems: 'center', gap: 26, opacity: s, transform: `translateX(${(1 - s) * 100}px)`}}>
            <svg width="68" height="68" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill={C.hijau} />
              <path d="M26 52 L44 70 L76 32" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - gambar} />
            </svg>
            <span style={{fontSize: 40, fontWeight: 800, color: C.teks}}>{t}</span>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: 1330,
          left: 150,
          width: 780,
          height: 220,
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
        <svg width="112" height="123" viewBox="0 0 100 110">
          <polygon points="10,6 56,55 10,104" fill="#2196f3" />
          <polygon points="10,6 74,42 56,55" fill="#4caf50" />
          <polygon points="74,42 96,55 74,68 56,55" fill="#ffc107" />
          <polygon points="10,104 56,55 74,68" fill="#f44336" />
        </svg>
        <div>
          <div style={{fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: 3}}>UNDUH DI</div>
          <div style={{fontSize: 76, fontWeight: 700, color: '#fff', lineHeight: 1.05}}>Play Store</div>
        </div>
      </div>
      <Abs x={0} y={1600} w={1080} style={{textAlign: 'center', fontSize: 52, fontWeight: 900, color: C.maroon, opacity: lencana}}>
        NUYAPAY · Kasir & Katalog UMKM
      </Abs>
    </>
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

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: '#fffaf6'}}>
    <Ad i={0}><Hook /></Ad>
    <Ad i={1}><Langkah1 /></Ad>
    <Ad i={2}><Langkah2 /></Ad>
    <Ad i={3}><Langkah3 /></Ad>
    <Ad i={4}><Langkah4 /></Ad>
    <Ad i={5}><Langkah5 /></Ad>
    <Ad i={6}><Penutup /></Ad>
    {D.slice(1).map((_, i) => (
      <Sapuan key={i} di={i + 1} />
    ))}
    <Progres />
  </AbsoluteFill>
);
