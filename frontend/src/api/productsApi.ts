import type { Product, InventoryItem } from '../types';
import { mockProducts } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { simulateNetworkDelay } from './client';

export const productsApi = {
  /**
   * GET /api/v1/products
   * List all products in catalog
   */
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    try {
      let query = supabase.from('products').select('*').eq('is_active', true).order('name');
      if (params?.category && params.category !== 'All') {
        query = query.eq('category', params.category);
      }
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category as any,
          unitPrice: Number(p.unit_price),
          mrp: Number(p.mrp),
          casePackSize: Number(p.case_size ?? 24),
          stockInHandCases: Number(p.stock_cases ?? 100),
          reorderLevelCases: 30,
          taxRatePct: 18,
          imageUrl: p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
          status: Number(p.stock_cases ?? 100) > 30 ? 'In Stock' : 'Low Stock',
        }));
      }
    } catch (e) {
      console.warn('Supabase products fetch fallback:', e);
    }

    await simulateNetworkDelay(200);
    let items = [...mockProducts];

    if (params?.category && params.category !== 'All') {
      items = items.filter((p) => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return items;
  },

  /**
   * GET /api/v1/inventory
   * Fetch current warehouse inventory stock items
   */
  async getInventory(): Promise<InventoryItem[]> {
    await simulateNetworkDelay(200);
    return mockProducts.map((p, idx) => ({
      id: `inv-${idx + 1}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      distributorName: 'Apex Logistics & FMCG',
      distributorId: 'dist-01',
      casesAvailable: p.stockInHandCases,
      casesReserved: Math.floor(p.stockInHandCases * 0.15),
      batchNumber: `BATCH-2026-${100 + idx}`,
      expiryDate: '2027-06-30',
      status: p.stockInHandCases < p.reorderLevelCases ? 'Low Stock' : 'Optimal',
    }));
  },
};
