import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // 1. Fetch active products with price and stock:
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data: supaProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && supaProducts && supaProducts.length > 0) {
        // Map database record to Product interface
        const mapped: Product[] = supaProducts.map((p) => {
          const stock = Number(p.stock_cases ?? 100);
          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category as any,
            unitPrice: Number(p.unit_price),
            mrp: Number(p.mrp),
            casePackSize: Number(p.case_size ?? 24),
            stockInHandCases: stock,
            reorderLevelCases: 30,
            taxRatePct: 18,
            imageUrl:
              p.image_url ||
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
            status: stock > 30 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock',
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.warn('Using mock catalog fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

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
            <Package className="w-7 h-7 text-brand-400" />
            <span>Product Master Catalog</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Live catalog synchronized with warehouse inventory and secondary order booking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU code, product name..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Beverages', 'Snacks', 'Personal Care', 'Dairy', 'FMCG'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="glass-card glass-card-hover p-5 rounded-2xl space-y-4 border border-slate-800 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80';
                  }}
                />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md ${
                    p.status === 'In Stock'
                      ? 'bg-emerald-500 text-white'
                      : p.status === 'Low Stock'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {p.status}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-brand-300 text-[10px] font-mono font-bold border border-slate-800">
                  {p.sku}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.category} • Pack size: {p.casePackSize} units/case
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Unit Price / MRP</span>
                  <span className="font-extrabold text-white text-sm">
                    ₹{p.unitPrice}{' '}
                    <span className="text-slate-400 line-through text-xs font-normal">
                      ₹{p.mrp}
                    </span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Stock in Hand</span>
                  <span className="font-bold text-brand-400 text-sm font-mono">
                    {p.stockInHandCases} Cases
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
