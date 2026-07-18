import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
  rentPrice: number;
  depositPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  startDate: string;
  endDate: string;
  fulfillmentType: 'delivery' | 'store_pickup';
  shippingAddress: string;
  addToCart: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void;
  removeFromCart: (productId: number, variants: Record<string, string>) => void;
  updateQuantity: (productId: number, qty: number, variants: Record<string, string>) => void;
  setDates: (start: string, end: string) => void;
  setFulfillment: (type: 'delivery' | 'store_pickup', address?: string) => void;
  clearCart: () => void;
  getTotalRent: () => number;
  getTotalDeposit: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // defaults tomorrow
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 1-day rental
    return d.toISOString().slice(0, 16);
  });
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'store_pickup'>('store_pickup');
  const [shippingAddress, setShippingAddress] = useState<string>('');

  const addToCart = (product: Product, quantity: number, selectedVariants: Record<string, string>) => {
    setCart((prev) => {
      // Find item with same product and matching variants
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
      );

      const rentPrice = parseFloat(product.calculated_price);
      const depositPrice = parseFloat(product.calculated_deposit);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { product, quantity, selectedVariants, rentPrice, depositPrice }];
    });
  };

  const removeFromCart = (productId: number, variants: Record<string, string>) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && JSON.stringify(item.selectedVariants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (productId: number, qty: number, variants: Record<string, string>) => {
    if (qty <= 0) {
      removeFromCart(productId, variants);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const setDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const setFulfillment = (type: 'delivery' | 'store_pickup', address: string = '') => {
    setFulfillmentType(type);
    setShippingAddress(address);
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalRent = () => {
    return cart.reduce((sum, item) => sum + item.rentPrice * item.quantity, 0);
  };

  const getTotalDeposit = () => {
    return cart.reduce((sum, item) => sum + item.depositPrice * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        startDate,
        endDate,
        fulfillmentType,
        shippingAddress,
        addToCart,
        removeFromCart,
        updateQuantity,
        setDates,
        setFulfillment,
        clearCart,
        getTotalRent,
        getTotalDeposit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
