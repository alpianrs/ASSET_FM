import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { ClipboardCheck, CheckCircle2, AlertTriangle, QrCode, Search, RefreshCw, Calendar, RotateCcw, Filter } from 'lucide-react';

export const StockOpname: React.FC = () => {
  const { assets, markAudited, resetStockOpname, units } = useAsset();

  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [opnameDate, setOpnameDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scanCode, setScanCode] = useState('');
  const [scannedIds, setScannedIds] = useState<string[]>([]);
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);

  const targetAssets = assets.filter((a) => {
    const matchesUnit = selectedUnit === 'Semua' || a.unit === selectedUnit;
    const matchesCategory = selectedCategory === 'Semua' || a.kategori === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      a.namaAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.qrCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetIdAuto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.ruangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.merk.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUnit && matchesCategory && matchesSearch;
  });

  const scannedCount = targetAssets.filter((a) => scannedIds.includes(a.id) || a.lastAuditedAt).length;
  const progressPercent = Math.round((scannedCount / (targetAssets.length || 1)) * 100);

  const handleAuditScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    const code = scanCode.trim().toLowerCase();
    const found = targetAssets.find(
      (a) =>
        a.qrCode.toLowerCase() === code ||
        a.assetIdAuto.toLowerCase() === code ||
        a.nomorInventaris.toLowerCase() === code
    );

    if (found) {
      if (!scannedIds.includes(found.id)) {
        setScannedIds((prev) => [...prev, found.id]);
      }
      markAudited(found.id, opnameDate);
      setLastScannedName(found.namaAsset);
      setScanCode('');
    } else {
      alert(`Asset dengan QR/Kode "${scanCode}" tidak ditemukan pada daftar filter terpilih.`);
    }
  };

  const handleResetOpname = () => {
    const unitText = selectedUnit === 'Semua' ? 'seluruh unit Lazuardi' : `unit ${selectedUnit}`;
    if (window.confirm(`Apakah Anda yakin ingin MERESET status Stock Opname untuk ${unitText}? Semua status verifikasi fisik akan dikembalikan ke 'Belum Di-Scan' agar bisa dilakukan Stock Opname ulang.`)) {
      setScannedIds([]);
      setLastScannedName(null);
      resetStockOpname(selectedUnit);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            <span>Audit Stock Opname Inventaris Aset</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi fisik keberadaan aset sekolah berbasis Unit Lazuardi menggunakan pemindaian QR Code real-time & penetapan tanggal opname.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Progres Opname Target</p>
            <p className="text-lg font-black text-emerald-600">{scannedCount} / {targetAssets.length} Aset ({progressPercent}%)</p>
          </div>

          <button
            onClick={handleResetOpname}
            className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            title="Mulai Ulang Stock Opname (Reset Status Verifikasi)"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Lakukan Opname Kembali</span>
          </button>
        </div>
      </div>

      {/* Target Selector & Live Audit Scanner Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1: Filter & Date Configuration */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Pengaturan Opname</span>
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tanggal Pelaksanaan Opname:</span>
            </label>
            <input
              type="date"
              value={opnameDate}
              onChange={(e) => setOpnameDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Sekolah / Operasional</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800"
            >
              <option value="Semua">Semua Unit Lazuardi ({units.length} Unit)</option>
              {units.map((u) => (
                <option key={u.id} value={u.nama}>{u.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Aset</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800"
            >
              <option value="Semua">Semua Kategori Aset</option>
              <option value="AC">AC (Pendingin Ruangan)</option>
              <option value="IT">IT & Komputer</option>
              <option value="Laboratorium">Laboratorium</option>
              <option value="Sound System">Sound System</option>
              <option value="Elektronik">Elektronik</option>
            </select>
          </div>
        </div>

        {/* Step 2: Scanner Box */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-6 rounded-3xl text-white shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>2. Input Pemindaian QR / Kode Opname</span>
            </h3>
            {lastScannedName && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                Terverifikasi: {lastScannedName}
              </span>
            )}
          </div>

          <form onSubmit={handleAuditScan} className="flex gap-2">
            <input
              type="text"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="Scan QR Code atau Ketik Kode Aset / Nama Ruangan..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-900/50 shrink-0"
            >
              Verifikasi
            </button>
          </form>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Capaian Opname Target (Tanggal: {opnameDate}):</span>
              <span className="font-bold">{progressPercent}% selesai ({scannedCount} dari {targetAssets.length})</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Audit Checklist Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Daftar Aset Target Stock Opname ({targetAssets.length} Aset)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Search filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aset / merk / ruangan..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Status Opname</th>
                <th className="py-3 px-4">QR / Kode Aset</th>
                <th className="py-3 px-4">Nama Aset & Merk</th>
                <th className="py-3 px-4">Lokasi & Gedung</th>
                <th className="py-3 px-4">Tanggal Audit Terakhir</th>
                <th className="py-3 px-4 text-center">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {targetAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada aset yang sesuai kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                targetAssets.map((asset) => {
                  const isAudited = scannedIds.includes(asset.id) || Boolean(asset.lastAuditedAt);
                  return (
                    <tr key={asset.id} className={isAudited ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-4">
                        {isAudited ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Fisik Ditemukan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Belum Di-Scan</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {asset.qrCode}
                        <div className="text-[10px] font-normal text-slate-400">{asset.assetIdAuto}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 block">{asset.namaAsset}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Merk: {asset.merk} ({asset.kategori})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-bold block">{asset.location.ruangan}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{asset.unit} • Gedung {asset.location.gedung}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {asset.lastAuditedAt ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            <span>{asset.lastAuditedAt}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum pernah</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (!scannedIds.includes(asset.id)) {
                              setScannedIds((prev) => [...prev, asset.id]);
                            }
                            markAudited(asset.id, opnameDate);
                          }}
                          className={`px-3 py-1 rounded-xl font-extrabold text-[10px] transition-all flex items-center gap-1 mx-auto ${
                            isAudited
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAudited ? 'Audit Ulang' : 'Tandai Ditemukan'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

