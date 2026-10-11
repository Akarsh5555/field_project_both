import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, FileText, Plus, CheckCircle2 } from 'lucide-react';
import { mockReports } from '../data/mockData';

export const Reports: React.FC = () => {
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
            <FileSpreadsheet className="w-7 h-7 text-brand-400" />
            <span>Reports & Compliance Downloads</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated PDF, CSV, and Excel exports for sales, beat audits, and warehouse audits.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Generate Scheduled Export</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReports.map((repDoc) => (
          <div
            key={repDoc.id}
            className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 border border-slate-800 flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 shrink-0 border border-brand-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-300 tracking-wider">
                  {repDoc.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{repDoc.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generated on {repDoc.generatedDate} • Format: {repDoc.format} ({repDoc.fileSize})
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for Download
              </span>

              <button
                onClick={() => alert(`Downloading ${repDoc.title} (${repDoc.format})...`)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download ({repDoc.format})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
