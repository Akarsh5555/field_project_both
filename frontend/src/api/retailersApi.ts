import type { Retailer } from '../types';
import { mockRetailers } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { simulateNetworkDelay } from './client';

export const retailersApi = {
  /**
   * GET /api/v1/retailers
   */
  async getRetailers(params?: { search?: string; type?: string; status?: string }): Promise<Retailer[]> {
    try {
      let query = supabase.from('retailers').select('*');

      if (params?.type && params.type !== 'All') {
        query = query.eq('type', params.type);
      }
      if (params?.status && params.status !== 'All') {
        query = query.eq('status', params.status);
      }
      if (params?.search) {
        query = query.or(
          `name.ilike.%${params.search}%,owner_name.ilike.%${params.search}%,code.ilike.%${params.search}%,territory.ilike.%${params.search}%`
        );
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped: Retailer[] = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          ownerName: r.owner_name || r.ownerName || 'Outlet Owner',
          code: r.code,
          type: (r.type as any) || (r.category as any) || 'Kirana',
          phone: r.phone || '+91 98110 00000',
          address: r.address || 'Delhi-NCR',
          territory: r.territory || 'North Delhi',
          city: r.city || 'Delhi',
          outstandingBalance: Number(r.outstanding_balance ?? 0),
          creditLimit: Number(r.credit_limit ?? 50000),
          lastOrderDate: r.last_order_date || '2026-10-08',
          lastVisitDate: r.last_visit_date || '2026-10-09',
          assignedRepName: r.assigned_rep_name || 'Vikram Sharma',
          assignedRepId: r.assigned_rep_id || 'rep-01',
          status: r.is_active === false ? 'Blocked' : (r.status as any) || 'Active',
          rating: Number(r.rating ?? 4.8),
        }));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase retailers query fallback:', err);
    }

    await simulateNetworkDelay(150);
    let items = [...mockRetailers];

    if (params?.type && params.type !== 'All') {
      items = items.filter((r) => r.type === params.type);
    }
    if (params?.status && params.status !== 'All') {
      items = items.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.territory.toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }
    return items;
  },

  /**
   * GET /api/v1/retailers/:id
   */
  async getRetailerById(id: string): Promise<Retailer | null> {
    try {
      const { data, error } = await supabase.from('retailers').select('*').eq('id', id).single();
      if (!error && data) return data as Retailer;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(150);
    return mockRetailers.find((r) => r.id === id) || null;
  },

  /**
   * POST /api/v1/retailers
   */
  async createRetailer(data: Omit<Retailer, 'id'>): Promise<Retailer> {
    try {
      const { data: inserted, error } = await supabase.from('retailers').insert([data]).select().single();
      if (!error && inserted) return inserted as Retailer;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(250);
    const newOutlet: Retailer = {
      ...data,
      id: `ret-${String(mockRetailers.length + 1).padStart(3, '0')}`,
    };
    mockRetailers.unshift(newOutlet);
    return newOutlet;
  },
};
