import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Building, Plus } from 'lucide-react';
import { mockDistributors } from '../data/mockData';

export const Distributors: React.FC = () => {
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
            <Truck className="w-7 h-7 text-brand-400" />
            <span>Primary Distributors Network</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Warehouse stock holding, credit limits, territory coverage, and fulfillment partners.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Distributor Partner</span>
        </button>
      </div>

      {/* Distributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDistributors.map((dist) => (
          <div
            key={dist.id}
            className="glass-card glass-card-hover p-6 rounded-2xl space-y-5 border border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-400">{dist.code}</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                {dist.status}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{dist.name}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{dist.region}</span>
              </p>
            </div>

            {/* Warehouse capacity bar */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Warehouse Capacity</span>
                <span className="font-bold text-white">{dist.currentWarehouseCapacityPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${dist.currentWarehouseCapacityPct}%` }}
                />
              </div>
            </div>

            {/* Stock Value & Credit */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Stock Value</span>
                <span className="font-extrabold text-white text-sm">
                  ₹{(dist.stockValue / 100000).toFixed(2)}L
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Balance Due</span>
                <span className="font-extrabold text-rose-400 text-sm">
                  ₹{(dist.outstandingBalance / 100000).toFixed(2)}L
                </span>
              </div>
            </div>

            {/* Territory Coverage Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Coverage Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dist.territoryCoverage.map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-[10px] font-semibold border border-slate-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
