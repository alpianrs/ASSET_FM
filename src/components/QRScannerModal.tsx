import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAsset } from '../context/AssetContext';
import { X, Camera, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (assetId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onScanSuccess,
}) => {
  const { assets, getAssetByQR } = useAsset();
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startCamera = async () => {
    setCameraPermissionError('');
    setIsCameraActive(false);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('reader');
      }

      const qrCode = html5QrCodeRef.current;

      // Directly request back camera ('environment')
      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const found = getAssetByQR(decodedText);
          if (found) {
            qrCode.stop().then(() => qrCode.clear()).catch(() => {});
            onScanSuccess(found.id);
          } else {
            setErrorMsg(`QR Code "${decodedText}" tidak ditemukan dalam database Lazuardi GCS.`);
          }
        },
        () => {
          // silent error callback during continuous scan
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Environment camera failed, trying fallback mode:', err);
      // Fallback: try facing mode user (front camera / laptop webcam)
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            { fps: 12, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            (decodedText) => {
              const found = getAssetByQR(decodedText);
              if (found) {
                html5QrCodeRef.current?.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
                onScanSuccess(found.id);
              } else {
                setErrorMsg(`QR Code "${decodedText}" tidak ditemukan.`);
              }
            },
            () => {}
          );
          setIsCameraActive(true);
        }
      } catch (err2: any) {
        setCameraPermissionError(
          'Tidak dapat mengakses kamera belakang HP. Pastikan Anda mengizinkan akses kamera pada browser.'
        );
      }
    }
  };

  useEffect(() => {
    // Automatically trigger back camera when modal mounts
    startCamera();

    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
          } else {
            html5QrCodeRef.current.clear().catch(() => {});
          }
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const found = getAssetByQR(manualInput);
    if (found) {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
      }
      onScanSuccess(found.id);
    } else {
      setErrorMsg(`Kode / QR "${manualInput}" tidak ditemukan.`);
    }
  };

  const handleQuickPresetScan = (qrCodeStr: string) => {
    const found = getAssetByQR(qrCodeStr);
    if (found) {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
      }
      onScanSuccess(found.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Kamera Belakang Siap Scan</h3>
              <p className="text-xs text-emerald-200">Kamera aktif otomatis — langsung arahkan ke QR Aset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Camera Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 text-center min-h-[280px] flex items-center justify-center">
            <div id="reader" className="w-full text-white" />

            {!isCameraActive && !cameraPermissionError && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 p-4 text-white">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs font-bold">Membuka Kamera Belakang HP...</p>
              </div>
            )}

            {cameraPermissionError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <AlertCircle className="w-10 h-10 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-200">{cameraPermissionError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Coba Lagi Kamera Belakang</span>
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Atau Input Kode Inventaris / QR Manual
            </label>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Contoh: LZU-SD-KHL-001 atau INV/2024..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Quick Preset Test Scan Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulasi Cepat Pemindaian Sample QR:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {assets.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleQuickPresetScan(a.qrCode)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 text-[11px] font-semibold transition-all border border-slate-200"
                >
                  {a.qrCode} ({a.namaAsset.substring(0, 16)}...)
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

