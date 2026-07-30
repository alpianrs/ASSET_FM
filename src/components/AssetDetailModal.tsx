import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { Asset, UnitName, GedungName, AssetCondition, AssetStatus } from '../types';
import { formatRupiah, calculateDepreciation, exportAssetsToPDF } from '../utils/exportUtils';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Building2,
  MapPin,
  Tag,
  User,
  ShieldCheck,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  ArrowRightLeft,
  Clock,
  FileText,
  Printer,
  Download,
  History,
  CheckCircle2,
  Share2,
  Plus,
} from 'lucide-react';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
  onOpenPrintQR: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onOpenPrintQR,
}) => {
  const {
    assets,
    currentRole,
    reportDamage,
    requestLoan,
    returnLoan,
    transferAsset,
    addWorkOrder,
    updateAssetCondition,
    recordACWash,
    recordAssetRepair,
    units,
    gedungs,
  } = useAsset();

  const asset = assets.find((a) => a.id === assetId);

  const [activeTab, setActiveTab] = useState<'info' | 'riwayat' | 'dokumen'>('info');

  // Sub-action modals state
  const [actionType, setActionType] = useState<
    'damage' | 'maintenance' | 'condition' | 'transfer' | 'loan' | 'ac_wash' | 'repair_result' | null
  >(null);

  // Form states for AC Wash
  const [washDate, setWashDate] = useState(new Date().toISOString().split('T')[0]);
  const [washInterval, setWashInterval] = useState(3);
  const [washTeknisi, setWashTeknisi] = useState('Pak Joko (Teknisi Vendor)');
  const [washVendor, setWashVendor] = useState('CV Windu Cool Technique (Vendor Luar)');
  const [washCost, setWashCost] = useState(150000);
  const [washFreon, setWashFreon] = useState(75);
  const [washFilter, setWashFilter] = useState(true);
  const [washOutdoor, setWashOutdoor] = useState(true);
  const [washNotes, setWashNotes] = useState('Pembersihan filter & cek tekanan freon.');

  // Form states for Repair Result
  const [repairTeknisi, setRepairTeknisi] = useState('Tim Maintenance FM');
  const [repairNotes, setRepairNotes] = useState('');
  const [repairCost, setRepairCost] = useState(250000);
  const [repairRekomendasi, setRepairRekomendasi] = useState<
    'Siap Pakai' | 'Rekomendasi Dijual' | 'Rekomendasi Didonasikan' | 'Afkir / Scrap'
  >('Siap Pakai');
  const [repairCondition, setRepairCondition] = useState<AssetCondition>('Baik');

  // Form states for actions
  const [damageDesc, setDamageDesc] = useState('');
  const [damageSeverity, setDamageSeverity] = useState<'Rusak Ringan' | 'Rusak Berat'>('Rusak Ringan');

  const [woType, setWoType] = useState<'Preventive' | 'Corrective'>('Preventive');
  const [woTeknisi, setWoTeknisi] = useState('Tim Maintenance FM');
  const [woVendor, setWoVendor] = useState('');
  const [woSparepart, setWoSparepart] = useState('');
  const [woCost, setWoCost] = useState(0);
  const [woNotes, setWoNotes] = useState('');

  const [newCondition, setNewCondition] = useState<AssetCondition>('Baik');
  const [newStatus, setNewStatus] = useState<AssetStatus>('Aktif');
  const [condNotes, setCondNotes] = useState('');

  const [transferUnit, setTransferUnit] = useState<UnitName>('SMP');
  const [transferGedung, setTransferGedung] = useState<GedungName>('Ibnu Rusyd');
  const [transferLantai, setTransferLantai] = useState('Lantai 1');
  const [transferRuangan, setTransferRuangan] = useState('Kelas 7A');
  const [transferNotes, setTransferNotes] = useState('');

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerUnit, setBorrowerUnit] = useState<UnitName>('SD');
  const [loanReturnDate, setLoanReturnDate] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');

  if (!asset) return null;

  const dep = calculateDepreciation(asset);

  const handleSubmitDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageDesc) return;
    reportDamage(asset.id, damageDesc, damageSeverity);
    setActionType(null);
    setDamageDesc('');
  };

  const handleSubmitWO = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkOrder({
      woNumber: `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId: asset.id,
      jenisMaintenance: woType,
      tanggal: new Date().toISOString().split('T')[0],
      teknisi: woTeknisi,
      vendor: woVendor,
      sparepart: woSparepart,
      biaya: Number(woCost),
      catatan: woNotes,
      status: 'In Progress',
    });
    setActionType(null);
  };

  const handleSubmitCondition = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssetCondition(asset.id, newCondition, newStatus, condNotes);
    setActionType(null);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transferAsset(asset.id, transferUnit, transferGedung, transferLantai, transferRuangan, transferNotes);
    setActionType(null);
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName || !loanReturnDate) return;
    requestLoan(
      asset.id,
      borrowerName,
      borrowerUnit,
      new Date().toISOString().split('T')[0],
      loanReturnDate,
      loanPurpose
    );
    setActionType(null);
  };

  const handleSubmitACWash = (e: React.FormEvent) => {
    e.preventDefault();
    recordACWash(asset.id, {
      tanggalCuci: washDate,
      intervalBulan: Number(washInterval),
      teknisi: washTeknisi,
      vendor: washVendor,
      biaya: Number(washCost),
      tekananFreonPsi: Number(washFreon),
      pembersihanFilter: washFilter,
      pembersihanOutdoor: washOutdoor,
      catatan: washNotes,
    });
    setActionType(null);
  };

  const handleSubmitRepairResult = (e: React.FormEvent) => {
    e.preventDefault();
    recordAssetRepair(asset.id, {
      teknisi: repairTeknisi,
      catatanPerbaikan: repairNotes,
      biaya: Number(repairCost),
      rekomendasi: repairRekomendasi,
      kondisi: repairCondition,
    });
    setActionType(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-sm">
              QR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">{asset.qrCode}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-mono">{asset.nomorInventaris}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black truncate max-w-md">{asset.namaAsset}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Banner */}
        <div className="p-4 bg-emerald-50/80 border-b border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-400 font-medium">Unit Pemilik:</span>
            <p className="font-bold text-slate-800">{asset.unit}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Lokasi:</span>
            <p className="font-bold text-slate-800">{asset.location.gedung} ({asset.location.ruangan})</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Kondisi:</span>
            <p className="font-bold text-emerald-700">{asset.kondisi}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Status:</span>
            <p className="font-bold text-blue-700">{asset.status}</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2 overflow-x-auto shrink-0">
          {asset.kategori === 'AC' && (
            <button
              onClick={() => setActionType('ac_wash')}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-200" />
              <span>Catat Cuci AC & Freon</span>
            </button>
          )}

          <button
            onClick={() => setActionType('repair_result')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
            <span>Rekam Hasil Perbaikan (Opsi Jual/Donasi)</span>
          </button>

          <button
            onClick={() => setActionType('damage')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Laporkan Kerusakan</span>
          </button>

          <button
            onClick={() => setActionType('maintenance')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Ajukan Maintenance</span>
          </button>

          <button
            onClick={() => setActionType('condition')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Kondisi</span>
          </button>

          <button
            onClick={() => setActionType('transfer')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Pindah Lokasi</span>
          </button>

          {asset.status === 'Dipinjam' ? (
            <button
              onClick={() => {
                const activeLoan = asset.loanHistory?.find((l) => l.status === 'Dipinjam');
                if (activeLoan) returnLoan(asset.id, activeLoan.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kembalikan Asset</span>
            </button>
          ) : (
            <button
              onClick={() => setActionType('loan')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pinjam Asset</span>
            </button>
          )}

          <button
            onClick={() => onOpenPrintQR(asset)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5 ml-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak QR</span>
          </button>

          <button
            onClick={() => exportAssetsToPDF([asset], `Detail Aset - ${asset.namaAsset}`)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'info' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Informasi Detail & Nilai Aset
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'riwayat' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Histori Aktivitas ({asset.maintenanceHistory?.length || 0} Maintenance)
            </button>
            <button
              onClick={() => setActiveTab('dokumen')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'dokumen' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Dokumen & Media ({asset.documents?.length || 0})
            </button>
          </div>

          {/* TAB 1: INFORMASI DETAIL */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Photo & QR Preview */}
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-sm">
                  <img src={asset.fotoUrl} alt={asset.namaAsset} className="w-full h-full object-cover" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">QR Code Digital</p>
                    <p className="text-xs font-mono font-extrabold text-slate-800">{asset.qrCode}</p>
                    <p className="text-[10px] text-slate-500">{asset.nomorInventaris}</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <QRCodeSVG value={asset.qrCode} size={64} level="M" />
                  </div>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Identitas & Spesifikasi */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>Identitas & Spesifikasi Produk</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Kategori</span>
                      <span className="font-bold text-slate-800">{asset.kategori} ({asset.subKategori})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Merk / Pabrik</span>
                      <span className="font-bold text-slate-800">{asset.merk}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tipe / Model</span>
                      <span className="font-bold text-slate-800">{asset.tipe} / {asset.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Serial Number</span>
                      <span className="font-mono font-bold text-slate-800">{asset.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Barcode Pabrik</span>
                      <span className="font-mono text-slate-700">{asset.barcodePabrik || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Supplier</span>
                      <span className="font-bold text-slate-800">{asset.supplier}</span>
                    </div>
                  </div>
                </div>

                {/* Informasi Pengadaan & Verifikasi FM */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Data Pengadaan & Status Verifikasi FM</span>
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black ${
                        asset.statusVerifikasi === 'Diverifikasi FM'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : asset.statusVerifikasi === 'Ditolak FM'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      }`}
                    >
                      {asset.statusVerifikasi || 'Diverifikasi FM'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Sumber Pengadaan</span>
                      <span className="font-bold text-slate-800">{asset.sumberPengadaan || 'Dibeli oleh FM'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Dibeli Oleh</span>
                      <span className="font-bold text-slate-800">{asset.dibeliOleh || 'Facility Management'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nama Pemohon / Pembeli</span>
                      <span className="font-semibold text-slate-800">{asset.namaPembeli || asset.penanggungJawab || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nomor PO</span>
                      <span className="font-mono text-slate-800">{asset.nomorPO || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nomor Invoice</span>
                      <span className="font-mono text-slate-800">{asset.nomorInvoice || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Sumber Dana & Tahun</span>
                      <span className="font-semibold text-slate-800">{asset.sumberDana || 'Anggaran Unit'} ({asset.tahunAnggaran || '2026'})</span>
                    </div>
                  </div>

                  {asset.statusVerifikasi === 'Ditolak FM' && asset.alasanPenolakan && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                      <p className="font-extrabold text-rose-900">Alasan Penolakan FM:</p>
                      <p className="italic">"{asset.alasanPenolakan}"</p>
                    </div>
                  )}
                </div>

                {/* Lokasi & Kepemilikan */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Lokasi & Penanggung Jawab</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Unit Pemilik</span>
                      <span className="font-bold text-slate-800">{asset.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Gedung</span>
                      <span className="font-bold text-slate-800">{asset.location.gedung}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Lantai & Ruangan</span>
                      <span className="font-bold text-slate-800">{asset.location.lantai} - {asset.location.ruangan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Area Detail</span>
                      <span className="text-slate-700">{asset.location.area}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">PIC Asset</span>
                      <span className="font-bold text-emerald-800">{asset.picAsset}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">User Pengguna</span>
                      <span className="text-slate-700">{asset.userPengguna}</span>
                    </div>
                  </div>
                </div>

                {/* Nilai Pembelian & Penyusutan */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>Nilai Aset & Perhitungan Penyusutan</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Harga Perolehan</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(asset.harga)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tgl Pembelian</span>
                      <span className="font-semibold text-slate-800">{asset.tanggalPembelian}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Umur Aset Saat Ini</span>
                      <span className="font-bold text-slate-800">{dep.ageYears} Tahun</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Masa Pakai Ideal</span>
                      <span className="font-bold text-slate-800">{asset.masapakaiTahun} Tahun</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Estimasi Nilai Buku Saat Ini (Penyusutan Garis Lurus):</span>
                    <span className="font-extrabold text-emerald-800 text-sm">{formatRupiah(dep.bookValue)}</span>
                  </div>
                </div>

                {/* Card Cuci AC & Reminder Status (Jika Kategori AC atau Ada Record Cuci) */}
                {(asset.kategori === 'AC' || asset.terakhirCuciAC) && (
                  <div className="p-5 rounded-2xl bg-cyan-50/80 border border-cyan-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-900 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-cyan-700" />
                        <span>Monitoring & Reminder Cuci AC Lazuardi</span>
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          asset.statusCuciAC === 'Perlu Cuci SEGERA'
                            ? 'bg-rose-500 text-white animate-bounce'
                            : asset.statusCuciAC === 'Perlu Cuci Bulan Ini'
                            ? 'bg-amber-400 text-slate-900 font-extrabold'
                            : 'bg-cyan-700 text-white'
                        }`}
                      >
                        {asset.statusCuciAC || 'Jadwal Normal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Terakhir Dicuci</span>
                        <span className="font-black text-slate-800">{asset.terakhirCuciAC || 'Belum Ada Record'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Jadwal Cuci Berikutnya</span>
                        <span className="font-black text-cyan-900">{asset.jadwalCuciACBerikutnya || '3 Bulan dari Cuci Terakhir'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-medium">Jumlah Cuci Dicatat</span>
                        <span className="font-bold text-slate-800">{asset.acWashHistory?.length || 0} Kali Service</span>
                      </div>
                    </div>

                    {asset.acWashHistory && asset.acWashHistory.length > 0 && (
                      <div className="pt-2 border-t border-cyan-200 text-xs">
                        <p className="text-[10px] font-bold text-cyan-900 uppercase mb-1">Pencucian Terakhir:</p>
                        <p className="text-slate-700 italic">
                          "{asset.acWashHistory[0].catatan}" (Tekanan Freon: {asset.acWashHistory[0].tekananFreonPsi || 75} psi, Oleh: {asset.acWashHistory[0].teknisi})
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Rekomendasi Status Hasil Perbaikan (Disiapkan untuk Dijual / Didonasikan) */}
                {asset.rekomendasiPerbaikan && (
                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700" />
                        <span>Acuan Status Pasca Perbaikan Maintenance</span>
                      </h4>
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                        {asset.rekomendasiPerbaikan}
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-bold uppercase">Rincian Perbaikan Terakhir:</span>
                        <p className="font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-amber-200 mt-1">
                          {asset.catatanPerbaikanTerakhir || 'Perbaikan modul & fungsi umum.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold pt-1">
                        <span>Tanggal Selesai Dibenarkan: {asset.tanggalSelesaiPerbaikan || asset.lastAuditedAt || 'Terbaru'}</span>
                        <span className="text-amber-900 font-extrabold">Status Siap Diproses FM</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: RIWAYAT */}
          {activeTab === 'riwayat' && (
            <div className="space-y-6">
              
              {/* Maintenance History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Riwayat Pemeliharaan & Repair (Work Orders)</span>
                </h4>

                {(!asset.maintenanceHistory || asset.maintenanceHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Belum ada catatan maintenance untuk aset ini.</p>
                ) : (
                  <div className="space-y-2">
                    {asset.maintenanceHistory.map((m) => (
                      <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{m.woNumber} ({m.jenisMaintenance})</span>
                          <span className="text-emerald-700">{formatRupiah(m.biaya)}</span>
                        </div>
                        <p className="text-slate-600">{m.catatan}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                          <span>Tanggal: {m.tanggal}</span>
                          <span>Teknisi: {m.teknisi}</span>
                          {m.vendor && <span>Vendor: {m.vendor}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Damage Reports */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Riwayat Laporan Kerusakan</span>
                </h4>

                {(!asset.damageReports || asset.damageReports.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada laporan kerusakan tersimpan.</p>
                ) : (
                  <div className="space-y-2">
                    {asset.damageReports.map((d) => (
                      <div key={d.id} className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <span>{d.tingkatKerusakan}</span>
                          <span>{d.reportedAt}</span>
                        </div>
                        <p className="text-rose-800">{d.deskripsi}</p>
                        <p className="text-[10px] text-rose-600">Pelapor: {d.reportedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Loan History */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Riwayat Peminjaman Aset</span>
                </h4>

                {(!asset.loanHistory || asset.loanHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Belum pernah dipinjam.</p>
                ) : (
                  <div className="space-y-2">
                    {asset.loanHistory.map((l) => (
                      <div key={l.id} className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-900">
                          <span>Peminjam: {l.borrowerName} ({l.borrowerUnit})</span>
                          <span className="text-purple-700 font-normal">{l.status}</span>
                        </div>
                        <p className="text-purple-800">Tujuan: {l.purpose}</p>
                        <p className="text-[10px] text-purple-600">Tgl Pinjam: {l.startDate} s.d. {l.expectedReturnDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: DOKUMEN */}
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-700">Lampiran Dokumen & Media Aset</h4>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Dokumen</span>
                </button>
              </div>

              {(!asset.documents || asset.documents.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  Belum ada dokumen atau manual book yang diupload.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {asset.documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.type} • Upload {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <button className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* SUB-ACTION MODAL POPUPS */}
      {actionType === 'damage' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Laporkan Kerusakan Aset</span>
            </h3>
            <form onSubmit={handleSubmitDamage} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tingkat Kerusakan</label>
                <select
                  value={damageSeverity}
                  onChange={(e) => setDamageSeverity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Deskripsi Kerusakan</label>
                <textarea
                  rows={3}
                  value={damageDesc}
                  onChange={(e) => setDamageDesc(e.target.value)}
                  placeholder="Jelaskan detail bagian yang rusak..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'maintenance' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              <span>Buat Work Order Maintenance</span>
            </h3>
            <form onSubmit={handleSubmitWO} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Jenis Maintenance</label>
                <select
                  value={woType}
                  onChange={(e) => setWoType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Preventive">Preventive (Pencegahan Rutin)</option>
                  <option value="Corrective">Corrective (Perbaikan Kerusakan)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Teknisi / Penanggung Jawab</label>
                <input
                  type="text"
                  value={woTeknisi}
                  onChange={(e) => setWoTeknisi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vendor Eksternal (Opsional)</label>
                <input
                  type="text"
                  value={woVendor}
                  onChange={(e) => setWoVendor(e.target.value)}
                  placeholder="Contoh: Daikin Service Center"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Estimasi Biaya (Rp)</label>
                <input
                  type="number"
                  value={woCost}
                  onChange={(e) => setWoCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Catatan Maintenance</label>
                <textarea
                  rows={2}
                  value={woNotes}
                  onChange={(e) => setWoNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Buat WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'transfer' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              <span>Perpindahan Lokasi & Unit Aset</span>
            </h3>
            <form onSubmit={handleSubmitTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Pindah ke Unit</label>
                <select
                  value={transferUnit}
                  onChange={(e) => setTransferUnit(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Ke Gedung</label>
                <select
                  value={transferGedung}
                  onChange={(e) => setTransferGedung(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  {gedungs.map((g) => (
                    <option key={g.id} value={g.nama}>{g.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Lantai & Ruangan</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={transferLantai}
                    onChange={(e) => setTransferLantai(e.target.value)}
                    placeholder="Lantai 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                  />
                  <input
                    type="text"
                    value={transferRuangan}
                    onChange={(e) => setTransferRuangan(e.target.value)}
                    placeholder="Ruang Kelas"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Alasan Perpindahan</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Konfirmasi Pindah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'ac_wash' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-600" />
                <span>Pencucian & Servis AC Periodic</span>
              </h3>
              <button onClick={() => setActionType(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitACWash} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Pencucian *</label>
                  <input
                    type="date"
                    required
                    value={washDate}
                    onChange={(e) => setWashDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Interval Berikutnya *</label>
                  <select
                    value={washInterval}
                    onChange={(e) => setWashInterval(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value={3}>Setiap 3 Bulan</option>
                    <option value={4}>Setiap 4 Bulan</option>
                    <option value={6}>Setiap 6 Bulan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Vendor Luar AC *</label>
                  <input
                    type="text"
                    required
                    value={washVendor}
                    onChange={(e) => setWashVendor(e.target.value)}
                    placeholder="Contoh: CV Windu Cool"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teknisi / Tukang AC *</label>
                  <input
                    type="text"
                    required
                    value={washTeknisi}
                    onChange={(e) => setWashTeknisi(e.target.value)}
                    placeholder="Pak Joko / Mas Rahmat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tekanan Freon (psi)</label>
                  <input
                    type="number"
                    value={washFreon}
                    onChange={(e) => setWashFreon(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Biaya Pencucian (Rp)</label>
                  <input
                    type="number"
                    value={washCost}
                    onChange={(e) => setWashCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={washFilter}
                    onChange={(e) => setWashFilter(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded-md"
                  />
                  <span>Cuci Filter Indoor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={washOutdoor}
                    onChange={(e) => setWashOutdoor(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded-md"
                  />
                  <span>Cuci Outdoor Unit</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Pekerjaan / Hasil</label>
                <textarea
                  rows={2}
                  value={washNotes}
                  onChange={(e) => setWashNotes(e.target.value)}
                  placeholder="Keterangan perbaikan / servis..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold shadow-md"
                >
                  Simpan Record Cuci AC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'repair_result' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                <span>Rekam Hasil Perbaikan Aset Maintenance</span>
              </h3>
              <button onClick={() => setActionType(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepairResult} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Teknisi / Penanggung Jawab Perbaikan *</label>
                <input
                  type="text"
                  required
                  value={repairTeknisi}
                  onChange={(e) => setRepairTeknisi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rekomendasi Status Hasil Perbaikan *</label>
                <select
                  value={repairRekomendasi}
                  onChange={(e) => setRepairRekomendasi(e.target.value as any)}
                  className="w-full bg-amber-50 border border-amber-300 rounded-xl p-2.5 font-black text-amber-900"
                >
                  <option value="Siap Pakai">Siap Pakai Kembali di Unit Lazuardi</option>
                  <option value="Rekomendasi Dijual">Rekomendasi Dijual (Layak Komersial)</option>
                  <option value="Rekomendasi Didonasikan">Rekomendasi Didonasikan (Masih Berfungsi)</option>
                  <option value="Afkir / Scrap">Rekomendasi Afkir / Di-Scrap</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Status ini menjadi acuan rekomendasi apakah barang bisa dijual atau didonasikan jika sudah dibenarkan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kondisi Pasca Perbaikan *</label>
                  <select
                    value={repairCondition}
                    onChange={(e) => setRepairCondition(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perawatan">Perlu Perawatan</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Biaya Perbaikan (Rp)</label>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Rincian Perbaikan yang Dilakukan *</label>
                <textarea
                  rows={3}
                  required
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Contoh: Mengganti kapasitor kompresor & modul sensor suhu. AC sudah dingin normal dan lulus uji 4 jam..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold shadow-md"
                >
                  Simpan Catatan Perbaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'loan' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Pengajuan Peminjaman Aset</span>
            </h3>
            <form onSubmit={handleSubmitLoan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Peminjam</label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="Nama Staf / Guru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Unit Peminjam</label>
                <select
                  value={borrowerUnit}
                  onChange={(e) => setBorrowerUnit(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.nama}>{u.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Rencana Tgl Pengembalian</label>
                <input
                  type="date"
                  value={loanReturnDate}
                  onChange={(e) => setLoanReturnDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tujuan / Acara</label>
                <textarea
                  rows={2}
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  placeholder="Contoh: Digunakan untuk Workshop Kurikulum"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Ajukan Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'condition' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Update Kondisi & Status Aset</span>
            </h3>
            <form onSubmit={handleSubmitCondition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Kondisi Aset</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Perlu Perawatan">Perlu Perawatan</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                  <option value="Hilang">Hilang</option>
                  <option value="Tidak Digunakan">Tidak Digunakan</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Status Operasional</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Dipinjam">Dipinjam</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Dijual">Dijual</option>
                  <option value="Dihapus">Dihapus</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Catatan Perubahan</label>
                <textarea
                  rows={2}
                  value={condNotes}
                  onChange={(e) => setCondNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
