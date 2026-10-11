import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Map, LayoutGrid } from 'lucide-react';
import { mockBeatPlans } from '../data/mockData';
import { BeatPlanningMap } from '@/components/maps/BeatPlanningMap';

export const BeatPlans: React.FC = () => {
  const [selectedBeatId, setSelectedBeatId] = useState<string>('beat-01');
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MapPin className="w-7 h-7 text-brand-400" />
            <span>Beat Plans & Route Optimization</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Weekly beat schedules, stop sequences, mileage optimization, and completion status.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all">
            <Plus className="w-4 h-4" />
            <span>Create New Beat Plan</span>
          </button>
        </div>
      </div>

      {/* Interactive GPS Beat Planning Map View */}
      {viewMode === 'map' && (
        <BeatPlanningMap
          selectedBeatId={selectedBeatId}
          onSelectBeat={(id) => setSelectedBeatId(id)}
        />
      )}

      {/* Beat Plans Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Beat Schedules ({mockBeatPlans.length})
          </h2>
          <span className="text-xs text-slate-400">Territory sequences & progress</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBeatPlans.map((beat) => {
            const isSelected = selectedBeatId === beat.id;

            return (
              <div
                key={beat.id}
                onClick={() => {
                  setSelectedBeatId(beat.id);
                  if (viewMode !== 'map') setViewMode('map');
                }}
                className={`glass-card glass-card-hover p-6 rounded-2xl space-y-5 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 shadow-lg shadow-brand-500/20 bg-slate-900/90'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-400">{beat.code}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      beat.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {beat.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{beat.beatName}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {beat.territory} • {beat.scheduledDay} Schedule
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Beat Completion</span>
                    <span className="font-bold text-white">{beat.completionPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all"
                      style={{ width: `${beat.completionPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Outlets</span>
                    <span className="font-bold text-white">{beat.retailersCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Est. Dist</span>
                    <span className="font-bold text-white">{beat.estimatedDistanceKm} km</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Duration</span>
                    <span className="font-bold text-white">
                      {beat.estimatedVisitsDurationHours} hrs
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Assigned Rep: <strong className="text-slate-200">{beat.repName}</strong>
                  </span>
                  <span className="text-brand-400 text-[11px] font-semibold">View Map →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BeatPlans;
