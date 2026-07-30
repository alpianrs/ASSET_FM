import React, { useState } from 'react';
import { AssetProvider } from './context/AssetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetDetailModal } from './components/AssetDetailModal';
import { QRScannerModal } from './components/QRScannerModal';
import { QRPrintModal } from './components/QRPrintModal';
import { MasterDataModal } from './components/MasterDataModal';
import { ProcurementManager } from './components/ProcurementManager';
import { StockOpname } from './components/StockOpname';
import { ReportsManager } from './components/ReportsManager';
import { HistoryLogView } from './components/HistoryLogView';
import { IntegrationPanel } from './components/IntegrationPanel';
import { AssetFormModal } from './components/AssetFormModal';
import { ACServiceScanModal } from './components/ACServiceScanModal';
import { LoginModal } from './components/LoginModal';
import { Asset, UnitName } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [acServiceScanOpen, setAcServiceScanOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [printQRAsset, setPrintQRAsset] = useState<Asset | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [unitFilterFromDashboard, setUnitFilterFromDashboard] = useState<UnitName | null>(null);

  const handleSelectUnitFromDashboard = (unitName: UnitName) => {
    setUnitFilterFromDashboard(unitName);
    setActiveTab('assets');
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleScanSuccess = (assetId: string) => {
    setScannerOpen(false);
    setSelectedAssetId(assetId);
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F1F5F9]">
        
        {/* Top Header Navbar */}
        <Navbar
          onOpenScanner={handleOpenScanner}
          onOpenACServiceModal={() => setAcServiceScanOpen(true)}
          onOpenStockOpname={() => setActiveTab('stock_opname')}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onSearchSelect={(id) => setSelectedAssetId(id)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectUnitFilter={handleSelectUnitFromDashboard}
              onSelectAsset={(id) => setSelectedAssetId(id)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetList
              initialUnitFilter={unitFilterFromDashboard}
              onSelectAsset={(id) => setSelectedAssetId(id)}
              onOpenPrintQR={(asset) => setPrintQRAsset(asset)}
              onOpenAddModal={() => {
                setAssetToEdit(null);
                setAddModalOpen(true);
              }}
              onEditAsset={(asset) => {
                setAssetToEdit(asset);
                setAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'procurement' && <ProcurementManager />}

          {activeTab === 'master' && <MasterDataModal />}

          {activeTab === 'stock_opname' && <StockOpname />}

          {activeTab === 'reports' && <ReportsManager />}

          {activeTab === 'history' && <HistoryLogView />}

          {activeTab === 'integrations' && <IntegrationPanel />}
        </main>

      </div>

      {/* Modals & Overlays */}
      {selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onOpenPrintQR={(asset) => setPrintQRAsset(asset)}
        />
      )}

      {scannerOpen && (
        <QRScannerModal
          onClose={() => setScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {acServiceScanOpen && (
        <ACServiceScanModal
          onClose={() => setAcServiceScanOpen(false)}
          onSelectACSuccess={(assetId) => {
            setAcServiceScanOpen(false);
            setSelectedAssetId(assetId);
          }}
        />
      )}

      {printQRAsset && (
        <QRPrintModal
          asset={printQRAsset}
          onClose={() => setPrintQRAsset(null)}
        />
      )}

      {addModalOpen && (
        <AssetFormModal
          assetToEdit={assetToEdit}
          onClose={() => {
            setAddModalOpen(false);
            setAssetToEdit(null);
          }}
        />
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AssetProvider>
      <MainApp />
    </AssetProvider>
  );
}
