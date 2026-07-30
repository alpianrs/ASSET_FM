import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { UnitName, GedungName } from '../types';
import { ClipboardCheck, CheckCircle2, AlertTriangle, QrCode, Search, RefreshCw, Check } from 'lucide-react';

export const StockOpname: React.FC = () => {
  const { assets, markAudited, units, gedungs } = useAsset();

  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');
  const [scanCode, setScanCode] = useState('');
  const [scannedIds, setScannedIds] = useState<string[]>([]);
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);

  const targetAssets = assets.filter((a) => {
    return selectedUnit === 'Semua' || a.unit === selectedUnit;
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
        markAudited(found.id);
      }
      setLastScannedName(found.namaAsset);
      setScanCode('');
    } else {
      alert(`Asset dengan QR/Kode "${scanCode}" tidak ditemukan di unit terpilih.`);
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
            Verifikasi fisik keberadaan aset sekolah berbasis Unit Lazuardi menggunakan pemindaian QR Code real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Progres Verifikasi Audit</p>
            <p className="text-lg font-black text-emerald-600">{scannedCount} / {targetAssets.length} Aset ({progressPercent}%)</p>
          </div>
        </div>
      </div>

      {/* Target Selector & Live Audit Scanner Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-400">1. Filter Target Audit</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah / Operasional</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
            >
              <option value="Semua">Semua Unit Lazuardi ({units.length} Unit)</option>
              {units.map((u) => (
                <option key={u.id} value={u.nama}>{u.nama}</option>
              ))}
            </select>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900">
            <strong>Catatan Opname:</strong> Verifikasi aset difokuskan langsung per Unit Sekolah karena lingkup gedung sudah terikat di bawah unit terkait.
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-emerald-950 p-6 rounded-3xl text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              <span>2. Input Pemindaian QR Opname</span>
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
              placeholder="Scan QR Code atau Ketik Kode Aset..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-900/50"
            >
              Verifikasi
            </button>
          </form>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Capaian Opname Target:</span>
              <span className="font-bold">{progressPercent}% selesai</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-700">Daftar Aset Target Stock Opname</h3>
          <span className="text-xs font-semibold text-slate-500">{targetAssets.length} Total Aset</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Status Opname</th>
                <th className="py-3 px-4">QR Code</th>
                <th className="py-3 px-4">Nama Aset</th>
                <th className="py-3 px-4">Unit & Gedung</th>
                <th className="py-3 px-4">Terakhir Diaudit</th>
                <th className="py-3 px-4 text-center">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {targetAssets.map((asset) => {
                const isAudited = scannedIds.includes(asset.id) || Boolean(asset.lastAuditedAt);
                return (
                  <tr key={asset.id} className={isAudited ? 'bg-emerald-50/40' : ''}>
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

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{asset.qrCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{asset.namaAsset}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.unit} ({asset.location.gedung})</td>
                    <td className="py-3 px-4 text-slate-500">{asset.lastAuditedAt || 'Belum pernah'}</td>
                    <td className="py-3 px-4 text-center">
                      {!isAudited && (
                        <button
                          onClick={() => {
                            setScannedIds((prev) => [...prev, asset.id]);
                            markAudited(asset.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors"
                        >
                          Tandai Ditemukan
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
