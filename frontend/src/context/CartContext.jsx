import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(undefined);

const getStorageKey = (userId) => userId ? `rentalhub_cart_${userId}` : null;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // defaults tomorrow
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 1-day rental
    return d.toISOString().slice(0, 16);
  });
  const [fulfillmentType, setFulfillmentType] = useState('store_pickup');
  const [shippingAddress, setShippingAddress] = useState('');

  // Load user-specific cart when user changes (login/logout)
  useEffect(() => {
    if (user && user.id) {
      try {
        const key = getStorageKey(user.id);
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCart(parsed.cart || []);
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.endDate) setEndDate(parsed.endDate);
          if (parsed.fulfillmentType) setFulfillmentType(parsed.fulfillmentType);
          if (parsed.shippingAddress) setShippingAddress(parsed.shippingAddress);
        } else {
          setCart([]);
        }
      } catch (e) {
        setCart([]);
      }
    } else {
      // User logged out — clear cart state
      setCart([]);
      setFulfillmentType('store_pickup');
      setShippingAddress('');
    }
  }, [user?.id]);

  // Persist cart to user-specific localStorage whenever it changes
  useEffect(() => {
    if (user && user.id) {
      const key = getStorageKey(user.id);
      localStorage.setItem(key, JSON.stringify({
        cart,
        startDate,
        endDate,
        fulfillmentType,
        shippingAddress,
      }));
    }
  }, [cart, startDate, endDate, fulfillmentType, shippingAddress, user?.id]);

  const addToCart = (product, quantity, selectedVariants) => {
    setCart((prev) => {
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

  const removeFromCart = (productId, variants) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && JSON.stringify(item.selectedVariants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (productId, qty, variants) => {
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

  const setDates = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const setFulfillment = (type, address = '') => {
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
