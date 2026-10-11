import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, Plus } from 'lucide-react';
import { mockInventory } from '../data/mockData';

export const Inventory: React.FC = () => {
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
            <Boxes className="w-7 h-7 text-brand-400" />
            <span>Depot & Distributor Inventory</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time batch tracking, stock reserved for pending orders, and expiration risk monitoring.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Record Stock Inward</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Product Name & SKU</th>
                <th className="py-3.5 px-4">Distributor Warehouse</th>
                <th className="py-3.5 px-4">Batch No</th>
                <th className="py-3.5 px-4">Cases Available</th>
                <th className="py-3.5 px-4">Cases Reserved</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {mockInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-bold text-white text-sm block">{item.productName}</span>
                      <span className="text-[10px] text-brand-400 font-mono">{item.sku}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-semibold">{item.distributorName}</td>
                  <td className="py-4 px-4 text-slate-400 font-mono">{item.batchNumber}</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold text-sm">
                    {item.casesAvailable} Cases
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-semibold">
                    {item.casesReserved} Cases
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-mono">{item.expiryDate}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Optimal'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
