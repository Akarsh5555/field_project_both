import type { Order } from '../types';
import { mockOrders } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { simulateNetworkDelay } from './client';

export const ordersApi = {
  /**
   * GET /api/v1/orders
   */
  async getOrders(params?: { retailerId?: string; repId?: string; status?: string }): Promise<Order[]> {
    try {
      let query = supabase.from('orders').select('*');

      if (params?.retailerId) {
        query = query.eq('retailer_id', params.retailerId);
      }
      if (params?.repId) {
        query = query.eq('rep_id', params.repId);
      }
      if (params?.status && params.status !== 'All') {
        query = query.eq('order_status', params.status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Order[];
      }
    } catch (err) {
      console.warn('Supabase orders query fallback:', err);
    }

    await simulateNetworkDelay(150);
    let items = [...mockOrders];

    if (params?.retailerId) {
      items = items.filter((o) => o.retailerId === params.retailerId);
    }
    if (params?.repId) {
      items = items.filter((o) => o.repId === params.repId);
    }
    if (params?.status && params.status !== 'All') {
      items = items.filter((o) => o.orderStatus === params.status);
    }
    return items;
  },

  /**
   * GET /api/v1/orders/:id
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) return data as Order;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(150);
    return mockOrders.find((o) => o.id === id) || null;
  },

  /**
   * POST /api/v1/orders
   */
  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'date'>): Promise<Order> {
    try {
      const payload = {
        ...data,
        order_number: `ORD-2026-${1000 + mockOrders.length + 1}`,
        date: new Date().toISOString().split('T')[0],
      };

      const { data: inserted, error } = await supabase.from('orders').insert([payload]).select().single();
      if (!error && inserted) return inserted as Order;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(250);
    const newOrder: Order = {
      ...data,
      id: `ord-${String(mockOrders.length + 1).padStart(3, '0')}`,
      orderNumber: `ORD-2026-${1000 + mockOrders.length + 1}`,
      date: new Date().toISOString().split('T')[0],
    };
    mockOrders.unshift(newOrder);
    return newOrder;
  },

  /**
   * PATCH /api/v1/orders/:id/status
   */
  async updateOrderStatus(id: string, orderStatus: Order['orderStatus']): Promise<Order> {
    try {
      const { data: updated, error } = await supabase
        .from('orders')
        .update({ order_status: orderStatus })
        .eq('id', id)
        .select()
        .single();
      if (!error && updated) return updated as Order;
    } catch {
      // Fallback
    }

    await simulateNetworkDelay(200);
    const index = mockOrders.findIndex((o) => o.id === id);
    if (index === -1) throw { message: 'Order not found', status: 404 };
    mockOrders[index].orderStatus = orderStatus;
    return mockOrders[index];
  },
};
