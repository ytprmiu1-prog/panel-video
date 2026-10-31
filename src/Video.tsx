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
   TUTORIAL: TERIMA PESANAN ONLINE (tepat 59 detik = 1770 frame, 30 fps)
   - Gaya blok merah-putih, tulisan seperti stiker, ritme cepat
   - Ponsel lurus, tanpa tokoh kartun, tanpa domain, tanpa musik
   - Narasi pakai text-to-speech TikTok; semua data adalah data contoh
   File berdiri sendiri: cukup timpa src/Video.tsx
   ===================================================================== */

const C = {
  merah: '#d92b22',
  merahGelap: '#a81812',
  tinta: '#1d0b09',
  krem: '#f7f0e4',
  kuning: '#ffd23f',
  hijau: '#00b09b',
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
const D = [120, 180, 210, 300, 270, 240, 270, 90, 90];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
if (D.reduce((a, b) => a + b, 0) !== 1770) {
  throw new Error('Total durasi adegan harus tepat 1770 frame (59 detik)');
}

/* ------------------------- Elemen dasar ------------------------- */

const posisi = (top: number): React.CSSProperties => ({position: 'absolute', top, left: 0, right: 0});

type Tema = 'merah' | 'krem';

const Latar: React.FC<{tema: Tema; children?: React.ReactNode}> = ({tema, children}) => {
  const frame = useCurrentFrame();
  const g = Math.sin(frame / 60) * 30;
  const merah = tema === 'merah';
  return (
    <AbsoluteFill style={{background: merah ? C.merah : C.krem, fontFamily: 'sans-serif', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: merah
            ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 24px, transparent 24px, transparent 60px)'
            : 'radial-gradient(rgba(217,43,34,0.12) 2px, transparent 2.5px)',
          backgroundSize: merah ? undefined : '44px 44px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 820,
          height: 820,
          borderRadius: 410,
          right: -320 + g,
          top: -300,
          background: merah ? C.merahGelap : C.merah,
          opacity: merah ? 0.55 : 0.16,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: 260,
          left: -220 - g,
          bottom: -180,
          background: C.kuning,
          opacity: merah ? 0.3 : 0.4,
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
  const o = interpolate(frame, [0, 5, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], clamp);
  const geser = interpolate(frame, [0, 12], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: -40,
          height: 1000,
          background: C.tinta,
          transform: `translateY(${-100 + geser * -1100}%)`,
          opacity: frame < 14 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// Teks besar kata demi kata. tema 'merah': teks putih, sorot kuning. tema 'krem': teks tinta, sorot merah.
const Teks: React.FC<{
  tema: Tema;
  kata: string[];
  sorot?: number[];
  ukuran?: number;
  mulai?: number;
  jeda?: number;
}> = ({tema, kata, sorot = [], ukuran = 84, mulai = 4, jeda = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const merah = tema === 'merah';
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '0 50px'}}>
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
              borderRadius: 16,
              background: hi ? (merah ? C.kuning : C.merah) : 'transparent',
              color: hi ? (merah ? C.tinta : 'white') : merah ? 'white' : C.tinta,
              opacity: s,
              transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s}) rotate(${hi ? -2 : 0}deg)`,
              textShadow: !hi && merah ? '0 5px 0 rgba(0,0,0,0.18)' : 'none',
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

// Stiker teks (kuning, bergaris tinta)
const Stiker: React.FC<{teks: string; mulai: number; top: number; rot?: number; ukuran?: number; warna?: string; tulisan?: string}> = ({
  teks,
  mulai,
  top,
  rot = -3,
  ukuran = 54,
  warna = C.kuning,
  tulisan = C.tinta,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 9}});
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '16px 40px',
          borderRadius: 22,
          background: warna,
          color: tulisan,
          border: `6px solid ${C.tinta}`,
          fontSize: ukuran,
          fontWeight: 900,
          boxShadow: `10px 10px 0 ${C.tinta}`,
          opacity: s,
          transform: `scale(${0.4 + 0.6 * s}) rotate(${rot}deg)`,
        }}
      >
        {teks}
      </div>
    </div>
  );
};

const Nomor: React.FC<{n: string; teks: string; tema: Tema}> = ({n, teks, tema}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: Math.max(0, frame - 2), fps, config: {damping: 9}});
  return (
    <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: s, transform: `scale(${0.6 + 0.4 * s})`}}>
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 65,
          background: tema === 'merah' ? C.kuning : C.merah,
          color: tema === 'merah' ? C.tinta : 'white',
          border: `7px solid ${C.tinta}`,
          fontSize: 88,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '116px',
          boxShadow: `8px 8px 0 ${C.tinta}`,
        }}
      >
        {n}
      </div>
      <div style={{fontSize: 70, fontWeight: 900, color: tema === 'merah' ? 'white' : C.tinta}}>{teks}</div>
    </div>
  );
};

const Catatan: React.FC<{tema: Tema}> = ({tema}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontSize: 28, color: tema === 'merah' ? 'rgba(255,255,255,0.75)' : 'rgba(29,11,9,0.55)'}}>
    *Data contoh
  </div>
);

const Progres: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, bottom: 0, height: 12, width: `${(frame / durationInFrames) * 100}%`, background: C.kuning, borderTop: `3px solid ${C.tinta}`}} />
  );
};

const IkonLonceng: React.FC<{ukuran?: number; warna?: string}> = ({ukuran = 40, warna = 'white'}) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 24 24">
    <path d="M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" fill={warna} />
  </svg>
);

/* ------------------------- HP lurus + layar aplikasi ------------------------- */

const DESAIN_W = 656;

const Hp: React.FC<{
  children: React.ReactNode;
  lebar?: number;
  atas?: number;
  kiri?: number;
  getar?: number;
  mulai?: number;
}> = ({children, lebar = 680, atas = 400, kiri, getar = 0, mulai = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame: Math.max(0, frame - mulai), fps, config: {damping: 15}});
  const tinggi = Math.round(lebar * 1.735);
  const skala = (lebar - 24) / DESAIN_W;
  const tinggiDesain = (tinggi - 24) / skala;
  const g = getar > 0 ? Math.sin(frame * 2.4) * 10 * getar : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: (kiri !== undefined ? kiri : (1080 - lebar) / 2) + g,
        top: atas,
        width: lebar,
        height: tinggi,
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * 170}px)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: 64,
          border: `12px solid ${C.tinta}`,
          background: '#f4f7fe',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 40px 90px rgba(29,11,9,0.4)',
        }}
      >
        <div style={{width: DESAIN_W, height: tinggiDesain, position: 'relative', transform: `scale(${skala})`, transformOrigin: 'top left'}}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{judul: string; kanan?: React.ReactNode}> = ({judul, kanan}) => (
  <div style={{height: 104, background: `linear-gradient(135deg, ${C.gelap}, #203a43)`, color: 'white', fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px'}}>
    <span>{judul}</span>
    {kanan}
  </div>
);

const Online: React.FC = () => (
  <span style={{fontSize: 20, padding: '6px 16px', borderRadius: 999, background: C.hijau}}>ONLINE</span>
);

const NavBawah: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, background: 'white', borderTop: '2px solid #e3e8f3', display: 'flex'}}>
    {['Dasbor', 'Kasir', 'Stok'].map((t, i) => (
      <div key={t} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 800, color: i === 1 ? C.biru : '#a0aabf', borderTop: i === 1 ? `6px solid ${C.biru}` : '6px solid transparent'}}>
        {t}
      </div>
    ))}
  </div>
);

const Tombol: React.FC<{teks: string; w: string; tulisan?: string; skala?: number; kecil?: boolean; flex?: number}> = ({
  teks,
  w,
  tulisan = 'white',
  skala = 1,
  kecil,
  flex = 1,
}) => (
  <div style={{flex, minWidth: 0, height: 64, borderRadius: 16, background: w, color: tulisan, fontSize: kecil ? 22 : 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${skala})`, whiteSpace: 'nowrap', padding: '0 10px'}}>
    {teks}
  </div>
);

const PRODUK = [
  {nama: 'Roti Tawar', harga: 14000, w: '#f0a35e', h: 'RT'},
  {nama: 'Mie Goreng Instan', harga: 3500, w: '#e8524a', h: 'MG'},
  {nama: 'Kopi Susu Botol', harga: 15000, w: '#8a5a44', h: 'KS'},
  {nama: 'Air Mineral 600 ml', harga: 4000, w: '#4aa3df', h: 'AM'},
];

const GridProduk: React.FC<{sorot?: string}> = ({sorot = ''}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
    {PRODUK.map((p) => (
      <div key={p.nama} style={{width: 296, boxSizing: 'border-box', background: 'white', borderRadius: 18, overflow: 'hidden', border: `3px solid ${sorot === p.nama ? C.biru : '#f0f0f0'}`}}>
        <div style={{height: 120, background: `linear-gradient(135deg, ${p.w}, ${p.w}aa)`, color: 'white', fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{p.h}</div>
        <div style={{padding: '10px 14px 14px'}}>
          <div style={{fontSize: 22, fontWeight: 800, color: '#2b2b2b'}}>{p.nama}</div>
          <div style={{fontSize: 24, fontWeight: 900, color: C.biru, marginTop: 2}}>Rp {titik(p.harga)}</div>
        </div>
      </div>
    ))}
  </div>
);

// Layar utama pemilik: tombol link toko + lonceng pesanan masuk
const LayarUtama: React.FC<{badge: number; linkTekan?: number; lonceng?: number}> = ({badge, linkTekan = 0, lonceng = 0}) => (
  <div style={{width: '100%', height: '100%', position: 'relative'}}>
    <Header judul="Warung Berkah" kanan={<Online />} />
    <div style={{padding: '20px 24px'}}>
      <div style={{display: 'flex', gap: 14, marginBottom: 20}}>
        <div style={{flex: 1, height: 74, borderRadius: 18, border: `3px solid ${C.biru}`, background: linkTekan > 0 ? C.biru : 'white', color: linkTekan > 0 ? 'white' : C.biru, fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.05 * linkTekan})`}}>
          Salin Link Toko
        </div>
        <div style={{flex: 1, height: 74, borderRadius: 18, background: C.gelap, color: 'white', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${1 + 0.12 * lonceng})`, boxShadow: lonceng > 0 ? '0 0 0 10px rgba(255,210,63,0.6)' : 'none'}}>
          <IkonLonceng ukuran={30} />
          Pesanan Masuk
          {badge > 0 ? (
            <span style={{background: C.bahaya, color: 'white', borderRadius: 14, padding: '2px 12px', fontSize: 22, fontWeight: 900}}>{badge}</span>
          ) : null}
        </div>
      </div>
      <GridProduk />
    </div>
    <NavBawah />
  </div>
);

const KartuPesanan: React.FC<{
  status: 'baru' | 'proses';
  sorot?: string;
  tekan?: string;
}> = ({status, sorot = '', tekan = ''}) => {
  const kotak = (k: string): React.CSSProperties => ({
    outline: sorot === k ? `5px solid ${C.merah}` : '5px solid transparent',
    outlineOffset: 4,
    borderRadius: 10,
  });
  const baru = status === 'baru';
  return (
    <div style={{background: '#f9f9f9', border: `3px solid ${baru ? C.biru : '#eee'}`, borderRadius: 22, padding: 22}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
        <b style={{fontSize: 24}}>#A1B2 · 10:42</b>
        <span style={{background: baru ? C.biru : '#eee', color: baru ? 'white' : '#666', borderRadius: 10, padding: '4px 14px', fontSize: 19, fontWeight: 800}}>
          {baru ? 'BARU' : 'SUDAH DIPROSES'}
        </span>
      </div>
      <div style={{...kotak('nama'), fontSize: 28, fontWeight: 800}}>Bu Sari</div>
      <div style={{fontSize: 21, color: '#555', marginTop: 2}}>WA: 0812-0000-0000</div>
      <div style={{...kotak('alamat'), fontSize: 21, color: '#555', marginTop: 6}}>Jl. Contoh No. 1</div>
      <div style={{...kotak('catatan'), fontSize: 21, color: '#555', marginTop: 6}}>Catatan: Antar sore ya</div>
      <div style={{...kotak('barang'), borderTop: '2px dashed #ddd', marginTop: 14, paddingTop: 10}}>
        {[
          ['2x Kopi Susu Botol', 30000],
          ['1x Roti Tawar', 14000],
        ].map(([n, h]) => (
          <div key={String(n)} style={{display: 'flex', justifyContent: 'space-between', fontSize: 23, marginTop: 4}}>
            <span>{n}</span>
            <span>Rp {titik(Number(h))}</span>
          </div>
        ))}
      </div>
      <div style={{...kotak('total'), display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: 900, marginTop: 12}}>
        <span>Total (belum ongkir)</span>
        <span>Rp 44.000</span>
      </div>
      <div style={{display: 'flex', gap: 10, marginTop: 18}}>
        <div style={{flex: 1.5, height: 62, borderRadius: 14, background: C.biru, color: 'white', fontSize: baru ? 26 : 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekan === 'proses' ? 0.93 : 1})`, textAlign: 'center'}}>
          {baru ? 'Proses' : 'Muat Ulang ke Kasir'}
        </div>
        <div style={{flex: 1, height: 62, borderRadius: 14, background: '#e8f7ee', color: '#128C7E', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekan === 'wa' ? 0.93 : 1})`}}>Chat WA</div>
        <div style={{flex: 1, height: 62, borderRadius: 14, background: '#f0f4ff', color: C.biru, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekan === 'peta' ? 0.93 : 1})`}}>Peta</div>
        <div style={{flex: 1, height: 62, borderRadius: 14, background: '#ffebee', color: '#d32f2f', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Batal</div>
      </div>
    </div>
  );
};

// Bottom sheet "Pesanan Masuk"
const SheetPesanan: React.FC<{buka: number; children: React.ReactNode}> = ({buka, children}) => (
  <div style={{position: 'absolute', inset: 0, background: `rgba(15,32,39,${0.5 * buka})`, visibility: buka > 0.01 ? 'visible' : 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 150, background: 'white', borderRadius: '34px 34px 0 0', padding: '26px 26px', transform: `translateY(${(1 - buka) * 900}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 900, color: C.gelap, marginBottom: 8}}>
        <IkonLonceng ukuran={34} warna={C.gelap} />
        Pesanan Masuk
      </div>
      <div style={{fontSize: 19, color: C.abu, marginBottom: 14, lineHeight: 1.3}}>
        Pesanan dari katalog online. Ketuk Proses untuk mengisi keranjang kasir, tambahkan ongkir bila perlu, lalu bayar seperti biasa.
      </div>
      <div style={{transform: 'scale(1.12)', transformOrigin: 'top left', width: `${100 / 1.12}%`}}>{children}</div>
    </div>
  </div>
);

const Dialog: React.FC<{opa: number; judul: string; pesan: string; hijau?: boolean}> = ({opa, judul, pesan, hijau}) => (
  <div style={{position: 'absolute', inset: 0, background: `rgba(15,32,39,${0.6 * opa})`, display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: opa > 0.01 ? 'visible' : 'hidden'}}>
    <div style={{width: 540, background: 'white', borderRadius: 32, padding: '34px 30px 28px', textAlign: 'center', opacity: opa, transform: `scale(${0.8 + 0.2 * opa})`}}>
      <div style={{width: 80, height: 80, borderRadius: 40, background: hijau ? C.hijau : C.kuning, color: hijau ? 'white' : C.tinta, fontSize: 50, fontWeight: 900, lineHeight: '80px', margin: '0 auto 16px'}}>{hijau ? (
          <svg width="46" height="46" viewBox="0 0 100 100" style={{marginTop: 17}}>
            <path d="M24 52 L44 72 L78 30" stroke="white" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ) : (
          '!'
        )}</div>
      <div style={{fontSize: 34, fontWeight: 900, color: C.gelap}}>{judul}</div>
      <div style={{fontSize: 24, color: '#6b7a99', marginTop: 12, lineHeight: 1.35}}>{pesan}</div>
      <div style={{marginTop: 22, padding: '14px 0', borderRadius: 16, background: C.biru, color: 'white', fontSize: 26, fontWeight: 800}}>OK</div>
    </div>
  </div>
);

/* ================= ADEGAN 1: HOOK ================= */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ting = spring({frame: frame - 4, fps, config: {damping: 7}});
  const kartu = spring({frame: frame - 14, fps, config: {damping: 11}});
  const goyang = Math.sin(frame * 1.6) * 10 * interpolate(frame, [14, 60], [1, 0], clamp);
  return (
    <Latar tema="merah">
      <div style={{...posisi(230), textAlign: 'center', fontSize: 270, fontWeight: 900, color: 'white', transform: `scale(${ting}) rotate(-5deg)`, textShadow: `12px 12px 0 ${C.tinta}`}}>
        TING!
      </div>
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 110,
          width: 860,
          boxSizing: 'border-box',
          padding: '30px 36px',
          background: 'white',
          borderRadius: 34,
          border: `6px solid ${C.tinta}`,
          boxShadow: `12px 12px 0 ${C.tinta}`,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          opacity: kartu,
          transform: `translateY(${(1 - kartu) * -200}px)`,
        }}
      >
        <div style={{transform: `rotate(${goyang}deg)`, background: C.merah, borderRadius: 24, padding: 18}}>
          <IkonLonceng ukuran={84} />
        </div>
        <div>
          <div style={{fontSize: 54, fontWeight: 900, color: C.tinta}}>Pesanan Masuk</div>
          <div style={{fontSize: 38, fontWeight: 700, color: '#6b5a55', marginTop: 4}}>Bu Sari pesan 3 barang</div>
        </div>
      </div>
      <Stiker teks="Terus ngapain?" mulai={44} top={1000} />
      <Stiker teks="Gampang, 4 langkah!" mulai={74} top={1190} rot={2} warna="white" />
      <div style={{position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 36}}>
        {['1', '2', '3', '4'].map((n, i) => {
          const s = spring({frame: Math.max(0, frame - (86 + i * 7)), fps, config: {damping: 8}});
          return (
            <div key={n} style={{width: 120, height: 120, borderRadius: 60, background: C.kuning, border: `6px solid ${C.tinta}`, fontSize: 76, fontWeight: 900, textAlign: 'center', lineHeight: '106px', color: C.tinta, boxShadow: `6px 6px 0 ${C.tinta}`, transform: `scale(${s})`, opacity: s}}>
              {n}
            </div>
          );
        })}
      </div>
    </Latar>
  );
};

/* ================= ADEGAN 2: BAGIKAN LINK TOKO ================= */

const Link: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const linkTekan = frame >= 20 && frame < 32 ? 1 : 0;
  const dialog = interpolate(frame, [34, 44, 86, 96], [0, 1, 1, 0], clamp);
  const terbang = interpolate(frame, [92, 128], [0, 1], clamp);
  const pesan = spring({frame: frame - 140, fps, config: {damping: 10}});
  const tekanPesan = frame >= 150 && frame < 160 ? 0.93 : 1;
  return (
    <Latar tema="krem">
      <Nomor n="1" teks="Bagikan link toko" tema="krem" />
      <div style={{position: 'absolute', top: 290, left: 60, width: 440, textAlign: 'center', fontSize: 40, fontWeight: 900, color: C.tinta}}>HP kamu</div>
      <div style={{position: 'absolute', top: 290, left: 580, width: 440, textAlign: 'center', fontSize: 40, fontWeight: 900, color: C.merah}}>HP pelanggan</div>
      <Hp lebar={440} kiri={60} atas={360}>
        <LayarUtama badge={0} linkTekan={linkTekan} />
        <Dialog opa={dialog} judul="Tersalin!" pesan="Link toko berhasil disalin. Bagikan ke pelanggan Anda." hijau />
      </Hp>
      <Hp lebar={440} kiri={580} atas={360} mulai={80}>
        <div style={{width: '100%', height: '100%'}}>
          <Header judul="Warung Berkah" />
          <div style={{padding: 22}}>
            <div style={{fontSize: 26, fontWeight: 900, color: C.gelap, marginBottom: 14}}>Katalog</div>
            <GridProduk sorot="Kopi Susu Botol" />
          </div>
          <div style={{position: 'absolute', left: 22, right: 22, bottom: 26, height: 84, borderRadius: 22, background: C.biru, color: 'white', fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pesan, transform: `scale(${tekanPesan})`}}>
            Pesan (3 item)
          </div>
        </div>
      </Hp>
      <div
        style={{
          position: 'absolute',
          left: 440 + terbang * 200,
          top: 900 - Math.sin(terbang * Math.PI) * 160,
          padding: '16px 30px',
          borderRadius: 999,
          background: C.hijau,
          color: 'white',
          fontSize: 40,
          fontWeight: 900,
          border: `5px solid ${C.tinta}`,
          boxShadow: `6px 6px 0 ${C.tinta}`,
          opacity: terbang > 0 && terbang < 1 ? 1 : 0,
        }}
      >
        link toko
      </div>
      <Stiker teks="Tinggal pilih, terus pesan" mulai={150} top={1480} rot={-2} />
      <Catatan tema="krem" />
    </Latar>
  );
};

/* ================= ADEGAN 3: PESANAN MASUK ================= */

const Masuk: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = frame >= 60 ? 1 : 0;
  const lonceng = interpolate(frame, [60, 70, 84], [0, 1, 0], clamp);
  const getar = frame >= 60 && frame < 100 ? 1 : 0;
  return (
    <Latar tema="merah">
      <Nomor n="2" teks="Pesanan masuk" tema="merah" />
      <Hp getar={getar} atas={290}>
        <LayarUtama badge={badge} lonceng={lonceng} />
      </Hp>
      {frame >= 60 && frame < 104 ? (
        <>
          <div style={{position: 'absolute', left: 90, top: 600, fontSize: 70, fontWeight: 900, color: C.kuning, transform: 'rotate(-12deg)'}}>bzzt</div>
          <div style={{position: 'absolute', right: 90, top: 700, fontSize: 70, fontWeight: 900, color: C.kuning, transform: 'rotate(10deg)'}}>bzzt</div>
        </>
      ) : null}
      <Stiker teks="Angka di sini nambah" mulai={64} top={1560} rot={-2} />
      <Stiker teks="Aplikasi kebuka? HP bergetar" mulai={120} top={1730} rot={2} warna="white" ukuran={42} />
    </Latar>
  );
};

/* ================= ADEGAN 4: BACA PESANAN ================= */

const Baca: React.FC = () => {
  const frame = useCurrentFrame();
  const buka = ease(interpolate(frame, [6, 30], [0, 1], clamp));
  const urut = [
    {k: 'nama', dari: 60, t: 'Siapa yang pesan'},
    {k: 'alamat', dari: 90, t: 'Alamatnya'},
    {k: 'catatan', dari: 120, t: 'Catatannya'},
    {k: 'barang', dari: 150, t: 'Barang apa aja'},
    {k: 'total', dari: 195, t: 'Totalnya'},
  ];
  const aktif = [...urut].reverse().find((u) => frame >= u.dari);
  return (
    <Latar tema="krem">
      <Nomor n="2" teks="Buka & baca" tema="krem" />
      <Hp atas={290}>
        <LayarUtama badge={1} />
        <SheetPesanan buka={buka}>
          <KartuPesanan status="baru" sorot={aktif && frame < 245 ? aktif.k : ''} />
        </SheetPesanan>
      </Hp>
      {aktif && frame < 245 ? <Stiker key={aktif.k} teks={aktif.t} mulai={aktif.dari} top={1560} /> : null}
      {frame >= 245 ? <Stiker teks="Semua lengkap, nggak perlu nanya" mulai={245} top={1560} ukuran={46} warna={C.merah} tulisan="white" /> : null}
      <Catatan tema="krem" />
    </Latar>
  );
};

/* ================= ADEGAN 5: PROSES ================= */

const KeranjangBar: React.FC<{bump: number}> = ({bump}) => (
  <div style={{position: 'absolute', left: 24, right: 24, bottom: 116, height: 96, borderRadius: 26, background: C.gelap, color: 'white', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: `scale(${1 + 0.06 * bump})`}}>
    <div>
      <div style={{fontSize: 34, fontWeight: 900}}>Rp 44.000</div>
      <div style={{fontSize: 20, opacity: 0.8}}>3 Item Ditambahkan</div>
    </div>
    <div style={{background: 'white', color: C.gelap, padding: '12px 26px', borderRadius: 14, fontSize: 24, fontWeight: 900}}>Bayar &gt;</div>
  </div>
);

const Proses: React.FC = () => {
  const frame = useCurrentFrame();
  const tekan = frame >= 26 && frame < 36 ? 'proses' : '';
  const dialog = interpolate(frame, [40, 52, 140, 152], [0, 1, 1, 0], clamp);
  const kasir = frame >= 154;
  const bump = interpolate(frame, [160, 170, 182], [0, 1, 0], clamp);
  return (
    <Latar tema="merah">
      <Nomor n="3" teks="Ketuk Proses" tema="merah" />
      <Hp atas={290}>
        {kasir ? (
          <div style={{width: '100%', height: '100%', position: 'relative'}}>
            <Header judul="Warung Berkah" kanan={<Online />} />
            <div style={{padding: 22}}>
              <GridProduk sorot="Kopi Susu Botol" />
            </div>
            <KeranjangBar bump={bump} />
            <NavBawah />
          </div>
        ) : (
          <>
            <LayarUtama badge={1} />
            <SheetPesanan buka={1}>
              <KartuPesanan status="baru" tekan={tekan} />
            </SheetPesanan>
          </>
        )}
        <Dialog opa={dialog} judul="Pesanan Dimuat" pesan={'Pesanan Bu Sari sudah dimuat ke keranjang.\nTambahkan Ongkir bila perlu, lalu tekan Bayar.'} hijau />
      </Hp>
      {frame >= 60 && frame < 150 ? <Stiker teks="Ongkir? Tambahin aja" mulai={60} top={1560} /> : null}
      {frame >= 160 ? <Stiker teks="Langsung masuk keranjang!" mulai={160} top={1560} /> : null}
    </Latar>
  );
};

/* ================= ADEGAN 6: CHAT WA DAN PETA ================= */

const ChatWa: React.FC<{opa: number}> = ({opa}) => (
  <div style={{position: 'absolute', inset: 0, background: '#efe7dd', opacity: opa, visibility: opa > 0.01 ? 'visible' : 'hidden'}}>
    <div style={{height: 104, background: '#075e54', color: 'white', fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 18}}>
      <div style={{width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(135deg,#0061ff,#60efff)', textAlign: 'center', lineHeight: '56px', fontSize: 24}}>BS</div>
      Bu Sari
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, background: '#f0f0f0', display: 'flex', alignItems: 'center', padding: '0 24px'}}>
      <div style={{flex: 1, height: 64, borderRadius: 32, background: 'white', fontSize: 24, color: '#9aa', display: 'flex', alignItems: 'center', padding: '0 26px'}}>Ketik pesan</div>
    </div>
  </div>
);

const PetaLokasi: React.FC<{buka: number}> = ({buka}) => {
  const frame = useCurrentFrame();
  const denyut = 1 + Math.sin(frame / 5) * 0.08;
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(15,32,39,${0.5 * buka})`, visibility: buka > 0.01 ? 'visible' : 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 260, background: 'white', borderRadius: '34px 34px 0 0', padding: '26px', transform: `translateY(${(1 - buka) * 800}px)`}}>
        <div style={{fontSize: 32, fontWeight: 900, color: C.gelap, marginBottom: 6}}>Lokasi Pelanggan</div>
        <div style={{fontSize: 19, color: C.abu, marginBottom: 14}}>Lokasi Bu Sari (-6.2000, 106.8000).</div>
        <div style={{height: 300, borderRadius: 22, background: '#dfe9e3', position: 'relative', overflow: 'hidden', marginBottom: 16}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 26, background: 'white', transform: 'rotate(-8deg)'}} />
          <div style={{position: 'absolute', left: 200, top: 0, bottom: 0, width: 26, background: 'white', transform: 'rotate(12deg)'}} />
          <div style={{position: 'absolute', left: 60, top: 40, width: 120, height: 70, background: '#c9dccf', borderRadius: 10}} />
          <div style={{position: 'absolute', left: 360, top: 170, width: 160, height: 90, background: '#c9dccf', borderRadius: 10}} />
          <svg width="70" height="90" viewBox="0 0 24 30" style={{position: 'absolute', left: 250, top: 70, transform: `scale(${denyut})`, transformOrigin: 'bottom center'}}>
            <path d="M12 0C6 0 2 4.5 2 10c0 7 10 18 10 18s10-11 10-18C22 4.5 18 0 12 0z" fill={C.merah} />
            <circle cx="12" cy="10" r="4" fill="white" />
          </svg>
        </div>
        <div style={{display: 'grid', gap: 12}}>
          <Tombol teks="Buka di Google Maps" w={C.biru} />
          <Tombol teks="Salin Koordinat" w="#f0f4ff" tulisan={C.biru} />
          <Tombol teks="Buka Peta Web (di dalam aplikasi)" w="#f5f5f5" tulisan="#555" kecil />
        </div>
      </div>
    </div>
  );
};

const WaPeta: React.FC = () => {
  const frame = useCurrentFrame();
  const sheet = ease(interpolate(frame, [4, 24], [0, 1], clamp));
  const tekan = frame >= 38 && frame < 48 ? 'wa' : frame >= 128 && frame < 138 ? 'peta' : '';
  const wa = interpolate(frame, [50, 62, 108, 120], [0, 1, 1, 0], clamp);
  const peta = ease(interpolate(frame, [142, 166], [0, 1], clamp));
  return (
    <Latar tema="krem">
      <Nomor n="3" teks="Konfirmasi & cek lokasi" tema="krem" />
      <Hp atas={290}>
        <LayarUtama badge={1} />
        <SheetPesanan buka={sheet}>
          <KartuPesanan status="baru" tekan={tekan} />
        </SheetPesanan>
        <ChatWa opa={wa} />
        <PetaLokasi buka={peta} />
      </Hp>
      {frame >= 50 && frame < 124 ? <Stiker teks="Chat WA: langsung kebuka" mulai={50} top={1560} /> : null}
      {frame >= 150 ? <Stiker teks="Peta: lokasi pelanggan" mulai={150} top={1560} rot={2} warna={C.merah} tulisan="white" /> : null}
      <Catatan tema="krem" />
    </Latar>
  );
};

/* ================= ADEGAN 7: BAYAR DAN STRUK ================= */

const Bayar: React.FC = () => {
  const frame = useCurrentFrame();
  const kembali = interpolate(frame, [50, 78], [0, 56000], clamp);
  const pilih = frame >= 44;
  const tekanSelesai = frame >= 108 && frame < 118 ? 0.95 : 1;
  const struk = ease(interpolate(frame, [130, 154], [0, 1], clamp));
  const a = 1;
  return (
    <Latar tema="merah">
      <Nomor n="4" teks="Bayar & kirim struk" tema="merah" />
      <Hp atas={290}>
        <div style={{position: 'absolute', inset: 0, opacity: a, visibility: a > 0.01 ? 'visible' : 'hidden', background: '#f4f7fe'}}>
          <Header judul="Pembayaran" />
          <div style={{padding: '24px 28px'}}>
            <div style={{textAlign: 'center', fontSize: 26, color: C.abu, fontWeight: 700}}>Total Tagihan</div>
            <div style={{textAlign: 'center', fontSize: 66, fontWeight: 900, color: C.gelap, marginBottom: 20}}>Rp 44.000</div>
            <div style={{display: 'flex', gap: 14, marginBottom: 20}}>
              <Tombol teks="Bayar Tunai" w={C.biru} />
              <Tombol teks="Bayar via QRIS" w="white" tulisan={C.abu} />
            </div>
            <div style={{fontSize: 22, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>Uang Diterima</div>
            <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
              {['Uang Pas', '50.000', '100.000'].map((u) => (
                <div key={u} style={{flex: 1, padding: '14px 0', textAlign: 'center', borderRadius: 14, fontSize: 25, fontWeight: 800, background: pilih && u === '100.000' ? C.biru : 'white', color: pilih && u === '100.000' ? 'white' : '#6b7a99', border: '2px solid #e3e8f3'}}>{u}</div>
              ))}
            </div>
            <div style={{borderRadius: 22, padding: '22px 26px', background: '#e8faf6', border: `2px solid ${C.hijau}`, opacity: pilih ? 1 : 0.25}}>
              <div style={{fontSize: 24, fontWeight: 700, color: '#2b7a6f'}}>Kembalian</div>
              <div style={{fontSize: 56, fontWeight: 900, color: C.hijau}}>Rp {titik(kembali)}</div>
            </div>
            <div style={{marginTop: 22, height: 84, borderRadius: 22, background: C.gelap, color: 'white', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tekanSelesai})`}}>
              Selesaikan &amp; Struk
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', inset: 0, background: `rgba(15,32,39,${0.55 * struk})`, visibility: struk > 0.01 ? 'visible' : 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: 'white', borderRadius: '34px 34px 0 0', padding: '30px 28px 36px', transform: `translateY(${(1 - struk) * 700}px)`}}>
            <div style={{fontSize: 34, fontWeight: 900, color: C.gelap, textAlign: 'center', marginBottom: 6}}>Pembayaran Berhasil</div>
            <div style={{fontSize: 22, color: C.abu, textAlign: 'center', marginBottom: 20}}>Struk Bu Sari: Rp 44.000</div>
            <div style={{display: 'grid', gap: 14}}>
              <Tombol teks="Cetak Bluetooth" w={C.gelap} />
              <Tombol teks="Bagikan Gambar Struk" w="#25d366" />
              <Tombol teks="Simpan ke Galeri" w="#eef2f9" tulisan="#6b7a99" />
            </div>
          </div>
        </div>
      </Hp>
      {frame < 126 ? <Stiker teks="Tunai atau QRIS, kayak biasa" mulai={20} top={1560} /> : <Stiker teks="Struk: cetak, kirim, atau simpan" mulai={140} top={1560} ukuran={46} />}
    </Latar>
  );
};

/* ================= ADEGAN 8: SUDAH DIPROSES ================= */

const Tanda: React.FC = () => {
  const frame = useCurrentFrame();
  const status = frame >= 24 ? 'proses' : 'baru';
  return (
    <Latar tema="krem">
      <Hp atas={260}>
        <LayarUtama badge={0} />
        <SheetPesanan buka={1}>
          <KartuPesanan status={status} />
        </SheetPesanan>
      </Hp>
      <Stiker teks="Ditandai. Nggak ada yang kelewat!" mulai={26} top={1520} ukuran={50} warna={C.merah} tulisan="white" />
      <Catatan tema="krem" />
    </Latar>
  );
};

/* ================= ADEGAN 9: AJAKAN ================= */

const Ajakan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 2, fps, config: {damping: 9}});
  const pil = spring({frame: frame - 36, fps, config: {damping: 8}});
  return (
    <Latar tema="merah">
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
          border: `8px solid ${C.tinta}`,
          boxShadow: `14px 14px 0 ${C.tinta}`,
          transform: `scale(${logo}) rotate(${(1 - logo) * -18}deg)`,
        }}
      >
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={posisi(740)}>
        <Teks tema="merah" kata={['Terima', 'pesanan', 'jadi', 'gampang']} sorot={[3]} ukuran={96} mulai={6} jeda={4} />
      </div>
      <div style={{...posisi(1080), textAlign: 'center', fontSize: 52, fontWeight: 800, color: 'white'}}>Kasir &amp; Katalog UMKM</div>
      <div
        style={{
          position: 'absolute',
          top: 1230,
          left: 190,
          width: 700,
          height: 140,
          borderRadius: 70,
          background: C.kuning,
          color: C.tinta,
          border: `7px solid ${C.tinta}`,
          boxShadow: `10px 10px 0 ${C.tinta}`,
          fontSize: 56,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '126px',
          boxSizing: 'border-box',
          transform: `scale(${pil})`,
        }}
      >
        Unduh di Play Store
      </div>
    </Latar>
  );
};

/* ================= RANGKAIAN ================= */

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.merah}}>
    <Adegan dari={DARI[0]} durasi={D[0]}><Hook /></Adegan>
    <Adegan dari={DARI[1]} durasi={D[1]}><Link /></Adegan>
    <Adegan dari={DARI[2]} durasi={D[2]}><Masuk /></Adegan>
    <Adegan dari={DARI[3]} durasi={D[3]}><Baca /></Adegan>
    <Adegan dari={DARI[4]} durasi={D[4]}><Proses /></Adegan>
    <Adegan dari={DARI[5]} durasi={D[5]}><WaPeta /></Adegan>
    <Adegan dari={DARI[6]} durasi={D[6]}><Bayar /></Adegan>
    <Adegan dari={DARI[7]} durasi={D[7]}><Tanda /></Adegan>
    <Adegan dari={DARI[8]} durasi={D[8]}><Ajakan /></Adegan>
    <Progres />
  </AbsoluteFill>
);
