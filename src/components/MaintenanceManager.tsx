import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { MaintenanceLog } from '../types';
import { formatRupiah, exportMaintenanceToPDF } from '../utils/exportUtils';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Building2,
  DollarSign,
  User,
  Check,
} from 'lucide-react';

export const MaintenanceManager: React.FC = () => {
  const { maintenanceLogs, updateWorkOrderStatus, addWorkOrder, assets } = useAsset();

  const [searchWO, setSearchWO] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);

  // New WO form state
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [jenisMaintenance, setJenisMaintenance] = useState<'Preventive' | 'Corrective'>('Preventive');
  const [teknisi, setTeknisi] = useState('Alpian Rinaldhi');
  const [vendor, setVendor] = useState('');
  const [sparepart, setSparepart] = useState('');
  const [biaya, setBiaya] = useState(0);
  const [catatan, setCatatan] = useState('');

  const filteredLogs = maintenanceLogs.filter((log) => {
    const s = searchWO.toLowerCase();
    const matchSearch =
      (log.woNumber || '').toLowerCase().includes(s) ||
      (log.teknisi || '').toLowerCase().includes(s) ||
      (log.catatan || '').toLowerCase().includes(s);
    const matchStatus = statusFilter === 'Semua' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmitWO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) return;

    addWorkOrder({
      woNumber: `WO-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      assetId,
      jenisMaintenance,
      tanggal: new Date().toISOString().split('T')[0],
      teknisi,
      vendor,
      sparepart,
      biaya: Number(biaya),
      catatan,
      status: 'In Progress',
    });

    setShowAddModal(false);
    setCatatan('');
  };

  const getStatusBadge = (status: MaintenanceLog['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Work Order Maintenance (Preventive & Corrective)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pemeliharaan preventif rutin dan perbaikan korektif aset sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat Work Order Baru</span>
          </button>
          <button
            onClick={() => exportMaintenanceToPDF(filteredLogs)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchWO}
            onChange={(e) => setSearchWO(e.target.value)}
            placeholder="Cari No. WO, teknisi, catatan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase shrink-0">Status WO:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Open">Open</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. WO & Jenis</th>
                <th className="py-3.5 px-4">Nama Aset</th>
                <th className="py-3.5 px-4">Tanggal & Teknisi</th>
                <th className="py-3.5 px-4">Sparepart / Vendor</th>
                <th className="py-3.5 px-4 text-right">Biaya (Rp)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Tindakan Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => {
                const targetAsset = assets.find((a) => a.id === log.assetId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-slate-900 font-mono">{log.woNumber}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.jenisMaintenance === 'Preventive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.jenisMaintenance}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{targetAsset?.namaAsset || log.assetId}</p>
                      <p className="text-[10px] text-slate-400">
                        {targetAsset?.unit} • {targetAsset?.location.gedung}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{log.tanggal}</p>
                      <p className="text-[10px] text-slate-500">Teknisi: {log.teknisi}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-700 truncate max-w-[150px]">{log.sparepart || '-'}</p>
                      {log.vendor && <p className="text-[10px] text-slate-400">Vendor: {log.vendor}</p>}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatRupiah(log.biaya)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {log.status !== 'Completed' ? (
                        <button
                          onClick={() => updateWorkOrderStatus(log.id, 'Completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add WO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span>Input Work Order Maintenance Baru</span>
            </h3>

            <form onSubmit={handleSubmitWO} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Pilih Aset Sekolah</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.namaAsset} ({a.unit} - {a.location.gedung})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Jenis Maintenance</label>
                  <select
                    value={jenisMaintenance}
                    onChange={(e) => setJenisMaintenance(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Corrective">Corrective</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teknisi</label>
                  <input
                    type="text"
                    value={teknisi}
                    onChange={(e) => setTeknisi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Vendor Eksternal</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Opsional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Sparepart Ditingkatkan</label>
                  <input
                    type="text"
                    value={sparepart}
                    onChange={(e) => setSparepart(e.target.value)}
                    placeholder="Contoh: Freon / Filter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Biaya Perbaikan / Sparepart (Rp)</label>
                <input
                  type="number"
                  value={biaya}
                  onChange={(e) => setBiaya(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Catatan Maintenance</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Simpan WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
