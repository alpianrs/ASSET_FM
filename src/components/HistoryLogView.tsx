import React, { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { History, Search, User, Shield, Clock } from 'lucide-react';

export const HistoryLogView: React.FC = () => {
  const { historyLogs } = useAsset();
  const [searchLog, setSearchLog] = useState('');

  const filteredLogs = historyLogs.filter(
    (log) => {
      const s = searchLog.toLowerCase();
      return (
        (log.action || '').toLowerCase().includes(s) ||
        (log.details || '').toLowerCase().includes(s) ||
        (log.user || '').toLowerCase().includes(s) ||
        (log.assetName && log.assetName.toLowerCase().includes(s))
      );
    }
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>History Log Audit Aktivitas Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catatan otomatis seluruh aktivitas perpindahan aset, maintenance, audit, dan update status.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchLog}
            onChange={(e) => setSearchLog(e.target.value)}
            placeholder="Cari aktivitas, user, aset..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-700">Daftar Audit Trail ({filteredLogs.length} Log)</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{log.action}</p>
                    {log.assetName && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                        {log.assetName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Petugas: <strong className="text-slate-700">{log.user}</strong></span>
                  <span>•</span>
                  <span>Role: <strong className="text-emerald-700">{log.role}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
