import React from 'react';
import {
  LayoutDashboard,
  Box,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  History,
  Share2,
} from 'lucide-react';
import { useAsset } from '../context/AssetContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, currentUser } = useAsset();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Master Assets & QR', icon: Box },
    { id: 'procurement', label: 'Monitoring Pengadaan', icon: ShieldCheck },
    { id: 'master', label: 'Locations & Gedung', icon: Building2 },
    { id: 'stock_opname', label: 'Stock Opname', icon: ClipboardCheck },
    { id: 'integration', label: 'Integrasi Cloud & Sheet', icon: Share2 },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'history', label: 'Activity Logs', icon: History },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800 shrink-0 h-full select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center font-black text-amber-300 text-xl shadow-lg shadow-blue-950/80 border border-blue-500/30">
            L
          </div>
          <div className="leading-tight">
            <h1 className="text-white font-extrabold text-base tracking-tight flex items-center gap-1.5">
              <span>Lazuardi GCS</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </h1>
            <p className="text-[11px] text-amber-400/90 font-bold tracking-wide">Aset & Monitoring FM</p>
          </div>
        </div>

        {/* Navigation Section */}
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
          Menu Utama
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-500/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile Card */}
      <div className="mt-auto p-6 pt-0">
        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700/80">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser ? currentUser.name : 'Pengguna App'}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};


