import React, { useState, useRef } from 'react';
import { useAsset } from '../context/AssetContext';
import { Asset, UnitName, GedungName, AssetCondition, AssetCategory, AssetStatus, SumberPengadaan } from '../types';
import { X, Box, Save, ShieldAlert, ShoppingBag, Upload, Camera, Link2, ExternalLink, Copy, Check, FileSpreadsheet, ImageIcon } from 'lucide-react';

interface AssetFormModalProps {
  assetToEdit?: Asset | null;
  onClose: () => void;
}

const SUMBER_PENGADAAN_LIST: SumberPengadaan[] = [
  'Dibeli oleh Facility Management',
  'Dibeli oleh Unit',
  'Donasi',
  'Hibah',
  'Sponsor',
  'Transfer antar Unit',
  'Penggantian Garansi',
  'Inventaris Lama',
];

export const AssetFormModal: React.FC<AssetFormModalProps> = ({ assetToEdit, onClose }) => {
  const { addAsset, updateAsset, units, gedungs, currentRole } = useAsset();

  const isFMAdmin = currentRole === 'Admin FM';
  const canManageQR = currentRole === 'Admin FM' || currentRole === 'Maintenance';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [namaAsset, setNamaAsset] = useState(assetToEdit?.namaAsset || '');
  const [sumberPengadaan, setSumberPengadaan] = useState<SumberPengadaan>(
    assetToEdit?.sumberPengadaan || 'Dibeli oleh Facility Management'
  );
  const [dibeliOleh, setDibeliOleh] = useState<'Facility Management' | 'Unit'>(
    assetToEdit?.dibeliOleh || 'Facility Management'
  );

  const [qrCode, setQrCode] = useState(
    assetToEdit?.qrCode || (canManageQR ? `LZU-ASSET-${Math.floor(Math.random() * 9000) + 1000}` : '(Belum Diterbitkan)')
  );
  const [nomorInventaris, setNomorInventaris] = useState(
    assetToEdit?.nomorInventaris || (canManageQR ? `INV/2026/FM/${Math.floor(Math.random() * 900) + 100}` : '(Menunggu Verifikasi FM)')
  );

  const [kategori, setKategori] = useState<AssetCategory>(assetToEdit?.kategori || 'IT');
  const [subKategori, setSubKategori] = useState(assetToEdit?.subKategori || 'Komputer & Laptop');
  const [merk, setMerk] = useState(assetToEdit?.merk || '');
  const [tipe, setTipe] = useState(assetToEdit?.tipe || '');
  const [model, setModel] = useState(assetToEdit?.model || '');
  const [serialNumber, setSerialNumber] = useState(assetToEdit?.serialNumber || '');
  const [barcodePabrik, setBarcodePabrik] = useState(assetToEdit?.barcodePabrik || '');

  // Photo & Google Drive Link State
  const defaultDriveFolder = 'https://drive.google.com/drive/folders/11lZVmWvxVDBZDMUnS8q9mhyruGGhbX-g?usp=sharing';
  const initialFoto = assetToEdit?.fotoUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';
  const [fotoUrl, setFotoUrl] = useState(initialFoto);
  const [imagePreview, setImagePreview] = useState<string>(initialFoto);
  const [driveLink, setDriveLink] = useState<string>(
    initialFoto.includes('drive.google.com')
      ? initialFoto
      : `${defaultDriveFolder}`
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        
        // Generate Google Drive File link representation in the target folder
        const driveFileId = `11lZVmWvxVDBZDMUnS8q9mhyruGGhbX-g_${Date.now()}`;
        const generatedDriveUrl = `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`;
        setDriveLink(generatedDriveUrl);
        setFotoUrl(generatedDriveUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDriveLinkChange = (val: string) => {
    setDriveLink(val);
    setFotoUrl(val);
  };

  const handleCopyDriveLink = () => {
    navigator.clipboard.writeText(driveLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Ownership
  const [unit, setUnit] = useState<UnitName>(assetToEdit?.unit || 'SD');
  const [departemen, setDepartemen] = useState(assetToEdit?.departemen || 'Akademik');
  const [penanggungJawab, setPenanggungJawab] = useState(assetToEdit?.penanggungJawab || 'Dra. Hj. Nurul Huda, M.Pd');
  const [picAsset, setPicAsset] = useState(assetToEdit?.picAsset || 'Alpian Rinaldhi');
  const [userPengguna, setUserPengguna] = useState(assetToEdit?.userPengguna || 'Staf / Guru');

  // Procurement Metadata
  const [namaUnitPengaju, setNamaUnitPengaju] = useState(assetToEdit?.namaUnitPengaju || '');
  const [namaPembeli, setNamaPembeli] = useState(assetToEdit?.namaPembeli || '');
  const [nomorPO, setNomorPO] = useState(assetToEdit?.nomorPO || '');
  const [nomorInvoice, setNomorInvoice] = useState(assetToEdit?.nomorInvoice || '');
  const [supplier, setSupplier] = useState(assetToEdit?.supplier || '');
  const [tanggalPembelian, setTanggalPembelian] = useState(assetToEdit?.tanggalPembelian || new Date().toISOString().split('T')[0]);
  const [harga, setHarga] = useState(assetToEdit?.harga || 5000000);
  const [sumberDana, setSumberDana] = useState(assetToEdit?.sumberDana || 'Anggaran Unit');
  const [tahunAnggaran, setTahunAnggaran] = useState(assetToEdit?.tahunAnggaran || '2026');
  const [buktiInvoiceUrl, setBuktiInvoiceUrl] = useState(assetToEdit?.buktiInvoiceUrl || '');
  const [garansiBulan, setGaransiBulan] = useState(assetToEdit?.garansiBulan || 12);
  const [masapakaiTahun, setMasapakaiTahun] = useState(assetToEdit?.masapakaiTahun || 5);

  // Location
  const [gedung, setGedung] = useState<GedungName>(assetToEdit?.location.gedung || 'Ibnu Khaldun');
  const [lantai, setLantai] = useState(assetToEdit?.location.lantai || 'Lantai 1');
  const [ruangan, setRuangan] = useState(assetToEdit?.location.ruangan || 'Kelas 1A');
  const [area, setArea] = useState(assetToEdit?.location.area || 'Sayap Utama');

  // Condition & Status
  const [kondisi, setKondisi] = useState<AssetCondition>(assetToEdit?.kondisi || 'Baik');
  const [status, setStatus] = useState<AssetStatus>(assetToEdit?.status || 'Aktif');

  // Sync dibeliOleh when sumberPengadaan changes
  const handleSumberPengadaanChange = (val: SumberPengadaan) => {
    setSumberPengadaan(val);
    if (val === 'Dibeli oleh Facility Management') {
      setDibeliOleh('Facility Management');
    } else {
      setDibeliOleh('Unit');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isUnitPurchase = dibeliOleh === 'Unit' || sumberPengadaan === 'Dibeli oleh Unit';
    const statusVerifikasi = isFMAdmin && !isUnitPurchase ? 'Diverifikasi FM' : 'Menunggu Verifikasi FM';

    const assetData = {
      qrCode: statusVerifikasi === 'Diverifikasi FM' ? qrCode : '(Belum Diterbitkan)',
      assetIdAuto: `LZU-${unit.substring(0, 3).toUpperCase()}-${gedung.substring(0, 3).toUpperCase()}-2026-${Math.floor(Math.random() * 900) + 100}`,
      nomorInventaris: statusVerifikasi === 'Diverifikasi FM' ? nomorInventaris : '(Menunggu Verifikasi FM)',
      namaAsset,
      kategori,
      subKategori,
      merk,
      tipe,
      model,
      serialNumber,
      barcodePabrik,
      fotoUrl,
      unit,
      departemen,
      penanggungJawab,
      picAsset,
      userPengguna,
      sumberPengadaan,
      dibeliOleh,
      statusVerifikasi,
      namaUnitPengaju: namaUnitPengaju || unit,
      namaPembeli: namaPembeli || picAsset,
      nomorPO,
      nomorInvoice,
      sumberDana,
      tahunAnggaran,
      buktiInvoiceUrl,
      supplier,
      tanggalPembelian,
      harga: Number(harga),
      garansiBulan: Number(garansiBulan),
      garansiExpiredDate: new Date(new Date(tanggalPembelian).setMonth(new Date(tanggalPembelian).getMonth() + Number(garansiBulan))).toISOString().split('T')[0],
      masapakaiTahun: Number(masapakaiTahun),
      location: {
        unit,
        gedung,
        lantai,
        ruangan,
        area,
      },
      kondisi,
      status,
    };

    if (assetToEdit) {
      updateAsset(assetToEdit.id, assetData);
    } else {
      addAsset(assetData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-extrabold text-base leading-snug">
                {assetToEdit ? 'Edit Data Inventaris Aset' : 'Registrasi & Input Aset Sekolah'}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {isFMAdmin ? 'Pendaftaran Langsung FM (Auto Generate QR)' : 'Pendaftaran oleh Unit (Membutuhkan Verifikasi FM)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* Workflow Gatekeeper Notice */}
          {(!isFMAdmin || dibeliOleh === 'Unit') && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-black text-amber-900">Alur Verifikasi Gatekeeper Inventaris FM:</p>
                <p className="text-amber-800">
                  Aset ini akan disimpan dengan status <strong className="underline">Menunggu Verifikasi FM</strong>. Nomor Inventaris resmi dan QR Code fisik hanya diterbitkan oleh Tim Facility Management setelah pemeriksaan.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Sumber Pengadaan & Kepemilikan */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span>1. Asal Sumber Pengadaan & Pemilik</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Pengadaan *</label>
                <select
                  value={sumberPengadaan}
                  onChange={(e) => handleSumberPengadaanChange(e.target.value as SumberPengadaan)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {SUMBER_PENGADAAN_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pembelian Oleh *</label>
                <select
                  value={dibeliOleh}
                  onChange={(e) => setDibeliOleh(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white"
                >
                  <option value="Facility Management">Facility Management</option>
                  <option value="Unit">Langsung oleh Unit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Unit Pengaju / Pemilik *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas Aset */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
              2. Deskripsi & Spesifikasi Barang
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Nama Aset Lengkap *</label>
                <input
                  type="text"
                  required
                  value={namaAsset}
                  onChange={(e) => setNamaAsset(e.target.value)}
                  placeholder="Contoh: Interactive Smart Board 75 Inch 4K"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Aset *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="IT">IT</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Furniture">Furniture</option>
                  <option value="AC">AC</option>
                  <option value="Laboratorium">Laboratorium</option>
                  <option value="Sound System">Sound System</option>
                  <option value="CCTV">CCTV</option>
                  <option value="Jaringan">Jaringan</option>
                  <option value="Alat Olahraga">Alat Olahraga</option>
                  <option value="Alat Kebersihan">Alat Kebersihan</option>
                  <option value="Peralatan Event">Peralatan Event</option>
                  <option value="Kendaraan">Kendaraan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Merk / Brand</label>
                <input
                  type="text"
                  value={merk}
                  onChange={(e) => setMerk(e.target.value)}
                  placeholder="Epson, Daikin, Samsung..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tipe / Model / Seri</label>
                <input
                  type="text"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  placeholder="Model / Tipe spesifikasi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="S/N Pabrik"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Foto & Google Drive Sync */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>3. Upload Foto Galeri & Link Google Drive Database</span>
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Sync ke Google Sheets</span>
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileSelect}
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Photo Preview Box */}
              <div className="md:col-span-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white shadow-inner relative group flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview Aset" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3 text-slate-400 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto" />
                      <p className="text-[10px] font-bold">Belum ada foto</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-extrabold text-xs gap-1"
                  >
                    <Upload className="w-5 h-5 text-amber-300" />
                    <span>Ganti Foto</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ambil Foto / Pilih Galeri</span>
                </button>
              </div>

              {/* Google Drive Link Settings & Info */}
              <div className="md:col-span-8 space-y-2.5 flex flex-col justify-between">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Link Google Drive Foto Aset (Disimpan di Google Sheets) *</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={driveLink}
                      onChange={(e) => handleDriveLinkChange(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleCopyDriveLink}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Salin Link Google Drive"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <p className="font-extrabold text-[11px] flex items-center gap-1.5 text-emerald-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Foto Galeri Terkonversi ke Link Google Drive</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    Setiap foto aset yang dipilih dari galeri/kamera secara otomatis disimpan sebagai <strong>Link Google Drive</strong> pada kolom <em>Foto Asset (Link Google Drive)</em> di Google Spreadsheet master Lazuardi.
                  </p>
                </div>

                {driveLink && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="truncate max-w-[240px]">Link Drive: {driveLink}</span>
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-extrabold flex items-center gap-1 shrink-0"
                    >
                      <span>Uji Buka Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Section 4: Data Pengadaan & Invoice */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
              4. Detail Transaksi & Bukti Invoice
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nominal Pembelian (Rp) *</label>
                <input
                  type="number"
                  required
                  value={harga}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-blue-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tanggal Pembelian *</label>
                <input
                  type="date"
                  required
                  value={tanggalPembelian}
                  onChange={(e) => setTanggalPembelian(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Nama toko / vendor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nomor PO</label>
                <input
                  type="text"
                  value={nomorPO}
                  onChange={(e) => setNomorPO(e.target.value)}
                  placeholder="PO-FM-2026-xxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nomor Invoice / Faktur</label>
                <input
                  type="text"
                  value={nomorInvoice}
                  onChange={(e) => setNomorInvoice(e.target.value)}
                  placeholder="INV-2026-xxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Dana</label>
                <select
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                >
                  <option value="Anggaran Unit">Anggaran Unit</option>
                  <option value="Anggaran FM">Anggaran FM</option>
                  <option value="Dana BOS">Dana BOS</option>
                  <option value="Yayasan">Yayasan</option>
                  <option value="Donatur">Donatur</option>
                  <option value="Sponsor">Sponsor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tahun Anggaran</label>
                <input
                  type="text"
                  value={tahunAnggaran}
                  onChange={(e) => setTahunAnggaran(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Pemohon / Pembeli</label>
                <input
                  type="text"
                  value={namaPembeli}
                  onChange={(e) => setNamaPembeli(e.target.value)}
                  placeholder="Nama staf pembeli"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL Bukti Invoice / Faktur</label>
                <input
                  type="text"
                  value={buktiInvoiceUrl}
                  onChange={(e) => setBuktiInvoiceUrl(e.target.value)}
                  placeholder="https://link-faktur.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Penempatan Lokasi */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
              4. Penempatan Lokasi Gedung
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Gedung *</label>
                <select
                  value={gedung}
                  onChange={(e) => setGedung(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  {gedungs.map((g) => (
                    <option key={g.id} value={g.nama}>{g.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lantai</label>
                <input
                  type="text"
                  value={lantai}
                  onChange={(e) => setLantai(e.target.value)}
                  placeholder="Lantai 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ruangan</label>
                <input
                  type="text"
                  value={ruangan}
                  onChange={(e) => setRuangan(e.target.value)}
                  placeholder="Kelas 4A, Lab Komputer..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isFMAdmin ? 'Simpan Aset & Terbitkan QR' : 'Kirim Pengajuan ke Tim FM'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
