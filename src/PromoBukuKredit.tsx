import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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

// Durasi tiap adegan (frame, 30 fps): total 1080 frame = 36 detik
const D = [105, 165, 90, 210, 180, 180, 150];
const DARI = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
export const DURASI_BK = D.reduce((a, b) => a + b, 0);

const posisi = (top: number): React.CSSProperties => ({
  position: 'absolute',
  top,
  left: 0,
  right: 0,
});

/* ---------- Adegan 1: HOOK (0-3,5 dtk) ---------- */

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

/* ---------- Adegan 2: MASALAH (3,5-9 dtk) ---------- */

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
          const s = spring({frame: frame - (22 + i * 38), fps, config: {damping: 12}});
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
    </Latar>
  );
};

/* ---------- Adegan 3: PERALIHAN KE SOLUSI (9-12 dtk) ---------- */

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
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 390,
          width: 300,
          height: 300,
          borderRadius: 76,
          background: `linear-gradient(135deg, ${warna.biru}, ${warna.hijau})`,
          boxShadow: '0 0 120px rgba(0,97,255,0.6)',
          color: 'white',
          fontSize: 190,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '300px',
          transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`,
        }}
      >
        B
      </div>
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
    </Latar>
  );
};

/* ---------- Layar aplikasi (tiruan) di dalam HP ---------- */

const Header: React.FC<{judul: string}> = ({judul}) => (
  <div
    style={{
      height: 120,
      background: `linear-gradient(135deg, ${warna.gelap}, #203a43)`,
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

/* ---------- Adegan 4: DASBOR (12-19 dtk) ---------- */

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
            <Bon nama="Pak Joko" produk="Gula 10 kg" sisa={120000} lunas={false} />
          </div>
          <div style={{opacity: kartu(6), transform: `translateY(${(1 - kartu(6)) * 40}px)`}}>
            <Bon nama="Mbak Rina" produk="Kopi 1 dus" sisa={75000} lunas={false} />
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

/* ---------- Adegan 5: CATAT BON (19-25 dtk) ---------- */

const Kolom: React.FC<{label: string; isi: string; aktif: boolean}> = ({label, isi, aktif}) => {
  const frame = useCurrentFrame();
  const kursor = aktif && frame % 16 < 8 ? '|' : '';
  return (
    <div style={{marginBottom: 22}}>
      <div style={{fontSize: 23, fontWeight: 800, color: '#2b2b2b', marginBottom: 8}}>{label}</div>
      <div
        style={{
          height: 72,
          borderRadius: 18,
          boxSizing: 'border-box',
          border: `3px solid ${aktif ? warna.biru : '#e3e8f3'}`,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          fontSize: 31,
          color: '#2b2b2b',
        }}
      >
        {isi}
        {kursor}
      </div>
    </div>
  );
};

const CatatBon: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nama = ketik('Bu Sari', frame, 18, 3);
  const produk = ketik('Beras 5 kg', frame, 50, 2);
  const modal = ketik('60.000', frame, 88, 3);
  const jual = ketik('75.000', frame, 116, 3);
  const tekan = frame >= 148 && frame < 158 ? 0.95 : 1;
  const toast = spring({frame: frame - 156, fps, config: {damping: 12}});
  return (
    <Latar>
      <BingkaiHp>
        <Header judul="Buat Catatan Baru" />
        <div style={{padding: '28px 30px'}}>
          <Kolom label="Nama Pelanggan" isi={nama} aktif={frame >= 18 && frame < 50} />
          <Kolom label="Rincian Produk" isi={produk} aktif={frame >= 50 && frame < 88} />
          <Kolom label="Harga Modal" isi={modal ? 'Rp ' + modal : ''} aktif={frame >= 88 && frame < 116} />
          <Kolom label="Harga Jual" isi={jual ? 'Rp ' + jual : ''} aktif={frame >= 116 && frame < 148} />
          <div
            style={{
              marginTop: 30,
              height: 92,
              borderRadius: 24,
              background: warna.biru,
              color: 'white',
              fontSize: 33,
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
            bottom: 40,
            left: 70,
            right: 70,
            height: 84,
            borderRadius: 42,
            background: warna.hijau,
            color: 'white',
            fontSize: 30,
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
      </BingkaiHp>
      <div style={posisi(1470)}>
        <KataPop
          kata={['Catat', 'bon', 'dalam', 'hitungan', 'detik']}
          sorot={[3, 4]}
          ukuran={76}
          mulai={14}
        />
      </div>
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ---------- Adegan 6: CICILAN + STRUK WA (25-31 dtk) ---------- */

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

const Cicilan: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lunas = frame >= 66;
  const sisa = interpolate(frame, [56, 70], [45000, 0], clamp);
  const tombol = spring({frame: frame - 96, fps, config: {damping: 12}});
  const tekanWa = frame >= 128 && frame < 138 ? 0.94 : 1;
  const terkirim = spring({frame: frame - 140, fps, config: {damping: 11}});
  return (
    <Latar>
      <BingkaiHp>
        <Header judul="Tagihan" />
        <div style={{padding: '24px 28px'}}>
          <div style={{display: 'flex', gap: 14, marginBottom: 26}}>
            <Chip teks="Semua" aktif={false} />
            <Chip teks="Belum Lunas" aktif={!lunas} />
            <Chip teks="Lunas" aktif={lunas} />
          </div>
          <Bon nama="Bu Sari" produk="Beras 5 kg" sisa={sisa} lunas={lunas} />
          <Bon nama="Pak Joko" produk="Gula 10 kg" sisa={120000} lunas={false} />
          <Bon nama="Mbak Rina" produk="Kopi 1 dus" sisa={75000} lunas={false} />
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 10,
              opacity: tombol,
              transform: `translateY(${(1 - tombol) * 40}px)`,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 84,
                borderRadius: 22,
                background: warna.wa,
                color: 'white',
                fontSize: 28,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${tekanWa})`,
              }}
            >
              Bagikan (WA)
            </div>
            <div
              style={{
                flex: 1,
                height: 84,
                borderRadius: 22,
                background: warna.gelap,
                color: 'white',
                fontSize: 24,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Cetak Printer (RawBT)
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            padding: '20px 32px',
            borderRadius: 30,
            background: '#dcf8c6',
            color: '#0f2027',
            fontSize: 28,
            fontWeight: 700,
            opacity: terkirim,
            transform: `scale(${0.6 + 0.4 * terkirim})`,
          }}
        >
          Struk terkirim
        </div>
      </BingkaiHp>
      <div style={posisi(1470)}>
        <KataPop
          kata={['Bayar', 'cicilan,', 'kirim', 'struk', 'ke', 'WA']}
          sorot={[3, 4, 5]}
          ukuran={76}
          mulai={14}
        />
      </div>
      <Catatan teks="*Data contoh" />
    </Latar>
  );
};

/* ---------- Adegan 7: AJAKAN (31-36 dtk) ---------- */

const Ajakan: React.FC<{alamat: string}> = ({alamat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pil = spring({frame: frame - 50, fps, config: {damping: 9}});
  const sub = spring({frame: frame - 30, fps, config: {damping: 12}});
  return (
    <Latar glow={warna.hijau}>
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
    </Latar>
  );
};

/* ---------- Rangkaian semua adegan ---------- */

export const PromoBukuKredit: React.FC<PromoBKProps> = ({alamat}) => (
  <Latar>
    <Adegan dari={DARI[0]} durasi={D[0]}><Hook /></Adegan>
    <Adegan dari={DARI[1]} durasi={D[1]}><Masalah /></Adegan>
    <Adegan dari={DARI[2]} durasi={D[2]}><Solusi /></Adegan>
    <Adegan dari={DARI[3]} durasi={D[3]}><Dasbor /></Adegan>
    <Adegan dari={DARI[4]} durasi={D[4]}><CatatBon /></Adegan>
    <Adegan dari={DARI[5]} durasi={D[5]}><Cicilan /></Adegan>
    <Adegan dari={DARI[6]} durasi={D[6]}><Ajakan alamat={alamat} /></Adegan>
    <Progres />
  </Latar>
);
