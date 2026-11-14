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
   TUTORIAL: CATAT PENGELUARAN & BACA LAPORAN (tepat 59 detik = 1770 frame)
   - Gaya buku kas bergaris + stabilo kuning + catatan tempel
   - Ponsel lurus, tanpa tokoh kartun, tanpa domain, tanpa musik
   - Narasi pakai text-to-speech TikTok; semua angka adalah data contoh
   File berdiri sendiri: cukup timpa src/Video.tsx
   ===================================================================== */

const C = {
  kertas: '#fbf6e6',
  tinta: '#1b1f3b',
  stabilo: '#ffe14d',
  merah: '#d92b22',
  hijau: '#0a9b7a',
  oranye: '#f08a24',
  biru: '#0061ff',
  gelap: '#0f2027',
  bahaya: '#ff416c',
  abu: '#8d99ae',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const titik = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const ketik = (t: string, frame: number, mulai: number, laju = 2) =>
  t.slice(0, Math.max(0, Math.floor((frame - mulai) / laju)));
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

// Durasi adegan (frame). HARUS berjumlah tepat 1770 (59 detik).
const D = [120, 150, 300, 210, 210, 150, 210, 210, 90, 120];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
if (D.reduce((a, b) => a + b, 0) !== 1770) {
  throw new Error('Total durasi adegan harus tepat 1770 frame (59 detik)');
}

/* ------------------------- Elemen dasar ------------------------- */

const posisi = (top: number): React.CSSProperties => ({position: 'absolute', top, left: 0, right: 0});

const Latar: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.kertas, fontFamily: 'sans-serif', overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 71px, rgba(0,97,255,0.16) 71px, rgba(0,97,255,0.16) 73px)',
      }}
    />
    <div style={{position: 'absolute', top: 0, bottom: 0, left: 96, width: 4, background: 'rgba(217,43,34,0.45)'}} />
    <div style={{position: 'absolute', top: 0, bottom: 0, left: 108, width: 2, background: 'rgba(217,43,34,0.3)'}} />
    {[260, 940, 1620].map((y) => (
      <div key={y} style={{position: 'absolute', left: 26, top: y, width: 34, height: 34, borderRadius: 17, background: 'rgba(27,31,59,0.18)'}} />
    ))}
    {children}
  </AbsoluteFill>
);

const Adegan: React.FC<{dari: number; durasi: number; children: React.ReactNode}> = ({dari, durasi, children}) => (
  <Sequence from={dari} durationInFrames={durasi}>
    <AdeganDalam>{children}</AdeganDalam>
  </Sequence>
);

const AdeganDalam: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const o = interpolate(frame, [0, 5, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], clamp);
  const sapu = interpolate(frame, [0, 13], [-1300, 1300], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: sapu,
          width: 1200,
          background: `linear-gradient(100deg, transparent, ${C.stabilo} 35%, ${C.stabilo} 65%, transparent)`,
          opacity: frame < 15 ? 0.95 : 0,
          transform: 'skewX(-12deg)',
        }}
      />
    </AbsoluteFill>
  );
};

// Teks kata demi kata; kata penting diberi stabilo kuning
const Teks: React.FC<{
  kata: string[];
  sorot?: number[];
  ukuran?: number;
  mulai?: number;
  jeda?: number;
}> = ({kata, sorot = [], ukuran = 84, mulai = 4, jeda = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '0 70px'}}>
      {kata.map((k, i) => {
        const s = spring({frame: Math.max(0, frame - (mulai + i * jeda)), fps, config: {damping: 12}});
        const hi = sorot.includes(i);
        return (
          <span
            key={i}
            style={{
              fontSize: ukuran,
              fontWeight: 900,
              padding: '0 14px',
              color: C.tinta,
              background: hi ? `linear-gradient(transparent 18%, ${C.stabilo} 18%, ${C.stabilo} 92%, transparent 92%)` : 'transparent',
              opacity: s,
              transform: `translateY(${(1 - s) * 40}px) scale(${0.75 + 0.25 * s}) rotate(${hi ? -1.5 : 0}deg)`,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

// Catatan tempel kuning
const Catatan: React.FC<{teks: string; mulai: number; top?: number; rot?: number; ukuran?: number; warna?: string; tulisan?: string}> = ({
  teks,
  mulai,
  top = 1560,
  rot = -2,
  ukuran = 52,
  warna = C.stabilo,
  tulisan = C.tinta,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 9}});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          position: 'relative',
          padding: '24px 46px',
          background: warna,
          color: tulisan,
          fontSize: ukuran,
          fontWeight: 900,
          boxShadow: '0 16px 34px rgba(27,31,59,0.28)',
          opacity: s,
          transform: `scale(${0.5 + 0.5 * s}) rotate(${rot}deg)`,
        }}
      >
        <div style={{position: 'absolute', top: -16, left: '50%', marginLeft: -60, width: 120, height: 32, background: 'rgba(255,255,255,0.65)', transform: 'rotate(-3deg)'}} />
        {teks}
      </div>
    </div>
  );
};

const Nomor: React.FC<{n: string; teks: string}> = ({n, teks}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - 2), fps, config: {damping: 9}});
  return (
    <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: s, transform: `scale(${0.6 + 0.4 * s})`}}>
      <div style={{width: 128, height: 128, borderRadius: 64, background: C.merah, color: 'white', fontSize: 86, fontWeight: 900, textAlign: 'center', lineHeight: '128px', boxShadow: '0 10px 24px rgba(217,43,34,0.4)'}}>{n}</div>
      <div style={{fontSize: 68, fontWeight: 900, color: C.tinta, background: `linear-gradient(transparent 60%, ${C.stabilo} 60%)`}}>{teks}</div>
    </div>
  );
};

const Pil: React.FC<{teks: string}> = ({teks}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - 2), fps, config: {damping: 10}});
  return (
    <div style={{position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s, transform: `scale(${0.7 + 0.3 * s})`}}>
      <div style={{padding: '16px 44px', borderRadius: 999, background: C.tinta, color: 'white', fontSize: 52, fontWeight: 900, letterSpacing: 3}}>{teks}</div>
    </div>
  );
};

const DataContoh: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontSize: 28, color: 'rgba(27,31,59,0.55)'}}>*Data contoh</div>
);

const Progres: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <div style={{position: 'absolute', left: 0, bottom: 0, height: 12, width: `${(frame / durationInFrames) * 100}%`, background: C.merah}} />;
};

const Angka: React.FC<{nilai: number; mulai?: number; durasi?: number; awalan?: string}> = ({nilai, mulai = 0, durasi = 36, awalan = 'Rp '}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [mulai, mulai + durasi], [0, 1], clamp);
  return <>{awalan + titik(nilai * ease(p))}</>;
};

/* ------------------------- HP lurus + layar aplikasi ------------------------- */

const LEBAR_HP = 680;
const TINGGI_HP = 1180;
const DESAIN_W = LEBAR_HP - 24;
const DESAIN_H = TINGGI_HP - 24;

const Hp: React.FC<{children: React.ReactNode; atas?: number}> = ({children, atas = 330}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', left: (1080 - LEBAR_HP) / 2, top: atas, width: LEBAR_HP, height: TINGGI_HP, opacity: masuk, transform: `translateY(${(1 - masuk) * 170}px)`}}>
      <div style={{width: '100%', height: '100%', boxSizing: 'border-box', borderRadius: 68, border: `12px solid ${C.tinta}`, background: '#f4f7fe', overflow: 'hidden', position: 'relative', boxShadow: '0 36px 80px rgba(27,31,59,0.35)'}}>
        <div style={{width: DESAIN_W, height: DESAIN_H, position: 'relative'}}>{children}</div>
      </div>
    </div>
  );
};

const Header: React.FC<{judul: string; online?: boolean}> = ({judul, online}) => (
  <div style={{height: 104, background: `linear-gradient(135deg, ${C.gelap}, #203a43)`, color: 'white', fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px'}}>
    <span>{judul}</span>
    {online ? <span style={{fontSize: 20, padding: '6px 16px', borderRadius: 999, background: '#00b09b'}}>ONLINE</span> : null}
  </div>
);

const NavBawah: React.FC<{aktif: number}> = ({aktif}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, background: 'white', borderTop: '2px solid #e3e8f3', display: 'flex'}}>
    {['Dasbor', 'Kasir', 'Stok'].map((t, i) => (
      <div key={t} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 800, color: aktif === i ? C.biru : '#a0aabf', borderTop: aktif === i ? `6px solid ${C.biru}` : '6px solid transparent'}}>{t}</div>
    ))}
  </div>
);

const Kotak: React.FC<{label: string; nilai: React.ReactNode; grad: string; denyut?: number}> = ({label, nilai, grad, denyut = 0}) => (
  <div style={{flex: 1, minWidth: 0, boxSizing: 'border-box', borderRadius: 26, padding: '20px 22px', background: grad, color: 'white', transform: `scale(${1 + 0.06 * denyut})`, boxShadow: denyut > 0 ? '0 0 0 8px rgba(255,225,77,0.8)' : 'none'}}>
    <div style={{fontSize: 22, fontWeight: 700, opacity: 0.92}}>{label}</div>
    <div style={{fontSize: 32, fontWeight: 900, marginTop: 4}}>{nilai}</div>
  </div>
);

const LayarDasbor: React.FC<{
  laba: number;
  catatTekan?: number;
  laporanTekan?: number;
  denyutLaba?: number;
}> = ({laba, catatTekan = 0, laporanTekan = 0, denyutLaba = 0}) => (
  <div style={{width: '100%', height: '100%', position: 'relative'}}>
    <Header judul="Warung Berkah" online />
    <div style={{padding: '22px 24px'}}>
      <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
        <Kotak label="Omset Hari Ini" nilai="Rp 1.500.000" grad="linear-gradient(135deg,#f5af19,#f12711)" />
        <Kotak label="Laba Hari Ini" nilai={'Rp ' + titik(laba)} grad="linear-gradient(135deg,#00b09b,#96c93d)" denyut={denyutLaba} />
      </div>
      <div style={{display: 'flex', gap: 16, marginBottom: 22}}>
        <Kotak label="Total TRX" nilai="64" grad="linear-gradient(135deg,#8e2de2,#4a00e0)" />
        <div style={{flex: 1, borderRadius: 26, padding: '20px 22px', background: C.gelap, color: 'white', transform: `scale(${1 - 0.06 * catatTekan})`, boxShadow: catatTekan > 0 ? '0 0 0 8px rgba(255,225,77,0.9)' : 'none'}}>
          <div style={{fontSize: 26, fontWeight: 800}}>Catat Keluar</div>
          <div style={{fontSize: 19, opacity: 0.8, marginTop: 4}}>Input pengeluaran hari ini</div>
        </div>
      </div>
      <div style={{fontSize: 26, fontWeight: 900, color: C.gelap, margin: '0 4px 12px'}}>Menu Cepat</div>
      <div style={{display: 'flex', gap: 16}}>
        {[
          {t: 'Laporan', s: 'Grafik & Analitik', w: C.biru, tekan: laporanTekan},
          {t: 'Pengaturan', s: 'Toko & Backup', w: '#8e2de2', tekan: 0},
        ].map((m) => (
          <div key={m.t} style={{flex: 1, boxSizing: 'border-box', borderRadius: 24, padding: '22px', background: 'white', boxShadow: m.tekan > 0 ? `0 0 0 8px rgba(255,225,77,0.9)` : '0 8px 24px rgba(15,32,39,0.07)', transform: `scale(${1 - 0.05 * m.tekan})`}}>
            <div style={{width: 54, height: 54, borderRadius: 16, background: m.w, opacity: 0.18}} />
            <div style={{fontSize: 28, fontWeight: 900, color: C.gelap, marginTop: 12}}>{m.t}</div>
            <div style={{fontSize: 20, color: C.abu, marginTop: 2}}>{m.s}</div>
          </div>
        ))}
      </div>
    </div>
    <NavBawah aktif={0} />
  </div>
);

const KATEGORI = ['Beli barang/bahan', 'Gaji', 'Sewa/listrik/air', 'Kemasan', 'Transport/ongkir', 'Promosi', 'Peralatan', 'Lain-lain'];

/* ================= ADEGAN 1: HOOK ================= */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const acak = (i: number) => String(Math.floor(((Math.sin(frame * 1.7 + i * 7.3) + 1) / 2) * 9.99));
  const baris = [0, 1, 2, 3, 4, 5].map(acak);
  const stempel = spring({frame: frame - 70, fps, config: {damping: 8}});
  const kartu = spring({frame: frame - 24, fps, config: {damping: 11}});
  return (
    <Latar>
      <div style={posisi(210)}>
        <Teks kata={['Untung', 'hari', 'ini', 'berapa?']} sorot={[3]} ukuran={110} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 150,
          width: 780,
          padding: '40px 0',
          textAlign: 'center',
          background: 'white',
          border: `6px solid ${C.tinta}`,
          borderRadius: 24,
          boxShadow: `12px 12px 0 ${C.tinta}`,
          opacity: kartu,
          transform: `scale(${0.6 + 0.4 * kartu})`,
        }}
      >
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 6, color: C.abu}}>UNTUNG HARI INI</div>
        <div style={{fontSize: 120, fontWeight: 900, color: C.tinta, fontFamily: 'monospace'}}>
          Rp {baris[0]}{baris[1]}{baris[2]}.{baris[3]}{baris[4]}{baris[5]}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1190,
          left: 250,
          width: 580,
          padding: '20px 0',
          textAlign: 'center',
          border: `10px solid ${C.merah}`,
          borderRadius: 20,
          color: C.merah,
          fontSize: 100,
          fontWeight: 900,
          letterSpacing: 4,
          background: 'rgba(255,255,255,0.7)',
          opacity: stempel,
          transform: `rotate(-6deg) scale(${2.4 - 1.4 * stempel})`,
        }}
      >
        KIRA-KIRA
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 2: SEBAB ================= */

const Sebab: React.FC = () => {
  const frame = useCurrentFrame();
  const nota = [
    {t: 'Rp 25.000', x: 200, d: 20},
    {t: 'Rp 60.000', x: 520, d: 34},
    {t: 'Rp 15.000', x: 780, d: 48},
    {t: 'Rp 90.000', x: 330, d: 62},
    {t: 'Rp 40.000', x: 640, d: 76},
  ];
  return (
    <Latar>
      <div style={posisi(180)}>
        <Teks kata={['Sebabnya:', 'pengeluaran', 'nggak', 'dicatat']} sorot={[1, 3]} ukuran={86} />
      </div>
      {nota.map((n, i) => {
        const t = frame - n.d;
        const o = interpolate(t, [0, 8, 50, 70], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: n.x,
              top: 1050 - Math.max(0, t) * 5,
              padding: '20px 32px',
              background: 'white',
              border: `4px dashed ${C.tinta}`,
              fontSize: 44,
              fontWeight: 900,
              color: C.merah,
              opacity: o,
              transform: `rotate(${(i - 2) * 6}deg)`,
            }}
          >
            -{n.t}
          </div>
        );
      })}
      <Catatan teks="Padahal gampang banget" mulai={96} top={1480} />
    </Latar>
  );
};

/* ================= ADEGAN 3: LANGKAH 1 - CATAT KELUAR ================= */

const CatatKeluar: React.FC = () => {
  const frame = useCurrentFrame();
  const catatTekan = interpolate(frame, [36, 42, 52], [0, 1, 0], clamp);
  const sheet = interpolate(frame, [52, 72, 224, 244], [0, 1, 1, 0], clamp);
  const nominal = ketik('50000', frame, 84, 6);
  const pilih = frame >= 150;
  const tekanSimpan = frame >= 196 && frame < 206 ? 0.94 : 1;
  const toast = interpolate(frame, [236, 248, 280, 296], [0, 1, 1, 0], clamp);
  return (
    <Latar>
      <Nomor n="1" teks="Ketuk Catat Keluar" />
      <Hp>
        <LayarDasbor laba={frame >= 244 ? 600000 - 50000 : 600000} catatTekan={catatTekan} />
        <div style={{position: 'absolute', inset: 0, background: `rgba(15,32,39,${0.55 * sheet})`, visibility: sheet > 0.01 ? 'visible' : 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: 'white', borderRadius: '36px 36px 0 0', padding: '30px 28px 36px', transform: `translateY(${(1 - sheet) * 620}px)`}}>
            <div style={{fontSize: 34, fontWeight: 900, color: C.gelap, marginBottom: 16}}>Catat Keluar</div>
            <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 6}}>Nominal</div>
            <div style={{height: 68, borderRadius: 16, border: `3px solid ${C.biru}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 32, color: '#2b2b2b', marginBottom: 16}}>
              {nominal ? 'Rp ' + titik(Number(nominal)) : 'Rp...'}
            </div>
            <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>Kategori</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18}}>
              {['Beli barang/bahan', 'Kemasan', 'Sewa/listrik/air', 'Transport/ongkir'].map((k) => (
                <div key={k} style={{padding: '10px 20px', borderRadius: 999, fontSize: 22, fontWeight: 800, background: pilih && k === 'Kemasan' ? C.biru : '#eef2f9', color: pilih && k === 'Kemasan' ? 'white' : '#6b7a99'}}>{k}</div>
              ))}
            </div>
            <div style={{height: 78, borderRadius: 20, background: C.merah, color: 'white', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekanSimpan})`}}>Simpan Pengeluaran</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, bottom: 130, padding: '20px 0', borderRadius: 40, background: C.hijau, color: 'white', fontSize: 30, fontWeight: 800, textAlign: 'center', opacity: toast, transform: `translateY(${(1 - toast) * 60}px)`}}>
          Pengeluaran tersimpan
        </div>
      </Hp>
      {frame >= 56 && frame < 130 ? <Catatan teks="Isi nominal" mulai={56} /> : null}
      {frame >= 130 && frame < 190 ? <Catatan teks="Pilih kategori" mulai={130} rot={2} /> : null}
      {frame >= 190 && frame < 290 ? <Catatan teks="Simpan Pengeluaran" mulai={190} /> : null}
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 4: KATEGORI ================= */

const Kategori: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const warna = [C.merah, C.biru, C.hijau, C.oranye, '#8e2de2', C.bahaya, '#00a8c0', C.abu];
  return (
    <Latar>
      <Pil teks="KATEGORI BIAYA" />
      <div style={posisi(230)}>
        <Teks kata={['Udah', 'disiapin', 'semua']} sorot={[1]} ukuran={96} />
      </div>
      <div style={{position: 'absolute', top: 500, left: 130, width: 830, display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center'}}>
        {KATEGORI.map((k, i) => {
          const s = spring({frame: Math.max(0, frame - (14 + i * 14)), fps, config: {damping: 9}});
          return (
            <div
              key={k}
              style={{
                width: 390,
                boxSizing: 'border-box',
                padding: '34px 24px',
                background: warna[i],
                color: 'white',
                fontSize: 44,
                fontWeight: 900,
                textAlign: 'center',
                borderRadius: 22,
                border: `5px solid ${C.tinta}`,
                boxShadow: `8px 8px 0 ${C.tinta}`,
                opacity: s,
                transform: `scale(${0.5 + 0.5 * s}) rotate(${(i % 2 === 0 ? -1.5 : 1.5) * (1 - s) * 6}deg)`,
              }}
            >
              {k}
            </div>
          );
        })}
      </div>
      <Catatan teks="Bahan, gaji, listrik, ongkir, promosi" mulai={130} top={1560} ukuran={44} />
    </Latar>
  );
};

/* ================= ADEGAN 5: LABA IKUT BERUBAH ================= */

const LabaBerubah: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const laba = interpolate(frame, [70, 110], [600000, 350000], clamp);
  const denyut = interpolate(frame, [70, 90, 112], [0, 1, 0], clamp);
  const chip = spring({frame: frame - 56, fps, config: {damping: 9}});
  return (
    <Latar>
      <Pil teks="LANGSUNG UPDATE" />
      <div style={posisi(210)}>
        <Teks kata={['Laba', 'Hari', 'Ini', 'ikut', 'berubah']} sorot={[0, 1, 2]} ukuran={86} />
      </div>
      <Hp atas={430}>
        <LayarDasbor laba={laba} denyutLaba={denyut} />
      </Hp>
      <div style={{position: 'absolute', left: 640, top: 760, padding: '16px 34px', borderRadius: 999, background: C.merah, color: 'white', fontSize: 52, fontWeight: 900, border: `5px solid ${C.tinta}`, opacity: chip * (frame < 120 ? 1 : 0), transform: `scale(${chip}) rotate(6deg)`}}>
        − Rp 250.000
      </div>
      <Catatan teks="Omset − modal − pengeluaran" mulai={120} top={1700} ukuran={44} />
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 6: BUKA LAPORAN ================= */

const BukaLaporan: React.FC = () => {
  const frame = useCurrentFrame();
  const tekan = interpolate(frame, [50, 58, 68], [0, 1, 0], clamp);
  const laporan = ease(interpolate(frame, [66, 90], [0, 1], clamp));
  return (
    <Latar>
      <Nomor n="2" teks="Buka Laporan" />
      <Hp>
        <LayarDasbor laba={350000} laporanTekan={tekan} />
        <div style={{position: 'absolute', inset: 0, background: '#f4f7fe', opacity: laporan, visibility: laporan > 0.01 ? 'visible' : 'hidden'}}>
          <Header judul="Laporan Analitik" />
        </div>
      </Hp>
      {frame >= 20 ? <Catatan teks="Menu Cepat > Laporan" mulai={20} /> : null}
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 7: PERIODE DAN KARTU ANGKA ================= */

const PERIODE = [
  {n: 'Harian', v: [1500000, 1150000, 350000, 64, '23.3%', 23438]},
  {n: 'Mingguan', v: [9800000, 7600000, 2200000, 410, '22.4%', 23902]},
  {n: 'Bulanan', v: [41200000, 32300000, 8900000, 1720, '21.6%', 23953]},
  {n: 'Tahunan', v: [486000000, 381000000, 105000000, 20300, '21.6%', 23941]},
];
const LABEL = ['OMSET MASUK', 'PENGELUARAN', 'LABA BERSIH', 'TOTAL TRX', '% MARGIN LABA', 'RATA-RATA/TRX'];
const WARNA_KPI = [C.biru, C.merah, C.hijau, '#8e2de2', C.oranye, '#00a8c0'];

const Periode: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(3, Math.floor(frame / 52));
  const mulai = idx * 52 + 4;
  const p = PERIODE[idx];
  return (
    <Latar>
      <Nomor n="2" teks="Pilih periode" />
      <Hp>
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
          <Header judul="Laporan Analitik" />
          <div style={{padding: '24px'}}>
            <div style={{display: 'flex', gap: 10, marginBottom: 22}}>
              {PERIODE.map((t, i) => (
                <div key={t.n} style={{flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: 14, fontSize: 22, fontWeight: 800, background: i === idx ? C.biru : 'white', color: i === idx ? 'white' : '#8d99ae', border: i === idx ? '2px solid transparent' : '2px solid #e3e8f3'}}>{t.n}</div>
              ))}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
              {LABEL.map((l, i) => (
                <div key={l} style={{width: 296, boxSizing: 'border-box', background: 'white', borderRadius: 22, padding: '20px 20px', borderTop: `8px solid ${WARNA_KPI[i]}`, boxShadow: '0 8px 24px rgba(15,32,39,0.07)'}}>
                  <div style={{fontSize: 20, fontWeight: 800, color: WARNA_KPI[i]}}>{l}</div>
                  <div style={{fontSize: 33, fontWeight: 900, color: C.gelap, marginTop: 8}}>
                    {i === 4 ? p.v[4] : i === 3 ? <Angka nilai={Number(p.v[3])} mulai={mulai} durasi={26} awalan="" /> : <Angka nilai={Number(p.v[i])} mulai={mulai} durasi={26} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <NavBawah aktif={0} />
        </div>
      </Hp>
      <Catatan teks={idx === 0 ? 'Harian' : idx === 1 ? 'Mingguan' : idx === 2 ? 'Bulanan' : 'Tahunan'} mulai={idx * 52 + 2} top={1560} rot={idx % 2 === 0 ? -2 : 2} />
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 8: GRAFIK ================= */

const Donat: React.FC<{p: number}> = ({p}) => {
  const bagian = [
    {n: 'Bahan', v: 62, w: C.merah},
    {n: 'Kemasan', v: 14, w: C.oranye},
    {n: 'Listrik', v: 10, w: C.biru},
    {n: 'Ongkir', v: 8, w: C.hijau},
    {n: 'Lain', v: 6, w: C.abu},
  ];
  const R = 70;
  const K = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <svg width="190" height="190" viewBox="0 0 190 190">
        {bagian.map((b) => {
          const panjang = (b.v / 100) * K * p;
          const el = (
            <circle key={b.n} cx="95" cy="95" r={R} fill="none" stroke={b.w} strokeWidth="34" strokeDasharray={`${panjang} ${K}`} strokeDashoffset={-acc * K * p / 100 * 1} transform="rotate(-90 95 95)" />
          );
          acc += b.v;
          return el;
        })}
      </svg>
      <div style={{display: 'grid', gap: 6}}>
        {bagian.map((b) => (
          <div key={b.n} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 700, color: C.gelap}}>
            <span style={{width: 18, height: 18, borderRadius: 9, background: b.w, display: 'inline-block'}} />
            {b.n} {b.v}%
          </div>
        ))}
      </div>
    </div>
  );
};

const Grafik: React.FC = () => {
  const frame = useCurrentFrame();
  const geser = ease(interpolate(frame, [50, 170], [0, 1], clamp)) * 640;
  const bar = [40, 55, 48, 70, 62, 85, 100];
  const top5 = [
    ['Kopi Susu Botol', 100],
    ['Roti Tawar', 64],
    ['Mie Goreng Instan', 41],
    ['Air Mineral 600 ml', 35],
    ['Es Teh Manis', 28],
  ];
  const kartu: React.CSSProperties = {background: 'white', borderRadius: 24, padding: '22px 24px', marginBottom: 20, boxShadow: '0 8px 24px rgba(15,32,39,0.07)'};
  const judul: React.CSSProperties = {fontSize: 26, fontWeight: 900, color: C.gelap, marginBottom: 14};
  const p1 = ease(interpolate(frame, [10, 50], [0, 1], clamp));
  const p2 = ease(interpolate(frame, [60, 100], [0, 1], clamp));
  const p3 = ease(interpolate(frame, [100, 140], [0, 1], clamp));
  const p4 = ease(interpolate(frame, [140, 180], [0, 1], clamp));
  return (
    <Latar>
      <Pil teks="GRAFIK" />
      <Hp>
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
          <Header judul="Laporan Analitik" />
          <div style={{padding: 24, transform: `translateY(${-geser}px)`}}>
            <div style={kartu}>
              <div style={judul}>Tren Pendapatan</div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 170}}>
                {bar.map((h, i) => (
                  <div key={i} style={{flex: 1, height: h * 1.6 * p1, background: i === 6 ? C.hijau : C.biru, borderRadius: 8}} />
                ))}
              </div>
            </div>
            <div style={kartu}>
              <div style={judul}>Omset vs Laba</div>
              {[
                ['Omset', 1500000, C.biru],
                ['Laba', 350000, C.hijau],
              ].map(([n, v, w]) => (
                <div key={String(n)} style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10}}>
                  <div style={{width: 90, fontSize: 22, fontWeight: 800, color: '#6b7a99'}}>{n}</div>
                  <div style={{height: 36, width: (Number(v) / 1500000) * 440 * p2, background: String(w), borderRadius: 8}} />
                </div>
              ))}
            </div>
            <div style={kartu}>
              <div style={judul}>Pengeluaran per Kategori</div>
              <Donat p={p3} />
            </div>
            <div style={kartu}>
              <div style={judul}>Top 5 Terlaris</div>
              {top5.map(([n, v], i) => (
                <div key={String(n)} style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 700, color: C.gelap, padding: '8px 0', borderBottom: '1px solid #eee', opacity: p4}}>
                  <span>{i + 1}. {n}</span>
                  <span style={{color: C.hijau}}>{v} terjual</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Hp>
      {frame < 56 ? <Catatan teks="Tren pendapatan" mulai={8} /> : frame < 104 ? <Catatan teks="Omset vs laba" mulai={58} rot={2} /> : frame < 150 ? <Catatan teks="Pengeluaran per kategori" mulai={106} /> : <Catatan teks="5 produk terlaris" mulai={152} rot={2} />}
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 9: RINCIAN TRANSAKSI ================= */

const Rincian: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame < 30 ? 0 : frame < 60 ? 1 : 2;
  const semua = [
    ['Penjualan #A1', '+Rp 44.000', true],
    ['Kemasan', '-Rp 50.000', false],
    ['Penjualan #A2', '+Rp 28.500', true],
    ['Transport/ongkir', '-Rp 60.000', false],
  ];
  const tampil = semua.filter((r) => f === 0 || (f === 1 && r[2]) || (f === 2 && !r[2]));
  return (
    <Latar>
      <Pil teks="RINCIAN TRANSAKSI" />
      <Hp atas={290}>
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
          <Header judul="Laporan Analitik" />
          <div style={{padding: 24}}>
            <div style={{fontSize: 28, fontWeight: 900, color: C.gelap, marginBottom: 14}}>Rincian Transaksi</div>
            <div style={{display: 'flex', gap: 12, marginBottom: 20}}>
              {['Semua', 'Masuk', 'Keluar'].map((t, i) => (
                <div key={t} style={{flex: 1, textAlign: 'center', padding: '14px 0', borderRadius: 14, fontSize: 24, fontWeight: 800, background: i === f ? C.biru : 'white', color: i === f ? 'white' : '#8d99ae', border: i === f ? '2px solid transparent' : '2px solid #e3e8f3'}}>{t}</div>
              ))}
            </div>
            {tampil.map((r) => (
              <div key={String(r[0])} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 20, padding: '22px 24px', marginBottom: 14, boxShadow: '0 8px 24px rgba(15,32,39,0.07)'}}>
                <span style={{fontSize: 28, fontWeight: 800, color: C.gelap}}>{String(r[0])}</span>
                <span style={{fontSize: 30, fontWeight: 900, color: r[2] ? C.hijau : C.merah}}>{String(r[1])}</span>
              </div>
            ))}
          </div>
        </div>
      </Hp>
      <Catatan teks="Saring: masuk atau keluar" mulai={8} top={1560} ukuran={46} />
      <DataContoh />
    </Latar>
  );
};

/* ================= ADEGAN 10: AJAKAN ================= */

const Ajakan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 2, fps, config: {damping: 9}});
  const pil = spring({frame: frame - 44, fps, config: {damping: 8}});
  return (
    <Latar>
      <div style={{position: 'absolute', left: 340, top: 230, width: 400, height: 400, borderRadius: 96, background: 'white', padding: 40, boxSizing: 'border-box', border: `8px solid ${C.tinta}`, boxShadow: `14px 14px 0 ${C.tinta}`, transform: `scale(${logo}) rotate(${(1 - logo) * -18}deg)`}}>
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={posisi(740)}>
        <Teks kata={['Tahu', 'untung', 'yang', 'sebenarnya']} sorot={[1, 3]} ukuran={92} mulai={8} jeda={4} />
      </div>
      <div style={{...posisi(1090), textAlign: 'center', fontSize: 52, fontWeight: 800, color: C.tinta}}>Kasir &amp; Katalog UMKM</div>
      <div style={{position: 'absolute', top: 1240, left: 190, width: 700, height: 140, borderRadius: 70, background: C.merah, color: 'white', border: `7px solid ${C.tinta}`, boxShadow: `10px 10px 0 ${C.tinta}`, fontSize: 56, fontWeight: 900, textAlign: 'center', lineHeight: '126px', boxSizing: 'border-box', transform: `scale(${pil})`}}>
        Unduh di Play Store
      </div>
    </Latar>
  );
};

/* ================= RANGKAIAN ================= */

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.kertas}}>
    <Adegan dari={DARI[0]} durasi={D[0]}><Hook /></Adegan>
    <Adegan dari={DARI[1]} durasi={D[1]}><Sebab /></Adegan>
    <Adegan dari={DARI[2]} durasi={D[2]}><CatatKeluar /></Adegan>
    <Adegan dari={DARI[3]} durasi={D[3]}><Kategori /></Adegan>
    <Adegan dari={DARI[4]} durasi={D[4]}><LabaBerubah /></Adegan>
    <Adegan dari={DARI[5]} durasi={D[5]}><BukaLaporan /></Adegan>
    <Adegan dari={DARI[6]} durasi={D[6]}><Periode /></Adegan>
    <Adegan dari={DARI[7]} durasi={D[7]}><Grafik /></Adegan>
    <Adegan dari={DARI[8]} durasi={D[8]}><Rincian /></Adegan>
    <Adegan dari={DARI[9]} durasi={D[9]}><Ajakan /></Adegan>
    <Progres />
  </AbsoluteFill>
);
