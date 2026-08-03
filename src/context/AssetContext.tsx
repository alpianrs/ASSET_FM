import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Asset,
  MasterGedung,
  MasterUnit,
  MaintenanceLog,
  ACWashRecord,
  HistoryLog,
  NotificationItem,
  UserRole,
  UserAccount,
  AssetDamageReport,
  AssetLoanRecord,
  AssetTransferRecord,
  UnitName,
  GedungName,
  AssetCondition,
  AssetStatus
} from '../types';
import { INITIAL_ASSETS, INITIAL_GEDUNG, INITIAL_NOTIFICATIONS, INITIAL_UNITS, INITIAL_HISTORY_LOGS, INITIAL_USERS, getDefaultPermissionsByRole } from '../data/mockData';
import { syncAssetsToGoogleSheet, importDataFromGoogleSheets, exportUsersToGoogleSheets, importUsersFromGoogleSheets } from '../utils/googleSheetsService';

interface IntegrationConfig {
  googleSheetsUrl: string;
  googleDriveFolderUrl: string;
  appScriptWebAppUrl?: string;
  firebaseEnabled: boolean;
  supabaseEnabled: boolean;
  accurateOnlineConnected: boolean;
  whatsappWebhook: string;
  emailAlerts: string;
}

interface AssetContextType {
  assets: Asset[];
  units: MasterUnit[];
  gedungs: MasterGedung[];
  notifications: NotificationItem[];
  historyLogs: HistoryLog[];
  maintenanceLogs: MaintenanceLog[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  loginWithEmail: (email: string, password?: string, role?: UserRole) => { success: boolean; message: string };
  logoutUser: () => void;
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id' | 'permissions'> & { permissions?: UserAccount['permissions'] }) => void;
  updateUserRole: (userId: string, newRole: UserRole, newPermissions?: UserAccount['permissions'], newUnit?: UserAccount['unit']) => void;
  updateUser: (userId: string, updatedData: Partial<UserAccount>) => void;
  deleteUser: (userId: string) => void;
  integrationConfig: IntegrationConfig;
  setIntegrationConfig: React.Dispatch<React.SetStateAction<IntegrationConfig>>;

  // Google Sheets Live Sync State
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  syncToGoogleSheetsNow: () => Promise<boolean>;
  fetchFromGoogleSheetsNow: () => Promise<boolean>;

  // Verification & Gatekeeping Actions
  verifyAsset: (assetId: string, data: { nomorInventaris: string; qrCode: string; kategori: Asset['kategori']; masapakaiTahun: number; kondisi: Asset['kondisi'] }) => void;
  rejectAsset: (assetId: string, reason: string) => void;

  // AC Washing & Maintenance Tracking
  recordACWash: (assetId: string, washData: { tanggalCuci: string; intervalBulan?: number; teknisi: string; vendor?: string; biaya: number; tekananFreonPsi?: number; pembersihanFilter: boolean; pembersihanOutdoor: boolean; catatan: string }) => void;
  recordAssetRepair: (assetId: string, repairData: { teknisi: string; catatanPerbaikan: string; biaya: number; rekomendasi: 'Siap Pakai' | 'Rekomendasi Dijual' | 'Rekomendasi Didonasikan' | 'Afkir / Scrap'; kondisi: AssetCondition }) => void;

  // Asset Actions
  addAsset: (asset: Omit<Asset, 'id' | 'maintenanceHistory' | 'damageReports' | 'loanHistory' | 'transferHistory' | 'documents'>) => void;
  bulkUpsertAssets: (newAssets: Partial<Asset>[]) => void;
  updateAsset: (id: string, updated: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getAssetByQR: (qrCodeOrId: string) => Asset | undefined;

  // Interventions
  reportDamage: (assetId: string, description: string, severity: 'Rusak Ringan' | 'Rusak Berat', foto?: string) => void;
  requestLoan: (assetId: string, borrowerName: string, borrowerUnit: UnitName, startDate: string, returnDate: string, purpose: string) => void;
  returnLoan: (assetId: string, loanId: string) => void;
  transferAsset: (assetId: string, toUnit: UnitName, toGedung: GedungName, toLantai: string, toRuangan: string, notes: string) => void;
  addWorkOrder: (wo: Omit<MaintenanceLog, 'id'>) => void;
  updateWorkOrderStatus: (woId: string, status: MaintenanceLog['status']) => void;
  updateAssetCondition: (assetId: string, condition: AssetCondition, status: AssetStatus, notes: string) => void;

  // Master Data
  addUnit: (unit: Omit<MasterUnit, 'id'>) => void;
  addGedung: (gedung: Omit<MasterGedung, 'id'>) => void;

  // Audit / Stock Opname
  markAudited: (assetId: string, customDate?: string) => void;
  resetStockOpname: (unitName?: string) => void;

  // Log & Notifications
  addLog: (action: string, details: string, assetId?: string, assetName?: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lazuardi_gcs_asset_data_v1';

// Helper to guarantee strictly unique IDs across all assets
function ensureUniqueAssets(rawAssets: Asset[]): Asset[] {
  if (!Array.isArray(rawAssets)) return [];
  const seenIds = new Set<string>();
  return rawAssets.map((asset, index) => {
    let uniqueId = asset.id || `ast-${index + 1}`;
    if (seenIds.has(uniqueId)) {
      uniqueId = `${uniqueId}_dup_${index}_${Math.floor(Math.random() * 1000)}`;
    }
    seenIds.add(uniqueId);
    return {
      ...asset,
      id: uniqueId,
    };
  });
}

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assets`);
      if (saved) {
        const parsed: Asset[] = JSON.parse(saved);
        // Merge missing INITIAL_ASSETS into saved assets if not already present
        const existingIds = new Set(parsed.map((a) => a.id));
        const missing = INITIAL_ASSETS.filter((a) => !existingIds.has(a.id));
        return ensureUniqueAssets([...parsed, ...missing]);
      }
      return ensureUniqueAssets(INITIAL_ASSETS);
    } catch {
      return ensureUniqueAssets(INITIAL_ASSETS);
    }
  });

  const [units, setUnits] = useState<MasterUnit[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_units`);
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [gedungs, setGedungs] = useState<MasterGedung[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gedungs`);
    return saved ? JSON.parse(saved) : INITIAL_GEDUNG;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_HISTORY_LOGS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_maintenance`);
    if (saved) return JSON.parse(saved);
    // derive initial maintenance logs from assets
    const initialWos = INITIAL_ASSETS.flatMap((a) => a.maintenanceHistory || []);
    return initialWos;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'Admin FM';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    }
  }, [currentUser]);

  const loginWithEmail = (inputEmail: string, inputPassword?: string, _overrideRole?: UserRole) => {
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanPass = inputPassword ? inputPassword.trim() : '';

    if (!cleanEmail) {
      return { success: false, message: 'Masukkan username atau email Anda!' };
    }

    // Find user by username, email, or name
    let matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.username.toLowerCase() === cleanEmail ||
        u.name.toLowerCase() === cleanEmail
    );

    if (!matched) {
      return {
        success: false,
        message: 'Username/Email tidak terdaftar. Hubungi Admin FM untuk pendaftaran akun & role.',
      };
    }

    if (matched.status === 'Non-aktif') {
      return { success: false, message: 'Akun Anda sedang non-aktif. Hubungi Admin FM.' };
    }

    if (matched.password && cleanPass && matched.password !== cleanPass) {
      return { success: false, message: 'Password salah. Silakan periksa kembali password Anda.' };
    }

    // Automatically use the role set by Admin for this user
    setCurrentUser(matched);
    setCurrentRole(matched.role);
    addLog('Login Sistem', `Pengguna ${matched.name} (${matched.username}) berhasil login sebagai ${matched.role}.`);
    return { success: true, message: `Berhasil login sebagai ${matched.name} (${matched.role})` };
  };

  const logoutUser = () => {
    if (currentUser) {
      addLog('Logout Sistem', `Pengguna ${currentUser.name} telah logout.`);
    }
    setCurrentUser(null);
  };

  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/15OEBPfr-Q9SXU7HPImwOXjCRbk2u4DBlyyOWa7B2AyE/edit?usp=sharing',
    googleDriveFolderUrl: 'https://drive.google.com/drive/u/0/folders/11lZVmWvxVDBZDMUnS8q9mhyruGGhbX-g',
    appScriptWebAppUrl: 'https://script.google.com/macros/s/AKfycbxmnN_utcfV96wQB6xZAJGdrzaTFEZTduJrwdIiyPPyyff3j8Pxz1LxUOEB77KDVguU/exec',
    firebaseEnabled: false,
    supabaseEnabled: false,
    accurateOnlineConnected: true,
    whatsappWebhook: '+6281299008822 (Lazuardi FM Bot)',
    emailAlerts: 'fm.lazuardi@lazuardi.sch.id',
  });

  // Google Sheets Live Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Ref flag to prevent inbound Google Sheets fetch from re-triggering outbound push
  const isInboundSyncRef = useRef<boolean>(false);

  const syncToGoogleSheetsNow = async (): Promise<boolean> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const okAssets = await syncAssetsToGoogleSheet(
        'direct_gsheets_token_active',
        integrationConfig.googleSheetsUrl,
        assets,
        integrationConfig.appScriptWebAppUrl
      );

      const okUsers = await exportUsersToGoogleSheets(
        'direct_gsheets_token_active',
        integrationConfig.googleSheetsUrl,
        users,
        integrationConfig.appScriptWebAppUrl
      );

      if (okAssets || okUsers) {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        return true;
      } else {
        setSyncError('Gagal sinkronisasi otomatis ke Google Sheets.');
        return false;
      }
    } catch (err: any) {
      setSyncError(err?.message || 'Gagal terhubung ke Google Apps Script.');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromGoogleSheetsNow = async (): Promise<boolean> => {
    setIsSyncing(true);
    setSyncError(null);
    isInboundSyncRef.current = true;
    try {
      const importedAssets = await importDataFromGoogleSheets(
        'direct_gsheets_token_active',
        integrationConfig.googleSheetsUrl,
        integrationConfig.appScriptWebAppUrl
      );
      if (importedAssets && importedAssets.length > 0) {
        bulkUpsertAssets(importedAssets);
      }

      const importedUsers = await importUsersFromGoogleSheets(
        'direct_gsheets_token_active',
        integrationConfig.googleSheetsUrl,
        integrationConfig.appScriptWebAppUrl
      );
      if (importedUsers && importedUsers.length > 0) {
        setUsers((prevLocalUsers) => {
          const map = new Map<string, UserAccount>();
          prevLocalUsers.forEach((u) => {
            map.set(u.id, u);
            if (u.email) map.set(u.email.toLowerCase(), u);
            if (u.username) map.set(u.username.toLowerCase(), u);
          });

          const merged = importedUsers.map((imp) => {
            const existing = map.get(imp.id) || (imp.email && map.get(imp.email.toLowerCase())) || (imp.username && map.get(imp.username.toLowerCase()));
            if (existing) {
              return {
                ...imp,
                name: existing.name || imp.name,
                username: existing.username || imp.username,
                password: existing.password || imp.password,
                role: existing.role || imp.role,
                unit: existing.unit || imp.unit,
                permissions: existing.permissions || imp.permissions,
              };
            }
            return imp;
          });

          const importedIds = new Set(merged.map((u) => u.id));
          const extraLocal = prevLocalUsers.filter((u) => !importedIds.has(u.id));

          return [...merged, ...extraLocal];
        });
      }

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(timeStr);
      return true;
    } catch (err: any) {
      setSyncError(err?.message || 'Gagal membaca data dari Google Sheets.');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Persistence & Auto-Sync to Google Sheets when assets change locally
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));

    if (isInboundSyncRef.current) {
      isInboundSyncRef.current = false;
      return;
    }

    // Debounced automatic background push to Google Sheets on local user edits
    const timer = setTimeout(() => {
      if (integrationConfig.appScriptWebAppUrl || integrationConfig.googleSheetsUrl) {
        syncAssetsToGoogleSheet(
          'direct_gsheets_token_active',
          integrationConfig.googleSheetsUrl,
          assets,
          integrationConfig.appScriptWebAppUrl
        )
          .then((ok) => {
            if (ok) {
              setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
              setSyncError(null);
            }
          })
          .catch((e) => {
            console.warn('Background auto-sync warning:', e);
          });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [assets, integrationConfig.appScriptWebAppUrl, integrationConfig.googleSheetsUrl]);

  // Persistence & Auto-Sync Users to Google Sheets when users change locally
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));

    if (isInboundSyncRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (integrationConfig.appScriptWebAppUrl || integrationConfig.googleSheetsUrl) {
        exportUsersToGoogleSheets(
          'direct_gsheets_token_active',
          integrationConfig.googleSheetsUrl,
          users,
          integrationConfig.appScriptWebAppUrl
        );
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [users, integrationConfig.appScriptWebAppUrl, integrationConfig.googleSheetsUrl]);

  // Initial Fetch & Periodic 45s Background Poll from Google Sheets (2-way sync)
  useEffect(() => {
    if (integrationConfig.appScriptWebAppUrl) {
      fetchFromGoogleSheetsNow().catch(() => {});

      const pollInterval = setInterval(() => {
        fetchFromGoogleSheetsNow().catch(() => {});
      }, 45000);

      return () => clearInterval(pollInterval);
    }
  }, [integrationConfig.appScriptWebAppUrl]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_units`, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gedungs`, JSON.stringify(gedungs));
  }, [gedungs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_maintenance`, JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  // User & Access Management Handlers
  const addUser = (userData: Omit<UserAccount, 'id' | 'permissions'> & { permissions?: UserAccount['permissions'] }) => {
    const newUser: UserAccount = {
      ...userData,
      id: `usr-${Date.now()}`,
      permissions: userData.permissions || getDefaultPermissionsByRole(userData.role),
      lastActive: 'Baru ditambahkan',
    };
    setUsers((prev) => [newUser, ...prev]);
    addLog('Tambah Pengguna & Role', `Menambahkan pengguna baru: ${newUser.name} (${newUser.role} - Unit ${newUser.unit})`);
  };

  const updateUserRole = (
    userId: string,
    newRole: UserRole,
    newPermissions?: UserAccount['permissions'],
    newUnit?: UserAccount['unit']
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedPerms = newPermissions || getDefaultPermissionsByRole(newRole);
          const updatedUser = {
            ...u,
            role: newRole,
            unit: newUnit !== undefined ? newUnit : u.unit,
            permissions: updatedPerms,
          };
          addLog('Update Role & Hak Akses', `Mengubah role ${u.name} menjadi ${newRole} (Unit: ${updatedUser.unit})`);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const updateUser = (userId: string, updatedData: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedPerms = updatedData.permissions || u.permissions;
          const updatedUser: UserAccount = {
            ...u,
            ...updatedData,
            permissions: updatedPerms,
          };
          addLog('Update Pengguna & Akses', `Mengubah akun/role ${updatedUser.name} (${updatedUser.username}) - Role: ${updatedUser.role}`);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      addLog('Hapus Pengguna', `Menghapus pengguna: ${target.name} (${target.role})`);
    }
  };

  const addLog = (action: string, details: string, assetId?: string, assetName?: string) => {
    const newLog: HistoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      user: 'Alpian Rinaldhi',
      role: currentRole,
      action,
      details,
      assetId,
      assetName,
    };
    setHistoryLogs((prev) => [newLog, ...prev]);
  };

  const getAssetByQR = (qrCodeOrId: string) => {
    const clean = qrCodeOrId.trim().toLowerCase();
    return assets.find(
      (a) =>
        a.qrCode.toLowerCase() === clean ||
        a.assetIdAuto.toLowerCase() === clean ||
        a.id.toLowerCase() === clean ||
        a.nomorInventaris.toLowerCase() === clean
    );
  };

  const verifyAsset = (
    assetId: string,
    data: {
      nomorInventaris: string;
      qrCode: string;
      kategori: Asset['kategori'];
      masapakaiTahun: number;
      kondisi: Asset['kondisi'];
    }
  ) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const today = new Date().toISOString().split('T')[0];

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            nomorInventaris: data.nomorInventaris,
            qrCode: data.qrCode,
            kategori: data.kategori,
            masapakaiTahun: data.masapakaiTahun,
            kondisi: data.kondisi,
            statusVerifikasi: 'Diverifikasi FM',
            status: 'Aktif',
            tanggalVerifikasi: today,
            diverifikasiOleh: 'Ir. Yudi Hermawan (Admin FM)',
          };
        }
        return a;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Aset Berhasil Diverifikasi FM',
      message: `Aset ${target.namaAsset} (${target.unit}) telah diverifikasi FM. Nomor Inventaris: ${data.nomorInventaris} & QR Code resmi diterbitkan.`,
      type: 'procurement',
      createdAt: new Date().toLocaleString('id-ID'),
      read: false,
      assetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addLog('Diverifikasi FM', `Aset ${target.namaAsset} diverifikasi. QR Code ${data.qrCode} & No. Inv ${data.nomorInventaris} diterbitkan.`, target.id, target.namaAsset);
  };

  const rejectAsset = (assetId: string, reason: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            statusVerifikasi: 'Ditolak FM',
            alasanPenolakan: reason,
            qrCode: '(Ditolak FM)',
            nomorInventaris: '(Ditolak FM)',
          };
        }
        return a;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Aset Ditolak FM',
      message: `Aset ${target.namaAsset} dari ${target.unit} ditolak FM. Alasan: ${reason}`,
      type: 'procurement',
      createdAt: new Date().toLocaleString('id-ID'),
      read: false,
      assetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addLog('Ditolak FM', `Pengajuan aset ${target.namaAsset} ditolak FM. Alasan: ${reason}`, target.id, target.namaAsset);
  };

  const addAsset = (data: Omit<Asset, 'id' | 'maintenanceHistory' | 'damageReports' | 'loanHistory' | 'transferHistory' | 'documents'>) => {
    // If entered by Unit or dibeliOleh === 'Unit', default statusVerifikasi to 'Menunggu Verifikasi FM'
    const isUnitPurchase = data.dibeliOleh === 'Unit' || data.sumberPengadaan === 'Dibeli oleh Unit';
    const isFMAdmin = currentRole === 'Admin FM';

    const statusVerifikasi = isFMAdmin && !isUnitPurchase ? 'Diverifikasi FM' : 'Menunggu Verifikasi FM';
    const nomorInventaris = statusVerifikasi === 'Diverifikasi FM' ? data.nomorInventaris : '(Menunggu Verifikasi FM)';
    const qrCode = statusVerifikasi === 'Diverifikasi FM' ? data.qrCode : '(Belum Diterbitkan)';

    const newAsset: Asset = {
      ...data,
      statusVerifikasi,
      nomorInventaris,
      qrCode,
      id: `ast-${Date.now()}`,
      documents: [],
      maintenanceHistory: [],
      damageReports: [],
      loanHistory: [],
      transferHistory: [],
    };

    setAssets((prev) => ensureUniqueAssets([newAsset, ...prev]));

    if (statusVerifikasi === 'Menunggu Verifikasi FM') {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Pengajuan Aset Unit Baru',
        message: `Aset ${data.namaAsset} diinput oleh Unit ${data.unit}. Menunggu verifikasi & penerbitan QR oleh Tim FM.`,
        type: 'procurement',
        createdAt: new Date().toLocaleString('id-ID'),
        read: false,
        assetId: newAsset.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    addLog('Aset Baru Ditambahkan', `Menambahkan aset: ${data.namaAsset} (${statusVerifikasi})`, newAsset.id, data.namaAsset);
  };

  const bulkUpsertAssets = (importedList: Partial<Asset>[]) => {
    setAssets((prev) => {
      const copy = [...prev];
      importedList.forEach((imported) => {
        if (!imported.namaAsset) return;
        const index = copy.findIndex(
          (item) =>
            (imported.id && item.id === imported.id) ||
            (imported.qrCode && item.qrCode === imported.qrCode) ||
            (imported.namaAsset && item.namaAsset.toLowerCase() === imported.namaAsset.toLowerCase() && item.unit === imported.unit)
        );

        if (index >= 0) {
          // Update existing asset safely without overwriting custom photoUrl with empty value
          const existingPhoto = copy[index].fotoUrl;
          const importedPhoto = imported.fotoUrl;
          const finalPhoto = importedPhoto && importedPhoto.trim() ? importedPhoto : existingPhoto;

          copy[index] = {
            ...copy[index],
            ...imported,
            fotoUrl: finalPhoto,
            location: {
              ...copy[index].location,
              ...(imported.location || {}),
            },
          };
        } else {
          // Create new asset entry
          const newAsset: Asset = {
            id: imported.id || `ast-sheet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            assetIdAuto: `LZU-${Math.floor(1000 + Math.random() * 9000)}`,
            nomorInventaris: imported.nomorInventaris || imported.qrCode || `INV-${Date.now()}`,
            qrCode: imported.qrCode || `LZU-ASSET-${Math.floor(100 + Math.random() * 900)}`,
            namaAsset: imported.namaAsset,
            kategori: imported.kategori || 'Elektronik',
            subKategori: 'Lain-lain',
            merk: imported.merk || '',
            tipe: '',
            model: imported.model || '',
            serialNumber: '',
            fotoUrl: imported.fotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            unit: imported.unit || 'SD',
            departemen: 'General',
            penanggungJawab: imported.penanggungJawab || 'Koordinator Unit',
            picAsset: 'Staf Unit',
            userPengguna: 'Unit',
            supplier: 'Vendor Master',
            sumberPengadaan: 'Dibeli oleh Facility Management',
            dibeliOleh: 'Facility Management',
            statusVerifikasi: 'Diverifikasi FM',
            tanggalPembelian: imported.tanggalPembelian || new Date().toISOString().split('T')[0],
            harga: imported.harga || 0,
            garansiBulan: 12,
            garansiExpiredDate: '',
            masapakaiTahun: 5,
            location: imported.location || {
              unit: imported.unit || 'SD',
              gedung: 'Arrazi',
              lantai: 'Lantai 1',
              ruangan: 'Ruang Kelas',
              area: 'Gedung Utama',
            },
            kondisi: imported.kondisi || 'Baik',
            status: imported.status || 'Aktif',
            maintenanceHistory: [],
            damageReports: [],
            loanHistory: [],
            transferHistory: [],
            documents: [],
          };
          copy.push(newAsset);
        }
      });
      return ensureUniqueAssets(copy);
    });
    addLog('Import Google Sheets', `Berhasil mengimpor ${importedList.length} data aset dari Google Sheets.`);
  };

  const updateAsset = (id: string, updated: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newA = { ...a, ...updated };
          addLog('Update Asset', `Memperbarui data aset: ${a.namaAsset}`, a.id, a.namaAsset);
          return newA;
        }
        return a;
      })
    );
  };

  const recordACWash = (
    assetId: string,
    washData: {
      tanggalCuci: string;
      intervalBulan?: number;
      teknisi: string;
      vendor?: string;
      biaya: number;
      tekananFreonPsi?: number;
      pembersihanFilter: boolean;
      pembersihanOutdoor: boolean;
      catatan: string;
    }
  ) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const interval = washData.intervalBulan || 3;
    const d = new Date(washData.tanggalCuci);
    d.setMonth(d.getMonth() + interval);
    const nextWashDate = d.toISOString().split('T')[0];

    const newWashRecord: ACWashRecord = {
      id: `wash-${Date.now()}`,
      assetId,
      tanggalCuci: washData.tanggalCuci,
      tanggalCuciBerikutnya: nextWashDate,
      teknisi: washData.teknisi,
      vendor: washData.vendor,
      biaya: washData.biaya,
      tekananFreonPsi: washData.tekananFreonPsi,
      pembersihanFilter: washData.pembersihanFilter,
      pembersihanOutdoor: washData.pembersihanOutdoor,
      catatan: washData.catatan,
    };

    const newMaintenanceLog: MaintenanceLog = {
      id: `m-wash-${Date.now()}`,
      assetId,
      woNumber: `WO-AC-${Date.now().toString().slice(-5)}`,
      tanggal: washData.tanggalCuci,
      jenisMaintenance: 'Cuci AC',
      biaya: washData.biaya,
      teknisi: washData.teknisi,
      vendor: washData.vendor,
      catatan: `[Cuci AC] ${washData.catatan || 'Cuci rutin AC & pengecekan freon.'} (Tekanan Freon: ${washData.tekananFreonPsi || 75} Psi)`,
      status: 'Completed',
    };

    setMaintenanceLogs((prev) => [newMaintenanceLog, ...prev]);

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const washHistory = a.acWashHistory || [];
          const mainHistory = a.maintenanceHistory || [];
          return {
            ...a,
            terakhirCuciAC: washData.tanggalCuci,
            jadwalCuciACBerikutnya: nextWashDate,
            statusCuciAC: 'Jadwal Aman',
            kondisi: 'Baik',
            acWashHistory: [newWashRecord, ...washHistory],
            maintenanceHistory: [newMaintenanceLog, ...mainHistory],
          };
        }
        return a;
      })
    );

    addLog('Pencucian AC', `Pencucian AC ${target.namaAsset} tercatat oleh ${washData.teknisi}. Jadwal berikutnya: ${nextWashDate}`, target.id, target.namaAsset);
  };

  const recordAssetRepair = (
    assetId: string,
    repairData: {
      teknisi: string;
      catatanPerbaikan: string;
      biaya: number;
      rekomendasi: 'Siap Pakai' | 'Rekomendasi Dijual' | 'Rekomendasi Didonasikan' | 'Afkir / Scrap';
      kondisi: AssetCondition;
    }
  ) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const today = new Date().toISOString().split('T')[0];

    const newLog: MaintenanceLog = {
      id: `m-repair-${Date.now()}`,
      woNumber: `WO-REP-${Math.floor(100 + Math.random() * 900)}`,
      assetId,
      jenisMaintenance: 'Perbaikan Selesai',
      tanggal: today,
      teknisi: repairData.teknisi,
      biaya: repairData.biaya,
      catatan: repairData.catatanPerbaikan,
      rekomendasi: repairData.rekomendasi,
      status: 'Completed',
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            kondisi: repairData.kondisi,
            rekomendasiPerbaikan: repairData.rekomendasi,
            catatanPerbaikanTerakhir: repairData.catatanPerbaikan,
            tanggalSelesaiPerbaikan: today,
            maintenanceHistory: [newLog, ...(a.maintenanceHistory || [])],
          };
        }
        return a;
      })
    );

    addLog('Perbaikan Aset Selesai', `Aset ${target.namaAsset} diperbaiki. Rekomendasi: ${repairData.rekomendasi}`, target.id, target.namaAsset);
  };

  const deleteAsset = (id: string) => {
    if (currentRole === 'Maintenance') {
      alert('Akses Terbatas: Tim Maintenance tidak diperkenankan menghapus data aset. Hanya Admin FM yang dapat menghapus aset.');
      return;
    }
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      addLog('Aset Dihapus', `Menghapus aset: ${target.namaAsset} (${target.qrCode})`, target.id, target.namaAsset);
    }
  };

  const reportDamage = (assetId: string, description: string, severity: 'Rusak Ringan' | 'Rusak Berat', foto?: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const newReport: AssetDamageReport = {
      id: `dr-${Date.now()}`,
      assetId,
      reportedBy: 'Alpian Rinaldhi',
      reportedAt: new Date().toISOString().split('T')[0],
      tingkatKerusakan: severity,
      deskripsi: description,
      foto,
      status: 'Pending',
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            kondisi: severity,
            status: 'Rusak',
            damageReports: [newReport, ...(a.damageReports || [])],
          };
        }
        return a;
      })
    );

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Laporan Kerusakan Aset Baru',
      message: `Aset ${target.namaAsset} dilaporkan ${severity}: ${description}`,
      type: 'kerusakan',
      createdAt: new Date().toLocaleString('id-ID'),
      read: false,
      assetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addLog('Laporkan Kerusakan', `Melaporkan kerusakan ${severity} pada ${target.namaAsset}: ${description}`, target.id, target.namaAsset);
  };

  const requestLoan = (
    assetId: string,
    borrowerName: string,
    borrowerUnit: UnitName,
    startDate: string,
    returnDate: string,
    purpose: string
  ) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const newLoan: AssetLoanRecord = {
      id: `ln-${Date.now()}`,
      assetId,
      borrowerName,
      borrowerUnit,
      startDate,
      expectedReturnDate: returnDate,
      purpose,
      approvedBy: currentRole === 'Admin FM' || currentRole === 'Kepala Unit' ? 'Alpian Rinaldhi' : undefined,
      status: 'Dipinjam',
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            status: 'Dipinjam',
            loanHistory: [newLoan, ...(a.loanHistory || [])],
          };
        }
        return a;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Aset Dipinjam',
      message: `Aset ${target.namaAsset} dipinjam oleh ${borrowerName} (${borrowerUnit}) s.d ${returnDate}.`,
      type: 'peminjaman',
      createdAt: new Date().toLocaleString('id-ID'),
      read: false,
      assetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addLog('Peminjaman Aset', `Aset ${target.namaAsset} dipinjam oleh ${borrowerName} untuk: ${purpose}`, target.id, target.namaAsset);
  };

  const returnLoan = (assetId: string, loanId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const today = new Date().toISOString().split('T')[0];

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          const updatedLoans = (a.loanHistory || []).map((l) =>
            l.id === loanId ? { ...l, status: 'Dikembalikan' as const, actualReturnDate: today } : l
          );
          return {
            ...a,
            status: 'Aktif',
            loanHistory: updatedLoans,
          };
        }
        return a;
      })
    );

    addLog('Pengembalian Aset', `Aset ${target.namaAsset} telah dikembalikan dan status kembali Aktif.`, target.id, target.namaAsset);
  };

  const transferAsset = (
    assetId: string,
    toUnit: UnitName,
    toGedung: GedungName,
    toLantai: string,
    toRuangan: string,
    notes: string
  ) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    const transferRec: AssetTransferRecord = {
      id: `tr-${Date.now()}`,
      assetId,
      fromUnit: target.unit,
      toUnit,
      fromLocation: `${target.location.gedung} (${target.location.ruangan})`,
      toLocation: `${toGedung} (${toRuangan})`,
      requestedBy: 'Alpian Rinaldhi',
      transferDate: new Date().toISOString().split('T')[0],
      notes,
    };

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            unit: toUnit,
            location: {
              ...a.location,
              unit: toUnit,
              gedung: toGedung,
              lantai: toLantai,
              ruangan: toRuangan,
            },
            transferHistory: [transferRec, ...(a.transferHistory || [])],
          };
        }
        return a;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Perpindahan Lokasi Aset',
      message: `Aset ${target.namaAsset} dipindahkan dari ${target.unit} (${target.location.gedung}) ke ${toUnit} (${toGedung}).`,
      type: 'perpindahan',
      createdAt: new Date().toLocaleString('id-ID'),
      read: false,
      assetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addLog('Perpindahan Aset', `Memindahkan ${target.namaAsset} dari ${target.unit} ke ${toUnit} (${toGedung} ${toRuangan})`, target.id, target.namaAsset);
  };

  const addWorkOrder = (woData: Omit<MaintenanceLog, 'id'>) => {
    const newWO: MaintenanceLog = {
      ...woData,
      id: `wo-${Date.now()}`,
    };

    setMaintenanceLogs((prev) => [newWO, ...prev]);

    // Also update asset status
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === woData.assetId) {
          return {
            ...a,
            status: 'Maintenance',
            kondisi: 'Perlu Perawatan',
            maintenanceHistory: [newWO, ...(a.maintenanceHistory || [])],
          };
        }
        return a;
      })
    );

    const target = assets.find((a) => a.id === woData.assetId);
    addLog('WO Maintenance', `Membuat Work Order ${woData.woNumber} (${woData.jenisMaintenance}) untuk aset ${target?.namaAsset || woData.assetId}`, woData.assetId, target?.namaAsset);
  };

  const updateWorkOrderStatus = (woId: string, status: MaintenanceLog['status']) => {
    setMaintenanceLogs((prev) =>
      prev.map((w) => {
        if (w.id === woId) {
          const updated = { ...w, status };
          if (status === 'Completed') {
            // Restore asset status to Aktif & Baik
            setAssets((aPrev) =>
              aPrev.map((a) => {
                if (a.id === w.assetId) {
                  return {
                    ...a,
                    status: 'Aktif',
                    kondisi: 'Baik',
                  };
                }
                return a;
              })
            );
          }
          return updated;
        }
        return w;
      })
    );
  };

  const updateAssetCondition = (assetId: string, condition: AssetCondition, status: AssetStatus, notes: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return { ...a, kondisi: condition, status };
        }
        return a;
      })
    );

    addLog('Update Kondisi Aset', `Mengubah kondisi ${target.namaAsset} menjadi ${condition} (${status}). Catatan: ${notes}`, target.id, target.namaAsset);
  };

  const addUnit = (unitData: Omit<MasterUnit, 'id'>) => {
    const newUnit: MasterUnit = {
      ...unitData,
      id: `u-${Date.now()}`,
    };
    setUnits((prev) => [...prev, newUnit]);
    addLog('Tambah Master Unit', `Menambahkan Master Unit baru: ${unitData.nama}`);
  };

  const addGedung = (gedungData: Omit<MasterGedung, 'id'>) => {
    const newGedung: MasterGedung = {
      ...gedungData,
      id: `g-${Date.now()}`,
    };
    setGedungs((prev) => [...prev, newGedung]);
    addLog('Tambah Master Gedung', `Menambahkan Master Gedung baru: ${gedungData.nama}`);
  };

  const markAudited = (assetId: string, customDate?: string) => {
    const auditDate = customDate || new Date().toISOString().split('T')[0];
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            lastAuditedAt: auditDate,
            auditedBy: currentUser?.name || 'Alpian Rinaldhi',
          };
        }
        return a;
      })
    );
    const target = assets.find((a) => a.id === assetId);
    addLog('Stock Opname Audit', `Audit fisik dikonfirmasi (${auditDate}) untuk aset: ${target?.namaAsset || assetId}`, assetId, target?.namaAsset);
  };

  const resetStockOpname = (unitName?: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (!unitName || unitName === 'Semua' || a.unit === unitName) {
          return {
            ...a,
            lastAuditedAt: undefined,
            auditedBy: undefined,
          };
        }
        return a;
      })
    );
    addLog('Stock Opname Reset', `Reset status Stock Opname untuk unit: ${unitName || 'Semua Unit'}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AssetContext.Provider
      value={{
        assets,
        units,
        gedungs,
        notifications,
        historyLogs,
        maintenanceLogs,
        currentRole,
        setCurrentRole,
        currentUser,
        loginWithEmail,
        logoutUser,
        users,
        addUser,
        updateUserRole,
        updateUser,
        deleteUser,
        integrationConfig,
        setIntegrationConfig,
        isSyncing,
        lastSyncTime,
        syncError,
        syncToGoogleSheetsNow,
        fetchFromGoogleSheetsNow,
        verifyAsset,
        rejectAsset,
        recordACWash,
        recordAssetRepair,
        addAsset,
        bulkUpsertAssets,
        updateAsset,
        deleteAsset,
        getAssetByQR,
        reportDamage,
        requestLoan,
        returnLoan,
        transferAsset,
        addWorkOrder,
        updateWorkOrderStatus,
        updateAssetCondition,
        addUnit,
        addGedung,
        markAudited,
        resetStockOpname,
        addLog,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
};
