import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { Asset, AssetCategory, AssetCondition, SumberPengadaan, StatusVerifikasi } from '../types';
import { formatRupiah } from '../utils/exportUtils';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  FileText,
  AlertTriangle,
  QrCode,
  Search,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  User,
  Tag,
  DollarSign,
  Calendar,
} from 'lucide-react';

const SUMBER_PENGADAAN_OPTIONS: SumberPengadaan[] = [
  'Dibeli oleh Facility Management',
  'Dibeli oleh Unit',
  'Donasi',
  'Hibah',
  'Sponsor',
  'Transfer antar Unit',
  'Penggantian Garansi',
  'Inventaris Lama',
];

export const ProcurementManager: React.FC = () => {
  const { assets, verifyAsset, rejectAsset, currentRole, addLog } = useAsset();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterSource, setFilterSource] = useState<string>('Semua');

  // Modal State for Verification
  const [verifyingAsset, setVerifyingAsset] = useState<Asset | null>(null);
  const [nomorInventarisInput, setNomorInventarisInput] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [kategoriInput, setKategoriInput] = useState<AssetCategory>('IT');
  const [masapakaiInput, setMasapakaiInput] = useState<number>(5);
  const [kondisiInput, setKondisiInput] = useState<AssetCondition>('Sangat Baik');

  // Modal State for Rejection
  const [rejectingAsset, setRejectingAsset] = useState<Asset | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isFMAdmin = currentRole === 'Admin FM';

  // Metrics
  const totalAssets = assets.length;
  const dibeliFMCount = assets.filter((a) => a.dibeliOleh === 'Facility Management' || a.sumberPengadaan === 'Dibeli oleh Facility Management').length;
  const dibeliUnitCount = assets.filter((a) => a.dibeliOleh === 'Unit' || a.sumberPengadaan === 'Dibeli oleh Unit').length;
  const pendingVerificationCount = assets.filter((a) => a.statusVerifikasi === 'Menunggu Verifikasi FM').length;
  const verifiedCount = assets.filter((a) => a.statusVerifikasi === 'Diverifikasi FM').length;
  const rejectedCount = assets.filter((a) => a.statusVerifikasi === 'Ditolak FM').length;
  const missingQRCount = assets.filter((a) => !a.qrCode || a.qrCode.includes('Belum') || a.qrCode.includes('Ditolak')).length;
  const missingInvCount = assets.filter((a) => !a.nomorInventaris || a.nomorInventaris.includes('Menunggu') || a.nomorInventaris.includes('Ditolak')).length;

  // Check pending assets older than 7 days
  const now = new Date();
  const pendingOver7Days = assets.filter((a) => {
    if (a.statusVerifikasi !== 'Menunggu Verifikasi FM') return false;
    const purchaseDate = new Date(a.tanggalPembelian);
    const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24));
    return diffDays > 7;
  });

  // Filtered assets
  const filteredAssets = assets.filter((asset) => {
    // Search
    const matchesSearch =
      asset.namaAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.nomorInvoice && asset.nomorInvoice.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.nomorPO && asset.nomorPO.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.supplier && asset.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status Filter
    const matchesStatus =
      filterStatus === 'Semua' ? true : asset.statusVerifikasi === filterStatus;

    // Source Filter
    const matchesSource =
      filterSource === 'Semua' ? true : asset.sumberPengadaan === filterSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleOpenVerifyModal = (asset: Asset) => {
    setVerifyingAsset(asset);
    const year = new Date().getFullYear();
    const unitShort = asset.unit.substring(0, 3).toUpperCase();
    const catShort = asset.kategori ? asset.kategori.substring(0, 3).toUpperCase() : 'GEN';
    
    // Auto-suggest official Inventory Number & QR Code
    const randomNum = Math.floor(100 + Math.random() * 900);
    setNomorInventarisInput(`INV/${year}/FM/${unitShort}/${randomNum}`);
    setQrCodeInput(`LZU-${unitShort}-${catShort}-${randomNum}`);
    setKategoriInput(asset.kategori || 'IT');
    setMasapakaiInput(asset.masapakaiTahun || 5);
    setKondisiInput(asset.kondisi || 'Sangat Baik');
  };

  const handleConfirmVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingAsset) return;

    verifyAsset(verifyingAsset.id, {
      nomorInventaris: nomorInventarisInput,
      qrCode: qrCodeInput,
      kategori: kategoriInput,
      masapakaiTahun: masapakaiInput,
      kondisi: kondisiInput,
    });

    setVerifyingAsset(null);
  };

  const handleOpenRejectModal = (asset: Asset) => {
    setRejectingAsset(asset);
    setRejectionReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAsset || !rejectionReason.trim()) return;

    rejectAsset(rejectingAsset.id, rejectionReason.trim());
    setRejectingAsset(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Gatekeeper Inventaris & Verifikasi Pengadaan FM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Monitoring Pengadaan & Verification Gate
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Seluruh aset yang masuk ke lingkungan Lazuardi GCS wajib terdaftar dan diverifikasi oleh Tim Facility Management untuk penerbitan Nomor Inventaris dan QR Code resmi.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Status Akses Anda</p>
              <p className="text-xs font-black text-blue-400 mt-0.5">{currentRole}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isFMAdmin ? 'Otoritas Verifikasi & QR Output Active' : 'User View & Submit Input'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner for Pending > 7 Days */}
      {pendingOver7Days.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-amber-900">
              PERINGATAN GATEKEEPER: {pendingOver7Days.length} Aset Menunggu Verifikasi Lebih Dari 7 Hari!
            </p>
            <p className="text-amber-700">
              Aset yang dibeli oleh Unit berikut telah mengantre lama dan belum diverifikasi fisik oleh Tim FM:{' '}
              <span className="font-bold underline">
                {pendingOver7Days.map((a) => `${a.namaAsset} (${a.unit})`).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Total Pengadaan</p>
            <p className="text-xl font-black text-slate-900">{totalAssets}</p>
            <p className="text-[10px] text-slate-500">FM: {dibeliFMCount} | Unit: {dibeliUnitCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/30 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-700">Menunggu Verifikasi</p>
            <p className="text-xl font-black text-amber-700">{pendingVerificationCount}</p>
            <p className="text-[10px] text-amber-600 font-semibold">Perlu Cek Fisik FM</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-200 bg-emerald-50/30 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-700">Diverifikasi FM</p>
            <p className="text-xl font-black text-emerald-700">{verifiedCount}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">QR Code Terbit</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-rose-200 bg-rose-50/30 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-rose-700">Ditolak FM</p>
            <p className="text-xl font-black text-rose-700">{rejectedCount}</p>
            <p className="text-[10px] text-rose-600 font-semibold">Tidak Memenuhi Syarat</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-indigo-200 bg-indigo-50/30 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-indigo-700">Belum Ada QR Code</p>
            <p className="text-xl font-black text-indigo-700">{missingQRCount}</p>
            <p className="text-[10px] text-indigo-600 font-semibold">Menunggu Output FM</p>
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aset, supplier, invoice, PO..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('Semua')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'Semua' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Status
              </button>
              <button
                onClick={() => setFilterStatus('Menunggu Verifikasi FM')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  filterStatus === 'Menunggu Verifikasi FM' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span>Menunggu Verifikasi</span>
                {pendingVerificationCount > 0 && (
                  <span className="bg-amber-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingVerificationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus('Diverifikasi FM')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'Diverifikasi FM' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Diverifikasi FM
              </button>
              <button
                onClick={() => setFilterStatus('Ditolak FM')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'Ditolak FM' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-rose-700 hover:bg-rose-100'
                }`}
              >
                Ditolak
              </button>
            </div>

            {/* Source Dropdown */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Sumber Pengadaan</option>
              {SUMBER_PENGADAAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Asset List & Gatekeeping Actions */}
      <div className="space-y-4">
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data aset pengadaan ditemukan</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter status verifikasi.</p>
          </div>
        ) : (
          filteredAssets.map((asset, index) => {
            const isPending = asset.statusVerifikasi === 'Menunggu Verifikasi FM';
            const isVerified = asset.statusVerifikasi === 'Diverifikasi FM';
            const isRejected = asset.statusVerifikasi === 'Ditolak FM';

            return (
              <div
                key={`${asset.id}-${index}`}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20 shadow-md shadow-amber-100/50'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  {/* Left Thumbnail & Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={asset.fotoUrl}
                      alt={asset.namaAsset}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                          {asset.unit}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {asset.sumberPengadaan || 'Pengadaan'}
                        </span>
                        
                        {/* Status Verifikasi Badge */}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Verifikasi FM</span>
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Diverifikasi FM</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Ditolak FM</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900">{asset.namaAsset}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {asset.merk} {asset.tipe} • Supplier: <span className="font-semibold text-slate-700">{asset.supplier || '-'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Price & QR Status */}
                  <div className="text-left md:text-right shrink-0">
                    <p className="text-xs text-slate-400 font-semibold">Harga Pembelian</p>
                    <p className="text-lg font-black text-blue-700">{formatRupiah(asset.harga)}</p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      No. Inv: <span className="text-slate-800 font-extrabold">{asset.nomorInventaris}</span>
                    </p>
                  </div>

                </div>

                {/* Procurement Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Dibeli Oleh</span>
                    <p className="font-extrabold text-slate-800">{asset.dibeliOleh || 'Unit'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pemohon / Pembeli</span>
                    <p className="font-semibold text-slate-800 truncate">{asset.namaPembeli || asset.penanggungJawab || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">No. Invoice / PO</span>
                    <p className="font-semibold text-slate-800 truncate">{asset.nomorInvoice || asset.nomorPO || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sumber Dana</span>
                    <p className="font-semibold text-slate-800">{asset.sumberDana || 'Anggaran Unit'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tgl Pembelian</span>
                    <p className="font-semibold text-slate-800">{asset.tanggalPembelian}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">QR Code Status</span>
                    <p className={`font-bold ${isVerified ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {asset.qrCode}
                    </p>
                  </div>
                </div>

                {/* Rejection Note if Rejected */}
                {isRejected && asset.alasanPenolakan && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-rose-900">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Alasan Penolakan Tim Facility Management:</span>
                    </p>
                    <p className="pl-5 text-rose-700 italic">"{asset.alasanPenolakan}"</p>
                  </div>
                )}

                {/* Verification Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>
                      Lokasi: <strong className="text-slate-800">{asset.location.gedung} ({asset.location.ruangan})</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* FM Admin Controls */}
                    {isFMAdmin && isPending && (
                      <>
                        <button
                          onClick={() => handleOpenRejectModal(asset)}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak Pengajuan</span>
                        </button>

                        <button
                          onClick={() => handleOpenVerifyModal(asset)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs transition-colors shadow-md shadow-emerald-200 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verifikasi & Terbitkan QR FM</span>
                        </button>
                      </>
                    )}

                    {isVerified && (
                      <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Diverifikasi oleh: {asset.diverifikasiOleh || 'Admin FM'} ({asset.tanggalVerifikasi || '2026'})</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* VERIFICATION MODAL (FM Only) */}
      {verifyingAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-black text-slate-900">Verifikasi & Terbitkan QR Asset</h3>
              </div>
              <button
                onClick={() => setVerifyingAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmVerify} className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-extrabold">{verifyingAsset.namaAsset}</p>
                <p>Unit Pengaju: <span className="font-bold">{verifyingAsset.unit}</span> | Harga: {formatRupiah(verifyingAsset.harga)}</p>
                <p className="text-[11px] text-blue-700">Sistem akan menyetujui aset dan menerbitkan Identitas Inventaris & QR Code resmi.</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nomor Inventaris Resmi (FM Output) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomorInventarisInput}
                  onChange={(e) => setNomorInventarisInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  QR Code Unique String (FM Output) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Masa Pakai (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={masapakaiInput}
                    onChange={(e) => setMasapakaiInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Kondisi Fisik Terverifikasi</label>
                  <select
                    value={kondisiInput}
                    onChange={(e) => setKondisiInput(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perawatan">Perlu Perawatan</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingAsset(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-200"
                >
                  Setujui & Terbitkan QR Code
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* REJECTION MODAL (FM Only) */}
      {rejectingAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-rose-700">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                <h3 className="text-base font-black text-slate-900">Tolak Pengajuan Aset Unit</h3>
              </div>
              <button
                onClick={() => setRejectingAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <p className="text-xs text-slate-600">
                Aset <strong className="text-slate-900">{rejectingAsset.namaAsset}</strong> dari unit{' '}
                <strong className="text-slate-900">{rejectingAsset.unit}</strong> akan ditolak oleh Tim FM.
              </p>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Alasan Penolakan Wajib Diisi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Bukti invoice tidak sah / Spesifikasi tidak sesuai standar Lazuardi GCS..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingAsset(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-200"
                >
                  Konfirmasi Tolak Aset
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
