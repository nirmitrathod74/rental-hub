import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getMediaUrl } from '../api';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      margin: '20px 32px 0 32px',
      borderRadius: '16px',
    }}>
      <Link to="/" style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '24px' }}>📦</span>
        <span style={{
          fontFamily: 'var(--font-title)',
          fontSize: '20px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>RentalHub</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" className="btn-secondary" style={{
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          textDecoration: 'none'
        }}>Catalog</Link>

        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Database size={16} /> Admin Console
              </Link>
            )}

            <Link to="/profile" className="btn-secondary" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link to="/cart" style={{ position: 'relative', color: 'inherit' }}>
              <ShoppingCart size={22} style={{ cursor: 'pointer' }} />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}>{cartItemsCount}</span>
              )}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.avatar ? (
                <img
                  src={getMediaUrl(user.avatar)}
                  alt={user.username}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--primary))' }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--primary))',
                  border: '1px solid hsl(var(--border-glass))'
                }}>
                  <UserIcon size={18} />
                </div>
              )}
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.username}</span>
              
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
