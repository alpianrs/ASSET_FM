import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { UserRole } from '../types';
import {
  QrCode,
  Bell,
  Search,
  Shield,
  User,
  Wrench,
  CheckCircle2,
  Menu,
  X,
  Building2,
  ClipboardCheck,
  Wind,
} from 'lucide-react';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenACServiceModal: () => void;
  onOpenStockOpname: () => void;
  onSearchSelect: (assetId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScanner,
  onOpenACServiceModal,
  onOpenStockOpname,
  onSearchSelect,
  activeTab,
  setActiveTab,
}) => {
  const { notifications, currentRole, setCurrentRole, markNotificationRead, clearNotifications, assets } = useAsset();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof assets>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const filtered = assets.filter(
        (a) =>
          a.namaAsset.toLowerCase().includes(q.toLowerCase()) ||
          a.qrCode.toLowerCase().includes(q.toLowerCase()) ||
          a.nomorInventaris.toLowerCase().includes(q.toLowerCase()) ||
          a.unit.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelectAsset = (assetId: string) => {
    onSearchSelect(assetId);
    setSearchQuery('');
    setShowResults(false);
  };

  const roles: { role: UserRole; icon: React.ReactNode; label: string }[] = [
    { role: 'Admin FM', icon: <Shield className="w-4 h-4 text-blue-600" />, label: 'Admin FM (Super)' },
    { role: 'Maintenance', icon: <Wrench className="w-4 h-4 text-amber-500" />, label: 'Tim Maintenance' },
    { role: 'Vendor AC (Tukang Service)', icon: <Wind className="w-4 h-4 text-cyan-600" />, label: 'Vendor AC (Tukang Service)' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-20">
      
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 lg:hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base">
            L
          </div>
          <span className="font-extrabold text-slate-900 text-sm">Lazuardi GCS</span>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Assets by QR, ID, or Name..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
              {searchResults.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset.id)}
                  className="w-full p-3 text-left hover:bg-blue-50/60 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    QR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{asset.namaAsset}</p>
                    <p className="text-xs text-slate-500">
                      {asset.qrCode} • {asset.unit} ({asset.location.gedung})
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                    {asset.kondisi}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Stock Opname Quick Link */}
        <button
          onClick={onOpenStockOpname}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
        >
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          <span>Stock Opname</span>
        </button>

        {/* Dedicated AC Service Scan Button for Vendor Luar */}
        <button
          onClick={onOpenACServiceModal}
          className="flex items-center gap-1.5 bg-cyan-700 text-white px-3 py-2 rounded-lg font-extrabold text-xs hover:bg-cyan-800 transition shadow-md shadow-cyan-200 active:scale-95"
          title="Scan & Service AC Khusus Vendor Luar / Tukang AC"
        >
          <Wind className="w-4 h-4 text-cyan-200" />
          <span className="hidden sm:inline">Service AC (Vendor Luar)</span>
          <span className="sm:hidden">Service AC</span>
        </button>

        {/* Scan QR Primary Button */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-blue-700 transition shadow-md shadow-blue-200 active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan QR Asset</span>
        </button>

        <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <button
                  onClick={clearNotifications}
                  className="text-[11px] font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.assetId) onSearchSelect(n.assetId);
                        setShowNotifs(false);
                      }}
                      className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative group">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              AR
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">Alpian R.</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">{currentRole}</p>
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl hidden group-hover:block z-50 p-1 divide-y divide-slate-100">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Access Role
            </div>
            <div className="py-1">
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => setCurrentRole(r.role)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentRole === r.role ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {r.icon}
                    <span>{r.label}</span>
                  </div>
                  {currentRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 border-b border-slate-200 bg-white p-4 space-y-2 z-50 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('assets');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'assets' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Master Assets & QR
          </button>
          <button
            onClick={() => {
              setActiveTab('procurement');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'procurement' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Monitoring Pengadaan
          </button>
          <button
            onClick={() => {
              setActiveTab('master');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'master' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Locations & Gedung
          </button>
          <button
            onClick={() => {
              setActiveTab('reports');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Reports & Export
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => {
              setActiveTab('integrations');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            System Integration
          </button>
        </div>
      )}
    </header>
  );
};
