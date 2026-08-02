import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { formatRupiah } from '../utils/exportUtils';
import { UnitName, GedungName, UserRole, UserAccount, UserPermissions } from '../types';
import { getDefaultPermissionsByRole } from '../data/mockData';
import {
  Building2,
  Plus,
  User,
  Shield,
  Wrench,
  Wind,
  CheckCircle2,
  Trash2,
  Edit3,
  UserCheck,
  Lock,
  Key,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

export const MasterDataModal: React.FC = () => {
  const {
    units,
    gedungs,
    assets,
    addUnit,
    addGedung,
    users,
    addUser,
    updateUserRole,
    updateUser,
    deleteUser,
    currentRole,
    setCurrentRole,
    syncToGoogleSheetsNow,
    fetchFromGoogleSheetsNow,
    isSyncing,
    lastSyncTime,
  } = useAsset();

  const [activeTab, setActiveTab] = useState<'units' | 'gedung' | 'users'>('users');

  // Add unit modal form
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [newUnitNama, setNewUnitNama] = useState<UnitName>('TK');

  // Add gedung modal form
  const [showGedungForm, setShowGedungForm] = useState(false);
  const [newGedungNama, setNewGedungNama] = useState<GedungName>('Ibnu Khaldun');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [newTotalLantai, setNewTotalLantai] = useState(2);

  // User Management Forms & Modals
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userUnit, setUserUnit] = useState<UnitName | 'Facility Management' | 'Semua'>('Facility Management');
  const [userRole, setUserRole] = useState<UserRole>('Maintenance');
  const [customPermissions, setCustomPermissions] = useState<UserPermissions>(
    getDefaultPermissionsByRole('Maintenance')
  );

  const handleRoleChangeInForm = (role: UserRole) => {
    setUserRole(role);
    setCustomPermissions(getDefaultPermissionsByRole(role));
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    addUnit({
      nama: newUnitNama,
      kepalaUnit: 'Tim Facility Management (FM)',
      picAsset: 'Tim Facility Management (FM)',
      lokasiGedung: ['Ibnu Khaldun'],
    });
    setShowUnitForm(false);
  };

  const handleCreateGedung = (e: React.FormEvent) => {
    e.preventDefault();
    addGedung({
      nama: newGedungNama,
      deskripsi: newDeskripsi,
      totalLantai: Number(newTotalLantai),
    });
    setShowGedungForm(false);
    setNewDeskripsi('');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = userUsername.trim() || userEmail.split('@')[0] || `user_${Date.now()}`;
    const finalPassword = userPassword.trim() || '123';

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName,
        username: finalUsername,
        password: finalPassword,
        email: userEmail,
        phone: userPhone,
        unit: userUnit,
        role: userRole,
        permissions: customPermissions,
      });
      setEditingUser(null);
    } else {
      addUser({
        name: userName,
        username: finalUsername,
        password: finalPassword,
        email: userEmail,
        phone: userPhone,
        unit: userUnit,
        role: userRole,
        status: 'Aktif',
        permissions: customPermissions,
      });
    }
    setShowUserForm(false);
    resetUserForm();
  };

  const openEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserUsername(u.username || u.email.split('@')[0] || '');
    setUserPassword(u.password || '');
    setUserEmail(u.email);
    setUserPhone(u.phone || '');
    setUserUnit(u.unit);
    setUserRole(u.role);
    setCustomPermissions(u.permissions || getDefaultPermissionsByRole(u.role));
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setUserName('');
    setUserUsername('');
    setUserPassword('');
    setUserEmail('');
    setUserPhone('');
    setUserUnit('Facility Management');
    setUserRole('Maintenance');
    setCustomPermissions(getDefaultPermissionsByRole('Maintenance'));
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin FM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>Admin FM</span>
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3 text-amber-600" />
            <span>Maintenance</span>
          </span>
        );
      case 'Vendor AC (Tukang Service)':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
            <Wind className="w-3 h-3 text-cyan-600" />
            <span>Vendor AC</span>
          </span>
        );
      case 'Kepala Unit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Kepala Unit</span>
          </span>
        );
      case 'User':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3 h-3 text-slate-500" />
            <span>User Staff</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Pengaturan Master Data & Akses Pengguna</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola hak akses pengguna, role tim maintenance, vendor luar, serta struktur master unit dan gedung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={() => {
                resetUserForm();
                setShowUserForm(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Pengguna & Set Role</span>
            </button>
          )}

          {activeTab === 'units' && (
            <button
              onClick={() => setShowUnitForm(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Master Unit</span>
            </button>
          )}

          {activeTab === 'gedung' && (
            <button
              onClick={() => setShowGedungForm(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Master Gedung</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 bg-white px-6 pt-4 rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Akses Role & Pengguna ({users.length} Akun)</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'units' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Master Unit Sekolah (11 Unit)</span>
        </button>

        <button
          onClick={() => setActiveTab('gedung')}
          className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'gedung' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Master Gedung & Bangunan ({gedungs.length} Gedung)</span>
        </button>
      </div>

      {/* TAB 1: USERS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Admin Notice Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-600/40 rounded-2xl shrink-0">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Pusat Kendali Otoritas & Akses Role Sistem</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md">Super Admin</span>
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Sebagai Admin FM, Anda berhak menentukan role pengguna (Admin FM, Tim Maintenance, Vendor AC Luar, Kepala Unit, atau User Staff).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-white/10 p-2 rounded-2xl border border-white/10 text-xs">
              <span className="text-blue-200 font-medium">Role Aktif Anda Saat Ini:</span>
              <strong className="text-amber-300 font-extrabold">{currentRole}</strong>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Daftar Pengguna & Hak Akses Terdaftar ({users.length} Akun)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchFromGoogleSheetsNow}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition-all"
                  title="Tarik data pengguna & hak akses terbaru dari Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Tarik dari Google Sheet</span>
                </button>
                <button
                  onClick={syncToGoogleSheetsNow}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  title="Simpan & kirim daftar pengguna ke tab 'Daftar Pengguna' di Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ke Google Sheet</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="p-3.5 pl-5">Nama & Kontak</th>
                    <th className="p-3.5">Unit Organisasi</th>
                    <th className="p-3.5">Role Akses</th>
                    <th className="p-3.5">Hak Akses Utama (Otoritas)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{u.name}</p>
                            <p className="text-slate-500 text-[11px]">{u.email}</p>
                            {u.phone && <p className="text-slate-400 text-[10px]">{u.phone}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                          {u.unit}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions?.canVerifyProcurement && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verifikasi Pengadaan
                            </span>
                          )}
                          {u.permissions?.canPerformMaintenance && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Maintenance & Service
                            </span>
                          )}
                          {u.permissions?.canManageAssets && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Kelola Aset
                            </span>
                          )}
                          {u.permissions?.canManageUsers && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Kelola Role
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {u.status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-blue-200"
                            title="Edit Role & Hak Akses"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setCurrentRole(u.role)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition-colors border border-slate-200"
                            title="Tes simulasi tampilan role pengguna ini"
                          >
                            Set Aktif
                          </button>

                          {u.role !== 'Admin FM' && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-red-200"
                              title="Hapus Pengguna"
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

          {/* Matrix Guide Role */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Panduan Hirarki Matriks Role Lazuardi GCS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-blue-900 font-extrabold text-sm">1. Admin FM (Super Admin)</strong>
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-blue-950 leading-relaxed text-[11px]">
                  Memiliki otoritas penuh: Verifikasi pengadaan aset unit, kelola master lokasi, atur role maintenance/vendor, sinkronisasi Google Sheets, dan verifikasi opname.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-900 font-extrabold text-sm">2. Tim Maintenance FM</strong>
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-amber-950 leading-relaxed text-[11px]">
                  Fokus perawatan teknis: Eksekusi Work Order perbaikan, jadwal cuci AC, update kondisi fisik aset, scan QR di lapangan, & rekomendasi afkir/dijual.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-cyan-900 font-extrabold text-sm">3. Vendor AC (Tukang Service)</strong>
                  <Wind className="w-4 h-4 text-cyan-600" />
                </div>
                <p className="text-cyan-950 leading-relaxed text-[11px]">
                  Akses khusus teknisi luar: Halaman scan QR cepat khusus unit AC, catat pembersihan indoor/outdoor, ukur tekanan freon (PSI), dan simpan bukti service.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MASTER UNITS */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => {
            const unitAssets = assets.filter((a) => a.unit === unit.nama);
            const count = unitAssets.length;
            const totalVal = unitAssets.reduce((s, a) => s + (a.harga || 0), 0);

            return (
              <div
                key={unit.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{unit.nama}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {count} Aset
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Penanggung Jawab: <strong className="text-slate-800">Tim Facility Management (FM)</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Total Nilai Aset:</span>
                  <span className="font-extrabold text-emerald-700">{formatRupiah(totalVal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: MASTER GEDUNG */}
      {activeTab === 'gedung' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gedungs.map((g) => {
            const gedungAssets = assets.filter((a) => a.location.gedung === g.nama);
            const count = gedungAssets.length;

            return (
              <div
                key={g.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{g.nama}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {g.totalLantai} Lantai
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{g.deskripsi}</p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Aset Bertempat:</span>
                  <span className="font-extrabold text-slate-900">{count} Unit Aset</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: USER FORM & ROLE ASSIGNMENT */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>{editingUser ? 'Edit Role & Akses Pengguna' : 'Tambah Pengguna & Tentukan Role'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  resetUserForm();
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Ahmad Santoso"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">Email Lazuardi / Vendor</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. ahmad@lazuardi.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="e.g. ahmad.santoso"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">Password Login *</label>
                  <input
                    type="text"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="e.g. Pass123!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-extrabold mb-1">Unit Organisasi</label>
                  <select
                    value={userUnit}
                    onChange={(e) => setUserUnit(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Facility Management">Facility Management</option>
                    <option value="SD">SD</option>
                    <option value="TK">TK</option>
                    <option value="SMP">SMP</option>
                    <option value="General Affair">General Affair</option>
                    <option value="Semua">Semua Unit (Global/Vendor)</option>
                  </select>
                </div>
              </div>

              {/* Role Selector Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-slate-800 font-black text-xs uppercase tracking-wider">
                  Pilih Access Role Pengguna
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['Admin FM', 'Maintenance', 'Kepala Unit', 'Vendor AC (Tukang Service)', 'User'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleChangeInForm(r)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        userRole === r
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{r}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {r === 'Admin FM' && 'Akses penuh seluruh modul'}
                          {r === 'Maintenance' && 'Work Order & Perawatan Aset'}
                          {r === 'Vendor AC (Tukang Service)' && 'Pembersihan AC & Freon'}
                          {r === 'Kepala Unit' && 'Pengajuan & Pinjam Aset'}
                          {r === 'User' && 'View & Lapor Kerusakan'}
                        </p>
                      </div>
                      {userRole === r && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-grained Permissions Toggles */}
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-2">
                <label className="block text-blue-900 font-black text-xs">
                  Otoritas Hak Akses Terperinci
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPermissions.canVerifyProcurement}
                      onChange={(e) =>
                        setCustomPermissions((p) => ({ ...p, canVerifyProcurement: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Verifikasi Pengadaan FM</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPermissions.canPerformMaintenance}
                      onChange={(e) =>
                        setCustomPermissions((p) => ({ ...p, canPerformMaintenance: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Eksekusi Perbaikan & Service AC</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPermissions.canManageAssets}
                      onChange={(e) =>
                        setCustomPermissions((p) => ({ ...p, canManageAssets: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Tambah & Edit Master Aset</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPermissions.canManageUsers}
                      onChange={(e) =>
                        setCustomPermissions((p) => ({ ...p, canManageUsers: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Kelola Role & Akses Pengguna</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    resetUserForm();
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                  Simpan Hak Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showUnitForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Tambah Master Unit</h3>
            <form onSubmit={handleCreateUnit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Unit Sekolah / Departemen</label>
                <input
                  type="text"
                  value={newUnitNama}
                  onChange={(e) => setNewUnitNama(e.target.value as any)}
                  placeholder="e.g. SMA, Lab, Perpustakaan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                Seluruh pengelolaan & penanggung jawab aset unit sekolah berada di bawah wewenang <strong>Tim Facility Management (FM)</strong>.
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnitForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gedung Modal */}
      {showGedungForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Tambah Master Gedung</h3>
            <form onSubmit={handleCreateGedung} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Gedung</label>
                <input
                  type="text"
                  value={newGedungNama}
                  onChange={(e) => setNewGedungNama(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Deskripsi & Fungsi</label>
                <textarea
                  rows={2}
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Total Lantai</label>
                <input
                  type="number"
                  value={newTotalLantai}
                  onChange={(e) => setNewTotalLantai(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGedungForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Simpan Gedung
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

