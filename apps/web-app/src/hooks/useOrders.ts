import { useState, useCallback } from 'react';
import { OrderItemRecord } from '../types';
import { fetchOrdersApi, payOrderApi } from '../services/api';

export function useOrders() {
  const [orders, setOrders] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersApi();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePayOrder = async (orderId: string) => {
    setPayingId(orderId);
    try {
      const res = await payOrderApi(orderId);
      if (res.success) {
        await loadOrders();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Payment error:', err);
      return false;
    } finally {
      setPayingId(null);
    }
  };

  return {
    orders,
    loading,
    payingId,
    error,
    loadOrders,
    payOrder: handlePayOrder,
  };
}
