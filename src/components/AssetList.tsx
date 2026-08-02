import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { Asset, UnitName, GedungName, AssetCondition, AssetCategory, AssetStatus } from '../types';
import { formatRupiah, exportAssetsToExcel, exportAssetsToPDF } from '../utils/exportUtils';
import { getDirectImageUrl } from '../utils/imageUtils';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  Edit3,
  Building2,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  Grid,
  List,
} from 'lucide-react';

interface AssetListProps {
  initialUnitFilter?: UnitName | null;
  onSelectAsset: (assetId: string) => void;
  onOpenPrintQR: (asset: Asset) => void;
  onOpenAddModal: () => void;
  onEditAsset: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  initialUnitFilter,
  onSelectAsset,
  onOpenPrintQR,
  onOpenAddModal,
  onEditAsset,
}) => {
  const { assets, deleteAsset, currentRole, units, gedungs } = useAsset();

  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnitFilter || 'Semua');
  const [selectedGedung, setSelectedGedung] = useState<string>('Semua');
  const [selectedKondisi, setSelectedKondisi] = useState<string>('Semua');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filtering logic
  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      search === '' ||
      a.namaAsset.toLowerCase().includes(search.toLowerCase()) ||
      a.qrCode.toLowerCase().includes(search.toLowerCase()) ||
      a.nomorInventaris.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.picAsset.toLowerCase().includes(search.toLowerCase());

    const matchUnit = selectedUnit === 'Semua' || a.unit === selectedUnit;
    const matchGedung = selectedGedung === 'Semua' || a.location.gedung === selectedGedung;
    const matchKondisi = selectedKondisi === 'Semua' || a.kondisi === selectedKondisi;
    const matchKategori = selectedKategori === 'Semua' || a.kategori === selectedKategori;
    const matchStatus = selectedStatus === 'Semua' || a.status === selectedStatus;

    return matchSearch && matchUnit && matchGedung && matchKondisi && matchKategori && matchStatus;
  });

  const handleResetFilters = () => {
    setSearch('');
    setSelectedUnit('Semua');
    setSelectedGedung('Semua');
    setSelectedKondisi('Semua');
    setSelectedKategori('Semua');
    setSelectedStatus('Semua');
  };

  const getKondisiBadge = (kondisi: AssetCondition) => {
    switch (kondisi) {
      case 'Sangat Baik':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Baik':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Perlu Perawatan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rusak Ringan':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rusak Berat':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>School Master Assets</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {filteredAssets.length} Assets
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage identity, location, responsible staff, and maintenance logs across all Lazuardi GCS assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentRole === 'Admin FM' || currentRole === 'Maintenance') && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Asset Baru & QR</span>
            </button>
          )}

          <button
            onClick={() => exportAssetsToExcel(filteredAssets)}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={() => exportAssetsToPDF(filteredAssets)}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
            title="Export to PDF"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset name, QR Code, inventory number, brand, PIC..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1 shrink-0"
          >
            Reset Filters
          </button>
        </div>

        {/* Multi Select Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          
          {/* Unit Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Owner Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="Semua">All Units (11)</option>
              {units.map((u) => (
                <option key={u.id} value={u.nama}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Gedung Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gedung</label>
            <select
              value={selectedGedung}
              onChange={(e) => setSelectedGedung(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="Semua">All Gedung</option>
              {gedungs.map((g) => (
                <option key={g.id} value={g.nama}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Kondisi Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Physical Condition</label>
            <select
              value={selectedKondisi}
              onChange={(e) => setSelectedKondisi(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="Semua">All Conditions</option>
              <option value="Sangat Baik">Sangat Baik</option>
              <option value="Baik">Baik</option>
              <option value="Perlu Perawatan">Perlu Perawatan</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Hilang">Hilang</option>
              <option value="Tidak Digunakan">Tidak Digunakan</option>
            </select>
          </div>

          {/* Kategori Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="Semua">All Categories</option>
              <option value="Furniture">Furniture</option>
              <option value="Elektronik">Elektronik</option>
              <option value="AC">AC</option>
              <option value="Mesin">Mesin</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="IT">IT</option>
              <option value="Sound System">Sound System</option>
              <option value="CCTV">CCTV</option>
              <option value="Jaringan">Jaringan</option>
              <option value="Alat Kebersihan">Alat Kebersihan</option>
              <option value="Alat Olahraga">Alat Olahraga</option>
              <option value="Laboratorium">Laboratorium</option>
              <option value="Peralatan Event">Peralatan Event</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operational Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="Semua">All Statuses</option>
              <option value="Aktif">Aktif</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
              <option value="Hilang">Hilang</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Asset View */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Tidak ada aset yang sesuai kriteria</h3>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Reset Seluruh Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Identitas & QR</th>
                  <th className="py-3.5 px-4">Nama Asset</th>
                  <th className="py-3.5 px-4">Unit & Lokasi</th>
                  <th className="py-3.5 px-4">PIC / Pengguna</th>
                  <th className="py-3.5 px-4">Kondisi & Status</th>
                  <th className="py-3.5 px-4 text-right">Harga Perolehan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAssets.map((asset, idx) => (
                  <tr key={`${asset.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* QR & Identitas */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenPrintQR(asset)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center font-mono font-bold text-[10px] transition-all border border-emerald-200 shrink-0"
                          title="Cetak Stiker QR Code"
                        >
                          QR
                        </button>
                        <div>
                          <p className="font-extrabold text-slate-800">{asset.qrCode}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{asset.nomorInventaris}</p>
                        </div>
                      </div>
                    </td>

                    {/* Nama Asset */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getDirectImageUrl(asset.fotoUrl)}
                          alt={asset.namaAsset}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p
                            onClick={() => onSelectAsset(asset.id)}
                            className="font-bold text-slate-900 group-hover:text-emerald-700 cursor-pointer hover:underline transition-colors line-clamp-1"
                          >
                            {asset.namaAsset}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {asset.kategori} • {asset.merk} ({asset.tipe})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Unit & Lokasi */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{asset.unit}</p>
                      <p className="text-[10px] text-slate-500">
                        {asset.location.gedung} - {asset.location.ruangan}
                      </p>
                    </td>

                    {/* PIC */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{asset.picAsset}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {asset.userPengguna}
                      </p>
                    </td>

                    {/* Kondisi & Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getKondisiBadge(
                            asset.kondisi
                          )}`}
                        >
                          {asset.kondisi}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === 'Aktif'
                                ? 'bg-emerald-500'
                                : asset.status === 'Maintenance'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {asset.status}
                        </span>
                      </div>
                    </td>

                    {/* Harga */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatRupiah(asset.harga)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectAsset(asset.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          title="Lihat Detail & Histori Aset"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenPrintQR(asset)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Cetak QR Code"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {(currentRole === 'Admin FM' || currentRole === 'Maintenance') && (
                          <button
                            onClick={() => onEditAsset(asset)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            title="Edit Aset"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {currentRole === 'Admin FM' && (
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus aset ${asset.namaAsset}?`)) {
                                deleteAsset(asset.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Hapus Aset (Khusus Admin FM)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset, idx) => (
            <div
              key={`${asset.id}-${idx}`}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 mb-3 border border-slate-100">
                  <img
                    src={getDirectImageUrl(asset.fotoUrl)}
                    alt={asset.namaAsset}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono font-bold text-[10px]">
                    {asset.qrCode}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${getKondisiBadge(asset.kondisi)}`}>
                      {asset.kondisi}
                    </span>
                  </div>
                </div>

                <h3
                  onClick={() => onSelectAsset(asset.id)}
                  className="font-extrabold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1"
                >
                  {asset.namaAsset}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {asset.kategori} • {asset.merk} {asset.tipe}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{asset.unit}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{asset.location.gedung} ({asset.location.ruangan})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-mono">{asset.nomorInventaris}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Harga Perolehan</p>
                  <p className="text-sm font-black text-slate-900">{formatRupiah(asset.harga)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectAsset(asset.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => onOpenPrintQR(asset)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
