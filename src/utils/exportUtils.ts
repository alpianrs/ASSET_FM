import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Asset, MaintenanceLog } from '../types';

// Format currency
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate linear depreciation (Penyusutan Aset)
export const calculateDepreciation = (asset: Asset) => {
  const purchaseYear = new Date(asset.tanggalPembelian).getFullYear();
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - purchaseYear);
  
  const usefulLife = asset.masapakaiTahun || 5;
  const annualDepreciation = asset.harga / usefulLife;
  const accumulatedDepreciation = Math.min(asset.harga, ageYears * annualDepreciation);
  const bookValue = Math.max(0, asset.harga - accumulatedDepreciation);

  return {
    ageYears,
    usefulLife,
    annualDepreciation,
    accumulatedDepreciation,
    bookValue,
  };
};

export const exportAssetsToExcel = (assets: Asset[], fileName = 'Lazuardi_GCS_Assets.xlsx') => {
  const data = assets.map((a) => {
    const dep = calculateDepreciation(a);
    return {
      'QR Code': a.qrCode,
      'Asset ID': a.assetIdAuto,
      'No. Inventaris': a.nomorInventaris,
      'Nama Asset': a.namaAsset,
      'Kategori': a.kategori,
      'Sub Kategori': a.subKategori,
      'Merk': a.merk,
      'Tipe/Model': `${a.tipe} / ${a.model}`,
      'Serial Number': a.serialNumber,
      'Unit Pemilik': a.unit,
      'Gedung': a.location.gedung,
      'Lantai/Ruangan': `${a.location.lantai} - ${a.location.ruangan}`,
      'Area': a.location.area,
      'Penanggung Jawab': a.penanggungJawab,
      'PIC Asset': a.picAsset,
      'Kondisi': a.kondisi,
      'Status': a.status,
      'Supplier': a.supplier,
      'Tgl Pembelian': a.tanggalPembelian,
      'Harga Perolehan (Rp)': a.harga,
      'Masa Pakai (Thn)': a.masapakaiTahun,
      'Umur Aset (Thn)': dep.ageYears,
      'Nilai Buku Saat Ini (Rp)': dep.bookValue,
      'Garansi Expired': a.garansiExpiredDate,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Aset');
  XLSX.writeFile(workbook, fileName);
};

export const exportAssetsToPDF = (assets: Asset[], title = 'Laporan Aset Lazuardi GCS', fileName = 'Lazuardi_GCS_Report.pdf') => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129); // Emerald Lazuardi
  doc.text('LAZUARDI GLOBAL COMPASSIONATE SCHOOL', 14, 15);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.text(title, 14, 22);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Tim Facility Management`, 14, 28);

  const tableData = assets.map((a) => [
    a.qrCode,
    a.namaAsset,
    a.unit,
    `${a.location.gedung} - ${a.location.ruangan}`,
    a.picAsset,
    a.kondisi,
    a.status,
    formatRupiah(a.harga),
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['QR Code', 'Nama Asset', 'Unit', 'Lokasi', 'PIC', 'Kondisi', 'Status', 'Harga']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
  });

  doc.save(fileName);
};

export const exportMaintenanceToPDF = (logs: MaintenanceLog[], fileName = 'Laporan_Maintenance_Lazuardi.pdf') => {
  const doc = new jsPDF('landscape');

  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129);
  doc.text('LAZUARDI GLOBAL COMPASSIONATE SCHOOL', 14, 15);
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.text('LAPORAN MAINTENANCE & WORK ORDER FACILITY MANAGEMENT', 14, 22);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  const tableData = logs.map((l) => [
    l.woNumber,
    l.assetId,
    l.jenisMaintenance,
    l.tanggal,
    l.teknisi,
    l.vendor || '-',
    formatRupiah(l.biaya),
    l.status,
    l.catatan,
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['No. WO', 'Asset ID', 'Jenis', 'Tanggal', 'Teknisi', 'Vendor', 'Biaya', 'Status', 'Catatan']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: { fontSize: 8 },
  });

  doc.save(fileName);
};
