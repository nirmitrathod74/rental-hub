import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

const getStorageKey = (userId) => userId ? `rentalhub_wishlist_${userId}` : null;

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load user-specific wishlist when user changes (login/logout)
  useEffect(() => {
    if (user && user.id) {
      try {
        const key = getStorageKey(user.id);
        const saved = localStorage.getItem(key);
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setWishlist([]);
      }
    } else {
      // User logged out — clear wishlist state
      setWishlist([]);
    }
  }, [user?.id]);

  // Persist wishlist to user-specific localStorage key whenever it changes
  useEffect(() => {
    if (user && user.id) {
      const key = getStorageKey(user.id);
      localStorage.setItem(key, JSON.stringify(wishlist));
    }
  }, [wishlist, user?.id]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        image: product.image,
        base_price: product.base_price,
        calculated_price: product.calculated_price
      }];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
