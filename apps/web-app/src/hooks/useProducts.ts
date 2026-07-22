import { useState, useEffect, useMemo } from 'react';
import { ProductItem } from '../types';
import { fetchProductsApi, refillCampaignStockApi } from '../services/api';

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [refillLoading, setRefillLoading] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleRefillStock = async (sku: string = 'KINH-X-DEN-SIZE-M', quantity: number = 10) => {
    setRefillLoading(true);
    try {
      const result = await refillCampaignStockApi(sku, quantity);
      if (result.success) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Refill error:', err);
      return false;
    } finally {
      setRefillLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    refillStock: handleRefillStock,
    refillLoading,
    refreshProducts: loadProducts,
  };
}
