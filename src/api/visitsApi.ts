import type { Visit, BeatPlan } from '../types';
import { mockVisits } from '../data/mockData';
import { simulateNetworkDelay } from './client';

export const visitsApi = {
  /**
   * GET /api/v1/visits
   * List all field visits logged
   */
  async getVisits(params?: { repId?: string; retailerId?: string; status?: string }): Promise<Visit[]> {
    await simulateNetworkDelay(200);
    let items = [...mockVisits];

    if (params?.repId) {
      items = items.filter((v) => v.repId === params.repId);
    }
    if (params?.retailerId) {
      items = items.filter((v) => v.retailerId === params.retailerId);
    }
    if (params?.status && params.status !== 'All') {
      items = items.filter((v) => v.status === params.status);
    }
    return items;
  },

  /**
   * POST /api/v1/visits/check-in
   * Log a new GPS geofenced check-in visit
   */
  async createVisitCheckIn(data: Omit<Visit, 'id' | 'visitCode'>): Promise<Visit> {
    await simulateNetworkDelay(300);
    const newVisit: Visit = {
      ...data,
      id: `vst-${String(mockVisits.length + 1).padStart(3, '0')}`,
      visitCode: `VST-2026-${100 + mockVisits.length + 1}`,
    };
    mockVisits.unshift(newVisit);
    return newVisit;
  },

  /**
   * GET /api/v1/beat-plans
   * List all beat plans and route schedules
   */
  async getBeatPlans(): Promise<BeatPlan[]> {
    await simulateNetworkDelay(200);
    return [
      {
        id: 'beat-01',
        beatName: 'Connaught Place & Janpath Kirana Route',
        code: 'BEAT-DEL-01',
        territory: 'North Delhi',
        repId: 'rep-01',
        repName: 'Vikram Sharma',
        retailersCount: 18,
        scheduledDay: 'Monday',
        estimatedDistanceKm: 14.5,
        estimatedVisitsDurationHours: 6.5,
        completionPct: 88,
        status: 'Active',
      },
      {
        id: 'beat-02',
        beatName: 'Karol Bagh & Patel Nagar Supermarkets',
        code: 'BEAT-DEL-02',
        territory: 'West Delhi',
        repId: 'rep-02',
        repName: 'Ananya Verma',
        retailersCount: 22,
        scheduledDay: 'Tuesday',
        estimatedDistanceKm: 18.2,
        estimatedVisitsDurationHours: 7.0,
        completionPct: 92,
        status: 'Active',
      },
    ];
  },
};
