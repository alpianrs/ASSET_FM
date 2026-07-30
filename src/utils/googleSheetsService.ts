import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Asset, GedungName, UnitName } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

// Auth listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInGoogleForSheets = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google OAuth.');
    }
    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('Error Google Sign-In:', err);
    throw err;
  }
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

export const getCachedToken = () => cachedAccessToken;

// Extract Spreadsheet ID from full URL or return ID as is
export const extractSpreadsheetId = (urlOrId: string): string => {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return urlOrId.trim();
};

/**
 * 1. Create a brand new Google Spreadsheet in the user's Google Drive
 */
export const createNewGoogleSheet = async (
  accessToken: string,
  title = 'Aset Lazuardi GCS - Master Database'
) => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Daftar Aset' } },
        { properties: { title: 'History Service AC' } },
        { properties: { title: 'Log Stock Opname' } },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal membuat Google Spreadsheet baru: ${errText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId as string,
    spreadsheetUrl: data.spreadsheetUrl as string,
  };
};

/**
 * 2. EXPORT (SINKRONISASI 1: AI STUDIO -> GOOGLE SHEETS)
 */
export const exportDataToGoogleSheets = async (
  accessToken: string,
  spreadsheetId: string,
  assets: Asset[]
) => {
  const cleanId = extractSpreadsheetId(spreadsheetId);

  // Prepare header + rows for "Daftar Aset"
  const header = [
    'ID Aset',
    'Kode QR / Inventaris',
    'Nama Aset',
    'Kategori',
    'Unit Sekolah',
    'Gedung',
    'Ruangan',
    'Kondisi',
    'Status',
    'Harga Perolehan (Rp)',
    'Tanggal Pembelian',
    'Merk/Brand',
    'Model/Tipe',
    'Terakhir Cuci AC',
    'Jadwal Cuci AC Berikutnya',
    'Penanggung Jawab',
    'Nomor PO / Note',
  ];

  const rows = assets.map((a) => [
    a.id,
    a.qrCode,
    a.namaAsset,
    a.kategori,
    a.unit,
    a.location?.gedung || 'Utama',
    a.location?.ruangan || 'Umum',
    a.kondisi,
    a.status,
    a.harga || 0,
    a.tanggalPembelian || '',
    a.merk || '',
    a.model || a.tipe || '',
    a.terakhirCuciAC || '',
    a.jadwalCuciACBerikutnya || '',
    a.penanggungJawab || '',
    a.nomorPO || '',
  ]);

  const valuesData = [header, ...rows];

  // Write to "Daftar Aset"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/Daftar%20Aset!A1?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Daftar Aset!A1',
      majorDimension: 'ROWS',
      values: valuesData,
    }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Gagal memperbarui sheet "Daftar Aset": ${errorMsg}`);
  }

  // Also export AC Wash Logs
  const acHeader = ['ID Aset', 'Kode QR', 'Nama AC', 'Unit', 'Gedung', 'Ruangan', 'Tanggal Service', 'Teknisi / Tukang AC', 'Vendor Luar', 'Biaya (Rp)', 'Freon (PSI)', 'Catatan / Ringkasan Pekerjaan'];
  const acRows: any[][] = [];
  assets.forEach((a) => {
    if (a.acWashHistory && a.acWashHistory.length > 0) {
      a.acWashHistory.forEach((log) => {
        acRows.push([
          a.id,
          a.qrCode,
          a.namaAsset,
          a.unit,
          a.location?.gedung || 'Utama',
          a.location?.ruangan || 'Umum',
          log.tanggalCuci,
          log.teknisi,
          log.vendor || 'Vendor Luar',
          log.biaya || 0,
          log.tekananFreonPsi || '-',
          log.catatan || '',
        ]);
      });
    }
  });

  if (acRows.length > 0) {
    const acUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/History%20Service%20AC!A1?valueInputOption=USER_ENTERED`;
    await fetch(acUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'History Service AC!A1',
        majorDimension: 'ROWS',
        values: [acHeader, ...acRows],
      }),
    });
  }

  return true;
};

/**
 * 3. IMPORT (SINKRONISASI 2: GOOGLE SHEETS -> AI STUDIO)
 */
export const importDataFromGoogleSheets = async (
  accessToken: string,
  spreadsheetId: string
): Promise<Partial<Asset>[]> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/Daftar%20Aset!A2:Q1000`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membaca sheet "Daftar Aset": ${errText}`);
  }

  const json = await res.json();
  const rawRows: string[][] = json.values || [];

  const importedAssets: Partial<Asset>[] = rawRows
    .filter((row) => row && row.length >= 3 && row[2]) // must have namaAsset
    .map((row) => {
      const unitVal = (row[4] as UnitName) || 'SD';
      const gedungVal = (row[5] as GedungName) || 'Arrazi';
      return {
        id: row[0] ? String(row[0]) : undefined,
        qrCode: row[1] || `LZU-ASSET-${Math.floor(100 + Math.random() * 900)}`,
        namaAsset: row[2],
        kategori: (row[3] as any) || 'Elektronik',
        unit: unitVal,
        location: {
          unit: unitVal,
          gedung: gedungVal,
          lantai: 'Lantai 1',
          ruangan: row[6] || 'Ruang Kelas',
          area: 'Area Utama',
        },
        kondisi: (row[7] as any) || 'Baik',
        status: (row[8] as any) || 'Aktif',
        harga: row[9] ? Number(row[9]) : 0,
        tanggalPembelian: row[10] || new Date().toISOString().split('T')[0],
        merk: row[11] || '',
        model: row[12] || '',
        terakhirCuciAC: row[13] || undefined,
        jadwalCuciACBerikutnya: row[14] || undefined,
        penanggungJawab: row[15] || '',
        nomorPO: row[16] || '',
      };
    });

  return importedAssets;
};
