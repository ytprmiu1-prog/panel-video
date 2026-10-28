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
   EDUKASI: OMSET BUKAN LABA (76 detik, 1080x1920, 30 fps)
   - Infografis terang (krem + merah logo), tanpa tokoh kartun
   - Bingkai HP lurus (tidak miring)
   - Tanpa musik/suara di dalam video (narasi pakai text-to-speech TikTok)
   - Tanpa domain; logo dari public/logo.png
   - Semua angka adalah contoh hitungan ("*Contoh hitungan")
   File ini berdiri sendiri (tidak butuh kit.tsx).
   ===================================================================== */

const C = {
  krem: '#f7f0e4',
  krem2: '#efe3d0',
  tinta: '#2a0f0c',
  marun: '#7a1510',
  merah: '#d92b22',
  hijau: '#0a9b7a',
  oranye: '#f08a24',
  abu: '#cfc6b8',
  emas: '#c9a14a',
  biru: '#0061ff',
  gelap: '#0f2027',
  bahaya: '#ff416c',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const titik = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ketik = (teks: string, frame: number, mulai: number, laju = 2) =>
  teks.slice(0, Math.max(0, Math.floor((frame - mulai) / laju)));
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

// Durasi adegan (frame). Total 2280 frame = 76 detik.
const D = [120, 180, 210, 240, 240, 270, 210, 210, 240, 210, 150];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_OMSET = D.reduce((a, b) => a + b, 0);

/* ------------------------- Elemen dasar ------------------------- */

const posisi = (top: number): React.CSSProperties => ({position: 'absolute', top, left: 0, right: 0});

const Latar: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = Math.sin(frame / 80) * 40;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(175deg, ${C.krem} 0%, ${C.krem2} 100%)`,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(122,21,16,0.10) 2px, transparent 2.5px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: 380,
          right: -300 + g,
          top: -260,
          background: C.merah,
          opacity: 0.14,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: 300,
          left: -260 - g,
          bottom: -200,
          background: C.emas,
          opacity: 0.16,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const Adegan: React.FC<{dari: number; durasi: number; children: React.ReactNode}> = ({dari, durasi, children}) => (
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
          background: `linear-gradient(100deg, transparent, ${C.merah} 40%, ${C.marun} 60%, transparent)`,
          opacity: frame < 16 ? 0.9 : 0,
          transform: 'skewX(-14deg)',
        }}
      />
    </AbsoluteFill>
  );
};

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
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '0 50px'}}>
      {kata.map((k, i) => {
        const s = spring({frame: Math.max(0, frame - (mulai + i * jeda)), fps, config: {damping: 12}});
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
              color: hi ? 'white' : C.tinta,
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

const Lencana: React.FC<{teks: string}> = ({teks}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - 2), fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top: 62, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s}}>
      <div
        style={{
          padding: '10px 30px',
          borderRadius: 999,
          background: C.tinta,
          fontSize: 32,
          fontWeight: 800,
          color: 'white',
          letterSpacing: 3,
          transform: `scale(${0.8 + 0.2 * s})`,
        }}
      >
        {teks}
      </div>
    </div>
  );
};

const Catatan: React.FC<{teks?: string}> = ({teks = '*Contoh hitungan'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontSize: 28, color: 'rgba(42,15,12,0.55)'}}>
    {teks}
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
          boxShadow: '0 16px 40px rgba(42,15,12,0.25)',
        }}
      >
        {teks}
      </div>
    </div>
  );
};

const Angka: React.FC<{nilai: number; mulai?: number; durasi?: number; awalan?: string}> = ({
  nilai,
  mulai = 0,
  durasi = 40,
  awalan = 'Rp ',
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [mulai, mulai + durasi], [0, 1], clamp);
  return <>{awalan + titik(nilai * ease(p))}</>;
};

const Kartu: React.FC<{
  mulai: number;
  warna?: string;
  teks?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({mulai, warna = 'white', teks = C.tinta, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 12}});
  return (
    <div
      style={{
        background: warna,
        color: teks,
        borderRadius: 36,
        boxShadow: '0 18px 50px rgba(42,15,12,0.16)',
        border: '3px solid rgba(42,15,12,0.08)',
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.9 + 0.1 * s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ================= ADEGAN 1: HOOK ================= */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stempel = spring({frame: frame - 74, fps, config: {damping: 8}});
  return (
    <Latar>
      <div style={posisi(230)}>
        <Kartu mulai={4} warna={C.tinta} teks="white" style={{margin: '0 auto', width: 860, padding: '44px 0', textAlign: 'center'}}>
          <div style={{fontSize: 40, fontWeight: 800, letterSpacing: 6, color: C.emas}}>OMSET HARI INI</div>
          <div style={{fontSize: 140, fontWeight: 900, marginTop: 6}}>
            <Angka nilai={1500000} mulai={6} durasi={44} />
          </div>
        </Kartu>
      </div>
      <div style={posisi(700)}>
        <Teks kata={['Untung', 'segitu?']} sorot={[1]} ukuran={130} mulai={44} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1080,
          left: 190,
          width: 700,
          padding: '26px 0',
          textAlign: 'center',
          border: `10px solid ${C.merah}`,
          borderRadius: 24,
          color: C.merah,
          fontSize: 120,
          fontWeight: 900,
          letterSpacing: 4,
          background: 'rgba(255,255,255,0.6)',
          opacity: stempel,
          transform: `rotate(-7deg) scale(${2.4 - 1.4 * stempel})`,
        }}
      >
        BELUM TENTU
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 2: OMSET = UANG MASUK ================= */

const Masuk: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const jumlah = Math.min(10, Math.max(0, Math.floor((frame - 20) / 9)));
  const catatan = spring({frame: frame - 110, fps, config: {damping: 12}});
  return (
    <Latar>
      <Lencana teks="APA ITU OMSET?" />
      <div style={posisi(170)}>
        <Teks kata={['Omset', '=', 'uang', 'masuk']} sorot={[0]} ukuran={104} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 190,
          top: 640,
          width: 700,
          height: 520,
          borderRadius: 44,
          background: 'white',
          border: `6px solid ${C.tinta}`,
          boxShadow: '0 24px 70px rgba(42,15,12,0.2)',
        }}
      >
        <div style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.marun, letterSpacing: 4}}>
          LACI KASIR
        </div>
        {Array.from({length: jumlah}).map((_, i) => {
          const t = frame - (20 + i * 9);
          const o = interpolate(t, [0, 5, 22, 30], [0, 1, 1, 0], clamp);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 50 + (i % 3) * 190,
                top: 150 + ((i * 2) % 3) * 85 + (t > 0 ? -Math.min(t, 30) * 1.2 : 0),
                padding: '14px 26px',
                borderRadius: 999,
                background: C.hijau,
                color: 'white',
                fontSize: 36,
                fontWeight: 900,
                whiteSpace: 'nowrap',
                opacity: o,
              }}
            >
              +Rp 15.000
            </div>
          );
        })}
        <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontSize: 80, fontWeight: 900, color: C.tinta}}>
          <Angka nilai={jumlah * 15000} mulai={0} durasi={1} />
        </div>
      </div>
      <div
        style={{
          ...posisi(1240),
          textAlign: 'center',
          fontSize: 64,
          fontWeight: 900,
          color: C.marun,
          opacity: catatan,
          transform: `translateY(${(1 - catatan) * 30}px)`,
        }}
      >
        Belum dikurangi apa-apa
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 3: CONTOH 100 GELAS ================= */

const Contoh: React.FC = () => {
  const frame = useCurrentFrame();
  const terisi = Math.min(100, Math.max(0, Math.floor((frame - 8) * 2.6)));
  return (
    <Latar>
      <Lencana teks="CONTOH HITUNGAN" />
      <div style={posisi(150)}>
        <Teks kata={['Jual', '100', 'gelas', 'kopi']} sorot={[1]} ukuran={90} />
      </div>
      <div style={{position: 'absolute', left: 190, top: 380, width: 700, display: 'flex', flexWrap: 'wrap', gap: 10}}>
        {Array.from({length: 100}).map((_, i) => (
          <div
            key={i}
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: i < terisi ? C.marun : 'rgba(42,15,12,0.1)',
              transform: `scale(${i < terisi ? 1 : 0.8})`,
            }}
          />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1090, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
        <Kartu mulai={86} style={{padding: '22px 36px', textAlign: 'center'}}>
          <div style={{fontSize: 30, fontWeight: 700, color: '#7b6f66'}}>harga per gelas</div>
          <div style={{fontSize: 62, fontWeight: 900}}>Rp 15.000</div>
        </Kartu>
        <div style={{fontSize: 70, fontWeight: 900, color: C.marun, opacity: interpolate(frame, [110, 120], [0, 1], clamp)}}>
          ×100
        </div>
      </div>
      <div style={{position: 'absolute', top: 1340, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Kartu mulai={130} warna={C.merah} teks="white" style={{padding: '30px 60px', textAlign: 'center'}}>
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 6}}>OMSET</div>
          <div style={{fontSize: 100, fontWeight: 900}}>
            <Angka nilai={1500000} mulai={134} durasi={34} />
          </div>
        </Kartu>
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 4 & 5: MODAL DAN BIAYA (batang proporsi) ================= */

const BatangProporsi: React.FC<{modal: number; biaya: number; sisa: number}> = ({modal, biaya, sisa}) => {
  const LEBAR = 880;
  const total = 1500000;
  const w1 = (modal / total) * LEBAR;
  const w2 = (biaya / total) * LEBAR;
  const w3 = (sisa / total) * LEBAR;
  return (
    <div style={{position: 'relative', width: LEBAR, height: 150, borderRadius: 30, background: 'rgba(42,15,12,0.1)', overflow: 'hidden', border: `5px solid ${C.tinta}`, boxSizing: 'content-box'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w1, background: C.marun}} />
      <div style={{position: 'absolute', left: w1, top: 0, bottom: 0, width: w2, background: C.oranye}} />
      <div style={{position: 'absolute', left: w1 + w2, top: 0, bottom: 0, width: w3, background: 'rgba(42,15,12,0.16)', opacity: w3 > 4 ? 1 : 0}} />
    </div>
  );
};

const Modal: React.FC = () => {
  const frame = useCurrentFrame();
  const w = ease(interpolate(frame, [50, 110], [0, 1], clamp));
  return (
    <Latar>
      <Lencana teks="LANGKAH 1: KURANGI MODAL" />
      <div style={posisi(160)}>
        <Teks kata={['Modal', 'bahan', 'harus', 'dikurangi']} sorot={[1]} ukuran={84} />
      </div>
      <div style={{position: 'absolute', left: 95, top: 520}}>
        <div style={{fontSize: 36, fontWeight: 800, color: C.marun, marginBottom: 16}}>Omset Rp 1.500.000</div>
        <BatangProporsi modal={900000 * w} biaya={0} sisa={1500000 - 900000 * w} />
      </div>
      <div style={{position: 'absolute', top: 900, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Kartu mulai={20} warna={C.marun} teks="white" style={{padding: '36px 56px', textAlign: 'center', width: 820}}>
          <div style={{fontSize: 36, fontWeight: 800, letterSpacing: 4, color: C.emas}}>MODAL BAHAN</div>
          <div style={{fontSize: 64, fontWeight: 900, marginTop: 8}}>100 × Rp 9.000</div>
          <div style={{fontSize: 96, fontWeight: 900, marginTop: 6}}>
            = <Angka nilai={900000} mulai={54} durasi={40} />
          </div>
        </Kartu>
      </div>
      <Kapsul teks="60% dari omset habis buat modal" mulai={116} warna={C.marun} top={1450} />
      <Catatan />
    </Latar>
  );
};

const Biaya: React.FC = () => {
  const frame = useCurrentFrame();
  const w = ease(interpolate(frame, [20, 70], [0, 1], clamp));
  const baris = [
    {n: 'Kemasan', v: 100000},
    {n: 'Sewa/listrik/air', v: 90000},
    {n: 'Transport/ongkir', v: 60000},
  ];
  return (
    <Latar>
      <Lencana teks="LANGKAH 2: KURANGI BIAYA" />
      <div style={posisi(160)}>
        <Teks kata={['Belum', 'lagi', 'biaya', 'lain']} sorot={[2, 3]} ukuran={84} />
      </div>
      <div style={{position: 'absolute', left: 95, top: 520}}>
        <div style={{fontSize: 36, fontWeight: 800, color: C.marun, marginBottom: 16}}>Omset Rp 1.500.000</div>
        <BatangProporsi modal={900000} biaya={250000 * w} sisa={600000 - 250000 * w} />
      </div>
      <div style={{position: 'absolute', top: 880, left: 140, width: 800}}>
        {baris.map((b, i) => (
          <Kartu
            key={b.n}
            mulai={34 + i * 22}
            style={{padding: '24px 40px', marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
          >
            <span style={{fontSize: 48, fontWeight: 800}}>{b.n}</span>
            <span style={{fontSize: 48, fontWeight: 900, color: C.oranye}}>Rp {titik(b.v)}</span>
          </Kartu>
        ))}
        <Kartu mulai={110} warna={C.oranye} teks="white" style={{padding: '26px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 46, fontWeight: 800}}>Total biaya lain</span>
          <span style={{fontSize: 60, fontWeight: 900}}>
            <Angka nilai={250000} mulai={114} durasi={30} />
          </span>
        </Kartu>
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 6: LABA BERSIH (grafik air terjun) ================= */

const LabaBersih: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const K = 700 / 1500000; // skala px per rupiah
  const DASAR = 1380;
  const batang = [
    {n: 'Omset', dari: 0, ke: 1500000, w: C.merah, mulai: 24},
    {n: 'Modal', dari: 1500000, ke: 600000, w: C.marun, mulai: 70},
    {n: 'Biaya', dari: 600000, ke: 350000, w: C.oranye, mulai: 116},
    {n: 'Laba', dari: 0, ke: 350000, w: C.hijau, mulai: 160},
  ];
  const akhir = spring({frame: frame - 190, fps, config: {damping: 9}});
  return (
    <Latar>
      <Lencana teks="HASIL AKHIR" />
      <div style={posisi(150)}>
        <Teks kata={['Sisanya', 'baru', 'laba', 'bersih']} sorot={[2, 3]} ukuran={88} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontSize: 44, fontWeight: 800, color: C.tinta}}>
        1.500.000 − 900.000 − 250.000 = <span style={{color: C.hijau}}>350.000</span>
      </div>
      <div style={{position: 'absolute', left: 90, top: DASAR, width: 900, height: 6, background: C.tinta}} />
      {batang.map((b, i) => {
        const p = ease(interpolate(frame, [b.mulai, b.mulai + 34], [0, 1], clamp));
        const atasNilai = Math.max(b.dari, b.ke);
        const bawahNilai = Math.min(b.dari, b.ke);
        const tinggi = (atasNilai - bawahNilai) * K * p;
        const y = DASAR - atasNilai * K;
        return (
          <React.Fragment key={b.n}>
            <div
              style={{
                position: 'absolute',
                left: 100 + i * 225,
                top: y,
                width: 180,
                height: tinggi,
                background: b.w,
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(42,15,12,0.2)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 100 + i * 225 - 20,
                width: 220,
                top: y - 62,
                textAlign: 'center',
                fontSize: 36,
                fontWeight: 900,
                color: C.tinta,
                opacity: p,
              }}
            >
              {i === 1 || i === 2 ? '−' : ''}
              {titik(Math.abs(b.ke - b.dari))}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 100 + i * 225 - 20,
                width: 220,
                top: DASAR + 18,
                textAlign: 'center',
                fontSize: 38,
                fontWeight: 800,
                color: C.marun,
              }}
            >
              {b.n}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', top: 1500, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '24px 60px',
            borderRadius: 40,
            background: C.hijau,
            color: 'white',
            textAlign: 'center',
            opacity: akhir,
            transform: `scale(${0.7 + 0.3 * akhir})`,
            boxShadow: '0 20px 60px rgba(10,155,122,0.4)',
          }}
        >
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 5}}>LABA BERSIH</div>
          <div style={{fontSize: 100, fontWeight: 900}}>Rp 350.000</div>
        </div>
      </div>
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 7: MARGIN ================= */

const Margin: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isi = Math.min(100, Math.max(0, Math.floor((frame - 14) * 0.9)));
  const warnaSel = (i: number) => (i < 60 ? C.marun : i < 77 ? C.oranye : C.hijau);
  const legend = spring({frame: frame - 110, fps, config: {damping: 11}});
  return (
    <Latar>
      <Lencana teks="MARGIN LABA" />
      <div style={posisi(150)}>
        <Teks kata={['Margin', 'laba', '±23%']} sorot={[2]} ukuran={104} />
      </div>
      <div style={{position: 'absolute', left: 175, top: 430, width: 740, display: 'flex', flexWrap: 'wrap', gap: 10}}>
        {Array.from({length: 100}).map((_, i) => (
          <div
            key={i}
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: i < isi ? warnaSel(i) : 'rgba(42,15,12,0.1)',
              transform: `scale(${i < isi ? 1 : 0.8})`,
            }}
          />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1230, left: 0, right: 0, textAlign: 'center', fontSize: 46, fontWeight: 800, color: C.tinta, opacity: legend}}>
        Dari tiap Rp 100 yang masuk
      </div>
      <div style={{position: 'absolute', top: 1310, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, opacity: legend}}>
        {[
          {t: 'Modal 60', w: C.marun},
          {t: 'Biaya 17', w: C.oranye},
          {t: 'Laba 23', w: C.hijau},
        ].map((l) => (
          <div key={l.t} style={{padding: '16px 30px', borderRadius: 999, background: l.w, color: 'white', fontSize: 40, fontWeight: 900}}>
            {l.t}
          </div>
        ))}
      </div>
      <Kapsul teks="±Rp 23 jadi laba" mulai={140} warna={C.hijau} top={1500} />
      <Catatan />
    </Latar>
  );
};

/* ================= ADEGAN 8: JANGAN CUMA LIHAT OMSET ================= */

const BandingToko: React.FC = () => {
  const frame = useCurrentFrame();
  const K = 560 / 2000000;
  const DASAR = 1330;
  const toko = [
    {n: 'Toko A', omset: 2000000, laba: 150000, x: 130, mulai: 24},
    {n: 'Toko B', omset: 1000000, laba: 300000, x: 590, mulai: 70},
  ];
  return (
    <Latar>
      <Lencana teks="JANGAN TERKECOH" />
      <div style={posisi(150)}>
        <Teks kata={['Jangan', 'cuma', 'lihat', 'omset']} sorot={[3]} ukuran={90} />
      </div>
      <div style={{position: 'absolute', left: 90, top: DASAR, width: 900, height: 6, background: C.tinta}} />
      {toko.map((t) => {
        const p = ease(interpolate(frame, [t.mulai, t.mulai + 40], [0, 1], clamp));
        return (
          <React.Fragment key={t.n}>
            <div style={{position: 'absolute', left: t.x, top: DASAR - t.omset * K * p, width: 150, height: t.omset * K * p, background: C.merah, borderRadius: 14}} />
            <div style={{position: 'absolute', left: t.x + 170, top: DASAR - t.laba * K * p, width: 150, height: t.laba * K * p, background: C.hijau, borderRadius: 14}} />
            <div style={{position: 'absolute', left: t.x - 20, width: 190, top: DASAR - t.omset * K * p - 90, textAlign: 'center', fontSize: 30, fontWeight: 900, color: C.merah, opacity: p}}>
              Omset
              <br />
              {titik(t.omset)}
            </div>
            <div style={{position: 'absolute', left: t.x + 150, width: 190, top: DASAR - t.laba * K * p - 90, textAlign: 'center', fontSize: 30, fontWeight: 900, color: C.hijau, opacity: p}}>
              Laba
              <br />
              {titik(t.laba)}
            </div>
            <div style={{position: 'absolute', left: t.x, width: 320, top: DASAR + 24, textAlign: 'center', fontSize: 52, fontWeight: 900, color: C.tinta}}>
              {t.n}
            </div>
          </React.Fragment>
        );
      })}
      <Kapsul teks="Omset gede, laba bisa tipis" mulai={130} warna={C.merah} top={1530} />
      <Catatan />
    </Latar>
  );
};

/* ================= HP LURUS + LAYAR APLIKASI (TIRUAN) ================= */

const LEBAR_HP = 680;
const TINGGI_HP = 1180;
const DESAIN_W = LEBAR_HP - 24;
const DESAIN_H = TINGGI_HP - 24;

const Hp: React.FC<{children: React.ReactNode; atas?: number}> = ({children, atas = 400}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 15}});
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - LEBAR_HP) / 2,
        top: atas,
        width: LEBAR_HP,
        height: TINGGI_HP,
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * 170}px)`,
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
          boxShadow: '0 40px 100px rgba(42,15,12,0.35)',
        }}
      >
        <div style={{width: DESAIN_W, height: DESAIN_H, position: 'relative'}}>{children}</div>
      </div>
    </div>
  );
};

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
    {online ? <span style={{fontSize: 20, padding: '6px 16px', borderRadius: 999, background: '#00b09b'}}>ONLINE</span> : null}
  </div>
);

const NavBawah: React.FC<{aktif: 'dasbor' | 'kasir' | 'stok'}> = ({aktif}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, background: 'white', borderTop: '2px solid #e3e8f3', display: 'flex'}}>
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

const KotakGrad: React.FC<{
  label: string;
  nilai: React.ReactNode;
  grad: string;
  besar?: boolean;
  denyut?: number;
  lebar?: number;
}> = ({label, nilai, grad, besar, denyut = 0, lebar = 296}) => (
  <div
    style={{
      width: besar ? '100%' : lebar,
      boxSizing: 'border-box',
      borderRadius: 26,
      padding: besar ? '26px 30px' : '20px 22px',
      background: grad,
      color: 'white',
      transform: `scale(${1 + 0.06 * denyut})`,
      boxShadow: denyut > 0 ? '0 0 0 8px rgba(217,43,34,0.35)' : 'none',
    }}
  >
    <div style={{fontSize: besar ? 26 : 22, fontWeight: 700, opacity: 0.92}}>{label}</div>
    <div style={{fontSize: besar ? 60 : 32, fontWeight: 900, marginTop: 4}}>{nilai}</div>
  </div>
);

/* ================= ADEGAN 9: DASBOR + CATAT KELUAR ================= */

const Dasbor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const muncul = (i: number) => spring({frame: frame - (14 + i * 8), fps, config: {damping: 13}});
  const sheet = interpolate(frame, [124, 140, 196, 210], [0, 1, 1, 0], clamp);
  const nominal = ketik('250000', frame, 146, 4);
  const tekan = frame >= 188 && frame < 198 ? 0.94 : 1;
  const tombolCatat = frame >= 112 && frame < 122 ? 0.94 : 1;
  const laba = interpolate(frame, [210, 232], [600000, 350000], clamp);
  const denyutLaba = interpolate(frame, [210, 220, 232], [0, 1, 0], clamp);
  const denyutOmset = interpolate(frame, [64, 74, 86], [0, 1, 0], clamp);
  return (
    <Latar>
      <Lencana teks="DI APLIKASI" />
      <div style={posisi(150)}>
        <Teks kata={['Laba', 'hari', 'ini', 'otomatis']} sorot={[3]} ukuran={88} />
      </div>
      <Hp atas={400}>
        <Header judul="Warung Berkah" online />
        <div style={{padding: '22px 24px'}}>
          <div style={{opacity: muncul(0)}}>
            <KotakGrad label="Total Omset Bersih" nilai={<Angka nilai={4100000} mulai={20} durasi={40} />} grad="linear-gradient(135deg,#0061ff,#60efff)" besar />
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 16, opacity: muncul(1)}}>
            <KotakGrad label="Total Masuk" nilai={<Angka nilai={18400000} mulai={28} durasi={40} />} grad="linear-gradient(135deg,#11998e,#38ef7d)" lebar={298} />
            <KotakGrad label="Total Keluar" nilai={<Angka nilai={14300000} mulai={28} durasi={40} />} grad="linear-gradient(135deg,#ff416c,#ff4b2b)" lebar={298} />
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 16, opacity: muncul(2)}}>
            <KotakGrad label="Omset Hari Ini" nilai={<Angka nilai={1500000} mulai={36} durasi={40} />} grad="linear-gradient(135deg,#f5af19,#f12711)" denyut={denyutOmset} lebar={298} />
            <KotakGrad label="Laba Hari Ini" nilai={'Rp ' + titik(frame < 210 ? Math.min(600000, 600000 * ease(interpolate(frame, [44, 84], [0, 1], clamp))) : laba)} grad="linear-gradient(135deg,#00b09b,#96c93d)" denyut={denyutLaba} lebar={298} />
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 16, opacity: muncul(3)}}>
            <KotakGrad label="Total TRX" nilai="64" grad="linear-gradient(135deg,#8e2de2,#4a00e0)" lebar={298} />
            <div
              style={{
                width: 298,
                boxSizing: 'border-box',
                borderRadius: 26,
                padding: '20px 22px',
                background: C.gelap,
                color: 'white',
                transform: `scale(${tombolCatat})`,
              }}
            >
              <div style={{fontSize: 24, fontWeight: 800}}>Catat Keluar</div>
              <div style={{fontSize: 19, opacity: 0.8, marginTop: 4}}>Input pengeluaran hari ini</div>
            </div>
          </div>
          <div style={{fontSize: 26, fontWeight: 900, color: C.gelap, margin: '26px 4px 12px', opacity: muncul(4)}}>Menu Cepat</div>
          <div style={{display: 'flex', gap: 16, opacity: muncul(4)}}>
            {[
              {t: 'Laporan', s: 'Grafik & Analitik', w: '#0061ff'},
              {t: 'Pengaturan', s: 'Toko & Backup', w: '#8e2de2'},
            ].map((m) => (
              <div key={m.t} style={{width: 298, boxSizing: 'border-box', borderRadius: 24, padding: '22px 22px', background: 'white', boxShadow: '0 8px 24px rgba(15,32,39,0.07)'}}>
                <div style={{width: 54, height: 54, borderRadius: 16, background: m.w, opacity: 0.15}} />
                <div style={{fontSize: 26, fontWeight: 900, color: C.gelap, marginTop: 12}}>{m.t}</div>
                <div style={{fontSize: 20, color: '#8d99ae', marginTop: 2}}>{m.s}</div>
              </div>
            ))}
          </div>
        </div>
        <NavBawah aktif="dasbor" />
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
              padding: '30px 28px 36px',
              transform: `translateY(${(1 - sheet) * 560}px)`,
            }}
          >
            <div style={{fontSize: 34, fontWeight: 900, color: C.gelap, marginBottom: 16}}>Catat Keluar</div>
            <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 6}}>Nominal</div>
            <div style={{height: 66, borderRadius: 16, border: `3px solid ${C.biru}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 30, color: '#2b2b2b', marginBottom: 16}}>
              {nominal ? 'Rp ' + titik(Number(nominal)) : 'Rp...'}
            </div>
            <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>Kategori</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18}}>
              {['Beli barang/bahan', 'Kemasan', 'Sewa/listrik/air', 'Transport/ongkir'].map((k) => (
                <div
                  key={k}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    fontSize: 22,
                    fontWeight: 800,
                    background: k === 'Kemasan' && frame >= 170 ? C.biru : '#eef2f9',
                    color: k === 'Kemasan' && frame >= 170 ? 'white' : '#6b7a99',
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
            <div style={{height: 76, borderRadius: 20, background: C.biru, color: 'white', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekan})`}}>
              Simpan
            </div>
          </div>
        </div>
      </Hp>
      <Kapsul teks="Omset − modal − pengeluaran = laba" mulai={226} warna={C.hijau} top={1650} />
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ================= ADEGAN 10: LAPORAN ================= */

const Laporan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const muncul = (i: number) => spring({frame: frame - (16 + i * 8), fps, config: {damping: 13}});
  const denyutTab = interpolate(frame, [100, 110, 122, 134, 146], [0, 1, 0, 1, 0], clamp);
  const batang = [40, 55, 48, 70, 62, 85, 100];
  const kpi: {l: string; v: React.ReactNode; w: string}[] = [
    {l: 'OMSET MASUK', v: <Angka nilai={1500000} mulai={20} durasi={36} />, w: C.biru},
    {l: 'PENGELUARAN', v: <Angka nilai={1150000} mulai={24} durasi={36} />, w: C.merah},
    {l: 'LABA BERSIH', v: <Angka nilai={350000} mulai={28} durasi={36} />, w: C.hijau},
    {l: 'TOTAL TRX', v: <Angka nilai={64} mulai={32} durasi={30} awalan="" />, w: '#8e2de2'},
    {l: '% MARGIN LABA', v: '23.3%', w: C.oranye},
    {l: 'RATA-RATA/TRX', v: <Angka nilai={23438} mulai={36} durasi={36} />, w: '#00a8c0'},
  ];
  return (
    <Latar>
      <Lencana teks="LAPORAN" />
      <div style={posisi(150)}>
        <Teks kata={['Laporan', 'harian', 'sampai', 'tahunan']} sorot={[3]} ukuran={84} />
      </div>
      <Hp atas={400}>
        <Header judul="Laporan Analitik" />
        <div style={{padding: '20px 22px'}}>
          <div style={{display: 'flex', gap: 10, marginBottom: 18, transform: `scale(${1 + 0.04 * denyutTab})`}}>
            {['Harian', 'Mingguan', 'Bulanan', 'Tahunan'].map((t, i) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px 0',
                  borderRadius: 14,
                  fontSize: 22,
                  fontWeight: 800,
                  background: i === 0 ? C.biru : 'white',
                  color: i === 0 ? 'white' : '#8d99ae',
                  border: i === 0 ? '2px solid transparent' : '2px solid #e3e8f3',
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
            {kpi.map((k, i) => {
              const s = muncul(Math.floor(i / 2));
              return (
                <div
                  key={k.l}
                  style={{
                    width: 298,
                    boxSizing: 'border-box',
                    background: 'white',
                    borderRadius: 22,
                    padding: '18px 20px',
                    borderTop: `7px solid ${k.w}`,
                    boxShadow: '0 8px 24px rgba(15,32,39,0.07)',
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px)`,
                  }}
                >
                  <div style={{fontSize: 19, fontWeight: 800, color: k.w}}>{k.l}</div>
                  <div style={{fontSize: 33, fontWeight: 900, color: C.gelap, marginTop: 6}}>{k.v}</div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 18, background: 'white', borderRadius: 22, padding: '18px 20px 20px', boxShadow: '0 8px 24px rgba(15,32,39,0.07)'}}>
            <div style={{fontSize: 22, fontWeight: 800, color: C.gelap, marginBottom: 12}}>Tren Pendapatan</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 190}}>
              {batang.map((h, i) => {
                const p = ease(interpolate(frame, [50 + i * 8, 80 + i * 8], [0, 1], clamp));
                return <div key={i} style={{flex: 1, height: h * 1.8 * p, background: i === 6 ? C.hijau : C.biru, borderRadius: 8}} />;
              })}
            </div>
          </div>
          <div style={{marginTop: 16, background: 'white', borderRadius: 22, padding: '18px 20px 20px', boxShadow: '0 8px 24px rgba(15,32,39,0.07)'}}>
            <div style={{fontSize: 22, fontWeight: 800, color: C.gelap, marginBottom: 12}}>Omset vs Laba</div>
            {[
              {n: 'Omset', v: 1500000, w: C.biru},
              {n: 'Laba', v: 350000, w: C.hijau},
            ].map((b, i) => {
              const p = ease(interpolate(frame, [70 + i * 14, 110 + i * 14], [0, 1], clamp));
              return (
                <div key={b.n} style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: i === 0 ? 10 : 0}}>
                  <div style={{width: 90, fontSize: 22, fontWeight: 800, color: '#6b7a99'}}>{b.n}</div>
                  <div style={{height: 34, width: (b.v / 1500000) * 420 * p, background: b.w, borderRadius: 8}} />
                </div>
              );
            })}
          </div>
        </div>
        <NavBawah aktif="dasbor" />
      </Hp>
      <Kapsul teks="Lengkap dengan persen margin laba" mulai={140} warna={C.hijau} top={1650} />
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ================= ADEGAN 11: AJAKAN ================= */

const Ajakan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 4, fps, config: {damping: 10}});
  const pil = spring({frame: frame - 50, fps, config: {damping: 9}});
  return (
    <Latar>
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: 230,
          width: 400,
          height: 400,
          borderRadius: 96,
          background: 'white',
          padding: 40,
          boxSizing: 'border-box',
          boxShadow: '0 30px 90px rgba(217,43,34,0.35), 0 20px 50px rgba(42,15,12,0.2)',
          transform: `scale(${logo}) rotate(${(1 - logo) * -18}deg)`,
        }}
      >
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={posisi(740)}>
        <Teks kata={['Tahu', 'untung', 'yang', 'sebenarnya']} sorot={[1, 3]} ukuran={92} mulai={12} />
      </div>
      <div style={{...posisi(1090), textAlign: 'center', fontSize: 52, fontWeight: 800, color: C.tinta}}>Kasir &amp; Katalog UMKM</div>
      <div
        style={{
          position: 'absolute',
          top: 1240,
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
          boxShadow: '0 20px 60px rgba(217,43,34,0.45)',
        }}
      >
        Unduh di Play Store
      </div>
    </Latar>
  );
};

/* ================= RANGKAIAN ================= */

export const OmsetBukanLaba: React.FC = () => (
  <AbsoluteFill style={{background: C.krem}}>
    <Adegan dari={DARI[0]} durasi={D[0]}><Hook /></Adegan>
    <Adegan dari={DARI[1]} durasi={D[1]}><Masuk /></Adegan>
    <Adegan dari={DARI[2]} durasi={D[2]}><Contoh /></Adegan>
    <Adegan dari={DARI[3]} durasi={D[3]}><Modal /></Adegan>
    <Adegan dari={DARI[4]} durasi={D[4]}><Biaya /></Adegan>
    <Adegan dari={DARI[5]} durasi={D[5]}><LabaBersih /></Adegan>
    <Adegan dari={DARI[6]} durasi={D[6]}><Margin /></Adegan>
    <Adegan dari={DARI[7]} durasi={D[7]}><BandingToko /></Adegan>
    <Adegan dari={DARI[8]} durasi={D[8]}><Dasbor /></Adegan>
    <Adegan dari={DARI[9]} durasi={D[9]}><Laporan /></Adegan>
    <Adegan dari={DARI[10]} durasi={D[10]}><Ajakan /></Adegan>
    <Progres />
  </AbsoluteFill>
);
