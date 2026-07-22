import { useState, useEffect } from 'react';

export function useSseStock(sku: string = 'KINH-X-DEN-SIZE-M', initialStock: number = 10) {
  const [stock, setStock] = useState<number>(initialStock);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`/api/purchase/stock-stream?sku=${sku}`);
      
      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && typeof data.stock === 'number') {
            setStock(data.stock);
          }
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [sku]);

  return { stock, setStock, isConnected };
}
