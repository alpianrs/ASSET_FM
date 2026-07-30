import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { UserRole } from '../types';
import { Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, FileSpreadsheet, LogOut, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, currentUser, logoutUser, users } = useAsset();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailInput.trim()) {
      setErrorMsg('Masukkan alamat email atau username Anda!');
      return;
    }

    const res = loginWithEmail(emailInput, passwordInput);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (usr: typeof users[0]) => {
    setEmailInput(usr.email);
    setPasswordInput(usr.password || '123');
    const res = loginWithEmail(usr.email, usr.password || '123');
    if (res.success) {
      setSuccessMsg(`Berhasil login sebagai ${usr.name} (${usr.role})`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Login Email Bebas (Sistem Akun)</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Direct Email
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Bisa menggunakan email publik / vendor (Google Sheets Database - Tanpa Firebase).
              </p>
            </div>
          </div>
        </div>

        {/* Current User Status Banner if logged in */}
        {currentUser && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Sedang Login: {currentUser.name}</p>
                <p className="text-[11px] text-emerald-700 font-medium">{currentUser.email} • Role: {currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={() => logoutUser()}
              className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-black mb-1">
                Alamat Email Pengguna (Google / Yahoo / Public Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. alpian@gmail.com, vendor@coolservice.com..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-black mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-200 active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Masuk Aplikasi (Dengan Email)</span>
            </button>
          </form>

          {/* Database Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] text-blue-950 font-medium leading-tight">
              <strong>Database Single Source:</strong> Aplikasi ini menggunakan <strong>Google Sheets Direct API</strong> sebagai basis data cloud utama.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

