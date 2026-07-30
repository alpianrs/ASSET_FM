import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAsset } from '../context/AssetContext';
import {
  X,
  Camera,
  Search,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wind,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { Asset } from '../types';

interface ACServiceScanModalProps {
  onClose: () => void;
  onSelectACSuccess?: (assetId: string) => void;
}

export const ACServiceScanModal: React.FC<ACServiceScanModalProps> = ({
  onClose,
  onSelectACSuccess,
}) => {
  const { assets, getAssetByQR, recordACWash } = useAsset();
  const acAssets = assets.filter((a) => a.kategori === 'AC');

  const [selectedAC, setSelectedAC] = useState<Asset | null>(null);
  const [unitFilter, setUnitFilter] = useState<string>('Semua');
  const [manualInput, setManualInput] = useState('');
  const [scanError, setScanError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for Vendor Luar / Tukang AC
  const [vendorName, setVendorName] = useState('CV Windu Cool Technique (Vendor Luar)');
  const [teknisiName, setTeknisiName] = useState('Pak Joko & Tim');
  const [tanggalCuci, setTanggalCuci] = useState(new Date().toISOString().split('T')[0]);
  const [intervalBulan, setIntervalBulan] = useState(3);
  const [biaya, setBiaya] = useState(150000);
  const [tekananFreon, setTekananFreon] = useState(75);
  const [cuciFilter, setCuciFilter] = useState(true);
  const [cuciOutdoor, setCuciOutdoor] = useState(true);
  const [tambahFreon, setTambahFreon] = useState(false);
  const [gantiSparepart, setGantiSparepart] = useState(false);
  const [catatan, setCatatan] = useState('Service rutin, pencucian indoor outdoor & pengecekan tekanan freon. Kondisi dingin optimal.');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only init QR camera scanner if no AC is selected yet
    if (!selectedAC) {
      const scanner = new Html5QrcodeScanner(
        'ac-qr-reader',
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          const found = getAssetByQR(decodedText);
          if (found && found.kategori === 'AC') {
            scanner.clear();
            setSelectedAC(found);
            setScanError('');
          } else if (found) {
            setScanError(`Aset "${found.namaAsset}" terdeteksi, namun kategori aset ini bukan AC (${found.kategori}).`);
          } else {
            setScanError(`QR Code "${decodedText}" tidak ditemukan.`);
          }
        },
        () => {}
      );

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
  }, [selectedAC]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const found = getAssetByQR(manualInput);
    if (found && found.kategori === 'AC') {
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
      setSelectedAC(found);
      setScanError('');
    } else if (found) {
      setScanError(`Aset "${found.namaAsset}" bukan kategori AC (${found.kategori}).`);
    } else {
      setScanError(`Kode QR / Inventaris "${manualInput}" tidak ditemukan.`);
    }
  };

  const handleSubmitACService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAC) return;

    const rincianKerja = [
      cuciFilter ? 'Cuci Filter Indoor' : null,
      cuciOutdoor ? 'Cuci Unit Outdoor' : null,
      tambahFreon ? 'Pengisian Freon' : null,
      gantiSparepart ? 'Ganti Sparepart/Kapasitor' : null,
    ]
      .filter(Boolean)
      .join(', ');

    const fullNotes = `[Vendor: ${vendorName}] Pekerjaan: ${rincianKerja}. ${catatan}`;

    recordACWash(selectedAC.id, {
      tanggalCuci,
      intervalBulan: Number(intervalBulan),
      teknisi: teknisiName,
      vendor: vendorName,
      biaya: Number(biaya),
      tekananFreonPsi: Number(tekananFreon),
      pembersihanFilter: cuciFilter,
      pembersihanOutdoor: cuciOutdoor,
      catatan: fullNotes,
    });

    // Calculate next date for notification message
    const d = new Date(tanggalCuci);
    d.setMonth(d.getMonth() + Number(intervalBulan));
    const nextDateStr = d.toISOString().split('T')[0];

    setSuccessMsg(
      `Service AC "${selectedAC.namaAsset}" berhasil dicatat oleh Vendor ${vendorName}! Terakhir cuci: ${tanggalCuci}. Jadwal berikutnya: ${nextDateStr}`
    );

    // Reset selection after delay or keep open for review
    setTimeout(() => {
      if (onSelectACSuccess) onSelectACSuccess(selectedAC.id);
    }, 1500);
  };

  const filteredACList = acAssets.filter((a) => {
    if (unitFilter === 'Semua') return true;
    return a.unit === unitFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-cyan-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center font-bold text-cyan-300">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <span>Scan & Update Service AC Vendor Luar</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px]">
                  Tukang AC / Vendor
                </span>
              </h3>
              <p className="text-xs text-cyan-200/90">
                Pindai QR tag AC atau pilih unit untuk input catatan service teknisi vendor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cyan-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* Notification Toast */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-start gap-3 shadow-md animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{successMsg}</p>
                <p className="text-[11px] font-semibold text-emerald-700">Mengarahkan ke rincian aset...</p>
              </div>
            </div>
          )}

          {!selectedAC ? (
            /* STEP 1: SCAN QR / SELECT AC UNIT */
            <div className="space-y-5">
              
              {/* Camera Scanner Box */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-cyan-900 text-center space-y-2">
                <p className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Pemindai Kamera QR Stiker AC</span>
                </p>
                <div id="ac-qr-reader" className="w-full rounded-xl overflow-hidden text-white min-h-[180px]" />
              </div>

              {scanError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Search or Quick Dropdown Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                
                {/* Search QR/Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cari Kode QR / Inventaris AC</label>
                  <form onSubmit={handleManualSearch} className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Contoh: LZU-AC-001..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Cari</span>
                    </button>
                  </form>
                </div>

                {/* Filter Unit Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Filter Unit Sekolah ({acAssets.length} Unit AC)</label>
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800"
                  >
                    <option value="Semua">Semua Unit Lazuardi</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="TK">TK</option>
                    <option value="Pelangi">Pelangi</option>
                    <option value="CARE">CARE</option>
                    <option value="Facility Management">Facility Management</option>
                  </select>
                </div>

              </div>

              {/* Direct List Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  Atau Pilih Langsung Unit AC dari Daftar ({filteredACList.length}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredACList.map((ac) => (
                    <button
                      key={ac.id}
                      onClick={() => {
                        setSelectedAC(ac);
                        setScanError('');
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all group flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-900 group-hover:text-cyan-900 truncate">
                          {ac.namaAsset}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {ac.unit} • {ac.location.gedung} ({ac.location.ruangan})
                        </p>
                        <p className="text-[10px] font-mono text-cyan-700 mt-1 font-bold">QR: {ac.qrCode}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-extrabold text-[9px] shrink-0">
                        {ac.terakhirCuciAC ? `Cuci: ${ac.terakhirCuciAC}` : 'Belum Cuci'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* STEP 2: FORM INPUT SERVICE AC VENDOR LUAR / TUKANG AC */
            <div className="space-y-4">
              
              {/* Selected AC Info Header */}
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-800 text-white font-mono font-black text-[10px]">
                      {selectedAC.qrCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                      Unit: {selectedAC.unit}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 mt-1 truncate">{selectedAC.namaAsset}</h4>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    Lokasi: Gedung {selectedAC.location.gedung} • Ruang {selectedAC.location.ruangan}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAC(null)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shrink-0"
                >
                  Ganti AC
                </button>
              </div>

              {/* Form Input Service */}
              <form onSubmit={handleSubmitACService} className="space-y-3 text-xs">
                
                {/* Vendor Luar & Tukang AC */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h5 className="font-extrabold text-xs uppercase text-cyan-900 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    <span>Identitas Vendor Luar / Tukang AC</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Vendor Luar AC *
                      </label>
                      <input
                        type="text"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="Contoh: CV Windu Cool, Berkah AC, dll"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Tukang AC / Teknisi Vendor *
                      </label>
                      <input
                        type="text"
                        required
                        value={teknisiName}
                        onChange={(e) => setTeknisiName(e.target.value)}
                        placeholder="Contoh: Pak Joko / Mas Rahmat"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Service Interval */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Service Selesai *</label>
                    <input
                      type="date"
                      required
                      value={tanggalCuci}
                      onChange={(e) => setTanggalCuci(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jadwal Cuci Berikutnya *</label>
                    <select
                      value={intervalBulan}
                      onChange={(e) => setIntervalBulan(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-extrabold text-cyan-900"
                    >
                      <option value={3}>3 Bulan Lagi (Rekomendasi Lazuardi)</option>
                      <option value={4}>4 Bulan Lagi</option>
                      <option value={6}>6 Bulan Lagi</option>
                    </select>
                  </div>
                </div>

                {/* Technical Parameters */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tekanan Freon (PSI)</label>
                    <input
                      type="number"
                      required
                      value={tekananFreon}
                      onChange={(e) => setTekananFreon(Number(e.target.value))}
                      placeholder="75"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-cyan-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Biaya Service Vendor (Rp)</label>
                    <input
                      type="number"
                      required
                      value={biaya}
                      onChange={(e) => setBiaya(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900"
                    />
                  </div>
                </div>

                {/* Checklists */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lingkup Pekerjaan Service Vendor:</label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={cuciFilter}
                        onChange={(e) => setCuciFilter(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded-md"
                      />
                      <span>Cuci Filter & Indoor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={cuciOutdoor}
                        onChange={(e) => setCuciOutdoor(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded-md"
                      />
                      <span>Cuci Unit Outdoor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={tambahFreon}
                        onChange={(e) => setTambahFreon(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded-md"
                      />
                      <span>Pengisian / Tambah Freon</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={gantiSparepart}
                        onChange={(e) => setGantiSparepart(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded-md"
                      />
                      <span>Perbaikan / Sparepart</span>
                    </label>
                  </div>
                </div>

                {/* Catatan / Garansi Vendor */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan Service & Garansi Vendor Luar *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tuliskan detail perbaikan, garansi service dari vendor, atau catatan kondisi AC..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAC(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs shadow-md shadow-cyan-900/30 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                    <span>Simpan Report Service Vendor AC</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
