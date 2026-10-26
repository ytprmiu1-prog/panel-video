import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* =====================================================================
   TUTORIAL: SCAN BARCODE DI KASIR (72 detik, 1080x1920, 30 fps)
   - Tanpa musik/suara di dalam video (narasi pakai text-to-speech TikTok)
   - Tanpa tokoh kartun, tanpa domain, logo dari public/logo.png
   - Semua data adalah data tiruan (tertulis "*Data contoh")
   File ini berdiri sendiri (tidak butuh kit.tsx).
   ===================================================================== */

const C = {
  marun: '#3a0b09',
  malam: '#120303',
  merah: '#d92b22',
  merahTerang: '#ff4b3e',
  perak: '#d8d4ce',
  emas: '#d4a94f',
  biru: '#0061ff',
  gelap: '#0f2027',
  hijau: '#00b09b',
  bahaya: '#ff416c',
  jingga: '#f5a623',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const titik = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ketik = (teks: string, frame: number, mulai: number, laju = 2) =>
  teks.slice(0, Math.max(0, Math.floor((frame - mulai) / laju)));

// Durasi adegan (frame). Total 2160 frame = 72 detik.
const D = [120, 150, 300, 180, 360, 240, 270, 240, 180, 120];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_SCAN = D.reduce((a, b) => a + b, 0);

/* ------------------------- Data tiruan ------------------------- */

const KODE = {
  kopi: '8990000000011',
  roti: '8990000000028',
  air: '8990000000035',
  mie: '8990000000042',
  asing: '8990000000999',
};

const PRODUK = [
  {id: 'roti', nama: 'Roti Tawar', harga: 14000, warna: '#f0a35e', huruf: 'RT', habis: false},
  {id: 'mie', nama: 'Mie Goreng Instan', harga: 3500, warna: '#e8524a', huruf: 'MG', habis: false},
  {id: 'kopi', nama: 'Kopi Susu Botol', harga: 15000, warna: '#8a5a44', huruf: 'KS', habis: false},
  {id: 'air', nama: 'Air Mineral 600 ml', harga: 4000, warna: '#4aa3df', huruf: 'AM', habis: true},
];

/* ------------------------- Elemen dasar ------------------------- */

const posisi = (top: number): React.CSSProperties => ({
  position: 'absolute',
  top,
  left: 0,
  right: 0,
});

const Latar: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = Math.sin(frame / 70) * 70;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${C.marun} 0%, ${C.malam} 70%)`,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: 500,
          left: -300 + g,
          top: -260,
          background: C.merah,
          opacity: 0.32,
          filter: 'blur(150px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: 350,
          right: -260 - g,
          bottom: 60,
          background: C.emas,
          opacity: 0.13,
          filter: 'blur(140px)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// Adegan: sapuan merah di awal + fade di akhir
const Adegan: React.FC<{dari: number; durasi: number; children: React.ReactNode}> = ({
  dari,
  durasi,
  children,
}) => (
  <Sequence from={dari} durationInFrames={durasi}>
    <AdeganDalam>{children}</AdeganDalam>
  </Sequence>
);

const AdeganDalam: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const o = interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], clamp);
  const sapu = interpolate(frame, [0, 14], [-1200, 1300], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: sapu,
          width: 1100,
          background: `linear-gradient(100deg, transparent, ${C.merah} 40%, ${C.merahTerang} 60%, transparent)`,
          opacity: frame < 16 ? 0.9 : 0,
          transform: 'skewX(-14deg)',
        }}
      />
    </AbsoluteFill>
  );
};

// Teks besar muncul kata demi kata
const Teks: React.FC<{
  kata: string[];
  sorot?: number[];
  ukuran?: number;
  mulai?: number;
  jeda?: number;
}> = ({kata, sorot = [], ukuran = 78, mulai = 4, jeda = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 16px',
        padding: '0 50px',
      }}
    >
      {kata.map((k, i) => {
        const s = spring({
          frame: Math.max(0, frame - (mulai + i * jeda)),
          fps,
          config: {damping: 12},
        });
        const hi = sorot.includes(i);
        return (
          <span
            key={i}
            style={{
              fontSize: ukuran,
              fontWeight: 900,
              padding: '0 18px',
              borderRadius: 16,
              background: hi ? C.merah : 'transparent',
              color: 'white',
              textShadow: hi ? 'none' : '0 4px 24px rgba(0,0,0,0.75)',
              opacity: s,
              transform: `translateY(${(1 - s) * 36}px) scale(${0.75 + 0.25 * s})`,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

const Lencana: React.FC<{teks: string; nomor?: string}> = ({teks, nomor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - 2), fps, config: {damping: 12}});
  return (
    <div
      style={{
        position: 'absolute',
        top: 62,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: s,
        transform: `scale(${0.8 + 0.2 * s})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 30px 10px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.25)',
          fontSize: 34,
          fontWeight: 800,
          color: 'white',
          letterSpacing: 2,
        }}
      >
        {nomor ? (
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: C.merah,
              textAlign: 'center',
              lineHeight: '52px',
              fontSize: 32,
            }}
          >
            {nomor}
          </span>
        ) : null}
        {teks}
      </div>
    </div>
  );
};

const Catatan: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 44,
      textAlign: 'center',
      fontSize: 28,
      color: 'rgba(255,255,255,0.5)',
    }}
  >
    *Data contoh
  </div>
);

const Progres: React.FC = () => {
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
        background: `linear-gradient(90deg, ${C.merah}, ${C.emas})`,
      }}
    />
  );
};

// Kapsul keterangan di bawah HP
const Kapsul: React.FC<{teks: string; mulai: number; warna?: string; top?: number}> = ({
  teks,
  mulai,
  warna = C.hijau,
  top = 1640,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 11}});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '18px 40px',
          borderRadius: 999,
          background: warna,
          color: 'white',
          fontSize: 42,
          fontWeight: 900,
          opacity: s,
          transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 30}px)`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        {teks}
      </div>
    </div>
  );
};

/* ------------------------- Barcode, ikon ------------------------- */

const Barcode: React.FC<{kode: string; lebar: number; tinggi: number}> = ({kode, lebar, tinggi}) => {
  const lebarBar: number[] = [];
  for (let i = 0; i < kode.length; i++) {
    const n = kode.charCodeAt(i);
    lebarBar.push((n % 3) + 1, ((n >> 1) % 2) + 1, ((n >> 2) % 3) + 1);
  }
  const total = lebarBar.reduce((a, b) => a + b, 0);
  const sk = lebar / total;
  let x = 0;
  const rects: React.ReactNode[] = [];
  lebarBar.forEach((w, i) => {
    if (i % 2 === 0) rects.push(<rect key={i} x={x * sk} y={0} width={w * sk} height={tinggi} fill="#111" />);
    x += w;
  });
  return (
    <svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
      {rects}
    </svg>
  );
};

const IkonScan: React.FC<{ukuran?: number; warna?: string}> = ({ukuran = 34, warna = 'white'}) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 40 40" fill="none" stroke={warna} strokeWidth="4" strokeLinecap="round">
    <path d="M6 14 V6 H14 M26 6 H34 V14 M34 26 V34 H26 M14 34 H6 V26" />
    <path d="M6 20 H34" />
  </svg>
);

const IkonCentang: React.FC<{ukuran?: number; warna?: string}> = ({ukuran = 56, warna = C.hijau}) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill={warna} />
    <path d="M28 52 L44 68 L74 34" stroke={warna === 'white' ? C.hijau : 'white'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/* ------------------------- Bingkai HP 3D ------------------------- */

const LEBAR_HP = 680;
const TINGGI_HP = 1180;
const DESAIN_W = LEBAR_HP - 24;
const DESAIN_H = TINGGI_HP - 24;

const Hp: React.FC<{children: React.ReactNode; atas?: number; getar?: number}> = ({
  children,
  atas = 400,
  getar = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 15}});
  const ayun = Math.sin(frame / 50) * 2.5;
  const g = getar > 0 ? Math.sin(frame * 3) * 8 * getar : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - LEBAR_HP) / 2 + g,
        top: atas,
        width: LEBAR_HP,
        height: TINGGI_HP,
        opacity: masuk,
        transform: `perspective(2000px) rotateY(${-9 + ayun}deg) rotateX(2deg) translateY(${(1 - masuk) * 170}px)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: 68,
          border: '12px solid #1a1a1f',
          background: '#f4f7fe',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 170px rgba(217,43,34,0.38), 0 60px 140px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{width: DESAIN_W, height: DESAIN_H, position: 'relative'}}>{children}</div>
      </div>
    </div>
  );
};

/* ------------------------- Layar aplikasi (tiruan) ------------------------- */

const Header: React.FC<{judul: string; online?: boolean}> = ({judul, online}) => (
  <div
    style={{
      height: 104,
      background: `linear-gradient(135deg, ${C.gelap}, #203a43)`,
      color: 'white',
      fontSize: 34,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
    }}
  >
    <span>{judul}</span>
    {online ? (
      <span
        style={{
          fontSize: 20,
          padding: '6px 16px',
          borderRadius: 999,
          background: C.hijau,
        }}
      >
        ONLINE
      </span>
    ) : null}
  </div>
);

const NavBawah: React.FC<{aktif: 'dasbor' | 'kasir' | 'stok'}> = ({aktif}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 96,
      background: 'white',
      borderTop: '2px solid #e3e8f3',
      display: 'flex',
    }}
  >
    {(['dasbor', 'kasir', 'stok'] as const).map((t) => (
      <div
        key={t}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 25,
          fontWeight: 800,
          color: aktif === t ? C.biru : '#a0aabf',
          borderTop: aktif === t ? `6px solid ${C.biru}` : '6px solid transparent',
          textTransform: 'capitalize',
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

const KartuProduk: React.FC<{p: (typeof PRODUK)[number]; sorot: number}> = ({p, sorot}) => (
  <div
    style={{
      width: 292,
      background: 'white',
      borderRadius: 18,
      overflow: 'hidden',
      border: `3px solid ${sorot > 0 ? C.biru : '#f0f0f0'}`,
      boxShadow: sorot > 0 ? '0 0 0 8px rgba(0,97,255,0.18)' : '0 4px 15px rgba(0,0,0,0.05)',
      position: 'relative',
      transform: `scale(${1 + 0.04 * sorot})`,
    }}
  >
    <div
      style={{
        height: 130,
        background: `linear-gradient(135deg, ${p.warna}, ${p.warna}aa)`,
        color: 'white',
        fontSize: 46,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {p.huruf}
    </div>
    <div style={{padding: '12px 16px 16px'}}>
      <div style={{fontSize: 22, fontWeight: 800, color: '#2b2b2b'}}>{p.nama}</div>
      <div style={{fontSize: 24, fontWeight: 900, color: C.biru, marginTop: 4}}>Rp {titik(p.harga)}</div>
    </div>
    {p.habis ? (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            padding: '8px 24px',
            borderRadius: 10,
            background: C.bahaya,
            color: 'white',
            fontSize: 26,
            fontWeight: 900,
            transform: 'rotate(-8deg)',
          }}
        >
          HABIS
        </span>
      </div>
    ) : null}
  </div>
);

const LayarKasir: React.FC<{
  item: number;
  total: number;
  sorot?: string;
  tombol?: number;
  bump?: number;
}> = ({item, total, sorot = '', tombol = 0, bump = 0}) => (
  <div style={{width: '100%', height: '100%', position: 'relative'}}>
    <Header judul="Warung Berkah" online />
    <div style={{padding: '18px 22px'}}>
      <div style={{display: 'flex', gap: 10, marginBottom: 16}}>
        {['Semua', 'Makanan', 'Minuman'].map((c, i) => (
          <div
            key={c}
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 800,
              background: i === 0 ? C.biru : 'white',
              color: i === 0 ? 'white' : '#8d99ae',
              border: i === 0 ? '2px solid transparent' : '2px solid #e3e8f3',
            }}
          >
            {c}
          </div>
        ))}
      </div>
      <div
        style={{
          height: 76,
          borderRadius: 20,
          border: `3px solid ${C.biru}`,
          background: tombol > 0 ? C.biru : 'white',
          color: tombol > 0 ? 'white' : C.biru,
          fontSize: 28,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 18,
          transform: `scale(${1 - 0.05 * tombol})`,
        }}
      >
        <IkonScan ukuran={34} warna={tombol > 0 ? 'white' : C.biru} />
        Scan Barcode Produk
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
        {PRODUK.map((p) => (
          <KartuProduk key={p.id} p={p} sorot={sorot === p.id ? 1 : 0} />
        ))}
      </div>
    </div>
    {item > 0 ? (
      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 116,
          height: 96,
          borderRadius: 26,
          background: C.gelap,
          color: 'white',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 16px 40px rgba(15,32,39,0.4)',
          transform: `scale(${1 + 0.06 * bump})`,
        }}
      >
        <div>
          <div style={{fontSize: 34, fontWeight: 900}}>Rp {titik(total)}</div>
          <div style={{fontSize: 20, opacity: 0.8}}>{item} Item Ditambahkan</div>
        </div>
        <div
          style={{
            background: 'white',
            color: C.gelap,
            padding: '12px 26px',
            borderRadius: 14,
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          Bayar &gt;
        </div>
      </div>
    ) : null}
    <NavBawah aktif="kasir" />
  </div>
);

const Kolom: React.FC<{label: string; isi: string; aktif: boolean; ikon?: boolean; ikonAktif?: number}> = ({
  label,
  isi,
  aktif,
  ikon,
  ikonAktif = 0,
}) => {
  const frame = useCurrentFrame();
  const kursor = aktif && frame % 16 < 8 ? '|' : '';
  return (
    <div style={{marginBottom: 16}}>
      <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 6}}>{label}</div>
      <div style={{display: 'flex', gap: 12}}>
        <div
          style={{
            flex: 1,
            height: 68,
            borderRadius: 16,
            boxSizing: 'border-box',
            border: `3px solid ${aktif ? C.biru : '#e3e8f3'}`,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            fontSize: 28,
            color: isi ? '#2b2b2b' : '#a3adc2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {isi || (ikon ? 'Kode Barcode (Opsional)...' : '')}
          {kursor}
        </div>
        {ikon ? (
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              background: C.biru,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${1 + 0.18 * ikonAktif})`,
              boxShadow: ikonAktif > 0 ? '0 0 0 10px rgba(0,97,255,0.25)' : 'none',
            }}
          >
            <IkonScan ukuran={38} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const FormProduk: React.FC<{
  nama: string;
  harga: string;
  modal: string;
  stok: string;
  kode: string;
  aktif: string;
  ikonAktif?: number;
  simpan?: number;
}> = ({nama, harga, modal, stok, kode, aktif, ikonAktif = 0, simpan = 0}) => (
  <div style={{width: '100%', height: '100%'}}>
    <Header judul="Tambah Produk Baru" />
    <div style={{padding: '20px 26px'}}>
      <Kolom label="Nama Produk" isi={nama} aktif={aktif === 'nama'} />
      <div style={{display: 'flex', gap: 14}}>
        <div style={{flex: 1}}>
          <Kolom label="Harga Jual" isi={harga ? 'Rp ' + harga : ''} aktif={aktif === 'harga'} />
        </div>
        <div style={{flex: 1}}>
          <Kolom label="Harga Modal" isi={modal ? 'Rp ' + modal : ''} aktif={aktif === 'modal'} />
        </div>
      </div>
      <Kolom label="Stok" isi={stok} aktif={aktif === 'stok'} />
      <Kolom label="Kode Barcode" isi={kode} aktif={aktif === 'barcode'} ikon ikonAktif={ikonAktif} />
      <div
        style={{
          marginTop: 22,
          height: 84,
          borderRadius: 22,
          background: C.biru,
          color: 'white',
          fontSize: 31,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 - 0.05 * simpan})`,
          boxShadow: '0 14px 36px rgba(0,97,255,0.38)',
        }}
      >
        Simpan Produk
      </div>
    </div>
  </div>
);

// Tampilan kamera pemindai
const Kamera: React.FC<{kode: string; tangkap: number}> = ({kode, tangkap}) => {
  const frame = useCurrentFrame();
  const laser = 0.5 + 0.5 * Math.sin(frame / 5);
  const kena = frame >= tangkap;
  const kilat = interpolate(frame, [tangkap, tangkap + 8], [0.9, 0], clamp);
  const goyang = Math.sin(frame / 7) * 6;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 40%, #26323b, #0a0f14 75%)',
      }}
    >
      <div style={{position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 28, fontWeight: 700}}>
        Arahkan ke barcode
      </div>
      <div
        style={{
          position: 'absolute',
          left: 78,
          top: 380,
          width: 500,
          height: 300,
          borderRadius: 18,
          background: '#f7f7f4',
          padding: '34px 30px 20px',
          boxSizing: 'border-box',
          transform: `rotate(${-3 + goyang * 0.3}deg) translateX(${goyang}px)`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        <Barcode kode={kode} lebar={440} tinggi={170} />
        <div style={{fontSize: 24, letterSpacing: 6, color: '#222', textAlign: 'center', marginTop: 10, fontFamily: 'monospace'}}>
          {kode}
        </div>
      </div>
      {['tl', 'tr', 'bl', 'br'].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            left: s[1] === 'l' ? 58 : 538,
            top: s[0] === 't' ? 350 : 640,
            width: 60,
            height: 60,
            borderTop: s[0] === 't' ? `7px solid ${kena ? C.hijau : C.merahTerang}` : 'none',
            borderBottom: s[0] === 'b' ? `7px solid ${kena ? C.hijau : C.merahTerang}` : 'none',
            borderLeft: s[1] === 'l' ? `7px solid ${kena ? C.hijau : C.merahTerang}` : 'none',
            borderRight: s[1] === 'r' ? `7px solid ${kena ? C.hijau : C.merahTerang}` : 'none',
          }}
        />
      ))}
      {!kena ? (
        <div
          style={{
            position: 'absolute',
            left: 66,
            width: 524,
            top: 372 + laser * 290,
            height: 6,
            background: C.merahTerang,
            boxShadow: `0 0 30px 8px ${C.merahTerang}`,
            borderRadius: 3,
          }}
        />
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 34px',
              borderRadius: 999,
              background: C.hijau,
              color: 'white',
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            <IkonCentang ukuran={40} warna="white" />
            Terbaca
          </div>
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, background: 'white', opacity: kilat}} />
    </div>
  );
};

const Dialog: React.FC<{opa: number; judul: string; pesan: string; warna?: string}> = ({
  opa,
  judul,
  pesan,
  warna = C.jingga,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `rgba(15,32,39,${0.6 * opa})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      visibility: opa > 0.01 ? 'visible' : 'hidden',
    }}
  >
    <div
      style={{
        width: 540,
        background: 'white',
        borderRadius: 32,
        padding: '36px 32px 30px',
        textAlign: 'center',
        opacity: opa,
        transform: `scale(${0.8 + 0.2 * opa})`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          background: warna,
          color: 'white',
          fontSize: 56,
          fontWeight: 900,
          lineHeight: '84px',
          margin: '0 auto 18px',
        }}
      >
        !
      </div>
      <div style={{fontSize: 36, fontWeight: 900, color: '#0f2027'}}>{judul}</div>
      <div style={{fontSize: 25, color: '#6b7a99', marginTop: 12, lineHeight: 1.35}}>{pesan}</div>
      <div
        style={{
          marginTop: 24,
          padding: '14px 0',
          borderRadius: 16,
          background: C.biru,
          color: 'white',
          fontSize: 27,
          fontWeight: 800,
        }}
      >
        OK
      </div>
    </div>
  </div>
);

// Bungkus kamera: meluncur masuk dan keluar
const LapisKamera: React.FC<{dari: number; sampai: number; tangkap: number; kode: string}> = ({
  dari,
  sampai,
  tangkap,
  kode,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dari, dari + 8, sampai - 8, sampai], [0, 1, 1, 0], clamp);
  if (frame < dari || frame > sampai) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <Kamera kode={kode} tangkap={tangkap - dari} />
    </div>
  );
};

/* ================= ADEGAN 1: HOOK ================= */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ketikan = ketik('Kopi Susu Bo', frame, 4, 3);
  const coret = interpolate(frame, [44, 56], [0, 100], clamp);
  const hasil = spring({frame: frame - 66, fps, config: {damping: 11}});
  const laser = ((frame % 54) / 54) * 330;
  const kartu = spring({frame: frame - 24, fps, config: {damping: 14}});
  return (
    <Latar>
      <div style={posisi(130)}>
        <Teks kata={['Kasir', 'tanpa', 'ngetik.']} ukuran={108} />
      </div>
      <div style={posisi(440)}>
        <Teks kata={['Cukup', 'scan.']} sorot={[1]} ukuran={120} mulai={28} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 150,
          width: 780,
          height: 90,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          fontSize: 40,
          padding: '0 30px',
          display: 'flex',
          alignItems: 'center',
          opacity: interpolate(frame, [56, 70], [1, 0.25], clamp),
          overflow: 'hidden',
        }}
      >
        {ketikan}
        {frame % 14 < 7 ? '|' : ''}
        <div style={{position: 'absolute', left: 20, top: 44, height: 5, width: `${coret}%`, background: C.merahTerang}} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 920,
          left: 190,
          width: 700,
          height: 400,
          borderRadius: 26,
          background: '#f7f7f4',
          padding: '44px 40px 24px',
          boxSizing: 'border-box',
          transform: `rotate(-4deg) scale(${kartu})`,
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          opacity: kartu,
        }}
      >
        <Barcode kode={KODE.kopi} lebar={620} tinggi={240} />
        <div style={{fontSize: 30, letterSpacing: 8, color: '#222', textAlign: 'center', marginTop: 12, fontFamily: 'monospace'}}>
          {KODE.kopi}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: 30 + laser,
            height: 7,
            background: C.merahTerang,
            boxShadow: `0 0 36px 10px ${C.merahTerang}`,
            borderRadius: 4,
            opacity: frame < 66 ? 1 : 0.0,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1420,
          left: 130,
          width: 820,
          padding: '26px 36px',
          borderRadius: 28,
          background: C.hijau,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 40,
          fontWeight: 900,
          opacity: hasil,
          transform: `scale(${0.8 + 0.2 * hasil})`,
        }}
      >
        <span>Kopi Susu Botol</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 16}}>
          Rp 15.000 <IkonCentang ukuran={52} warna="white" />
        </span>
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 2: 3 LANGKAH ================= */

const Tiga: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const langkah = [
    {n: '1', t: 'Daftarkan barcode di produk'},
    {n: '2', t: 'Scan di kasir'},
    {n: '3', t: 'Bayar, stok berkurang'},
  ];
  return (
    <Latar>
      <div style={posisi(190)}>
        <Teks kata={['Cuma', '3', 'langkah.']} sorot={[1]} ukuran={112} />
      </div>
      <div style={{...posisi(560), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        {langkah.map((l, i) => {
          const s = spring({frame: frame - (26 + i * 26), fps, config: {damping: 12}});
          return (
            <div
              key={l.n}
              style={{
                width: 900,
                boxSizing: 'border-box',
                padding: '36px 44px',
                display: 'flex',
                alignItems: 'center',
                gap: 36,
                borderRadius: 40,
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.22)',
                opacity: s,
                transform: `translateX(${(1 - s) * 400}px)`,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  background: C.merah,
                  color: 'white',
                  fontSize: 64,
                  fontWeight: 900,
                  textAlign: 'center',
                  lineHeight: '100px',
                  flexShrink: 0,
                }}
              >
                {l.n}
              </div>
              <div style={{fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1.15}}>{l.t}</div>
            </div>
          );
        })}
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 3: LANGKAH 1 - DAFTARKAN BARCODE ================= */

const Daftar: React.FC = () => {
  const frame = useCurrentFrame();
  const nama = ketik('Kopi Susu Botol', frame, 22, 3);
  const harga = ketik('15.000', frame, 70, 3);
  const modal = ketik('9.000', frame, 96, 3);
  const stok = ketik('24', frame, 120, 3);
  const kode = ketik(KODE.kopi, frame, 258, 1);
  const aktif =
    frame < 22 ? '' : frame < 70 ? 'nama' : frame < 96 ? 'harga' : frame < 120 ? 'modal' : frame < 150 ? 'stok' : frame < 262 ? 'barcode' : '';
  const ikon = interpolate(frame, [158, 168, 178], [0, 1, 0], clamp) + (frame >= 178 && frame < 190 ? 1 : 0);
  return (
    <Latar>
      <Lencana teks="LANGKAH 1/3" nomor="1" />
      <div style={posisi(150)}>
        <Teks kata={['Daftarkan', 'barcode', 'di', 'produk']} sorot={[1]} ukuran={74} mulai={4} />
      </div>
      <Hp>
        <FormProduk
          nama={nama}
          harga={harga}
          modal={modal}
          stok={stok}
          kode={kode}
          aktif={aktif}
          ikonAktif={Math.min(1, ikon)}
        />
        <LapisKamera dari={186} sampai={262} tangkap={236} kode={KODE.kopi} />
      </Hp>
      <Kapsul teks="Kode terisi otomatis" mulai={266} />
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 4: ANTI DOBEL ================= */

const AntiDobel: React.FC = () => {
  const frame = useCurrentFrame();
  const kode = frame >= 24 ? ketik(KODE.kopi, frame, 24, 1) : '';
  const simpan = frame >= 62 && frame < 72 ? 1 : 0;
  const dialog = interpolate(frame, [74, 84, 130, 140], [0, 1, 1, 0], clamp);
  const bersih = frame >= 146 ? '' : kode;
  return (
    <Latar>
      <Lencana teks="ANTI DOBEL" />
      <div style={posisi(150)}>
        <Teks kata={['Satu', 'barcode,', 'satu', 'produk.']} sorot={[0, 1]} ukuran={78} />
      </div>
      <Hp>
        <FormProduk
          nama="Roti Tawar"
          harga="14.000"
          modal="9.500"
          stok="20"
          kode={bersih}
          aktif={frame < 62 ? 'barcode' : ''}
          simpan={simpan}
        />
        <Dialog
          opa={dialog}
          judul="Barcode Sudah Dipakai"
          pesan={'Kode ini sudah dipakai produk "Kopi Susu Botol". Gunakan kode lain, atau kosongkan.'}
        />
      </Hp>
      <Kapsul teks="Aplikasi tolak kode dobel" mulai={90} warna={C.merah} />
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 5: LANGKAH 2 - SCAN DI KASIR ================= */

const ScanKasir: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // tiga scan: roti (tangkap 100), mie (tangkap 205), roti lagi (tangkap 300)
  const jadwal = [
    {dari: 44, tangkap: 94, sampai: 118, kode: KODE.roti},
    {dari: 150, tangkap: 198, sampai: 222, kode: KODE.mie},
    {dari: 250, tangkap: 296, sampai: 320, kode: KODE.roti},
  ];
  let item = 0;
  let total = 0;
  if (frame >= 118) {item = 1; total = 14000;}
  if (frame >= 222) {item = 2; total = 17500;}
  if (frame >= 320) {item = 3; total = 31500;}
  const tombol = [44, 150, 250].some((d) => frame >= d - 14 && frame < d - 4) ? 1 : 0;
  const bump = Math.max(
    interpolate(frame, [118, 126, 136], [0, 1, 0], clamp),
    interpolate(frame, [222, 230, 240], [0, 1, 0], clamp),
    interpolate(frame, [320, 328, 338], [0, 1, 0], clamp)
  );
  const sorot = frame >= 118 && frame < 150 ? 'roti' : frame >= 222 && frame < 250 ? 'mie' : frame >= 320 ? 'roti' : '';
  const getar = [94, 198, 296].some((t) => frame >= t && frame < t + 8) ? 1 : 0;
  const lencana = spring({frame: frame - 330, fps, config: {damping: 11}});
  return (
    <Latar>
      <Lencana teks="LANGKAH 2/3" nomor="2" />
      <div style={posisi(150)}>
        <Teks kata={['Scan', 'di', 'kasir']} sorot={[0]} ukuran={86} mulai={4} />
      </div>
      <Hp getar={getar}>
        <LayarKasir item={item} total={total} sorot={sorot} tombol={tombol} bump={bump} />
        {jadwal.map((j, i) => (
          <LapisKamera key={i} dari={j.dari} sampai={j.sampai} tangkap={j.tangkap} kode={j.kode} />
        ))}
      </Hp>
      <div style={{...posisi(1640), display: 'flex', justifyContent: 'center', opacity: lencana}}>
        <div style={{padding: '18px 40px', borderRadius: 999, background: C.hijau, color: 'white', fontSize: 42, fontWeight: 900}}>
          Scan lagi, jumlah nambah
        </div>
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 6: VARIAN ================= */

const Varian: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sheet = interpolate(frame, [78, 94, 150, 164], [0, 1, 1, 0], clamp);
  const tekan = frame >= 138 && frame < 148 ? 0.94 : 1;
  const sudah = frame >= 164;
  const bump = interpolate(frame, [164, 172, 182], [0, 1, 0], clamp);
  const info = spring({frame: frame - 176, fps, config: {damping: 11}});
  return (
    <Latar>
      <Lencana teks="PRODUK BERVARIAN" />
      <div style={posisi(150)}>
        <Teks kata={['Ada', 'varian?', 'Sekali', 'ketuk.']} sorot={[1, 3]} ukuran={78} />
      </div>
      <Hp>
        <LayarKasir
          item={sudah ? 4 : 3}
          total={sudah ? 51500 : 31500}
          sorot={sudah ? 'kopi' : ''}
          bump={bump}
        />
        <LapisKamera dari={16} sampai={78} tangkap={62} kode={KODE.kopi} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(15,32,39,${0.55 * sheet})`,
            visibility: sheet > 0.01 ? 'visible' : 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'white',
              borderRadius: '36px 36px 0 0',
              padding: '34px 30px 40px',
              transform: `translateY(${(1 - sheet) * 520}px)`,
            }}
          >
            <div style={{fontSize: 34, fontWeight: 900, color: '#0f2027', textAlign: 'center'}}>Pilih Varian Produk</div>
            <div style={{fontSize: 28, fontWeight: 800, color: '#6b7a99', textAlign: 'center', margin: '6px 0 22px'}}>
              Kopi Susu Botol
            </div>
            {[
              {n: 'Reguler', h: 15000, t: 1},
              {n: 'Besar', h: 20000, t: tekan},
            ].map((v) => (
              <div
                key={v.n}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9f9f9',
                  border: '2px solid #eee',
                  borderRadius: 18,
                  padding: '18px 22px',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{fontSize: 30, fontWeight: 900, color: '#0f2027'}}>{v.n}</div>
                  <div style={{fontSize: 25, fontWeight: 800, color: C.biru}}>Rp {titik(v.h)}</div>
                </div>
                <div
                  style={{
                    padding: '12px 28px',
                    borderRadius: 14,
                    background: C.biru,
                    color: 'white',
                    fontSize: 26,
                    fontWeight: 800,
                    transform: `scale(${v.t})`,
                  }}
                >
                  + Tambah
                </div>
              </div>
            ))}
          </div>
        </div>
      </Hp>
      <div style={{...posisi(1640), display: 'flex', justifyContent: 'center', opacity: info}}>
        <div style={{padding: '18px 40px', borderRadius: 999, background: C.hijau, color: 'white', fontSize: 42, fontWeight: 900}}>
          Masuk keranjang: Besar Rp 20.000
        </div>
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 7: TIDAK DITEMUKAN / STOK HABIS ================= */

const Aman: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = interpolate(frame, [60, 70, 124, 134], [0, 1, 1, 0], clamp);
  const d2 = interpolate(frame, [190, 200, 250, 262], [0, 1, 1, 0], clamp);
  return (
    <Latar>
      <Lencana teks="AMAN DARI SALAH SCAN" />
      <div style={posisi(150)}>
        <Sequence from={0} durationInFrames={138}>
          <Teks kata={['Barcode', 'belum', 'terdaftar?']} sorot={[2]} ukuran={80} mulai={4} />
        </Sequence>
        <Sequence from={138}>
          <Teks kata={['Stok', 'habis?']} sorot={[0, 1]} ukuran={90} mulai={2} />
        </Sequence>
      </div>
      <Hp>
        <LayarKasir item={4} total={51500} />
        <LapisKamera dari={12} sampai={62} tangkap={52} kode={KODE.asing} />
        <LapisKamera dari={142} sampai={192} tangkap={182} kode={KODE.air} />
        <Dialog opa={d1} judul="Tidak Ditemukan" pesan={`Barcode "${KODE.asing}" tidak cocok dengan produk manapun.`} />
        <Dialog opa={d2} judul="Stok Habis" pesan={'Maaf, stok produk "Air Mineral 600 ml" sedang kosong.'} warna={C.bahaya} />
      </Hp>
      {frame >= 76 && frame < 140 ? <Kapsul teks="Daftarkan dulu di Langkah 1" mulai={76} warna={C.jingga} /> : null}
      {frame >= 206 ? <Kapsul teks="Stok kosong tidak bisa terjual" mulai={206} warna={C.merah} /> : null}
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 8: LANGKAH 3 - BAYAR ================= */

const Bayar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pilih = frame >= 60;
  const kembali = interpolate(frame, [76, 100], [0, 48500], clamp);
  const selesai = spring({frame: frame - 130, fps, config: {damping: 12}});
  const stokAwal = 20;
  const stok = Math.round(interpolate(frame, [150, 176], [stokAwal, 18], clamp));
  const tekan = frame >= 118 && frame < 128 ? 0.95 : 1;
  return (
    <Latar>
      <Lencana teks="LANGKAH 3/3" nomor="3" />
      <div style={posisi(150)}>
        <Teks kata={['Bayar,', 'stok', 'berkurang', 'otomatis']} sorot={[2, 3]} ukuran={74} />
      </div>
      <Hp>
        <div style={{width: '100%', height: '100%', background: '#f4f7fe'}}>
          <Header judul="Pembayaran" />
          <div style={{padding: '24px 28px'}}>
            <div style={{textAlign: 'center', fontSize: 26, color: '#8d99ae', fontWeight: 700}}>Total Tagihan</div>
            <div style={{textAlign: 'center', fontSize: 66, fontWeight: 900, color: '#0f2027', marginBottom: 20}}>
              Rp 51.500
            </div>
            <div style={{display: 'flex', gap: 14, marginBottom: 20}}>
              <div style={{flex: 1, padding: '18px 0', textAlign: 'center', borderRadius: 18, background: C.biru, color: 'white', fontSize: 28, fontWeight: 800}}>
                Bayar Tunai
              </div>
              <div style={{flex: 1, padding: '18px 0', textAlign: 'center', borderRadius: 18, background: 'white', border: '2px solid #e3e8f3', color: '#8d99ae', fontSize: 28, fontWeight: 800}}>
                Bayar via QRIS
              </div>
            </div>
            <div style={{fontSize: 22, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>Uang Diterima</div>
            <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
              {['Uang Pas', '50.000', '100.000'].map((u) => (
                <div
                  key={u}
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    textAlign: 'center',
                    borderRadius: 14,
                    fontSize: 25,
                    fontWeight: 800,
                    background: pilih && u === '100.000' ? C.biru : 'white',
                    color: pilih && u === '100.000' ? 'white' : '#6b7a99',
                    border: '2px solid #e3e8f3',
                  }}
                >
                  {u}
                </div>
              ))}
            </div>
            <div
              style={{
                borderRadius: 22,
                padding: '22px 26px',
                background: '#e8faf6',
                border: `2px solid ${C.hijau}`,
                opacity: pilih ? 1 : 0.25,
              }}
            >
              <div style={{fontSize: 24, fontWeight: 700, color: '#2b7a6f'}}>Kembalian</div>
              <div style={{fontSize: 56, fontWeight: 900, color: C.hijau}}>Rp {titik(kembali)}</div>
            </div>
            <div
              style={{
                marginTop: 22,
                height: 84,
                borderRadius: 22,
                background: C.gelap,
                color: 'white',
                fontSize: 30,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${tekan})`,
              }}
            >
              Selesaikan &amp; Struk
            </div>
            <div
              style={{
                marginTop: 22,
                borderRadius: 22,
                padding: '20px 26px',
                background: 'white',
                boxShadow: '0 10px 30px rgba(15,32,39,0.1)',
                opacity: selesai,
                transform: `translateY(${(1 - selesai) * 40}px)`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{fontSize: 26, fontWeight: 800, color: '#0f2027'}}>Stok Roti Tawar</div>
              <div style={{fontSize: 34, fontWeight: 900, color: C.merah}}>
                {stokAwal} <span style={{color: '#8d99ae'}}>{'>'}</span> {stok}
              </div>
            </div>
          </div>
        </div>
      </Hp>
      <Kapsul teks="Tunai atau QRIS, stok langsung update" mulai={172} />
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 9: TIPS ================= */

const IkonTips: React.FC<{jenis: 'cahaya' | 'lensa' | 'barcode'}> = ({jenis}) => {
  if (jenis === 'cahaya') {
    return (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none" stroke={C.emas} strokeWidth="7" strokeLinecap="round">
        <circle cx="50" cy="50" r="18" fill={C.emas} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={50 + Math.cos((a * Math.PI) / 180) * 30}
            y1={50 + Math.sin((a * Math.PI) / 180) * 30}
            x2={50 + Math.cos((a * Math.PI) / 180) * 42}
            y2={50 + Math.sin((a * Math.PI) / 180) * 42}
          />
        ))}
      </svg>
    );
  }
  if (jenis === 'lensa') {
    return (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="7">
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="24" />
        <circle cx="40" cy="40" r="6" fill="white" stroke="none" />
      </svg>
    );
  }
  return (
    <div style={{width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 14}}>
      <Barcode kode="8990000000011" lebar={76} tinggi={60} />
    </div>
  );
};

const Tips: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const daftar: {j: 'cahaya' | 'lensa' | 'barcode'; t: string}[] = [
    {j: 'cahaya', t: 'Cahaya cukup'},
    {j: 'lensa', t: 'Lensa kamera bersih'},
    {j: 'barcode', t: 'Barcode tidak lecek'},
  ];
  return (
    <Latar>
      <Lencana teks="TIPS" />
      <div style={posisi(170)}>
        <Teks kata={['Biar', 'scan', 'lancar']} sorot={[2]} ukuran={100} />
      </div>
      <div style={{...posisi(520), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
        {daftar.map((d, i) => {
          const s = spring({frame: frame - (24 + i * 24), fps, config: {damping: 12}});
          return (
            <div
              key={d.t}
              style={{
                width: 900,
                boxSizing: 'border-box',
                padding: '36px 48px',
                display: 'flex',
                alignItems: 'center',
                gap: 44,
                borderRadius: 42,
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.22)',
                opacity: s,
                transform: `scale(${0.8 + 0.2 * s})`,
              }}
            >
              <IkonTips jenis={d.j} />
              <div style={{fontSize: 62, fontWeight: 900, color: 'white', lineHeight: 1.1}}>{d.t}</div>
            </div>
          );
        })}
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 10: AJAKAN ================= */

const Ajakan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 4, fps, config: {damping: 10}});
  const pil = spring({frame: frame - 44, fps, config: {damping: 9}});
  return (
    <Latar>
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: 250,
          width: 400,
          height: 400,
          borderRadius: 96,
          background: 'white',
          padding: 40,
          boxSizing: 'border-box',
          boxShadow: '0 0 150px rgba(217,43,34,0.6), 0 40px 100px rgba(0,0,0,0.5)',
          transform: `scale(${logo}) rotate(${(1 - logo) * -18}deg)`,
        }}
      >
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={posisi(760)}>
        <Teks kata={['Kasir', 'jadi', 'lebih', 'cepat']} sorot={[3]} ukuran={104} mulai={12} />
      </div>
      <div
        style={{
          ...posisi(1080),
          textAlign: 'center',
          fontSize: 52,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        Kasir &amp; Katalog UMKM
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1230,
          left: 190,
          width: 700,
          height: 140,
          borderRadius: 70,
          background: C.merah,
          color: 'white',
          fontSize: 58,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '140px',
          transform: `scale(${pil})`,
          boxShadow: '0 20px 70px rgba(217,43,34,0.5)',
        }}
      >
        Unduh di Play Store
      </div>
    </Latar>
  );
};

/* ================= RANGKAIAN ================= */

export const TutorialScanBarcode: React.FC = () => (
  <AbsoluteFill style={{background: C.malam}}>
    <Adegan dari={DARI[0]} durasi={D[0]}><Hook /></Adegan>
    <Adegan dari={DARI[1]} durasi={D[1]}><Tiga /></Adegan>
    <Adegan dari={DARI[2]} durasi={D[2]}><Daftar /></Adegan>
    <Adegan dari={DARI[3]} durasi={D[3]}><AntiDobel /></Adegan>
    <Adegan dari={DARI[4]} durasi={D[4]}><ScanKasir /></Adegan>
    <Adegan dari={DARI[5]} durasi={D[5]}><Varian /></Adegan>
    <Adegan dari={DARI[6]} durasi={D[6]}><Aman /></Adegan>
    <Adegan dari={DARI[7]} durasi={D[7]}><Bayar /></Adegan>
    <Adegan dari={DARI[8]} durasi={D[8]}><Tips /></Adegan>
    <Adegan dari={DARI[9]} durasi={D[9]}><Ajakan /></Adegan>
    <Progres />
  </AbsoluteFill>
);
