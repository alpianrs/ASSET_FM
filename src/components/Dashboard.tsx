import React from 'react';
import { useAsset } from '../context/AssetContext';
import { formatRupiah } from '../utils/exportUtils';
import { UnitName, GedungName } from '../types';
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  HelpCircle,
  Building2,
  TrendingUp,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface DashboardProps {
  onSelectUnitFilter: (unitName: UnitName) => void;
  onSelectAsset: (assetId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

const CONDITION_COLORS: Record<string, string> = {
  'Sangat Baik': '#10b981', // Emerald
  Baik: '#3b82f6', // Blue
  'Perlu Perawatan': '#f59e0b', // Amber
  'Rusak Ringan': '#f97316', // Orange
  'Rusak Berat': '#ef4444', // Red
  Hilang: '#6b7280', // Gray
  'Tidak Digunakan': '#9ca3af',
};

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectUnitFilter,
  onSelectAsset,
  onNavigateToTab,
}) => {
  const { assets, units, gedungs, maintenanceLogs } = useAsset();

  // Metrics
  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === 'Aktif').length;
  const damagedAssets = assets.filter((a) => a.status === 'Rusak' || a.kondisi.includes('Rusak')).length;
  const maintenanceAssets = assets.filter((a) => a.status === 'Maintenance').length;
  const borrowedAssets = assets.filter((a) => a.status === 'Dipinjam').length;
  const lostAssets = assets.filter((a) => a.status === 'Hilang' || a.kondisi === 'Hilang').length;
  const totalValue = assets.reduce((sum, a) => sum + (a.harga || 0), 0);

  // Stats by Gedung
  const gedungData = gedungs.map((g) => {
    const count = assets.filter((a) => a.location.gedung === g.nama).length;
    const value = assets
      .filter((a) => a.location.gedung === g.nama)
      .reduce((s, a) => s + (a.harga || 0), 0);
    return { name: g.nama, Jumlah: count, Nilai: value };
  });

  // Stats by Condition
  const conditionCounts: Record<string, number> = {};
  assets.forEach((a) => {
    conditionCounts[a.kondisi] = (conditionCounts[a.kondisi] || 0) + 1;
  });
  const conditionPieData = Object.keys(conditionCounts).map((cond) => ({
    name: cond,
    value: conditionCounts[cond],
  }));

  // Stats by Category
  const categoryCounts: Record<string, number> = {};
  assets.forEach((a) => {
    categoryCounts[a.kategori] = (categoryCounts[a.kategori] || 0) + 1;
  });
  const categoryChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    Jumlah: categoryCounts[cat],
  }));

  // Unit breakdown data
  const unitStats = units.map((u) => {
    const unitAssets = assets.filter((a) => a.unit === u.nama);
    const count = unitAssets.length;
    const value = unitAssets.reduce((s, a) => s + (a.harga || 0), 0);
    return {
      ...u,
      calculatedCount: count,
      calculatedValue: value,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Facility Management Lazuardi GCS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Asset & Maintenance Control Center
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time asset management across 11 units and 10 gedung locations with QR Code tracking.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateToTab('assets')}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs sm:text-sm hover:bg-blue-500 transition-all shadow-md shadow-blue-950 flex items-center justify-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span>Manage Assets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Assets</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalAssets}</p>
            <p className="text-xs font-bold text-blue-600 mt-0.5">
              {formatRupiah(totalValue)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Assets</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeAssets}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {((activeAssets / (totalAssets || 1)) * 100).toFixed(0)}% Normal Condition
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maintenance</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{maintenanceAssets}</p>
            <p className="text-xs font-medium text-amber-600 mt-0.5">Work Orders Active</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Damaged / Action</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{damagedAssets}</p>
            <p className="text-xs font-medium text-rose-600 mt-0.5">Needs Attention</p>
          </div>
        </div>

      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-slate-700">Borrowed</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{borrowedAssets} Units</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Missing</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{lostAssets} Units</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Total Work Orders</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{maintenanceLogs.length} WO</span>
        </div>
      </div>

      {/* BERDASARKAN UNIT (11 Master Units Grid) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Assets by Master Unit (11 Units)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any unit card to filter assets directly.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            11 Master Units
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {unitStats.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelectUnitFilter(u.nama)}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all text-left group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {u.nama}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-500 truncate">PIC: {u.picAsset}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                <span className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                  {u.calculatedCount} <span className="text-[10px] font-medium text-slate-500">Asset</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-600">
                  {formatRupiah(u.calculatedValue).replace('Rp', 'Rp ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAINTENANCE SPECIAL WIDGETS: CUCI AC & REKOMENDASI PENJUALAN/DONASI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Reminder Cuci AC Lazuardi */}
        <div className="bg-white p-6 rounded-3xl border border-cyan-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Jadwal & Reminder Cuci AC Sekolah</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Monitoring servis berkala unit AC Lazuardi GCS</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-extrabold text-xs">
              {assets.filter((a) => a.kategori === 'AC').length} Unit AC Total
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {assets.filter((a) => a.kategori === 'AC' || a.terakhirCuciAC).slice(0, 5).map((ac) => (
              <div
                key={ac.id}
                onClick={() => onSelectAsset(ac.id)}
                className="p-3 bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">{ac.namaAsset}</p>
                  <p className="text-[10px] text-slate-500 truncate">Unit {ac.unit} • Lokasi: {ac.location.ruangan}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    ac.statusCuciAC?.includes('SEGERA')
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {ac.statusCuciAC || 'Jadwal Normal'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Cuci Terakhir: {ac.terakhirCuciAC || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Rekomendasi Hasil Perbaikan (Dijual / Didonasikan) */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Aset Dibenarkan (Opsi Jual / Donasi)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Acuan status perbaikan tim maintenance untuk tindakan FM</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
              {assets.filter((a) => a.rekomendasiPerbaikan).length} Record Maintenance
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {assets.filter((a) => a.rekomendasiPerbaikan).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada aset dengan catatan rekomendasi penjualan/donasi dari maintenance.
              </div>
            ) : (
              assets.filter((a) => a.rekomendasiPerbaikan).map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onSelectAsset(rep.id)}
                  className="p-3 bg-amber-50/40 hover:bg-amber-100/60 border border-amber-200/80 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate">{rep.namaAsset}</p>
                    <p className="text-[10px] text-slate-600 truncate">Rincian: {rep.catatanPerbaikanTerakhir || 'Perbaikan fungsi'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                      {rep.rekomendasiPerbaikan}
                    </span>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">{rep.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart per Gedung */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Distribution by Gedung</h3>
              <p className="text-xs text-slate-500">Physical count across 10 gedung locations</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gedungData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Units`, 'Asset Count']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="Jumlah" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Kondisi Aset */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Asset Condition Breakdown</h3>
              <p className="text-xs text-slate-500">Physical operating health status</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {conditionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CONDITION_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val} Units`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart per Kategori */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Assets by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val: number) => [`${val} Units`, 'Category']} />
              <Bar dataKey="Jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
