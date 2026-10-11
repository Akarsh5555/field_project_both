import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Search, ShieldCheck, Eye, X, Plus } from 'lucide-react';
import { mockVisits } from '../data/mockData';
import type { Visit } from '../types';

export const Visits: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const filteredVisits = mockVisits.filter(
    (v) =>
      v.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.repName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-brand-400" />
            <span>Field Visits & Audit Logs</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Geofence verified check-ins, photo proofs, audit feedback, and order booking logs.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Schedule Special Visit</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by visit code, outlet, or rep..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Visits Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Visit Code</th>
                <th className="py-3.5 px-4">Retailer Outlet</th>
                <th className="py-3.5 px-4">Sales Rep</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Geofence Verified</th>
                <th className="py-3.5 px-4">Order Booked</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4 text-brand-400 font-mono font-bold">{v.visitCode}</td>
                  <td className="py-4 px-4 font-bold text-white">{v.retailerName}</td>
                  <td className="py-4 px-4 text-slate-300 font-semibold">{v.repName}</td>
                  <td className="py-4 px-4 text-slate-400">{v.visitType}</td>
                  <td className="py-4 px-4 text-slate-300">{v.actualCheckIn || v.plannedTime}</td>
                  <td className="py-4 px-4">
                    {v.geofenceVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <ShieldCheck className="w-4 h-4" /> Verified (50m)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-400">
                    {v.orderBookedAmount > 0 ? `₹${v.orderBookedAmount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : v.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedVisit(v)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-brand-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 space-y-5 relative border border-slate-700 shadow-2xl">
            <button
              onClick={() => setSelectedVisit(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono text-brand-400 font-bold">{selectedVisit.visitCode}</span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedVisit.retailerName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedVisit.retailerAddress}</p>
            </div>

            {selectedVisit.photoProofUrl && (
              <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-700">
                <img src={selectedVisit.photoProofUrl} alt="Proof" className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Geofence Verified Check-in
                </span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 block font-semibold">Rep Notes & Audit Feedback</span>
              <p className="text-slate-200">{selectedVisit.notes || 'No rep notes added.'}</p>
              {selectedVisit.feedback && (
                <p className="text-brand-300 italic pt-1 border-t border-slate-800">
                  "{selectedVisit.feedback}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
