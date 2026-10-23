import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  Adegan,
  AngkaNaik,
  BingkaiHp,
  Catatan,
  IkonBulat,
  KataPop,
  Latar,
  Progres,
  clamp,
  ketik,
  titik,
  warna,
} from './kit';

export type PromoBKProps = {alamat: string};
export const promoBKDefaultProps: PromoBKProps = {alamat: 'nuyapay.my.id'};

// Durasi tiap adegan (frame, 30 fps): total 2490 frame = 83 detik
const D = [105, 150, 90, 195, 240, 150, 240, 150, 150, 210, 165, 165, 195, 150, 135];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_BK = D.reduce((a, b) => a + b, 0);

const posisi = (top: number): React.CSSProperties => ({
  position: 'absolute',
  top,
  left: 0,
  right: 0,
});

/* ================= BAGIAN 1: MASALAH ================= */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const buku = spring({frame: frame - 10, fps, config: {damping: 10}});
  const tanya = spring({frame: frame - 45, fps, config: {damping: 7}});
  const baris = [
    ['Bu Sari', '150.000'],
    ['Pak Joko', '???'],
    ['Mbak Rina', '75.000 / lunas?'],
    ['Kak Ayu', '(lupa)'],
  ];
  return (
    <Latar glow={warna.merah}>
      <div style={posisi(150)}>
        <KataPop
          kata={['Bon', 'pelanggan', 'masih', 'dicatat', 'di', 'buku', 'tulis?']}
          sorot={[5, 6]}
          ukuran={92}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 250,
          width: 580,
          height: 780,
          borderRadius: 24,
          background:
            'repeating-linear-gradient(#fffdf5 0px, #fffdf5 68px, #cfd8ea 68px, #cfd8ea 70px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          transform: `rotate(-6deg) scale(${buku})`,
          opacity: buku,
          padding: '40px 36px',
          boxSizing: 'border-box',
        }}
      >
        {baris.map((b, i) => (
          <div
            key={i}
            style={{
              height: 70,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 38,
              fontStyle: 'italic',
              color: '#3a3f55',
              textDecoration: i === 1 ? 'line-through' : 'none',
            }}
          >
            <span>{b[0]}</span>
            <span>{b[1]}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1230,
          left: 690,
          width: 200,
          height: 200,
          borderRadius: 100,
          background: warna.merah,
          color: 'white',
          fontSize: 150,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '200px',
          transform: `scale(${tanya}) rotate(12deg)`,
        }}
      >
        ?
      </div>
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
          border: '6px solid rgba(255,255,255,0.9)',
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
          color: warna.gelap,
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

const Masalah: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const daftar = [
    'Lupa siapa yang belum bayar',
    'Hitungan cicilan sering meleset',
    'Buku hilang, rusak, atau basah',
  ];
  return (
    <Latar glow={warna.merah}>
      <div style={posisi(200)}>
        <KataPop kata={['Akibatnya?']} sorot={[0]} ukuran={110} />
      </div>
      <div style={{...posisi(470), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
        {daftar.map((t, i) => {
          const s = spring({frame: frame - (22 + i * 30), fps, config: {damping: 12}});
          return (
            <div
              key={i}
              style={{
                width: 900,
                boxSizing: 'border-box',
                padding: '40px 44px',
                display: 'flex',
                alignItems: 'center',
                gap: 36,
                borderRadius: 40,
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.14)',
                opacity: s,
                transform: `translateX(${(1 - s) * -300}px)`,
              }}
            >
              <IkonBulat jenis="x" ukuran={96} />
              <div style={{fontSize: 54, fontWeight: 800, color: 'white', lineHeight: 1.2}}>{t}</div>
            </div>
          );
        })}
      </div>
      <Karakter top={1260} tinggi={560} teks="Duh, catatan bonnya berantakan lagi..." />
    </Latar>
  );
};

const Solusi: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 12, fps, config: {damping: 9}});
  const nama = spring({frame: frame - 28, fps, config: {damping: 12}});
  return (
    <Latar glow={warna.biru}>
      <div style={posisi(430)}>
        <KataPop kata={['Ganti', 'ke...']} ukuran={96} />
      </div>
      <Img
        src={staticFile('logo.jpg')}
        style={{
          position: 'absolute',
          top: 740,
          left: 370,
          width: 340,
          height: 340,
          objectFit: 'cover',
          borderRadius: 80,
          boxShadow: '0 0 120px rgba(0,97,255,0.6)',
          transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`,
        }}
      />
      <div
        style={{
          ...posisi(1130),
          textAlign: 'center',
          fontSize: 84,
          fontWeight: 900,
          color: 'white',
          opacity: nama,
          transform: `translateY(${(1 - nama) * 50}px)`,
        }}
      >
        Buku Kredit UMKM
      </div>
      <Karakter top={1300} tinggi={520} teks="Semua bon tercatat rapi di sini!" />
    </Latar>
  );
};

/* ================= KOMPONEN LAYAR APLIKASI ================= */

const Header: React.FC<{judul: string; bg?: string}> = ({judul, bg}) => (
  <div
    style={{
      height: 120,
      background: bg || `linear-gradient(135deg, ${warna.gelap}, #203a43)`,
      color: 'white',
      fontSize: 38,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      padding: '0 34px',
    }}
  >
    {judul}
  </div>
);

// Kerangka adegan: HP + judul + teks bawah
const Layar: React.FC<{
  judul: string;
  kata: string[];
  sorot?: number[];
  glow?: string;
  bg?: string;
  children: React.ReactNode;
}> = ({judul, kata, sorot, glow, bg, children}) => (
  <Latar glow={glow}>
    <BingkaiHp>
      <Header judul={judul} bg={bg} />
      {children}
    </BingkaiHp>
    <div style={posisi(1470)}>
      <KataPop kata={kata} sorot={sorot} ukuran={76} mulai={14} />
    </div>
    <Catatan teks="*Data contoh" />
  </Latar>
);

// Lencana keterangan di dasar layar HP
const Lencana: React.FC<{teks: string; dari: number; sampai?: number; bg?: string}> = ({
  teks,
  dari,
  sampai = 9999,
  bg = warna.oranye,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - dari, fps, config: {damping: 12}});
  if (frame > sampai) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 36,
        right: 36,
        bottom: 36,
        padding: '18px 24px',
        borderRadius: 999,
        background: bg,
        color: bg === warna.oranye ? warna.gelap : 'white',
        fontSize: 28,
        fontWeight: 900,
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      {teks}
    </div>
  );
};

// Kotak dialog di tengah layar HP (seperti popup di aplikasi)
const ModalBox: React.FC<{dari: number; sampai?: number; children: React.ReactNode}> = ({
  dari,
  sampai = 9999,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - dari, fps, config: {damping: 13}});
  const keluar = interpolate(frame, [sampai - 6, sampai], [1, 0], clamp);
  if (frame < dari || frame > sampai) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        background: 'rgba(15,32,39,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(s, 1) * keluar,
      }}
    >
      <div
        style={{
          width: 560,
          boxSizing: 'border-box',
          background: 'white',
          borderRadius: 36,
          padding: '36px 34px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          transform: `scale(${0.8 + 0.2 * s})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const TombolModal: React.FC<{teks: string; bg: string; warnaTeks?: string; tekan?: boolean}> = ({
  teks,
  bg,
  warnaTeks = 'white',
  tekan = false,
}) => (
  <div
    style={{
      flex: 1,
      height: 76,
      borderRadius: 20,
      background: bg,
      color: warnaTeks,
      fontSize: 28,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${tekan ? 0.94 : 1})`,
    }}
  >
    {teks}
  </div>
);

const Chip: React.FC<{teks: string; aktif: boolean}> = ({teks, aktif}) => (
  <div
    style={{
      padding: '12px 26px',
      borderRadius: 999,
      fontSize: 25,
      fontWeight: 800,
      background: aktif ? warna.biru : 'white',
      color: aktif ? 'white' : '#8d99ae',
      border: aktif ? 'none' : '2px solid #e3e8f3',
    }}
  >
    {teks}
  </div>
);

const Bon: React.FC<{nama: string; produk: string; sisa: number; lunas: boolean}> = ({
  nama,
  produk,
  sisa,
  lunas,
}) => (
  <div
    style={{
      background: 'white',
      borderRadius: 26,
      padding: '26px 28px',
      marginBottom: 20,
      boxShadow: '0 10px 30px rgba(15,32,39,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <div style={{fontSize: 32, fontWeight: 900, color: '#0f2027'}}>{nama}</div>
      <div style={{fontSize: 24, color: '#8d99ae', marginTop: 4}}>{produk}</div>
      <div style={{fontSize: 28, fontWeight: 800, color: lunas ? warna.hijau : warna.merah, marginTop: 10}}>
        Sisa Rp {titik(sisa)}
      </div>
    </div>
    <div
      style={{
        padding: '10px 22px',
        borderRadius: 999,
        fontSize: 24,
        fontWeight: 800,
        color: 'white',
        background: lunas ? warna.hijau : warna.merah,
      }}
    >
      {lunas ? 'Lunas' : 'Belum Lunas'}
    </div>
  </div>
);

/* ================= BAGIAN 2: FITUR ================= */

/* ---------- Dasbor ---------- */

const Dasbor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kartu = (i: number) => spring({frame: frame - (16 + i * 12), fps, config: {damping: 13}});
  const data = [
    {nama: 'Omzet Keseluruhan', nilai: 12400000, w: warna.biru},
    {nama: 'Modal Keluar', nilai: 7550000, w: '#d98f00'},
    {nama: 'Cicilan Masuk', nilai: 8200000, w: warna.hijau},
    {nama: 'Sisa Piutang', nilai: 4200000, w: warna.merah},
  ];
  const k0 = kartu(0);
  return (
    <Latar>
      <BingkaiHp>
        <Header judul="Buku Kredit UMKM" />
        <div style={{padding: 28}}>
          <div
            style={{
              borderRadius: 30,
              padding: '30px 32px',
              background: `linear-gradient(135deg, ${warna.biru}, ${warna.hijau})`,
              color: 'white',
              opacity: k0,
              transform: `scale(${0.9 + 0.1 * k0})`,
            }}
          >
            <div style={{fontSize: 26, fontWeight: 700, opacity: 0.9}}>Estimasi Laba Bersih</div>
            <div style={{fontSize: 62, fontWeight: 900, marginTop: 6}}>
              <AngkaNaik nilai={4850000} mulai={22} durasi={60} />
            </div>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 22}}>
            {data.map((d, i) => {
              const s = kartu(i + 1);
              return (
                <div
                  key={i}
                  style={{
                    width: 300,
                    boxSizing: 'border-box',
                    padding: '24px 22px',
                    borderRadius: 26,
                    background: 'white',
                    boxShadow: '0 10px 30px rgba(15,32,39,0.08)',
                    opacity: s,
                    transform: `translateY(${(1 - s) * 40}px)`,
                  }}
                >
                  <div style={{fontSize: 22, fontWeight: 700, color: '#8d99ae'}}>{d.nama}</div>
                  <div style={{fontSize: 31, fontWeight: 900, color: d.w, marginTop: 8}}>
                    <AngkaNaik nilai={d.nilai} mulai={30 + i * 12} durasi={50} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize: 28, fontWeight: 900, color: '#0f2027', margin: '26px 4px 14px', opacity: kartu(5)}}>
            Tagihan Terbaru
          </div>
          <div style={{opacity: kartu(5), transform: `translateY(${(1 - kartu(5)) * 40}px)`}}>
            <Bon nama="Pak Joko" produk="Kulkas 2 Pintu" sisa={1200000} lunas={false} />
          </div>
          <div style={{opacity: kartu(6), transform: `translateY(${(1 - kartu(6)) * 40}px)`}}>
            <Bon nama="Bu Sari" produk="Rice Cooker + 1 lagi" sisa={750000} lunas={false} />
          </div>
        </div>
      </BingkaiHp>
      <div style={posisi(1470)}>
        <KataPop
          kata={['Laba,', 'omzet,', 'dan', 'piutang', 'sekali', 'lihat']}
          sorot={[4, 5]}
          ukuran={76}
          mulai={14}
        />
      </div>
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ---------- Formulir catat bon (lengkap) ---------- */

const Kolom: React.FC<{label: string; isi: string; aktif: boolean; lebar?: string}> = ({
  label,
  isi,
  aktif,
  lebar = '100%',
}) => {
  const frame = useCurrentFrame();
  const kursor = aktif && frame % 16 < 8 ? '|' : '';
  return (
    <div style={{marginBottom: 14, width: lebar}}>
      <div style={{fontSize: 21, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>{label}</div>
      <div
        style={{
          height: 62,
          borderRadius: 16,
          boxSizing: 'border-box',
          border: `3px solid ${aktif ? warna.biru : '#e3e8f3'}`,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          fontSize: 27,
          color: '#2b2b2b',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {isi}
        {kursor}
      </div>
    </div>
  );
};

const Formulir: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nama = ketik('Pak Joko', frame, 12, 3);
  const wa = ketik('0812 3456 7890', frame, 38, 2);
  const alamat = ketik('Jl. Melati No. 5', frame, 68, 2);
  const produk = ketik('Kulkas 2 Pintu', frame, 102, 2);
  const desk = ketik('Silver, No. Seri KL-2210', frame, 132, 1.5);
  const modal = ketik('2.700.000', frame, 172, 2);
  const jual = ketik('3.200.000', frame, 192, 2);
  const tekan = frame >= 216 && frame < 226 ? 0.95 : 1;
  const toast = spring({frame: frame - 226, fps, config: {damping: 12}});
  const judulBagian = (t: string) => (
    <div style={{fontSize: 23, fontWeight: 900, color: warna.biru, margin: '6px 0 12px'}}>{t}</div>
  );
  return (
    <Layar
      judul="Buat Catatan Baru"
      kata={['Catat', 'bon', 'lengkap', 'dengan', 'rincian']}
      sorot={[2, 4]}
    >
      <div style={{padding: '22px 30px'}}>
        {judulBagian('Data Pelanggan')}
        <Kolom label="Nama Pelanggan" isi={nama} aktif={frame >= 12 && frame < 38} />
        <Kolom label="Nomor WA" isi={wa} aktif={frame >= 38 && frame < 68} />
        <Kolom label="Alamat Lengkap" isi={alamat} aktif={frame >= 68 && frame < 102} />
        {judulBagian('Rincian Produk')}
        <Kolom label="Nama Produk" isi={produk} aktif={frame >= 102 && frame < 132} />
        <Kolom label="Deskripsi (warna, no. seri, dll)" isi={desk} aktif={frame >= 132 && frame < 172} />
        <div style={{display: 'flex', gap: 18}}>
          <Kolom label="Harga Modal" isi={modal ? 'Rp ' + modal : ''} aktif={frame >= 172 && frame < 192} lebar="50%" />
          <Kolom label="Harga Jual" isi={jual ? 'Rp ' + jual : ''} aktif={frame >= 192 && frame < 216} lebar="50%" />
        </div>
        <div
          style={{
            marginTop: 10,
            height: 84,
            borderRadius: 24,
            background: warna.biru,
            color: 'white',
            fontSize: 31,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${tekan})`,
            boxShadow: '0 14px 40px rgba(0,97,255,0.4)',
          }}
        >
          Simpan ke Buku Bon
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 70,
          right: 70,
          height: 76,
          borderRadius: 38,
          background: warna.hijau,
          color: 'white',
          fontSize: 28,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: toast,
          transform: `translateY(${(1 - toast) * 80}px)`,
        }}
      >
        Berhasil disimpan
      </div>
    </Layar>
  );
};

/* ---------- Cari & filter ---------- */

const gradAvatar = [
  'linear-gradient(135deg,#0061ff,#60efff)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#ff416c,#ff4b2b)',
];

const KartuP: React.FC<{
  nama: string;
  item: number;
  sisa: number;
  total: number;
  g: number;
}> = ({nama, item, sisa, total, g}) => {
  const lunas = sisa === 0;
  return (
    <div
      style={{
        height: 150,
        boxSizing: 'border-box',
        background: 'white',
        borderRadius: 28,
        padding: '0 26px',
        boxShadow: '0 10px 30px rgba(15,32,39,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{position: 'relative'}}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              background: gradAvatar[g % 3],
              color: 'white',
              fontSize: 32,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {nama.slice(0, 2).toUpperCase()}
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 24,
              height: 24,
              borderRadius: 12,
              border: '4px solid white',
              background: lunas ? warna.hijau : warna.merah,
            }}
          />
        </div>
        <div>
          <div style={{fontSize: 32, fontWeight: 900, color: '#0f2027'}}>{nama}</div>
          <div
            style={{
              marginTop: 6,
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 999,
              background: '#eef3ff',
              color: warna.biru,
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {item} Item Kredit
          </div>
        </div>
      </div>
      <div style={{textAlign: 'right'}}>
        <div style={{fontSize: 18, color: '#8d99ae', fontWeight: 700}}>Total Tagihan</div>
        <div style={{fontSize: 30, fontWeight: 900, color: lunas ? warna.hijau : warna.merah}}>
          Rp {titik(sisa)}
        </div>
        <div style={{fontSize: 18, color: '#8d99ae', fontWeight: 700, marginTop: 4}}>
          Total Belanja Rp {titik(total)}
        </div>
      </div>
    </div>
  );
};

const CariFilter: React.FC = () => {
  const frame = useCurrentFrame();
  const q = frame >= 78 ? '' : ketik('sari', frame, 14, 4);
  const lunasAktif = frame >= 95;
  const visSari = interpolate(frame, [0, 92, 100], [1, 1, 0], clamp);
  const visJoko = interpolate(frame, [0, 20, 28, 76, 84, 92, 100], [1, 1, 0, 0, 1, 1, 0], clamp);
  const visRina = interpolate(frame, [0, 20, 28, 76, 84], [1, 1, 0, 0, 1], clamp);
  const bungkus = (v: number, isi: React.ReactNode) => (
    <div style={{height: 150 * v, opacity: v, marginBottom: 18 * v, overflow: 'hidden'}}>{isi}</div>
  );
  return (
    <Layar
      judul="Tagihan"
      kata={['Cari', 'pelanggan', 'dan', 'saring', 'status']}
      sorot={[3, 4]}
    >
      <div style={{padding: '24px 28px'}}>
        <div
          style={{
            height: 72,
            borderRadius: 36,
            background: 'white',
            border: '3px solid #e3e8f3',
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            fontSize: 28,
            color: q ? '#2b2b2b' : '#a9b3c7',
            marginBottom: 20,
          }}
        >
          {q || 'Cari nama pelanggan...'}
          {q && frame % 16 < 8 ? '|' : ''}
        </div>
        <div style={{display: 'flex', gap: 14, marginBottom: 26}}>
          <Chip teks="Semua" aktif={!lunasAktif} />
          <Chip teks="Belum Lunas" aktif={false} />
          <Chip teks="Lunas" aktif={lunasAktif} />
        </div>
        {bungkus(visRina, <KartuP nama="Mbak Rina" item={1} sisa={0} total={250000} g={2} />)}
        {bungkus(visJoko, <KartuP nama="Pak Joko" item={1} sisa={700000} total={3200000} g={1} />)}
        {bungkus(visSari, <KartuP nama="Bu Sari" item={2} sisa={750000} total={950000} g={0} />)}
      </div>
    </Layar>
  );
};

/* ---------- Kartu pelanggan terbuka: gabungan bon + rincian ---------- */

const ProdukBox: React.FC<{nama: string; desc: string; sisa: number; laba: number}> = ({
  nama,
  desc,
  sisa,
  laba,
}) => {
  const tombol = (teks: string, bg: string, span = 1) => (
    <div
      style={{
        gridColumn: `span ${span}`,
        height: 60,
        borderRadius: 16,
        background: bg,
        color: 'white',
        fontSize: 22,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {teks}
    </div>
  );
  return (
    <div
      style={{
        background: '#f8faff',
        border: '2px solid #e3e8f3',
        borderRadius: 26,
        padding: '22px 24px',
        marginBottom: 20,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 900, color: '#0f2027'}}>{nama}</div>
        <div style={{fontSize: 28, fontWeight: 900, color: warna.merah}}>Rp {titik(sisa)}</div>
      </div>
      <div style={{fontSize: 22, color: '#8d99ae', margin: '6px 0'}}>{desc}</div>
      <div style={{fontSize: 22, fontWeight: 800, color: warna.hijau, marginBottom: 16}}>
        Estimasi Laba: Rp {titik(laba)}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {tombol('Bayar Angsuran', warna.biru)}
        {tombol('Cetak Bon', warna.gelap)}
        {tombol('Edit', warna.oranye)}
        {tombol('Hapus Data', warna.merah)}
      </div>
    </div>
  );
};

const Detail: React.FC = () => {
  const frame = useCurrentFrame();
  const gulir = interpolate(frame, [120, 200], [0, -360], clamp);
  return (
    <Layar
      judul="Tagihan"
      kata={['Semua', 'bon', 'satu', 'pelanggan', 'digabung']}
      sorot={[3, 4]}
    >
      <div style={{padding: '24px 28px', transform: `translateY(${gulir}px)`}}>
        <KartuP nama="Bu Sari" item={2} sisa={750000} total={950000} g={0} />
        <div
          style={{
            margin: '18px 4px',
            fontSize: 24,
            color: '#4b5563',
            lineHeight: 1.5,
          }}
        >
          WA 0812 9876 5432
          <br />
          Jl. Kenanga No. 12
        </div>
        <div style={{display: 'flex', gap: 16, marginBottom: 22}}>
          <div
            style={{
              flex: 1,
              height: 72,
              borderRadius: 20,
              background: warna.wa,
              color: 'white',
              fontSize: 26,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Kirim Tagihan
          </div>
          <div
            style={{
              flex: 1,
              height: 72,
              borderRadius: 20,
              background: '#8e2de2',
              color: 'white',
              fontSize: 26,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Tambah Bon
          </div>
        </div>
        <div style={{fontSize: 26, fontWeight: 900, color: '#0f2027', marginBottom: 14}}>Rincian Barang:</div>
        <ProdukBox nama="Rice Cooker" desc="Putih, 1,8 liter" sisa={350000} laba={70000} />
        <ProdukBox nama="Kompor 2 Tungku" desc="Hitam, No. Seri KG-2210" sisa={400000} laba={150000} />
      </div>
      <Lencana teks="Laba tiap produk ikut dihitung" dari={70} sampai={115} />
      <Lencana teks="Tambah barang tanpa isi ulang data" dari={150} />
    </Layar>
  );
};

/* ---------- Bayar angsuran + validasi nominal ---------- */

const Bayar: React.FC = () => {
  const frame = useCurrentFrame();
  const sisa = interpolate(frame, [136, 150], [1200000, 700000], clamp);
  const salah = ketik('2000000', frame, 18, 3);
  const benar = ketik('500000', frame, 90, 3);
  const nominal = frame >= 84 ? benar : salah;
  const errorMuncul = frame >= 44 && frame < 84;
  const geser = errorMuncul ? Math.sin(frame * 1.6) * 8 * Math.max(0, 1 - (frame - 44) / 25) : 0;
  const tekan = frame >= 124 && frame < 134;
  return (
    <Layar
      judul="Tagihan"
      kata={['Bayar', 'angsuran', 'dengan', 'validasi', 'nominal']}
      sorot={[3, 4]}
    >
      <div style={{padding: '24px 28px'}}>
        <Bon nama="Pak Joko" produk="Kulkas 2 Pintu" sisa={sisa} lunas={false} />
        <Bon nama="Bu Sari" produk="Rice Cooker + 1 lagi" sisa={750000} lunas={false} />
      </div>
      <ModalBox dari={8} sampai={138}>
        <div style={{fontSize: 34, fontWeight: 900, color: '#0f2027'}}>Bayar Kulkas 2 Pintu</div>
        <div style={{fontSize: 24, color: '#8d99ae', margin: '8px 0 18px'}}>Sisa Tagihan: Rp 1.200.000</div>
        <div
          style={{
            height: 76,
            borderRadius: 18,
            boxSizing: 'border-box',
            border: `3px solid ${errorMuncul ? warna.merah : warna.biru}`,
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 32,
            color: '#2b2b2b',
            transform: `translateX(${geser}px)`,
          }}
        >
          {nominal}
          {frame % 16 < 8 ? '|' : ''}
        </div>
        <div
          style={{
            height: errorMuncul ? 64 : 0,
            marginTop: errorMuncul ? 14 : 0,
            overflow: 'hidden',
            borderRadius: 14,
            background: '#fdecef',
            color: warna.merah,
            fontSize: 24,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            padding: errorMuncul ? '0 20px' : 0,
          }}
        >
          Melebihi sisa tagihan!
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 22}}>
          <TombolModal teks="Batal" bg="#eef1f7" warnaTeks="#6b7280" />
          <TombolModal teks="Bayar" bg={warna.biru} tekan={tekan} />
        </div>
      </ModalBox>
    </Layar>
  );
};

/* ---------- Histori pembayaran + koreksi ---------- */

const Histori: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const baris = [
    {t: '05/09/2026', n: 1000000},
    {t: '20/09/2026', n: 1000000},
    {t: '12/10/2026', n: 500000},
  ];
  const buka = interpolate(frame, [12, 34], [0, 1], clamp);
  const sorotEdit = frame >= 66 && frame < 90;
  return (
    <Layar
      judul="Tagihan"
      kata={['Histori', 'pembayaran', 'tercatat', 'rapi']}
      sorot={[3]}
    >
      <div style={{padding: '24px 28px'}}>
        <div
          style={{
            background: '#f8faff',
            border: '2px solid #e3e8f3',
            borderRadius: 26,
            padding: '22px 24px',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontSize: 30, fontWeight: 900, color: '#0f2027'}}>Kulkas 2 Pintu</div>
            <div style={{fontSize: 28, fontWeight: 900, color: warna.merah}}>Rp 700.000</div>
          </div>
          <div style={{fontSize: 22, color: '#8d99ae', margin: '6px 0 18px'}}>Silver, No. Seri KL-2210</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: 18,
              background: '#eef3ff',
              color: warna.biru,
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            <span>Histori Pembayaran</span>
            <span style={{transform: `rotate(${buka * 180}deg)`}}>v</span>
          </div>
          <div style={{height: 330 * buka, overflow: 'hidden', opacity: buka}}>
            {baris.map((b, i) => {
              const s = spring({frame: frame - (22 + i * 8), fps, config: {damping: 13}});
              const ujung = i === 2;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 6px',
                    borderBottom: i < 2 ? '2px dashed #e3e8f3' : 'none',
                    opacity: s,
                  }}
                >
                  <div>
                    <div style={{fontSize: 24, fontWeight: 800, color: '#0f2027'}}>Pembayaran Kulkas 2 Pintu</div>
                    <div style={{fontSize: 21, color: '#8d99ae', marginTop: 4}}>{b.t}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                    <div style={{fontSize: 25, fontWeight: 900, color: warna.hijau}}>+Rp {titik(b.n)}</div>
                    <div
                      style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: ujung && sorotEdit ? warna.oranye : '#eef1f7',
                        color: ujung && sorotEdit ? warna.gelap : '#6b7280',
                        fontSize: 20,
                        fontWeight: 800,
                        transform: `scale(${ujung && sorotEdit ? 1.12 : 1})`,
                      }}
                    >
                      Ubah
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ModalBox dari={92}>
        <div style={{fontSize: 32, fontWeight: 900, color: '#0f2027'}}>Edit Nominal Bayar</div>
        <div style={{fontSize: 22, color: warna.merah, fontWeight: 700, margin: '8px 0 16px'}}>
          Maksimal: Rp 1.200.000
        </div>
        <div
          style={{
            height: 70,
            borderRadius: 16,
            border: `3px solid ${warna.biru}`,
            boxSizing: 'border-box',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 28,
            marginBottom: 14,
          }}
        >
          500000
        </div>
        <div
          style={{
            height: 70,
            borderRadius: 16,
            border: '3px solid #e3e8f3',
            boxSizing: 'border-box',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 28,
            marginBottom: 22,
          }}
        >
          12/10/2026
        </div>
        <div style={{display: 'flex', gap: 14}}>
          <TombolModal teks="Batal" bg="#eef1f7" warnaTeks="#6b7280" />
          <TombolModal teks="Simpan" bg={warna.biru} />
        </div>
      </ModalBox>
    </Layar>
  );
};

/* ---------- Struk: cetak & kirim WA ---------- */

const Struk: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cetak = interpolate(frame, [10, 70], [0, 700], clamp);
  const tombol = spring({frame: frame - 92, fps, config: {damping: 12}});
  const tekanWa = frame >= 150 && frame < 160;
  const terkirim = spring({frame: frame - 162, fps, config: {damping: 11}});
  const baris = (k: string, v: string, tebal = false) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 27,
        fontWeight: tebal ? 800 : 500,
        margin: '8px 0',
      }}
    >
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
  const garis = <div style={{borderTop: '3px dashed #222', margin: '14px 0'}} />;
  return (
    <Latar glow={warna.hijau}>
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 220,
          width: 640,
          maxHeight: cetak,
          overflow: 'hidden',
          background: '#fffefa',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <div style={{padding: '36px 36px 40px', fontFamily: 'monospace', color: '#111'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 34, fontWeight: 900}}>Toko Zubair</div>
            <div style={{fontSize: 22, marginTop: 4}}>12/10/2026, 10.15.00</div>
          </div>
          {garis}
          {baris('Nasabah:', 'Pak Joko')}
          {garis}
          <div style={{textAlign: 'center', fontSize: 25, fontWeight: 800}}>PEMBAYARAN CICILAN</div>
          {garis}
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 26}}>
            <span>Produk:</span>
            <span style={{textAlign: 'right', maxWidth: '65%'}}>
              <b>Kulkas 2 Pintu</b>
              <br />
              <span style={{fontSize: 20, color: '#555'}}>Silver, No. Seri KL-2210</span>
            </span>
          </div>
          {garis}
          {baris('Nominal Masuk:', 'Rp 500.000', true)}
          {baris('Sisa Piutang:', 'Rp 700.000', true)}
          {garis}
          <div style={{textAlign: 'center', fontSize: 24, marginTop: 14}}>TERIMA KASIH</div>
        </div>
      </div>
      <div
        style={{
          ...posisi(980),
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          opacity: tombol,
          transform: `translateY(${(1 - tombol) * 50}px)`,
        }}
      >
        <div
          style={{
            width: 400,
            height: 96,
            borderRadius: 26,
            background: warna.biru,
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Cetak Printer (RawBT)
        </div>
        <div
          style={{
            width: 400,
            height: 96,
            borderRadius: 26,
            background: warna.wa,
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${tekanWa ? 0.93 : 1})`,
          }}
        >
          Bagikan (WA)
        </div>
      </div>
      <div
        style={{
          ...posisi(1130),
          textAlign: 'center',
          fontSize: 38,
          fontWeight: 800,
          color: '#a8e6cf',
          opacity: terkirim,
          transform: `scale(${0.8 + 0.2 * terkirim})`,
        }}
      >
        Struk terkirim ke WhatsApp pelanggan
      </div>
      <div style={posisi(1470)}>
        <KataPop kata={['Struk', 'siap', 'cetak', 'atau', 'kirim', 'WA']} sorot={[2, 5]} ukuran={76} mulai={14} />
      </div>
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ---------- Tagih lewat WhatsApp ---------- */

const teksWa = (t: string) =>
  t.split('*').map((s, i) => (i % 2 ? <b key={i}>{s}</b> : <span key={i}>{s}</span>));

const TagihWa: React.FC = () => {
  const frame = useCurrentFrame();
  const pesan =
    'Halo Kak Bu Sari, kami dari *Toko Zubair* menginformasikan total sisa cicilan untuk produk (Rice Cooker, Kompor 2 Tungku) adalah sebesar *Rp 750.000*. Mohon kesediaannya untuk melakukan pembayaran. Terima kasih!';
  const isi = pesan.slice(0, Math.max(0, Math.floor((frame - 18) * 2)));
  return (
    <Layar
      judul="Bu Sari"
      bg="#075e54"
      kata={['Pesan', 'tagihan', 'terisi', 'otomatis']}
      sorot={[2, 3]}
      glow={warna.wa}
    >
      <div
        style={{
          height: 1011 - 6,
          background: '#e6ddd4',
          padding: '30px 26px',
          boxSizing: 'border-box',
        }}
      >
        {isi ? (
          <div
            style={{
              marginLeft: 70,
              background: '#dcf8c6',
              borderRadius: '26px 26px 6px 26px',
              padding: '22px 26px',
              fontSize: 27,
              lineHeight: 1.45,
              color: '#111',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            {teksWa(isi)}
          </div>
        ) : null}
      </div>
      <Lencana teks="Sisa semua barang dijumlahkan" dari={120} bg={warna.wa} />
    </Layar>
  );
};

/* ---------- Edit & hapus yang aman ---------- */

const EditHapus: React.FC = () => {
  const frame = useCurrentFrame();
  const harga = frame < 32 ? '3200000' : ketik('1000000', frame, 34, 3);
  const galat = frame >= 66 && frame < 96;
  const tekanSimpan = frame >= 58 && frame < 66;
  return (
    <Layar
      judul="Tagihan"
      kata={['Edit', 'dan', 'hapus', 'tetap', 'aman']}
      sorot={[4]}
    >
      <div style={{padding: '24px 28px'}}>
        <Bon nama="Pak Joko" produk="Kulkas 2 Pintu" sisa={700000} lunas={false} />
        <Bon nama="Bu Sari" produk="Rice Cooker + 1 lagi" sisa={750000} lunas={false} />
      </div>
      <ModalBox dari={6} sampai={96}>
        <div style={{fontSize: 32, fontWeight: 900, color: '#0f2027', marginBottom: 18}}>Edit Data Produk</div>
        <div
          style={{
            height: 66,
            borderRadius: 16,
            border: '3px solid #e3e8f3',
            boxSizing: 'border-box',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 26,
            marginBottom: 14,
          }}
        >
          Pak Joko
        </div>
        <div
          style={{
            height: 66,
            borderRadius: 16,
            border: `3px solid ${galat ? warna.merah : warna.biru}`,
            boxSizing: 'border-box',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 26,
          }}
        >
          Rp {harga}
        </div>
        <div
          style={{
            height: galat ? 100 : 0,
            marginTop: galat ? 14 : 0,
            overflow: 'hidden',
            borderRadius: 14,
            background: '#fdecef',
            color: warna.merah,
            fontSize: 22,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            padding: galat ? '0 18px' : 0,
          }}
        >
          Harga jual baru kurang dari total yang sudah dibayar!
        </div>
        <div style={{marginTop: 20}}>
          <TombolModal teks="Simpan Perubahan" bg={warna.biru} tekan={tekanSimpan} />
        </div>
      </ModalBox>
      <ModalBox dari={100}>
        <div style={{textAlign: 'center'}}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              border: `6px solid ${warna.oranye}`,
              color: warna.oranye,
              fontSize: 60,
              fontWeight: 900,
              lineHeight: '78px',
              margin: '0 auto 16px',
            }}
          >
            !
          </div>
          <div style={{fontSize: 34, fontWeight: 900, color: '#0f2027'}}>Hapus Bon Ini?</div>
          <div style={{fontSize: 23, color: '#6b7280', margin: '10px 0 22px'}}>
            Hanya data bon produk ini yang akan dihapus.
          </div>
        </div>
        <div style={{display: 'flex', gap: 14}}>
          <TombolModal teks="Batal" bg="#eef1f7" warnaTeks="#6b7280" />
          <TombolModal teks="Ya, Hapus" bg={warna.merah} />
        </div>
      </ModalBox>
      <Lencana teks="Ubah nama atau WA: semua bonnya ikut" dari={14} sampai={92} />
    </Layar>
  );
};

/* ---------- Pengaturan: nama toko + backup ---------- */

const Backup: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nama = ketik('Toko Zubair', frame, 14, 3);
  const tekan = frame >= 88 && frame < 100;
  const item = (judul: string, sub: React.ReactNode, aktif = false) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '26px 28px',
        background: aktif ? '#eef3ff' : 'white',
        borderBottom: '2px solid #f0f3fa',
      }}
    >
      <div style={{width: 70, height: 70, borderRadius: 20, background: '#eef3ff'}} />
      <div style={{flex: 1}}>
        <div style={{fontSize: 28, fontWeight: 900, color: '#0f2027'}}>{judul}</div>
        <div style={{fontSize: 23, color: '#8d99ae', marginTop: 4}}>{sub}</div>
      </div>
      <div style={{fontSize: 40, color: '#c5cde0'}}>{'>'}</div>
    </div>
  );
  const s = spring({frame, fps, config: {damping: 13}});
  return (
    <Layar
      judul="Buku Kredit UMKM"
      kata={['Backup', '&', 'pulihkan', 'data', 'mudah']}
      sorot={[2, 3]}
    >
      <div style={{padding: '24px 28px', opacity: s}}>
        <div style={{fontSize: 28, fontWeight: 900, color: '#0f2027', margin: '8px 4px 16px'}}>Pengaturan</div>
        <div style={{borderRadius: 28, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,32,39,0.08)'}}>
          {item(
            'Nama Agen / Toko Anda',
            <span style={{color: warna.biru, fontWeight: 800}}>
              {nama || 'Contoh: Zubair Store'}
              {nama && frame % 16 < 8 ? '|' : ''}
            </span>
          )}
          {item('Salin Teks Data', 'Backup & Pulihkan Data', tekan)}
          {item('Tempel Data', 'Backup & Pulihkan Data')}
        </div>
      </div>
      <ModalBox dari={104} sampai={9999}>
        <div style={{textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 14}}>
            <IkonBulat jenis="ok" ukuran={96} />
          </div>
          <div style={{fontSize: 34, fontWeight: 900, color: '#0f2027'}}>Berhasil Disalin!</div>
          <div style={{fontSize: 22, color: '#6b7280', margin: '10px 0 0', lineHeight: 1.4}}>
            Kode backup siap disimpan. Simpan di aplikasi Catatan HP agar tidak terpotong.
          </div>
        </div>
      </ModalBox>
      <Lencana teks="Nama toko tampil di struk & pesan WA" dari={52} sampai={96} />
      <Lencana teks="Data juga tersimpan di server" dari={150} bg={warna.hijau} />
    </Layar>
  );
};

/* ---------- Rekap fitur ---------- */

const Rekap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const daftar = [
    'Laba, omzet & piutang otomatis',
    'Catat bon lengkap + rincian',
    'Cari & filter pelanggan',
    'Bon digabung per pelanggan',
    'Bayar angsuran + histori',
    'Struk: cetak & kirim WA',
    'Tagih sopan lewat WhatsApp',
    'Backup & pulihkan data',
  ];
  return (
    <Latar glow={warna.hijau}>
      <div style={posisi(150)}>
        <KataPop kata={['Semua', 'ada', 'di', 'satu', 'aplikasi']} sorot={[3, 4]} ukuran={84} />
      </div>
      <div style={{...posisi(420), display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 90, gap: 22}}>
        {daftar.map((t, i) => {
          const s = spring({frame: frame - (14 + i * 9), fps, config: {damping: 12}});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                opacity: s,
                transform: `translateX(${(1 - s) * -200}px)`,
              }}
            >
              <IkonBulat jenis="ok" ukuran={68} />
              <div style={{fontSize: 44, fontWeight: 800, color: 'white'}}>{t}</div>
            </div>
          );
        })}
      </div>
    </Latar>
  );
};

/* ---------- Ajakan ---------- */

const Ajakan: React.FC<{alamat: string}> = ({alamat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pil = spring({frame: frame - 50, fps, config: {damping: 9}});
  const sub = spring({frame: frame - 30, fps, config: {damping: 12}});
  return (
    <Latar glow={warna.hijau}>
      <Img
        src={staticFile('logo.jpg')}
        style={{
          position: 'absolute',
          top: 170,
          left: 440,
          width: 200,
          height: 200,
          objectFit: 'cover',
          borderRadius: 48,
          boxShadow: '0 0 90px rgba(0,176,155,0.5)',
          opacity: sub,
          transform: `scale(${0.7 + 0.3 * sub})`,
        }}
      />
      <div style={posisi(460)}>
        <KataPop kata={['Mulai', 'catat', 'bonmu', 'hari', 'ini']} sorot={[3, 4]} ukuran={104} />
      </div>
      <div
        style={{
          ...posisi(1000),
          textAlign: 'center',
          fontSize: 48,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          opacity: sub,
        }}
      >
        Usaha tertib, hati tenang.
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1160,
          left: 190,
          width: 700,
          height: 130,
          borderRadius: 65,
          background: warna.oranye,
          color: warna.gelap,
          fontSize: 56,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '130px',
          transform: `scale(${pil})`,
        }}
      >
        {alamat}
      </div>
      <div
        style={{
          ...posisi(1380),
          textAlign: 'center',
          fontSize: 44,
          fontWeight: 800,
          color: 'white',
          opacity: sub,
        }}
      >
        Buku Kredit UMKM
      </div>
      <Karakter top={1490} tinggi={380} teks="Yuk, coba sekarang!" />
    </Latar>
  );
};

/* ================= RANGKAIAN SEMUA ADEGAN ================= */

export const PromoBukuKredit: React.FC<PromoBKProps> = ({alamat}) => {
  const adegan: React.ReactNode[] = [
    <Hook key="0" />,
    <Masalah key="1" />,
    <Solusi key="2" />,
    <Dasbor key="3" />,
    <Formulir key="4" />,
    <CariFilter key="5" />,
    <Detail key="6" />,
    <Bayar key="7" />,
    <Histori key="8" />,
    <Struk key="9" />,
    <TagihWa key="10" />,
    <EditHapus key="11" />,
    <Backup key="12" />,
    <Rekap key="13" />,
    <Ajakan key="14" alamat={alamat} />,
  ];
  return (
    <Latar>
      {adegan.map((a, i) => (
        <Adegan key={i} dari={DARI[i]} durasi={D[i]}>
          {a}
        </Adegan>
      ))}
      <Progres />
    </Latar>
  );
};
