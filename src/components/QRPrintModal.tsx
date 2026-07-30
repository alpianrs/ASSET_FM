import React from 'react';
import { Asset } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, Sparkles } from 'lucide-react';

interface QRPrintModalProps {
  asset: Asset;
  onClose: () => void;
}

export const QRPrintModal: React.FC<QRPrintModalProps> = ({ asset, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm">Cetak Stiker QR Code Resmi Aset</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Stiker Label Preview */}
        <div className="p-6 space-y-6">
          <div
            id="printable-qr-card"
            className="p-5 rounded-2xl bg-white border-2 border-blue-800 shadow-md text-slate-900 space-y-4 print:shadow-none print:border-2"
          >
            {/* Header Sekolah */}
            <div className="text-center pb-3 border-b border-amber-300 bg-amber-50/50 -mx-5 -mt-5 p-4 rounded-t-2xl">
              <h4 className="font-black text-xs uppercase tracking-wider text-blue-900">
                LAZUARDI GLOBAL COMPASSIONATE SCHOOL
              </h4>
              <p className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest">
                TIM FACILITY MANAGEMENT • STIKER RESMI INVENTARIS
              </p>
            </div>

            {/* QR & Info Grid */}
            <div className="flex items-center gap-4 pt-1">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                <QRCodeSVG value={asset.qrCode} size={110} level="H" includeMargin />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-amber-300 font-mono font-black text-[10px]">
                  {asset.qrCode}
                </span>
                <h3 className="font-black text-sm text-slate-900 line-clamp-2 leading-snug">
                  {asset.namaAsset}
                </h3>
                <p className="text-[10px] font-mono font-bold text-slate-600 truncate">{asset.nomorInventaris}</p>
                <div className="text-[11px] text-slate-800 font-extrabold pt-1 border-t border-slate-100">
                  <p className="text-blue-900 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">Unit: {asset.unit}</p>
                </div>
              </div>
            </div>

            {/* Footer Warning */}
            <div className="text-[8px] text-slate-400 text-center font-medium uppercase tracking-wider pt-2 border-t border-slate-100">
              Dilarang melepas atau merusak stiker ini. Lapor FM jika rusak.
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end gap-2 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-200 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Stiker Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
