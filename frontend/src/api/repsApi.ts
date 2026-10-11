import type { SalesRep } from '../types';
import { mockSalesReps } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { simulateNetworkDelay } from './client';

export const repsApi = {
  /**
   * GET /api/v1/reps
   * Query Supabase `sales_reps` table or fallback to mock data
   */
  async getSalesReps(params?: { search?: string; status?: string; region?: string }): Promise<SalesRep[]> {
    try {
      let query = supabase.from('sales_reps').select('*');

      if (params?.region && params.region !== 'All Regions') {
        query = query.eq('region', params.region);
      }
      if (params?.status && params.status !== 'All') {
        query = query.eq('status', params.status);
      }
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%,territory.ilike.%${params.search}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped: SalesRep[] = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: r.phone || '',
          email: r.email || '',
          territory: r.territory || 'North Delhi',
          region: r.region || 'North Zone (Delhi-NCR)',
          status: (r.status as any) || 'Active',
          batteryLevel: Number(r.battery_level ?? 85),
          lastCheckIn: r.last_check_in || 'Recently',
          targetAmount: Number(r.target_amount ?? 500000),
          targetAchievedPct: Number(r.target_achieved_pct ?? 0),
          visitsTodayCount: Number(r.visits_today_count ?? 0),
          totalDistanceKm: Number(r.total_distance_km ?? 0),
          salesClosedAmount: Number(r.sales_closed_amount ?? 0),
          joinDate: r.join_date || '2024-01-01',
        }));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase reps query fallback:', err);
    }

    // Fallback to mock data
    await simulateNetworkDelay(150);
    let reps = [...mockSalesReps];

    if (params?.region && params.region !== 'All Regions') {
      reps = reps.filter((r) => r.region === params.region);
    }
    if (params?.status && params.status !== 'All') {
      reps = reps.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      reps = reps.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.territory.toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }
    return reps;
  },

  /**
   * GET /api/v1/reps/:id
   */
  async getSalesRepById(id: string): Promise<SalesRep | null> {
    try {
      const { data, error } = await supabase.from('sales_reps').select('*').eq('id', id).single();
      if (!error && data) return data as SalesRep;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(150);
    return mockSalesReps.find((r) => r.id === id) || null;
  },

  /**
   * POST /api/v1/reps
   */
  async createSalesRep(data: Omit<SalesRep, 'id'>): Promise<SalesRep> {
    try {
      const { data: inserted, error } = await supabase.from('sales_reps').insert([data]).select().single();
      if (!error && inserted) return inserted as SalesRep;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(250);
    const newRep: SalesRep = {
      ...data,
      id: `rep-${String(mockSalesReps.length + 1).padStart(2, '0')}`,
    };
    mockSalesReps.unshift(newRep);
    return newRep;
  },

  /**
   * PUT /api/v1/reps/:id
   */
  async updateSalesRep(id: string, updates: Partial<SalesRep>): Promise<SalesRep> {
    try {
      const { data: updated, error } = await supabase
        .from('sales_reps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && updated) return updated as SalesRep;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(200);
    const index = mockSalesReps.findIndex((r) => r.id === id);
    if (index === -1) throw { message: 'Sales Representative not found', status: 404 };
    mockSalesReps[index] = { ...mockSalesReps[index], ...updates };
    return mockSalesReps[index];
  },
};
