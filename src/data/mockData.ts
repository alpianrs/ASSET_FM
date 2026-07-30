import { Asset, MasterGedung, MasterUnit, MaintenanceLog, HistoryLog, NotificationItem, UserRole } from '../types';

export const INITIAL_UNITS: MasterUnit[] = [
  { id: 'u-1', nama: 'SD', kepalaUnit: 'Dra. Hj. Nurul Huda, M.Pd', picAsset: 'Alpian Rinaldhi', lokasiGedung: ['Ibnu Khaldun', 'Arrazi'] },
  { id: 'u-2', nama: 'SMP', kepalaUnit: 'Drs. Ahmad Fauzi', picAsset: 'Budi Santoso', lokasiGedung: ['Ibnu Rusyd', 'Ibnu Sina'] },
  { id: 'u-3', nama: 'TK', kepalaUnit: 'Siti Rahmawati, S.Pd', picAsset: 'Rina Kusuma', lokasiGedung: ['Arrazi'] },
  { id: 'u-4', nama: 'Pelangi', kepalaUnit: 'Dewi Lestari, S.Psi', picAsset: 'Hendra Gunawan', lokasiGedung: ['Pelangi'] },
  { id: 'u-5', nama: 'CARE', kepalaUnit: 'Fajri Ramadhan, M.Si', picAsset: 'Arief Kurniawan', lokasiGedung: ['Direktorat'] },
  { id: 'u-6', nama: 'Facility Management', kepalaUnit: 'Ir. Yudi Hermawan', picAsset: 'Alpian Rinaldhi', lokasiGedung: ['Aula', 'Direktorat'] },
  { id: 'u-7', nama: 'Keuangan', kepalaUnit: 'Sri Wahyuni, SE', picAsset: 'Fitri Handayani', lokasiGedung: ['Direktorat'] },
  { id: 'u-8', nama: 'General Affair', kepalaUnit: 'Bambang Soetjipto', picAsset: 'Dedi Pratama', lokasiGedung: ['Direktorat'] },
  { id: 'u-9', nama: 'Litbang', kepalaUnit: 'Dr. Tri Sugiarto', picAsset: 'Eko Prasetyo', lokasiGedung: ['Direktorat'] },
  { id: 'u-10', nama: 'CRM', kepalaUnit: 'Maya Indah, S.Kom', picAsset: 'Novianti', lokasiGedung: ['Direktorat'] },
  { id: 'u-11', nama: 'Mitra Office', kepalaUnit: 'Rizal Iskandar', picAsset: 'Agus Wijaya', lokasiGedung: ['Direktorat'] },
];

export const INITIAL_GEDUNG: MasterGedung[] = [
  { id: 'g-1', nama: 'Arrazi', deskripsi: 'Gedung Pembelajaran TK & Laboratorium Bahasa', totalLantai: 2 },
  { id: 'g-2', nama: 'Ibnu Sina', deskripsi: 'Gedung Sains & Fasilitas Kesehatan / UKS', totalLantai: 3 },
  { id: 'g-3', nama: 'Direktorat', deskripsi: 'Gedung Manajemen Sekolah & Kantor Administrasi', totalLantai: 2 },
  { id: 'g-4', nama: 'Ibnu Khaldun', deskripsi: 'Gedung Pembelajaran SD (Kelas 1 - 6)', totalLantai: 3 },
  { id: 'g-5', nama: 'Pelangi', deskripsi: 'Gedung Inklusi & Activity Center Pelangi', totalLantai: 2 },
  { id: 'g-6', nama: 'Aula', deskripsi: 'Aula Serbaguna & Indoor Activity Center', totalLantai: 1 },
  { id: 'g-7', nama: 'Masjid', deskripsi: 'Masjid Lazuardi GCS & Pusat Kegiatan Keagamaan', totalLantai: 2 },
  { id: 'g-8', nama: 'Lazmart', deskripsi: 'Kantin, Koperasi & Toko Perlengkapan Sekolah', totalLantai: 1 },
  { id: 'g-9', nama: 'Al Farabi', deskripsi: 'Gedung Perpustakaan & Resource Center', totalLantai: 2 },
  { id: 'g-10', nama: 'Ibnu Rusyd', deskripsi: 'Gedung Pembelajaran SMP & Ruang Sains', totalLantai: 3 },
  { id: 'g-11', nama: 'Al Biruni', deskripsi: 'Gedung Inovasi Technology & Lab Komputer', totalLantai: 2 },
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-1',
    qrCode: 'LZU-SD-KHL-001',
    assetIdAuto: 'LZU-SD-KHL-2024-001',
    nomorInventaris: 'INV/2024/SD/IT/001',
    namaAsset: 'Interactive Smart Board 75 Inch 4K',
    kategori: 'IT',
    subKategori: 'Interactive Display',
    merk: 'Samsung',
    tipe: 'Flip Pro WM75B',
    model: 'WM75B-4K',
    serialNumber: 'SAMP75B20240981',
    barcodePabrik: '8806092123456',
    fotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    unit: 'SD',
    departemen: 'Akademik SD',
    penanggungJawab: 'Dra. Hj. Nurul Huda, M.Pd',
    picAsset: 'Alpian Rinaldhi',
    userPengguna: 'Wali Kelas 4A',
    
    // Procurement
    supplier: 'PT Teknologi Edukasi Nusantara',
    sumberPengadaan: 'Dibeli oleh Facility Management',
    dibeliOleh: 'Facility Management',
    statusVerifikasi: 'Diverifikasi FM',
    namaUnitPengaju: 'SD Lazuardi',
    namaPembeli: 'Tim FM Procurement',
    nomorPO: 'PO-FM-2024-089',
    nomorInvoice: 'INV-TEN-2024-1102',
    sumberDana: 'Anggaran FM',
    tahunAnggaran: '2024',
    tanggalVerifikasi: '2024-02-16',
    diverifikasiOleh: 'Ir. Yudi Hermawan (Admin FM)',

    tanggalPembelian: '2024-02-15',
    harga: 48500000,
    garansiBulan: 36,
    garansiExpiredDate: '2027-02-15',
    masapakaiTahun: 5,
    location: {
      unit: 'SD',
      gedung: 'Ibnu Khaldun',
      lantai: 'Lantai 2',
      ruangan: 'Kelas 4A',
      area: 'Sayap Utara',
      titikLokasi: 'Dinding Depan Kelas 4A',
      koordinat: '-6.35412, 106.8321'
    },
    kondisi: 'Sangat Baik',
    status: 'Aktif',
    documents: [
      { id: 'doc-1', title: 'Invoice Smartboard', type: 'Invoice', url: '#', uploadedAt: '2024-02-15' },
      { id: 'doc-2', title: 'Kartu Garansi Resmi', type: 'Garansi', url: '#', uploadedAt: '2024-02-15' }
    ],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  },
  {
    id: 'ast-2',
    qrCode: 'LZU-SMP-IBN-002',
    assetIdAuto: 'LZU-SMP-IBN-2023-014',
    nomorInventaris: 'INV/2023/SMP/LAB/014',
    namaAsset: 'Mikroskop Binokuler Digital 1000x',
    kategori: 'Laboratorium',
    subKategori: 'Alat Praktikum Biologi',
    merk: 'Olympus',
    tipe: 'CX23 LED',
    model: 'CX23-R2',
    serialNumber: 'OLYM2023CX9912',
    barcodePabrik: '4957638012391',
    fotoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    unit: 'SMP',
    departemen: 'Laboratorium IPA',
    penanggungJawab: 'Drs. Ahmad Fauzi',
    picAsset: 'Budi Santoso',
    userPengguna: 'Guru Biologi',

    // Procurement
    supplier: 'CV Lab Sains Indonesia',
    sumberPengadaan: 'Dibeli oleh Facility Management',
    dibeliOleh: 'Facility Management',
    statusVerifikasi: 'Diverifikasi FM',
    namaUnitPengaju: 'SMP Lazuardi',
    sumberDana: 'Anggaran FM',
    tahunAnggaran: '2023',
    tanggalVerifikasi: '2023-08-11',
    diverifikasiOleh: 'Ir. Yudi Hermawan (Admin FM)',

    tanggalPembelian: '2023-08-10',
    harga: 22000000,
    garansiBulan: 24,
    garansiExpiredDate: '2025-08-10',
    masapakaiTahun: 7,
    location: {
      unit: 'SMP',
      gedung: 'Ibnu Rusyd',
      lantai: 'Lantai 3',
      ruangan: 'Lab IPA',
      area: 'Meja Praktikum Utama',
      titikLokasi: 'Lemari Penyimpanan Lab 01',
      koordinat: '-6.35415, 106.8325'
    },
    kondisi: 'Baik',
    status: 'Aktif',
    documents: [
      { id: 'doc-3', title: 'Manual Book Olympus CX23', type: 'Manual Book', url: '#', uploadedAt: '2023-08-10' }
    ],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  },
  {
    id: 'ast-3',
    qrCode: 'LZU-FM-HAL-003',
    assetIdAuto: 'LZU-FM-HAL-2022-005',
    nomorInventaris: 'INV/2022/FM/AC/005',
    namaAsset: 'AC Inverter Standing 5 PK',
    kategori: 'AC',
    subKategori: 'AC Standing Floor',
    merk: 'Daikin',
    tipe: 'FVRN125BXV14',
    model: '5 PK Inverter',
    serialNumber: 'DKN5PK20228831',
    fotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    unit: 'Facility Management',
    departemen: 'Maintenance Gedung',
    penanggungJawab: 'Ir. Yudi Hermawan',
    picAsset: 'Alpian Rinaldhi',
    userPengguna: 'Tim Event Lazuardi',

    // Procurement
    supplier: 'PT Cold Air Jaya',
    sumberPengadaan: 'Dibeli oleh Facility Management',
    dibeliOleh: 'Facility Management',
    statusVerifikasi: 'Diverifikasi FM',
    sumberDana: 'Anggaran FM',
    tahunAnggaran: '2022',

    tanggalPembelian: '2022-05-20',
    harga: 28500000,
    garansiBulan: 36,
    garansiExpiredDate: '2025-05-20',
    masapakaiTahun: 8,
    location: {
      unit: 'Facility Management',
      gedung: 'Aula',
      lantai: 'Lantai 1',
      ruangan: 'Auditorium Utama',
      area: 'Sudut Kiri Panggung',
      titikLokasi: 'Pintu Masuk Barat'
    },
    kondisi: 'Perlu Perawatan',
    status: 'Aktif',
    
    // AC Wash & Repair Tracking
    terakhirCuciAC: '2026-04-10',
    jadwalCuciACBerikutnya: '2026-07-10', // Overdue!
    statusCuciAC: 'Overdue Cuci AC',
    rekomendasiPerbaikan: 'Siap Pakai',
    catatanPerbaikanTerakhir: 'Servis rutin & pembersihan filter indoor outdoor. Freon 75 psi normal.',
    acWashHistory: [
      {
        id: 'wash-1',
        assetId: 'ast-3',
        tanggalCuci: '2026-04-10',
        tanggalCuciBerikutnya: '2026-07-10',
        teknisi: 'Tim Maintenance FM (Ahmad & Agus)',
        biaya: 150000,
        tekananFreonPsi: 75,
        pembersihanFilter: true,
        pembersihanOutdoor: true,
        catatan: 'Cuci filter & sirip kondensor. Kondisi dingin optimal.'
      }
    ],
    documents: [],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  },
  {
    id: 'ast-4',
    qrCode: 'LZU-GA-HL-004',
    assetIdAuto: 'LZU-GA-HL-2023-088',
    nomorInventaris: 'INV/2023/GA/SND/088',
    namaAsset: 'Portable Wireless Sound System 15 Inch Dual Mic',
    kategori: 'Sound System',
    subKategori: 'Portable Speaker',
    merk: 'Yamaha',
    tipe: 'StagePas 600BT',
    model: '600BT-PRO',
    serialNumber: 'YMHSP600BT912',
    fotoUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    unit: 'General Affair',
    departemen: 'Logistik & Event',
    penanggungJawab: 'Bambang Soetjipto',
    picAsset: 'Dedi Pratama',
    userPengguna: 'Panitia Event Sekolah',

    // Procurement
    supplier: 'Melodia Musik Jakarta',
    sumberPengadaan: 'Dibeli oleh Facility Management',
    dibeliOleh: 'Facility Management',
    statusVerifikasi: 'Diverifikasi FM',
    sumberDana: 'Anggaran FM',
    tahunAnggaran: '2023',

    tanggalPembelian: '2023-11-05',
    harga: 16800000,
    garansiBulan: 12,
    garansiExpiredDate: '2024-11-05',
    masapakaiTahun: 5,
    location: {
      unit: 'General Affair',
      gedung: 'Aula',
      lantai: 'Lantai 1',
      ruangan: 'Ruang Sound & AV',
      area: 'Meja Kontrol AV'
    },
    kondisi: 'Baik',
    status: 'Dipinjam',
    documents: [],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [
      {
        id: 'ln-1',
        assetId: 'ast-4',
        borrowerName: 'Eko Prasetyo (Litbang)',
        borrowerUnit: 'Litbang',
        startDate: '2026-07-21',
        expectedReturnDate: '2026-07-24',
        purpose: 'Acara Workshop Kurikulum Guru Lazuardi',
        approvedBy: 'Bambang Soetjipto',
        status: 'Dipinjam'
      }
    ],
    transferHistory: []
  },
  {
    id: 'ast-9',
    qrCode: '(Belum Diterbitkan)',
    assetIdAuto: 'REQ-SD-2026-012',
    nomorInventaris: '(Menunggu Verifikasi FM)',
    namaAsset: 'Projector Portable Short Throw 4000 Lumens',
    kategori: 'IT',
    subKategori: 'Proyektor Mini',
    merk: 'Epson',
    tipe: 'EB-E01 XGA',
    model: 'EB-E01',
    serialNumber: 'EPSN2026XGA99',
    fotoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    unit: 'SD',
    departemen: 'Akademik SD',
    penanggungJawab: 'Dra. Hj. Nurul Huda, M.Pd',
    picAsset: 'Fitri Handayani',
    userPengguna: 'Guru SD',

    // Procurement (PURCHASED DIRECTLY BY UNIT - PENDING VERIFICATION)
    supplier: 'Toko Elektronik Komputer Maju',
    sumberPengadaan: 'Dibeli oleh Unit',
    dibeliOleh: 'Unit',
    statusVerifikasi: 'Menunggu Verifikasi FM',
    namaUnitPengaju: 'SD Lazuardi GCS',
    namaPembeli: 'Fitri Handayani (Staf SD)',
    nomorPO: 'PO-SD-2026-004',
    nomorInvoice: 'INV-KM-2026-8812',
    sumberDana: 'Anggaran Unit',
    tahunAnggaran: '2026',
    buktiInvoiceUrl: 'https://example.com/invoice-projector-sd.pdf',

    tanggalPembelian: '2026-07-16',
    harga: 6850000,
    garansiBulan: 12,
    garansiExpiredDate: '2027-07-16',
    masapakaiTahun: 4,
    location: {
      unit: 'SD',
      gedung: 'Ibnu Khaldun',
      lantai: 'Lantai 1',
      ruangan: 'Kantor Guru SD',
      area: 'Meja Alat Pembelajaran'
    },
    kondisi: 'Baik',
    status: 'Aktif',
    documents: [
      { id: 'doc-9', title: 'Faktur Pembelian Projector SD', type: 'Invoice', url: '#', uploadedAt: '2026-07-16' }
    ],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  },
  {
    id: 'ast-10',
    qrCode: '(Belum Diterbitkan)',
    assetIdAuto: 'REQ-SMP-2026-003',
    nomorInventaris: '(Menunggu Verifikasi FM)',
    namaAsset: 'Laptop Intel Core i7 16GB RAM Kebutuhan Lab Robotics',
    kategori: 'IT',
    subKategori: 'Laptop Lab',
    merk: 'Lenovo',
    tipe: 'ThinkPad L14 Gen 4',
    model: '21H1CTO1WW',
    serialNumber: 'LNVTP2026-88123',
    fotoUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    unit: 'SMP',
    departemen: 'Laboratorium Komputer',
    penanggungJawab: 'Drs. Ahmad Fauzi',
    picAsset: 'Budi Santoso',
    userPengguna: 'Siswa Ekskul Robotik',

    // Procurement (PURCHASED BY UNIT - PENDING VERIFICATION > 7 DAYS ALERT)
    supplier: 'PT Computa Utama',
    sumberPengadaan: 'Dibeli oleh Unit',
    dibeliOleh: 'Unit',
    statusVerifikasi: 'Menunggu Verifikasi FM',
    namaUnitPengaju: 'SMP Lazuardi GCS',
    namaPembeli: 'Budi Santoso (Lab SMP)',
    nomorPO: 'PO-SMP-2026-015',
    nomorInvoice: 'INV-CU-2026-0988',
    sumberDana: 'Anggaran Unit',
    tahunAnggaran: '2026',
    buktiInvoiceUrl: 'https://example.com/invoice-lenovo-smp.pdf',

    tanggalPembelian: '2026-07-10', // > 7 days ago
    harga: 15400000,
    garansiBulan: 24,
    garansiExpiredDate: '2028-07-10',
    masapakaiTahun: 5,
    location: {
      unit: 'SMP',
      gedung: 'Ibnu Rusyd',
      lantai: 'Lantai 2',
      ruangan: 'Lab Robotik',
      area: 'Meja Instruktur'
    },
    kondisi: 'Sangat Baik',
    status: 'Aktif',
    documents: [
      { id: 'doc-10', title: 'Invoice & Faktur Pajak Laptop Lenovo', type: 'Invoice', url: '#', uploadedAt: '2026-07-10' }
    ],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  },
  {
    id: 'ast-11',
    qrCode: '(Ditolak FM)',
    assetIdAuto: 'REQ-TK-2026-001',
    nomorInventaris: '(Ditolak FM)',
    namaAsset: 'Air Purifier HEPA Filter Kamar Bermain TK',
    kategori: 'Elektronik',
    subKategori: 'Air Cleaner',
    merk: 'Sharp',
    tipe: 'FP-J30Y-B',
    model: 'FP-J30Y',
    serialNumber: 'SHP2026AP9123',
    fotoUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80',
    unit: 'TK',
    departemen: 'TK & Playgroup',
    penanggungJawab: 'Siti Rahmawati, S.Pd',
    picAsset: 'Rina Kusuma',
    userPengguna: 'Kamar Ruang TK',

    // Procurement (REJECTED BY FM)
    supplier: 'Toko Elektronik Rumah Sehat',
    sumberPengadaan: 'Dibeli oleh Unit',
    dibeliOleh: 'Unit',
    statusVerifikasi: 'Ditolak FM',
    alasanPenolakan: 'Bukti pembelian tidak lengkap (tanpa stempel toko) & kapasitas CADR tidak sesuai standar volume ruangan Arrazi TK.',
    namaUnitPengaju: 'TK Lazuardi GCS',
    namaPembeli: 'Rina Kusuma',
    nomorPO: 'PO-TK-2026-001',
    nomorInvoice: 'INV-TK-2026-012',
    sumberDana: 'Anggaran Unit',
    tahunAnggaran: '2026',

    tanggalPembelian: '2026-07-05',
    harga: 2150000,
    garansiBulan: 12,
    garansiExpiredDate: '2027-07-05',
    masapakaiTahun: 3,
    location: {
      unit: 'TK',
      gedung: 'Arrazi',
      lantai: 'Lantai 1',
      ruangan: 'Kelas Playgroup A',
      area: 'Sudut Ruangan'
    },
    kondisi: 'Baik',
    status: 'Aktif',
    documents: [],
    maintenanceHistory: [],
    damageReports: [],
    loanHistory: [],
    transferHistory: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-p1',
    title: 'Pengajuan Aset Unit Menunggu Verifikasi FM',
    message: 'SD Lazuardi menginput aset "Projector Portable Short Throw" yang dibeli langsung oleh Unit. Membutuhkan verifikasi FM & penerbitan QR Code.',
    type: 'procurement',
    createdAt: '2026-07-22 14:00',
    read: false,
    assetId: 'ast-9'
  },
  {
    id: 'notif-p2',
    title: 'ALERT: Aset Menunggu Verifikasi > 7 Hari',
    message: 'Aset "Laptop ThinkPad L14" dari SMP Lazuardi telah menunggu verifikasi FM selama lebih dari 7 hari!',
    type: 'procurement',
    createdAt: '2026-07-21 09:30',
    read: false,
    assetId: 'ast-10'
  },
  {
    id: 'notif-1',
    title: 'Peringatan Garansi Berakhir',
    message: 'Garansi IP Camera Hikvision (LZU-FM-DIR-008) akan berakhir dalam 30 hari.',
    type: 'garansi',
    createdAt: '2026-07-22 09:00',
    read: false,
    assetId: 'ast-8'
  },
  {
    id: 'notif-3',
    title: 'Aset Dipinjam',
    message: 'Sound System Wireless (LZU-GA-HL-004) dipinjam oleh Eko Prasetyo (Litbang) s.d. 24 Juli 2026.',
    type: 'peminjaman',
    createdAt: '2026-07-21 11:15',
    read: true,
    assetId: 'ast-4'
  }
];

export const INITIAL_HISTORY_LOGS: HistoryLog[] = [
  {
    id: 'log-p1',
    timestamp: '2026-07-22 14:00',
    user: 'Fitri Handayani',
    role: 'User',
    action: 'Input Aset Pembelian Unit',
    assetId: 'ast-9',
    assetName: 'Projector Portable Short Throw',
    details: 'Input data aset baru dibeli Unit SD. Status: Menunggu Verifikasi FM.'
  },
  {
    id: 'log-1',
    timestamp: '2026-07-22 10:30',
    user: 'Alpian Rinaldhi',
    role: 'Admin FM',
    action: 'Asset Dipindahkan',
    assetId: 'ast-1',
    assetName: 'Interactive Smart Board 75 Inch 4K',
    details: 'Asset dipindahkan dari Gedung Arrazi ke Gedung Khaldun Kelas 4A.'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-21 11:15',
    user: 'Dedi Pratama',
    role: 'User',
    action: 'Peminjaman Aset',
    assetId: 'ast-4',
    assetName: 'Portable Wireless Sound System 15 Inch',
    details: 'Disetujui peminjaman untuk Eko Prasetyo (Litbang) sampai 24 Juli 2026.'
  }
];

export const getDefaultPermissionsByRole = (role: UserRole) => {
  switch (role) {
    case 'Admin FM':
      return {
        canVerifyProcurement: true,
        canManageAssets: true,
        canPerformMaintenance: true,
        canAuditStockOpname: true,
        canManageMasterData: true,
        canManageUsers: true,
        canSyncGoogleSheets: true,
      };
    case 'Maintenance':
      return {
        canVerifyProcurement: false,
        canManageAssets: true,
        canPerformMaintenance: true,
        canAuditStockOpname: true,
        canManageMasterData: false,
        canManageUsers: false,
        canSyncGoogleSheets: false,
      };
    case 'Kepala Unit':
      return {
        canVerifyProcurement: false,
        canManageAssets: true,
        canPerformMaintenance: false,
        canAuditStockOpname: true,
        canManageMasterData: false,
        canManageUsers: false,
        canSyncGoogleSheets: false,
      };
    case 'Vendor AC (Tukang Service)':
      return {
        canVerifyProcurement: false,
        canManageAssets: false,
        canPerformMaintenance: true,
        canAuditStockOpname: false,
        canManageMasterData: false,
        canManageUsers: false,
        canSyncGoogleSheets: false,
      };
    case 'User':
    default:
      return {
        canVerifyProcurement: false,
        canManageAssets: false,
        canPerformMaintenance: false,
        canAuditStockOpname: false,
        canManageMasterData: false,
        canManageUsers: false,
        canSyncGoogleSheets: false,
      };
  }
};

export const INITIAL_USERS: import('../types').UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Alpian Rinaldhi',
    email: 'Alpianrs@lazuardi.sch.id',
    role: 'Admin FM',
    unit: 'Facility Management',
    status: 'Aktif',
    phone: '0812-9988-7766',
    lastActive: 'Hari Ini, 09:30',
    permissions: getDefaultPermissionsByRole('Admin FM'),
  },
  {
    id: 'usr-2',
    name: 'Budi Santoso',
    email: 'budi.maintenance@lazuardi.sch.id',
    role: 'Maintenance',
    unit: 'Facility Management',
    status: 'Aktif',
    phone: '0813-1122-3344',
    lastActive: 'Kemarin, 16:45',
    permissions: getDefaultPermissionsByRole('Maintenance'),
  },
  {
    id: 'usr-3',
    name: 'Fitri Handayani',
    email: 'fitri.sd@lazuardi.sch.id',
    role: 'Kepala Unit',
    unit: 'SD',
    status: 'Aktif',
    phone: '0815-5566-7788',
    lastActive: '2 hari lalu',
    permissions: getDefaultPermissionsByRole('Kepala Unit'),
  },
  {
    id: 'usr-4',
    name: 'Ahmad Tekno (Vendor CoolService AC)',
    email: 'ahmad@coolservice.com',
    role: 'Vendor AC (Tukang Service)',
    unit: 'Semua',
    status: 'Aktif',
    phone: '0821-4455-6677',
    lastActive: '22 Juli 2026',
    permissions: getDefaultPermissionsByRole('Vendor AC (Tukang Service)'),
  },
  {
    id: 'usr-5',
    name: 'Dedi Pratama',
    email: 'dedi.ga@lazuardi.sch.id',
    role: 'User',
    unit: 'General Affair',
    status: 'Aktif',
    phone: '0817-8899-0011',
    lastActive: '20 Juli 2026',
    permissions: getDefaultPermissionsByRole('User'),
  },
];
