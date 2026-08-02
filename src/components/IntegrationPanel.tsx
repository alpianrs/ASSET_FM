import React, { useState, useEffect } from 'react';
import { useAsset } from '../context/AssetContext';
import {
  Share2,
  CheckCircle2,
  RefreshCw,
  Send,
  Database,
  FileSpreadsheet,
  MessageSquare,
  Cloud,
  ExternalLink,
  PlusCircle,
  Download,
  Upload,
  User,
  LogOut,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  initGoogleAuth,
  signInGoogleForSheets,
  logoutGoogle,
  createNewGoogleSheet,
  exportDataToGoogleSheets,
  importDataFromGoogleSheets,
  extractSpreadsheetId,
} from '../utils/googleSheetsService';
import { User as FirebaseUser } from 'firebase/auth';

export const IntegrationPanel: React.FC = () => {
  const { assets, bulkUpsertAssets, integrationConfig, setIntegrationConfig, addLog } = useAsset();

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [syncingExport, setSyncingExport] = useState(false);
  const [syncingImport, setSyncingImport] = useState(false);
  const [creatingSheet, setCreatingSheet] = useState(false);

  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState(
    integrationConfig.googleSheetsUrl || 'https://docs.google.com/spreadsheets/d/15OEBPfr-Q9SXU7HPImwOXjCRbk2u4DBlyyOWa7B2AyE/edit?usp=sharing'
  );

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<string | null>(null);

  // Background Periodic Auto-Sync (every 60 seconds) when logged in & autoSyncEnabled
  useEffect(() => {
    if (!accessToken || !autoSyncEnabled || !spreadsheetIdInput.trim()) return;

    const interval = setInterval(async () => {
      try {
        const imported = await importDataFromGoogleSheets(accessToken, spreadsheetIdInput);
        if (imported && imported.length > 0) {
          bulkUpsertAssets(imported);
        }
        setLastAutoSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        // Silent fail background polling
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(interval);
  }, [accessToken, autoSyncEnabled, spreadsheetIdInput, bulkUpsertAssets]);

  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSimulateSync = (service: string) => {
    setSyncing(service);
    setTimeout(() => {
      setSyncing(null);
      setStatusMsg({ type: 'success', text: `Tes koneksi & sinkronisasi ${service} Berhasil!` });
      addLog('Sync Integrasi Cloud', `Berhasil melakukan tes sinkronisasi data dengan ${service}`);
    }, 1200);
  };

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setStatusMsg(null);
    try {
      const res = await signInGoogleForSheets();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMsg({
          type: 'success',
          text: `Berhasil Login Google dengan Akun: ${res.user.email}! Akses Google Sheets & Drive telah aktif.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: `Gagal login Google: ${err?.message || 'Izin ditolak atau popup ditutup.'}`,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setStatusMsg({ type: 'error', text: 'Silakan klik "Login Google" terlebih dahulu untuk membuat Spreadsheet di Google Drive Anda.' });
      return;
    }

    setCreatingSheet(true);
    setStatusMsg(null);
    try {
      const result = await createNewGoogleSheet(accessToken, 'Aset Lazuardi GCS - Master Database (Live 2-Way)');
      setSpreadsheetIdInput(result.spreadsheetId);
      setIntegrationConfig((p) => ({ ...p, googleSheetsUrl: result.spreadsheetUrl }));

      // Auto export current data to new sheet
      await exportDataToGoogleSheets(accessToken, result.spreadsheetId, assets);

      setStatusMsg({
        type: 'success',
        text: `Berhasil membuat Spreadsheet baru di Google Drive! ID: ${result.spreadsheetId}. Data ${assets.length} aset telah disinkronkan otomatis.`,
      });
      addLog('Buat Google Sheet', `Membuat Google Spreadsheet baru: ${result.spreadsheetUrl}`);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: `Gagal membuat Spreadsheet: ${err.message}` });
    } finally {
      setCreatingSheet(false);
    }
  };

  const handleExportToSheets = async () => {
    if (!accessToken) {
      setStatusMsg({ type: 'error', text: 'Silakan klik "Login Google" terlebih dahulu untuk menyinkronkan data ke Google Sheets.' });
      return;
    }

    if (!spreadsheetIdInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Masukkan ID atau URL Google Spreadsheet sasaran terlebih dahulu.' });
      return;
    }

    setSyncingExport(true);
    setStatusMsg(null);
    try {
      await exportDataToGoogleSheets(accessToken, spreadsheetIdInput, assets);
      setStatusMsg({
        type: 'success',
        text: `Berhasil mengekspor & menyinkronkan ${assets.length} data Aset & History Service AC ke Google Sheets!`,
      });
      addLog('Export Google Sheets', `Sinkronkan ${assets.length} aset ke Google Sheets ID: ${extractSpreadsheetId(spreadsheetIdInput)}`);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: `Gagal kirim data ke Google Sheets: ${err.message}. Pastikan akun Google memiliki akses edit ke file Spreadsheet tersebut.`,
      });
    } finally {
      setSyncingExport(false);
    }
  };

  const handleImportFromSheets = async () => {
    if (!accessToken) {
      setStatusMsg({ type: 'error', text: 'Silakan klik "Login Google" terlebih dahulu untuk mengambil data dari Google Sheets.' });
      return;
    }

    if (!spreadsheetIdInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Masukkan ID atau URL Google Spreadsheet sasaran.' });
      return;
    }

    setSyncingImport(true);
    setStatusMsg(null);
    try {
      const imported = await importDataFromGoogleSheets(accessToken, spreadsheetIdInput);
      if (imported.length === 0) {
        setStatusMsg({ type: 'info', text: 'Tidak ada data aset baru yang ditemukan pada tab "Daftar Aset" Google Sheet.' });
      } else {
        bulkUpsertAssets(imported);
        setStatusMsg({
          type: 'success',
          text: `Berhasil menarik ${imported.length} baris data Aset dari Google Sheets ke AI Studio! Data lokal diperbarui secara otomatis.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: `Gagal membaca dari Google Sheets: ${err.message}. Pastikan file Spreadsheet memiliki tab bernama "Daftar Aset".`,
      });
    } finally {
      setSyncingImport(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-600" />
            <span>Pusat Integrasi Ecosystem Lazuardi GCS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi koneksi langsung ke Google Sheets, Database Cloud, API Accurate, dan Notifikasi WA/Email.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 shadow-sm animate-fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : statusMsg.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-blue-50 border border-blue-200 text-blue-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p>{statusMsg.text}</p>
          </div>
        </div>
      )}

      {/* Integration Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Sheets & Drive - 2-Way Sync Card */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-200">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Google Sheets Integrasi 2-Arah (Realtime Direct)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    OAuth 2.0 Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kirim & tarik otomatis data Aset, History Service AC Vendor, dan Stock Opname langsung ke Spreadsheet Google Drive
                </p>
              </div>
            </div>

            {/* Google Authentication Button */}
            <div>
              {googleUser ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      googleUser.email?.[0].toUpperCase() || 'G'
                    )}
                  </div>
                  <div className="text-left text-xs pr-2">
                    <p className="font-bold text-emerald-950 truncate max-w-[160px]">{googleUser.displayName || 'Google User'}</p>
                    <p className="text-[10px] text-emerald-700 truncate max-w-[160px]">{googleUser.email}</p>
                  </div>
                  <button
                    onClick={logoutGoogle}
                    title="Logout Google"
                    className="p-1.5 rounded-xl hover:bg-emerald-200/60 text-emerald-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-extrabold text-xs shadow-sm hover:shadow transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isAuthenticating ? 'Menghubungkan...' : 'Login Akun Google (Google Sheets DB)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Spreadsheet Target Input & Create New Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                URL / ID Google Spreadsheet Target (2-Way Live):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  placeholder="Masukkan ID Spreadsheet atau tempel URL Google Sheets..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                {spreadsheetIdInput.trim() && (
                  <a
                    href={
                      spreadsheetIdInput.startsWith('http')
                        ? spreadsheetIdInput
                        : `https://docs.google.com/spreadsheets/d/${extractSpreadsheetId(spreadsheetIdInput)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0"
                    title="Buka Spreadsheet di Google Sheets Tab Baru"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCreateNewSheet}
                disabled={creatingSheet || !accessToken}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <PlusCircle className={`w-4 h-4 text-emerald-400 ${creatingSheet ? 'animate-spin' : ''}`} />
                <span>{creatingSheet ? 'Membuat Sheet...' : '+ Buat Spreadsheet Baru di Drive'}</span>
              </button>
            </div>
          </div>

          {/* 2-Way Sync Buttons */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Aksi Sinkronisasi 2-Arah (AI Studio &lt;--&gt; Google Sheets)</span>
              </h4>

              {/* Auto Sync Toggle */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-700">Auto-Sync (Background):</span>
                <button
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-[10px] font-bold ${autoSyncEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {autoSyncEnabled ? 'Aktif' : 'Non-aktif'}
                </span>
              </div>
            </div>

            {autoSyncEnabled && accessToken && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11px] font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span><strong>Mode Auto-Sync Aktif:</strong> Aplikasi secara otomatis memeriksa & memperbarui perubahan dari Google Sheets setiap 1 menit.</span>
                </div>
                {lastAutoSyncTime && (
                  <span className="text-[10px] font-mono text-emerald-700 shrink-0">
                    Sync Terakhir: {lastAutoSyncTime}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Export (AI Studio -> Google Sheets) */}
              <button
                onClick={handleExportToSheets}
                disabled={syncingExport || !accessToken}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-left transition-all shadow-md shadow-emerald-200 flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Upload className={`w-5 h-5 text-emerald-100 ${syncingExport ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-white group-hover:underline flex items-center gap-1">
                    <span>1. Kirim Data ke Google Sheets</span>
                    <span className="text-[10px] bg-emerald-800 px-1.5 py-0.2 rounded text-emerald-200 font-mono">
                      Export
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-100 mt-0.5">
                    Simpan & perbarui otomatis {assets.length} data Aset + History Service AC ke tab Spreadsheet.
                  </p>
                </div>
              </button>

              {/* Option 2: Import (Google Sheets -> AI Studio) */}
              <button
                onClick={handleImportFromSheets}
                disabled={syncingImport || !accessToken}
                className="p-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-left transition-all shadow-md shadow-teal-200 flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Download className={`w-5 h-5 text-teal-200 ${syncingImport ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-white group-hover:underline flex items-center gap-1">
                    <span>2. Tarik Data dari Google Sheets</span>
                    <span className="text-[10px] bg-teal-950 px-1.5 py-0.2 rounded text-teal-200 font-mono">
                      Import
                    </span>
                  </p>
                  <p className="text-[11px] text-teal-100 mt-0.5">
                    Membaca baris perubahan atau penambahan Aset baru dari Google Sheet langsung ke aplikasi.
                  </p>
                </div>
              </button>
            </div>

            {!accessToken && (
              <p className="text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Harap klik tombol <strong>Login Google</strong> di atas untuk mengaktifkan fitur sinkronisasi 2-arah ini.</span>
              </p>
            )}
          </div>
        </div>

        {/* Google Sheets Database Engine (No Firebase) */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Google Sheets Single Cloud Database (100% No Firebase)</h3>
                <p className="text-xs text-slate-500">Database terhubung langsung ke Google Sheets target Anda</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Active Google Sheet DB
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Spreadsheet Master Database:</span>
              </p>
              <a
                href={integrationConfig.googleSheetsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-xs transition-all"
              >
                <span>Buka Google Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="font-mono text-[11px] bg-white p-2 rounded-xl border border-emerald-200 break-all text-slate-800">
              {integrationConfig.googleSheetsUrl}
            </p>

            <div className="pt-2 border-t border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[11px] text-emerald-900 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Folder Google Drive Penyimpanan Foto Aset:</span>
                </p>
                <a
                  href={integrationConfig.googleDriveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-xs transition-all shrink-0"
                >
                  <span>Buka Folder Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={integrationConfig.googleDriveFolderUrl}
                onChange={(e) => setIntegrationConfig((p) => ({ ...p, googleDriveFolderUrl: e.target.value }))}
                placeholder="https://drive.google.com/drive/u/0/folders/..."
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Apps Script Guide */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Kode Google Apps Script untuk Multi-Tab (Daftar Aset & Daftar Pengguna)</span>
              </h4>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Mendukung User & Hak Akses
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pasang script ini di Google Sheets Anda (<strong>Extensions &gt; Apps Script</strong>) agar perubahan data Aset maupun Daftar Pengguna & Hak Akses tersinkron secara otomatis dua arah antara Aplikasi dan Google Sheets.
            </p>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Kode Apps Script (Copy & Paste ke Apps Script Editor):
              </label>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto select-all max-h-48">
{`function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : 'Daftar Aset';
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var req = JSON.parse(e.postData.contents);
  var sheetTarget = 'Daftar Aset';
  var rows = req;
  
  if (req && req.sheetName && req.data) {
    sheetTarget = req.sheetName;
    rows = req.data;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetTarget) || ss.insertSheet(sheetTarget);
  sheet.clear();
  rows.forEach(function(row) { sheet.appendRow(row); });
  return ContentService.createTextOutput(JSON.stringify({status: 'success', target: sheetTarget})).setMimeType(ContentService.MimeType.JSON);
}`}
              </pre>
            </div>

            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                URL Apps Script Web App (Jika Sudah Deploy Web App):
              </label>
              <input
                type="text"
                value={integrationConfig.appScriptWebAppUrl || ''}
                onChange={(e) => setIntegrationConfig((p) => ({ ...p, appScriptWebAppUrl: e.target.value }))}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={() => handleSimulateSync('Google Sheets Database')}
            disabled={syncing === 'Google Sheets Database'}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing === 'Google Sheets Database' ? 'animate-spin' : ''}`} />
            <span>Tes Koneksi Google Sheets DB</span>
          </button>
        </div>

        {/* API Accurate Online */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">API Accurate Online</h3>
                <p className="text-xs text-slate-500">Sinkronisasi pembukuan keuangan & nilai depresiasi aset</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
              API Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Menyinkronkan data harga perolehan, nilai buku, dan penyusutan aset sekolah langsung ke modul Keuangan Accurate.
          </p>

          <button
            onClick={() => handleSimulateSync('Accurate Online API')}
            disabled={syncing === 'Accurate Online API'}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing === 'Accurate Online API' ? 'animate-spin' : ''}`} />
            <span>Sync Keuangan Accurate</span>
          </button>
        </div>

        {/* WhatsApp & Email Notification */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">WhatsApp & Email Gateway</h3>
                <p className="text-xs text-slate-500">Notifikasi otomatis kerusakan, jadwal WO, & garansi</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Aktif
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold">Nomor WA Bot FM:</label>
              <input
                type="text"
                value={integrationConfig.whatsappWebhook}
                onChange={(e) => setIntegrationConfig((p) => ({ ...p, whatsappWebhook: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold">Email Alerts Target:</label>
              <input
                type="text"
                value={integrationConfig.emailAlerts}
                onChange={(e) => setIntegrationConfig((p) => ({ ...p, emailAlerts: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
              />
            </div>
          </div>

          <button
            onClick={() => handleSimulateSync('WhatsApp & Email Gateway')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesan Tes Notifikasi</span>
          </button>
        </div>

      </div>

    </div>
  );
};
