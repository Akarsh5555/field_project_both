import React from 'react';
import { motion } from 'framer-motion';
import { Target as TargetIcon, Plus } from 'lucide-react';
import { mockTargets } from '../data/mockData';

export const Targets: React.FC = () => {
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
            <TargetIcon className="w-7 h-7 text-brand-400" />
            <span>Sales Quotas & Targets</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Monthly revenue targets, visit quota tracking, and outlet acquisition goals.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Allocate Monthly Targets</span>
        </button>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTargets.map((tgt) => {
          const salesPct = Math.round((tgt.salesAchievedAmount / tgt.salesTargetAmount) * 100);
          return (
            <div
              key={tgt.id}
              className="glass-card glass-card-hover p-6 rounded-2xl space-y-5 border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{tgt.monthYear}</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    tgt.status === 'Achieved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : tgt.status === 'On Track'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {tgt.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{tgt.repName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sales Quota Fulfillment</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Revenue Achieved</span>
                  <span className="font-extrabold text-emerald-400">{salesPct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(salesPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>₹{(tgt.salesAchievedAmount / 100000).toFixed(2)}L</span>
                  <span>Target: ₹{(tgt.salesTargetAmount / 100000).toFixed(2)}L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Visits Completed</span>
                  <span className="font-bold text-white">
                    {tgt.visitsAchievedCount} / {tgt.visitsTargetCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">New Outlets</span>
                  <span className="font-bold text-white">
                    {tgt.newOutletsAchievedCount} / {tgt.newOutletsTargetCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
