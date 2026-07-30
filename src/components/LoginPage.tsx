import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { UserRole } from '../types';
import {
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Wind,
  User,
  Building2,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LoginPageProps {
  onOpenACServiceModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenACServiceModal }) => {
  const { loginWithEmail } = useAsset();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!usernameInput.trim()) {
      setErrorMsg('Masukkan username atau email Anda!');
      return;
    }

    const res = loginWithEmail(usernameInput, passwordInput);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Background Decorative Element */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-xl w-full z-10">
        
        {/* Main Login Card & Vendor AC Access */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
          
          <div>
            {/* App Brand Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-amber-300 text-2xl shadow-lg border border-blue-400/30">
                  L
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Lazuardi GCS</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  </h1>
                  <p className="text-xs text-amber-300 font-bold tracking-wide">
                    Sistem Manajemen Aset & Facility Management
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-200 mt-2 leading-relaxed">
                Silakan masuk menggunakan Username/Email & Password. Akses khusus Vendor Service AC tersedia tanpa login.
              </p>
            </div>

            {/* Vendor Service AC - No Login Needed Section */}
            <div className="p-6 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border-b border-cyan-100 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-cyan-950 text-sm sm:text-base flex items-center gap-2">
                      <span>Scan Service AC (Khusus Vendor)</span>
                      <span className="text-[10px] bg-cyan-700 text-white font-black px-2 py-0.5 rounded-full">
                        Tanpa Login
                      </span>
                    </h2>
                    <p className="text-xs text-cyan-800 font-medium">
                      Tukang AC / Vendor Luar dapat langsung scan QR Code & catat pengerjaan.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenACServiceModal}
                className="w-full py-3 px-4 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-cyan-200 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Wind className="w-4 h-4 text-cyan-200" />
                <span>Buka Form & Scan QR Service AC (Vendor Luar)</span>
                <ArrowRight className="w-4 h-4 text-cyan-200 ml-auto" />
              </button>
            </div>

            {/* Login Form */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Login Pengguna Terdaftar</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">Google Sheets DB</span>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-bold text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Masukkan username atau email Anda..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan password akun..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Masuk Aplikasi</span>
                </button>
              </form>
            </div>
          </div>

          {/* Database Footer Status */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 text-slate-600 text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="overflow-hidden leading-tight">
                <p className="font-extrabold text-slate-800 text-[11px]">Database Cloud: Google Sheets & Apps Script</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  Terhubung ke Database Lazuardi
                </p>
              </div>
            </div>
            <div className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-extrabold shrink-0">
              Akses Privat
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
