import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductItem, quantity?: number) => void;
  updateQuantity: (sku: string, delta: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  applyVoucher: (code: string) => { success: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'omnidrop_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [discount, setDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart items', e);
    }
  }, [cartItems]);

  const addToCart = (product: ProductItem, quantity: number = 1) => {
    setCartItems((prev) => {
      const index = prev.findIndex((item) => item.product.sku === product.sku);
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.product.sku === sku ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (sku: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  const applyVoucher = (code: string) => {
    const sub = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const upper = code.trim().toUpperCase();

    if (upper === 'OMNI50') {
      const d = Math.round(sub * 0.1);
      setDiscount(d);
      return { success: true, message: `Áp dụng mã OMNI50 thành công! Giảm ${d.toLocaleString()} ₫` };
    } else if (upper === 'FREESHIP') {
      setDiscount(30000);
      return { success: true, message: 'Áp dụng mã FREESHIP thành công! Giảm 30.000 ₫ phí vận chuyển' };
    } else {
      return { success: false, message: 'Mã giảm giá không hợp lệ. Hãy thử: OMNI50 hoặc FREESHIP' };
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        discount,
        finalTotal,
        applyVoucher,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
