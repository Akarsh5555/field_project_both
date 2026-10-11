import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  Plus,
  Phone,
  MapPin,
  UserCheck,
  Calendar,
  Eye,
  X,
  Building,
  CalendarCheck,
  ShoppingCart,
  ShieldCheck,
  Star
} from 'lucide-react';
import { mockRetailers, mockVisits, mockOrders } from '../data/mockData';
import { retailersApi } from '../api/retailersApi';
import type { Retailer } from '../types';

export const Retailers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [retailersList, setRetailersList] = useState<Retailer[]>(mockRetailers);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'visits' | 'orders'>('info');

  // Fetch real retailers from backend database
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const data = await retailersApi.getRetailers();
        if (data && data.length > 0) {
          const existingIds = new Set(data.map((d) => d.id));
          setRetailersList([...data, ...mockRetailers.filter((m) => !existingIds.has(m.id))]);
        }
      } catch (err) {
        console.warn('Retailers fetch notice:', err);
      }
    };
    fetchRetailers();
  }, []);

  // Handle URL parameter sync for retailer details page
  useEffect(() => {
    if (id) {
      const foundRetailer = retailersList.find((r) => r.id === id || r.code.toLowerCase() === id.toLowerCase());
      if (foundRetailer) {
        setSelectedRetailer(foundRetailer);
      }
    }
  }, [id, retailersList]);

  const filteredRetailers = retailersList.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter visits & orders associated with selectedRetailer
  const retailerVisits = selectedRetailer
    ? mockVisits.filter((v) => v.retailerId === selectedRetailer.id || v.retailerName === selectedRetailer.name)
    : [];

  const retailerOrders = selectedRetailer
    ? mockOrders.filter((o) => o.retailerId === selectedRetailer.id || o.retailerName === selectedRetailer.name)
    : [];

  const handleOpenDetails = (ret: Retailer) => {
    setSelectedRetailer(ret);
    setActiveTab('info');
    navigate(`/retailers/${ret.id}`);
  };

  const handleCloseDetails = () => {
    setSelectedRetailer(null);
    navigate('/retailers');
  };

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
            <Store className="w-7 h-7 text-brand-400" />
            <span>Retail Outlets Management</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Search, filter, and audit Kirana stores, supermarkets, pharmacies, credit balances, and order histories.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add New Retail Outlet</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by outlet name, owner, phone, address or territory..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Outlet Type & Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Kirana', 'Supermarket', 'Pharmacy', 'Wholesale'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  typeFilter === type
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            {['All', 'Active', 'Blocked'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Retailers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Retailer Name</th>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Phone Contact</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Territory</th>
                <th className="py-3.5 px-4">Assigned Sales Rep</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRetailers.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                  {/* Retailer Name */}
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-bold text-white text-sm block">{r.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-brand-400 font-mono font-semibold">{r.code}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                          {r.type}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-4 px-4 text-slate-200 font-semibold">{r.ownerName}</td>

                  {/* Phone */}
                  <td className="py-4 px-4">
                    <span className="text-slate-300 font-mono text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {r.phone}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-4 px-4 max-w-[200px] truncate text-slate-300" title={r.address}>
                    {r.address}
                  </td>

                  {/* Territory */}
                  <td className="py-4 px-4">
                    <span className="text-slate-200 font-semibold block">{r.territory}</span>
                    <span className="text-[10px] text-slate-400">{r.city}</span>
                  </td>

                  {/* Assigned Sales Representative */}
                  <td className="py-4 px-4">
                    <span className="text-brand-300 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                      {r.assignedRepName}
                    </span>
                  </td>

                  {/* Last Visit Date */}
                  <td className="py-4 px-4 text-slate-300 font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {r.lastVisitDate}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* Actions: View Details */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetails(r)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retailer Details Modal / Drawer */}
      {selectedRetailer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 space-y-6 relative border border-slate-700 shadow-2xl my-8">
            {/* Close Button */}
            <button
              onClick={handleCloseDetails}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedRetailer.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-xs font-mono font-bold">
                    {selectedRetailer.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedRetailer.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {selectedRetailer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span>Owner: <strong className="text-white">{selectedRetailer.ownerName}</strong></span>
                  <span>•</span>
                  <span>Type: <strong className="text-brand-300">{selectedRetailer.type}</strong></span>
                </p>
              </div>

              <a
                href={`tel:${selectedRetailer.phone}`}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Outlet</span>
              </a>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'info'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Contact & Account Info</span>
              </button>

              <button
                onClick={() => setActiveTab('visits')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'visits'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Visit History ({retailerVisits.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Order History ({retailerOrders.length})</span>
              </button>
            </div>

            {/* Tab 1: Contact Information */}
            {activeTab === 'info' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Full Address & Location</span>
                    <p className="text-white font-medium flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      <span>{selectedRetailer.address}, {selectedRetailer.city}</span>
                    </p>
                    <p className="text-slate-400 pt-1 border-t border-slate-800">
                      Territory: <strong className="text-slate-200">{selectedRetailer.territory}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Assigned Sales Representative</span>
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>{selectedRetailer.assignedRepName}</span>
                    </p>
                    <p className="text-slate-400 pt-1 border-t border-slate-800">
                      Last Visit: <strong className="text-slate-200">{selectedRetailer.lastVisitDate}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Outstanding Balance</span>
                    <span className="text-base font-black text-rose-400 mt-1 block">
                      ₹{selectedRetailer.outstandingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Credit Limit</span>
                    <span className="text-base font-black text-white mt-1 block">
                      ₹{selectedRetailer.creditLimit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Outlet Score</span>
                    <span className="text-base font-black text-amber-400 mt-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{selectedRetailer.rating} / 5.0</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Visit History */}
            {activeTab === 'visits' && (
              <div className="space-y-3">
                {retailerVisits.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-3 px-3">Visit Code</th>
                          <th className="py-3 px-3">Sales Rep</th>
                          <th className="py-3 px-3">Planned Time</th>
                          <th className="py-3 px-3">Check-In</th>
                          <th className="py-3 px-3">GPS Verification</th>
                          <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {retailerVisits.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-900/60">
                            <td className="py-3 px-3 font-mono font-bold text-brand-400">{v.visitCode}</td>
                            <td className="py-3 px-3 font-bold text-white">{v.repName}</td>
                            <td className="py-3 px-3 text-slate-300">{v.plannedTime}</td>
                            <td className="py-3 px-3 text-slate-400">{v.actualCheckIn || '—'}</td>
                            <td className="py-3 px-3">
                              {v.geofenceVerified ? (
                                <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Pending</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  v.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">
                    No visit logs recorded for {selectedRetailer.name}.
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-3">
                {retailerOrders.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-3 px-3">Order #</th>
                          <th className="py-3 px-3">Sales Rep</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Total Amount</th>
                          <th className="py-3 px-3">Payment</th>
                          <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {retailerOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-900/60">
                            <td className="py-3 px-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                            <td className="py-3 px-3 text-slate-300 font-semibold">{ord.repName}</td>
                            <td className="py-3 px-3 text-slate-400">{ord.date}</td>
                            <td className="py-3 px-3 font-bold text-emerald-400">
                              ₹{ord.totalAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                                {ord.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.orderStatus === 'Approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {ord.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">
                    No order history recorded for {selectedRetailer.name}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
