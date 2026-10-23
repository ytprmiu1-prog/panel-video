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
import {StokHabis, stokHabisDefaultProps} from './StokHabis';
import type {Chat} from './StokHabis';

export type PromoProps = {alamat: string};
export const promoDefaultProps: PromoProps = {alamat: 'nuyapay.my.id'};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BG = 'radial-gradient(circle at 50% 30%, #1a1d2b 0%, #07080d 75%)';
const NEON = '#d7ff3a';

// Durasi tiap adegan (frame, 30 fps)
const D = [210, 150, 120, 180, 150, 150, 120, 150, 120, 150];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_PROMO = D.reduce((a, b) => a + b, 0);

const ketik = (teks: string, frame: number, mulai: number, laju = 2) =>
  teks.slice(0, Math.max(0, Math.floor((frame - mulai) / laju)));

/* ---------- Pembungkus adegan ---------- */

const Pudar: React.FC<{tanpaMasuk?: boolean; children: React.ReactNode}> = ({
  tanpaMasuk,
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const awal = tanpaMasuk ? 1 : 0;
  const o = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [awal, 1, 1, 0],
    clamp
  );
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Adegan: React.FC<{i: number; tanpaMasuk?: boolean; children: React.ReactNode}> = ({
  i,
  tanpaMasuk,
  children,
}) => (
  <Sequence from={DARI[i]} durationInFrames={D[i]}>
    <Pudar tanpaMasuk={tanpaMasuk}>{children}</Pudar>
  </Sequence>
);

const Latar: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: BG, fontFamily: 'sans-serif', alignItems: 'center'}}>
    {children}
  </AbsoluteFill>
);

/* ---------- Teks narasi di bawah ---------- */

const Teks: React.FC<{
  kata: string[];
  sorot?: number[];
  mulai?: number;
  sampai?: number;
  ukuran?: number;
}> = ({kata, sorot = [], mulai = 6, sampai, ukuran = 78}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (sampai !== undefined && frame > sampai) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 190,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '14px 18px',
        padding: '0 60px',
      }}
    >
      {kata.map((k, i) => {
        const s = spring({frame: frame - (mulai + i * 6), fps, config: {damping: 12}});
        const hi = sorot.includes(i);
        return (
          <span
            key={i}
            style={{
              fontSize: ukuran,
              fontWeight: 900,
              padding: '0 22px',
              borderRadius: 18,
              background: hi ? NEON : 'transparent',
              color: hi ? '#111827' : 'white',
              textShadow: hi ? 'none' : '0 4px 24px rgba(0,0,0,0.8)',
              opacity: s,
              transform: `scale(${0.6 + 0.4 * s})`,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Bingkai HP + label ---------- */

const Hp: React.FC<{
  src: string;
  rasio: number;
  lebar?: number;
  children?: React.ReactNode;
}> = ({src, rasio, lebar = 640, children}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const masuk = spring({frame, fps, config: {damping: 14}});
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05], clamp);
  const tinggi = Math.round(lebar * rasio);
  const atas = Math.max(100, 110 + (1290 - tinggi) / 2);
  return (
    <div
      style={{
        position: 'absolute',
        top: atas,
        left: (1080 - lebar) / 2,
        width: lebar,
        height: tinggi,
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * 160}px) scale(${zoom})`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          borderRadius: 52,
          overflow: 'hidden',
          border: '10px solid #1f2430',
          background: '#fff',
          boxShadow: '0 0 120px rgba(80,120,255,0.25), 0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
        />
      </div>
      {children}
    </div>
  );
};

const Label: React.FC<{
  teks: string;
  x: number;
  y: number;
  kapan: number;
  warna?: 'neon' | 'merah' | 'putih';
}> = ({teks, x, y, kapan, warna = 'putih'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - kapan, fps, config: {damping: 11}});
  const gaya: Record<string, React.CSSProperties> = {
    neon: {background: NEON, color: '#111827'},
    putih: {background: 'white', color: '#111827'},
    merah: {background: 'rgba(30,8,8,0.92)', color: '#ef4444', border: '4px solid #ef4444'},
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${s})`,
        opacity: s,
        whiteSpace: 'nowrap',
        fontSize: 46,
        fontWeight: 800,
        padding: '10px 30px',
        borderRadius: 999,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        ...gaya[warna],
      }}
    >
      {teks}
    </div>
  );
};

/* ---------- Adegan 1: hook (pakai StokHabis) ---------- */

const chatPromo: Chat[] = [
  {inisial: 'BS', nama: 'Bu Sari', pesan: 'Es teller besar', jam: '', warna: '#8a5a44'},
  {inisial: 'PJ', nama: 'Pak Joko', pesan: 'Ayam bakar ready?', jam: '08.04', warna: '#3f6b66'},
  {inisial: 'MR', nama: 'Mbak Rina', pesan: 'Nasi 3 bungkus', jam: '08.05', warna: '#7a3b5a'},
  {inisial: 'KA', nama: 'Kak Ayu', pesan: 'Bisa antar sore?', jam: '08.06', warna: '#3d6a45'},
  {inisial: 'PB', nama: 'Pak Budi', pesan: 'Sate satean 20 tusuk', jam: '08.07', warna: '#5a4a2e'},
];

/* ---------- Adegan 2: balas chat, orderan kelewat ---------- */

const Balas: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panel = spring({frame, fps, config: {damping: 14}});
  const tag = spring({frame: frame - 18, fps, config: {damping: 9}});
  const balasan = ketik('Maaf kak, stok habis. Mau diganti es teh manis?', frame, 25);
  const caret = frame % 16 < 8 ? '|' : '';
  const baris = [
    {n: 'Pak Joko', p: 'Ayam bakar ready?', t: '12 mnt'},
    {n: 'Mbak Rina', p: 'Nasi 3 bungkus', t: ''},
    {n: 'Kak Ayu', p: 'Bisa antar sore?', t: '20 mnt'},
  ];
  const pil = spring({frame: frame - 95, fps, config: {damping: 9}});
  return (
    <Latar>
      <div
        style={{
          width: 900,
          marginTop: 190,
          opacity: panel,
          transform: `translateY(${(1 - panel) * 80}px)`,
        }}
      >
        <div style={{background: 'rgba(255,255,255,0.08)', borderRadius: 36, padding: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                background: '#8a5a44',
                color: 'white',
                fontSize: 32,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              BS
            </div>
            <div style={{fontSize: 44, fontWeight: 800, color: 'white', flex: 1}}>Bu Sari</div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#ef4444',
                border: '5px solid #ef4444',
                borderRadius: 10,
                padding: '2px 16px',
                transform: `scale(${tag}) rotate(-4deg)`,
                opacity: tag,
              }}
            >
              HABIS
            </div>
          </div>
          <div
            style={{
              marginTop: 28,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: '24px 30px',
              fontSize: 48,
              fontWeight: 700,
              color: 'white',
            }}
          >
            Es teller besar masih ada?
          </div>
          <div
            style={{
              marginTop: 28,
              minHeight: 190,
              background: 'rgba(0,0,0,0.45)',
              border: '2px solid rgba(255,255,255,0.18)',
              borderRadius: 24,
              padding: '24px 30px',
              fontSize: 48,
              fontFamily: 'monospace',
              color: 'white',
              lineHeight: 1.3,
            }}
          >
            {balasan}
            {caret}
          </div>
        </div>

        <div style={{fontSize: 30, letterSpacing: 6, color: 'rgba(255,255,255,0.45)', margin: '44px 0 18px 12px'}}>
          CHAT LAIN
        </div>
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 16}}>
          {baris.map((b, i) => {
            const s = spring({frame: frame - (50 + i * 10), fps, config: {damping: 14}});
            return (
              <div
                key={i}
                style={{
                  height: 112,
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 32px',
                  opacity: s,
                  transform: `translateY(${(1 - s) * 40}px)`,
                }}
              >
                <div>
                  <div style={{fontSize: 28, color: 'rgba(255,255,255,0.5)', fontWeight: 600}}>{b.n}</div>
                  <div style={{fontSize: 40, color: 'white', fontWeight: 800}}>{b.p}</div>
                </div>
                {b.t ? (
                  <div style={{fontSize: 34, color: '#ef4444', fontWeight: 800}}>{b.t}</div>
                ) : null}
              </div>
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 184,
              transform: `translate(-50%, -50%) scale(${pil})`,
              opacity: pil,
              whiteSpace: 'nowrap',
              fontSize: 46,
              fontWeight: 800,
              color: '#ef4444',
              background: 'rgba(30,8,8,0.95)',
              border: '4px solid #ef4444',
              borderRadius: 999,
              padding: '10px 36px',
            }}
          >
            orderan kelewat
          </div>
        </div>
      </div>
      <Teks kata={['Sibuk', 'balas', 'chat,', 'orderan', 'kelewat']} sorot={[4]} mulai={10} />
    </Latar>
  );
};

/* ---------- Karakter pemilik warung (gambar public/karakter.jpg) ---------- */

const MATA = [
  {x: 39.0, y: 31.4, w: 8.7, h: 3.6, kulit: '160,106,78'},
  {x: 52.7, y: 32.5, w: 8.2, h: 3.6, kulit: '200,143,108'},
];

const Karakter: React.FC<{top: number; tinggi: number; teks: string}> = ({top, tinggi, teks}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const masuk = spring({frame: frame - 6, fps, config: {damping: 8, mass: 0.9}});
  const bubble = spring({frame: frame - 26, fps, config: {damping: 8}});
  const lebar = Math.round(tinggi * 0.85);
  const W = lebar * 2;
  const H = (W * 2576) / 1717;
  const mulaiBicara = 34;
  const bicara = frame >= mulaiBicara && frame < mulaiBicara + teks.length * 2 + 6;
  const diketik = teks.slice(0, Math.max(0, Math.floor((frame - mulaiBicara) / 2)));
  const sisa = teks.slice(diketik.length);
  const t = (frame + 22) % 90;
  const kedip = t < 8 ? Math.sin((Math.PI * t) / 8) : 0;
  const napas = 1 + Math.sin(frame / 20) * 0.012;
  const miring = Math.sin(frame / 26) * 1.6 + (bicara ? Math.sin(frame / 3.2) * 0.9 : 0);
  const loncat = bicara ? -Math.abs(Math.sin(frame / 4.5)) * 7 : 0;
  const bumbu = [0, 1, 2, 3, 4].map((k) => {
    const fase = (frame - 70 + k * 26) % 130;
    const aktif = frame > 70 && fase >= 0;
    const naik = fase * 1.7;
    return {
      k,
      aktif,
      x: lebar * (0.12 + 0.19 * k),
      y: naik,
      o: aktif ? Math.max(0, 1 - fase / 120) : 0,
    };
  });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top,
          left: 70,
          width: lebar,
          height: tinggi,
          borderRadius: 56,
          overflow: 'hidden',
          border: `6px solid ${NEON}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          opacity: Math.min(1, masuk * 1.4),
          transform: `translateX(${(1 - masuk) * -520}px) translateY(${loncat}px) rotate(${miring * 0.6}deg)`,
          transformOrigin: '50% 100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: W,
            height: H,
            left: lebar / 2 - 0.46 * W,
            top: tinggi * 0.4 - 0.32 * H,
            transform: `scale(${napas}) rotate(${miring}deg)`,
            transformOrigin: '46% 70%',
          }}
        >
          <Img src={staticFile('karakter.jpg')} style={{width: '100%', height: '100%', display: 'block'}} />
          {MATA.map((m, i) => (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: `${m.x - m.w / 2}%`,
                  top: `${m.y - m.h / 2}%`,
                  width: `${m.w}%`,
                  height: `${m.h}%`,
                  background: `radial-gradient(ellipse at center, rgba(${m.kulit},1) 55%, rgba(${m.kulit},0) 100%)`,
                  opacity: kedip > 0 ? 1 : 0,
                  transform: `scaleY(${kedip})`,
                  transformOrigin: '50% 0%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${m.x - m.w * 0.42}%`,
                  top: `${m.y - m.h * 0.2 + m.h * 0.7 * kedip - m.h * 0.35}%`,
                  width: `${m.w * 0.84}%`,
                  height: `${m.h * 0.3}%`,
                  borderBottom: '3px solid rgb(50,30,25)',
                  borderRadius: '0 0 50% 50%',
                  opacity: kedip > 0.6 ? 1 : 0,
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
      {bumbu.map((b) =>
        b.aktif ? (
          <div
            key={b.k}
            style={{
              position: 'absolute',
              left: 70 + b.x,
              top: top + tinggi * 0.35 - b.y,
              width: 34,
              height: 34,
              opacity: b.o,
              background:
                b.k % 2 === 0
                  ? 'radial-gradient(circle at 35% 30%, #fff3b0, #f5af19 60%, #c98a00)'
                  : '#ffffff',
              borderRadius: b.k % 2 === 0 ? 17 : 0,
              clipPath:
                b.k % 2 === 0
                  ? 'none'
                  : 'polygon(50% 0%, 61% 38%, 100% 50%, 61% 62%, 50% 100%, 39% 62%, 0% 50%, 39% 38%)',
              transform: `rotate(${b.y * 2}deg)`,
            }}
          />
        ) : null
      )}
      <div
        style={{
          position: 'absolute',
          top: top + tinggi * 0.1,
          left: 70 + lebar + 36,
          width: 1080 - (70 + lebar + 36) - 60,
          boxSizing: 'border-box',
          padding: '30px 34px',
          borderRadius: 40,
          background: 'white',
          color: '#111827',
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.25,
          opacity: Math.min(1, bubble * 1.5),
          transform: `scale(${0.5 + 0.5 * bubble}) translateY(${loncat * 0.6}px)`,
          transformOrigin: 'left center',
        }}
      >
        <span>{diketik}</span>
        <span style={{opacity: 0}}>{sisa}</span>
      </div>
    </>
  );
};

/* ---------- Adegan 3: perkenalan NUYAPAY ---------- */

const Logo: React.FC<{ukuran: number}> = ({ukuran}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 10}});
  const denyut = 1 + Math.sin(frame / 8) * 0.015;
  return (
    <Img
      src={staticFile('logo.png')}
      style={{
        width: ukuran,
        height: ukuran,
        borderRadius: ukuran * 0.22,
        boxShadow: '0 0 140px rgba(239,68,68,0.45)',
        transform: `scale(${s * denyut})`,
      }}
    />
  );
};

const Kenalan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nama = spring({frame: frame - 12, fps, config: {damping: 12}});
  return (
    <Latar>
      <div style={{marginTop: 260, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Logo ukuran={380} />
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: 'white',
            marginTop: 50,
            opacity: nama,
            transform: `translateY(${(1 - nama) * 40}px)`,
          }}
        >
          NUYAPAY
        </div>
        <div style={{fontSize: 60, fontWeight: 700, color: NEON, marginTop: 10, minHeight: 80}}>
          {ketik('Katalog Online + Kasir', frame, 30)}
          {frame % 16 < 8 ? '|' : ''}
        </div>
      </div>
      <Karakter top={1170} tinggi={340} teks="Tenang, ada NUYAPAY!" />
      <Teks kata={['Solusinya:', 'katalog', 'online', 'NUYAPAY']} sorot={[3]} mulai={20} />
    </Latar>
  );
};

/* ---------- Adegan layar aplikasi ---------- */

const Katalog: React.FC = () => (
  <Latar>
    <Hp src="katalog.jpg" rasio={1.8667} lebar={680}>
      <Label teks="otomatis ditandai" x={66} y={28} kapan={30} warna="neon" />
      <Label teks="tidak bisa dipesan" x={40} y={43} kapan={55} warna="merah" />
    </Hp>
    <Teks kata={['Stok', 'habis', 'otomatis', 'ditandai']} sorot={[1]} mulai={10} />
  </Latar>
);

const Wa: React.FC = () => (
  <Latar>
    <Hp src="wa.jpg" rasio={1.3519} lebar={700}>
      <Label teks="Isi pesanan" x={66} y={40} kapan={30} />
      <Label teks="Total Rp 16.000" x={62} y={53} kapan={50} warna="neon" />
      <Label teks="Nama pemesan" x={64} y={66} kapan={70} />
    </Hp>
    <Teks kata={['Pesanan', 'masuk', 'ke', 'WhatsApp']} sorot={[3]} mulai={10} />
  </Latar>
);

const Pesanan: React.FC = () => (
  <Latar>
    <Hp src="pesanan.jpg" rasio={1.9981} lebar={640}>
      <Label teks="pesanan baru" x={62} y={64} kapan={30} warna="neon" />
      <Label teks="ketuk Proses" x={40} y={84} kapan={60} />
    </Hp>
    <Teks kata={['Tinggal', 'ketuk', 'Proses']} sorot={[2]} mulai={10} />
  </Latar>
);

const Kasir: React.FC = () => (
  <Latar>
    <Hp src="kasir.jpg" rasio={1.9981} lebar={640}>
      <Label teks="member & poin" x={62} y={57} kapan={25} warna="neon" />
      <Label teks="tunai atau QRIS" x={50} y={79} kapan={50} />
    </Hp>
    <Teks kata={['Bayar', 'tunai', 'atau', 'QRIS']} sorot={[3]} mulai={10} />
  </Latar>
);

const Laporan: React.FC = () => (
  <Latar>
    <Hp src="laporan.jpg" rasio={1.9981} lebar={640}>
      <Label teks="laba bersih" x={50} y={39} kapan={30} warna="neon" />
      <Label teks="omset vs laba" x={55} y={60} kapan={60} />
    </Hp>
    <Teks kata={['Omset', 'dan', 'laba', 'otomatis']} sorot={[2]} mulai={10} />
  </Latar>
);

const Stok: React.FC = () => (
  <Latar>
    <Hp src="stok.jpg" rasio={1.9981} lebar={640}>
      <Label teks="scan barcode" x={52} y={74} kapan={25} />
      <Label teks="stok terpantau" x={50} y={84} kapan={50} warna="neon" />
    </Hp>
    <Teks kata={['Stok', '&', 'barcode', 'terpantau']} sorot={[2]} mulai={10} />
  </Latar>
);

/* ---------- Adegan 10: penutup ---------- */

const Penutup: React.FC<{alamat: string}> = ({alamat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 25, fps, config: {damping: 10}});
  const denyut = 1 + Math.sin(frame / 6) * 0.02;
  return (
    <Latar>
      <div style={{marginTop: 280, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Logo ukuran={300} />
        <div style={{fontSize: 120, fontWeight: 900, color: 'white', marginTop: 40}}>NUYAPAY</div>
        <div style={{fontSize: 52, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginTop: 6}}>
          Kelola Usaha + Katalog Online
        </div>
        <div
          style={{
            marginTop: 60,
            fontSize: 70,
            fontWeight: 900,
            color: '#111827',
            background: NEON,
            borderRadius: 28,
            padding: '16px 50px',
            opacity: s,
            transform: `scale(${s * denyut})`,
          }}
        >
          {alamat}
        </div>
      </div>
      <Karakter top={1120} tinggi={380} teks="Yuk, coba sekarang!" />
      <Teks kata={['Coba', 'NUYAPAY', 'sekarang']} sorot={[1]} mulai={10} />
    </Latar>
  );
};

/* ---------- Komposisi utama ---------- */

export const PromoNuyaPay: React.FC<PromoProps> = ({alamat}) => (
  <AbsoluteFill style={{background: '#07080d'}}>
    <Adegan i={0} tanpaMasuk>
      <StokHabis
        {...stokHabisDefaultProps}
        chats={chatPromo}
        kalimat="sering"
        kataSorot="habis?"
      />
      <Teks
        kata={['Jualan', 'lewat', 'WhatsApp,', 'tapi', 'chat', 'numpuk', 'dan', 'stok']}
        sorot={[2]}
        mulai={10}
        sampai={120}
        ukuran={66}
      />
    </Adegan>
    <Adegan i={1}>
      <Balas />
    </Adegan>
    <Adegan i={2}>
      <Kenalan />
    </Adegan>
    <Adegan i={3}>
      <Katalog />
    </Adegan>
    <Adegan i={4}>
      <Wa />
    </Adegan>
    <Adegan i={5}>
      <Pesanan />
    </Adegan>
    <Adegan i={6}>
      <Kasir />
    </Adegan>
    <Adegan i={7}>
      <Laporan />
    </Adegan>
    <Adegan i={8}>
      <Stok />
    </Adegan>
    <Adegan i={9}>
      <Penutup alamat={alamat} />
    </Adegan>
  </AbsoluteFill>
);
