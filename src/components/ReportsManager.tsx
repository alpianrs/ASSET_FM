import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { exportAssetsToExcel, exportAssetsToPDF, exportMaintenanceToPDF } from '../utils/exportUtils';
import { FileText, FileSpreadsheet, Download, Filter, Printer, Layers } from 'lucide-react';

export const ReportsManager: React.FC = () => {
  const { assets, maintenanceLogs, units, gedungs } = useAsset();

  const [reportType, setReportType] = useState<
    | 'unit'
    | 'gedung'
    | 'pic'
    | 'rusak'
    | 'maintenance'
    | 'nilai_penyusutan'
    | 'hilang_pinjam'
    | 'stock_opname'
  >('unit');

  const [selectedUnit, setSelectedUnit] = useState('Semua');

  const getFilteredData = () => {
    switch (reportType) {
      case 'unit':
        return selectedUnit === 'Semua' ? assets : assets.filter((a) => a.unit === selectedUnit);
      case 'gedung':
        return assets;
      case 'rusak':
        return assets.filter((a) => a.status === 'Rusak' || a.kondisi.includes('Rusak'));
      case 'hilang_pinjam':
        return assets.filter((a) => a.status === 'Hilang' || a.status === 'Dipinjam');
      default:
        return assets;
    }
  };

  const reportData = getFilteredData();

  const handleExportPDF = () => {
    if (reportType === 'maintenance') {
      exportMaintenanceToPDF(maintenanceLogs);
    } else {
      exportAssetsToPDF(reportData, `Laporan Aset Lazuardi GCS - Kategori: ${reportType.toUpperCase()}`);
    }
  };

  const handleExportExcel = () => {
    exportAssetsToExcel(reportData, `Laporan_Aset_Lazuardi_${reportType}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Pusat Laporan & Ekspor Data Aset Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate laporan komprehensif seluruh aset Lazuardi GCS format PDF dan Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor ke Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase">Pilih Jenis Laporan Terstruktur:</label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setReportType('unit')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'unit' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            1. Asset per Unit
          </button>

          <button
            onClick={() => setReportType('gedung')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'gedung' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            2. Asset per Gedung
          </button>

          <button
            onClick={() => setReportType('rusak')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'rusak' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            3. Asset Rusak
          </button>

          <button
            onClick={() => setReportType('maintenance')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'maintenance' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            4. Maintenance Bulanan
          </button>

          <button
            onClick={() => setReportType('nilai_penyusutan')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'nilai_penyusutan' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            5. Nilai & Penyusutan Asset
          </button>

          <button
            onClick={() => setReportType('hilang_pinjam')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'hilang_pinjam' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            6. Asset Hilang & Dipinjam
          </button>

          <button
            onClick={() => setReportType('stock_opname')}
            className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
              reportType === 'stock_opname' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            7. Laporan Stock Opname
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-700">Preview Data Laporan ({reportData.length} Data)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">QR Code</th>
                <th className="py-3 px-4">Nama Aset</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Gedung / Lokasi</th>
                <th className="py-3 px-4">PIC</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{a.qrCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{a.namaAsset}</td>
                  <td className="py-3 px-4">{a.unit}</td>
                  <td className="py-3 px-4">{a.location.gedung} - {a.location.ruangan}</td>
                  <td className="py-3 px-4">{a.picAsset}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{a.kondisi}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
