export type UserRole = 'Admin FM' | 'Maintenance' | 'Kepala Unit' | 'User' | 'Vendor AC (Tukang Service)';

export interface UserPermissions {
  canVerifyProcurement: boolean;
  canManageAssets: boolean;
  canPerformMaintenance: boolean;
  canAuditStockOpname: boolean;
  canManageMasterData: boolean;
  canManageUsers: boolean;
  canSyncGoogleSheets: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  unit: UnitName | 'Facility Management' | 'Semua';
  status: 'Aktif' | 'Non-aktif';
  phone?: string;
  avatarUrl?: string;
  lastActive?: string;
  permissions: UserPermissions;
}

export type UnitName = 
  | 'TK'
  | 'SD'
  | 'SMP'
  | 'Pelangi'
  | 'CARE'
  | 'Facility Management'
  | 'Keuangan'
  | 'General Affair'
  | 'Litbang'
  | 'CRM'
  | 'Mitra Office';

export type GedungName = 
  | 'Arrazi'
  | 'Ibnu Sina'
  | 'Direktorat'
  | 'Ibnu Khaldun'
  | 'Pelangi'
  | 'Aula'
  | 'Masjid'
  | 'Lazmart'
  | 'Al Farabi'
  | 'Ibnu Rusyd'
  | 'Al Biruni';

export type SumberPengadaan = 
  | 'Dibeli oleh Facility Management'
  | 'Dibeli oleh Unit'
  | 'Donasi'
  | 'Hibah'
  | 'Sponsor'
  | 'Transfer antar Unit'
  | 'Penggantian Garansi'
  | 'Inventaris Lama';

export type StatusVerifikasi = 
  | 'Menunggu Verifikasi FM'
  | 'Diverifikasi FM'
  | 'Ditolak FM';

export type AssetCondition = 
  | 'Sangat Baik'
  | 'Baik'
  | 'Perlu Perawatan'
  | 'Rusak Ringan'
  | 'Rusak Berat'
  | 'Hilang'
  | 'Tidak Digunakan';

export type AssetStatus = 
  | 'Aktif'
  | 'Dipinjam'
  | 'Maintenance'
  | 'Rusak'
  | 'Dihapus'
  | 'Dijual'
  | 'Hilang';

export type AssetCategory = 
  | 'Furniture'
  | 'Elektronik'
  | 'AC'
  | 'Mesin'
  | 'Kendaraan'
  | 'IT'
  | 'Sound System'
  | 'CCTV'
  | 'Jaringan'
  | 'Alat Kebersihan'
  | 'Alat Olahraga'
  | 'Laboratorium'
  | 'Peralatan Event';

export interface MasterUnit {
  id: string;
  nama: UnitName;
  kepalaUnit: string;
  picAsset: string;
  lokasiGedung: GedungName[];
  jumlahAsset?: number;
  nilaiAsset?: number;
}

export interface MasterGedung {
  id: string;
  nama: GedungName;
  deskripsi: string;
  totalLantai: number;
}

export interface LocationDetail {
  unit: UnitName;
  gedung: GedungName;
  lantai: string; // e.g. "Lantai 1", "Lantai 2"
  ruangan: string; // e.g. "Kelas 4A", "Lab IPA"
  area: string; // e.g. "Sayap Timur"
  titikLokasi?: string;
  koordinat?: string;
}

export interface AssetDocument {
  id: string;
  title: string;
  type: 'Invoice' | 'Manual Book' | 'SOP' | 'Garansi' | 'Foto Sebelum' | 'Foto Sesudah' | 'Video';
  url: string;
  uploadedAt: string;
}

export interface ACWashRecord {
  id: string;
  assetId: string;
  tanggalCuci?: string;
  tanggalCuciBerikutnya?: string;
  tanggalService?: string;
  jenisService?: string;
  teknisi?: string;
  teknisiName?: string;
  isVendorLuar?: boolean;
  kondisiFreon?: string;
  gantiSparepart?: boolean;
  vendor?: string;
  biaya: number;
  tekananFreonPsi?: number;
  pembersihanFilter?: boolean;
  pembersihanOutdoor?: boolean;
  catatan: string;
}

export interface MaintenanceLog {
  id: string;
  woNumber: string;
  assetId: string;
  jenisMaintenance: 'Preventive' | 'Corrective' | 'Cuci AC' | 'Perbaikan Selesai';
  tanggal: string;
  teknisi: string;
  vendor?: string;
  sparepart?: string;
  biaya: number;
  fotoSebelum?: string;
  fotoSesudah?: string;
  catatan: string;
  rekomendasi?: 'Siap Pakai' | 'Rekomendasi Dijual' | 'Rekomendasi Didonasikan' | 'Afkir / Scrap';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface AssetDamageReport {
  id: string;
  assetId: string;
  reportedBy: string;
  reportedAt: string;
  tingkatKerusakan: 'Rusak Ringan' | 'Rusak Berat';
  deskripsi: string;
  foto?: string;
  status: 'Pending' | 'Approved' | 'In Maintenance' | 'Resolved';
}

export interface AssetLoanRecord {
  id: string;
  assetId: string;
  borrowerName: string;
  borrowerUnit: UnitName;
  startDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  approvedBy?: string;
  status: 'Diajukan' | 'Dipinjam' | 'Dikembalikan' | 'Keterlambatan';
}

export interface AssetTransferRecord {
  id: string;
  assetId: string;
  fromUnit: UnitName;
  toUnit: UnitName;
  fromLocation: string;
  toLocation: string;
  requestedBy: string;
  transferDate: string;
  notes: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  assetId?: string;
  assetName?: string;
  details: string;
}

export interface Asset {
  id: string; // Internal UUID
  qrCode: string; // Identitas QR Code string (e.g. LZU-ASSET-001)
  assetIdAuto: string; // LZ-SD-KHL-2026-001
  nomorInventaris: string; // INV/2026/FM/SD/001
  namaAsset: string;
  kategori: AssetCategory;
  subKategori: string;
  merk: string;
  tipe: string;
  model: string;
  serialNumber?: string;
  barcodePabrik?: string;
  fotoUrl: string;

  // Kepemilikan
  unit: UnitName;
  departemen: string;
  penanggungJawab: string;
  picAsset: string;
  userPengguna: string;

  // Pembelian & Pengadaan
  supplier: string;
  sumberPengadaan: SumberPengadaan;
  dibeliOleh: 'Facility Management' | 'Unit';
  statusVerifikasi: StatusVerifikasi;
  alasanPenolakan?: string;
  namaUnitPengaju?: string;
  namaPembeli?: string;
  nomorPO?: string;
  nomorInvoice?: string;
  sumberDana?: string;
  tahunAnggaran?: string;
  buktiInvoiceUrl?: string;
  buktiFotoUrl?: string;
  tanggalVerifikasi?: string;
  diverifikasiOleh?: string;

  tanggalPembelian: string; // YYYY-MM-DD
  harga: number; // Rupiah
  garansiBulan: number; // e.g. 24 bulan
  garansiExpiredDate?: string;
  masapakaiTahun: number; // useful life in years

  // Lokasi
  location: LocationDetail;

  // Kondisi & Status
  kondisi: AssetCondition;
  status: AssetStatus;

  // Associated Records
  documents?: AssetDocument[];
  maintenanceHistory: MaintenanceLog[];
  damageReports: AssetDamageReport[];
  loanHistory: AssetLoanRecord[];
  transferHistory: AssetTransferRecord[];

  // AC Washing & Service Tracking
  terakhirCuciAC?: string; // YYYY-MM-DD
  jadwalCuciACBerikutnya?: string; // YYYY-MM-DD
  statusCuciAC?: 'Jadwal Aman' | 'Segera Dicuci' | 'Overdue Cuci AC' | 'Siap Pakai / Normal';
  acWashHistory?: ACWashRecord[];

  // Repair Status & Disposal Recommendation
  rekomendasiPerbaikan?: 'Siap Pakai' | 'Rekomendasi Dijual' | 'Rekomendasi Didonasikan' | 'Afkir / Scrap' | 'Dingin Normal' | string;
  catatanPerbaikanTerakhir?: string;
  tanggalSelesaiPerbaikan?: string;

  // Stock Opname Status
  lastAuditedAt?: string;
  auditedBy?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'procurement' | 'maintenance' | 'garansi' | 'kerusakan' | 'perpindahan' | 'peminjaman' | 'stock_opname' | 'overdue';
  createdAt: string;
  read: boolean;
  assetId?: string;
}

export interface StockOpnameSession {
  id: string;
  title: string;
  unit: UnitName | 'Semua';
  gedung: GedungName | 'Semua';
  startDate: string;
  auditor: string;
  scannedAssetIds: string[];
  status: 'In Progress' | 'Completed';
  totalExpected: number;
}
