import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Boxes, CalendarDays, ClipboardList, LayoutDashboard, LogOut, PackageSearch, Search, ShoppingCart, UserRound, Heart, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { getMediaUrl } from '../api/index.js';
import logo from '../assets/final_logo.png';

const NavItem = ({ to, icon: Icon, children }) => <NavLink to={to} end={to === '/'} className="nav-link"><Icon /> <span>{children}</span></NavLink>;

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const signOut = () => { logout(); navigate('/login'); };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/" style={{ marginRight: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={logo} alt="RentalHub Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', display: 'block' }} />
        <span>RentalHub ERP</span>
      </Link>
      
      <div className="topbar-links" style={{ display: 'flex', gap: '24px', marginRight: '32px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'transparent'}>Products</Link>
        <Link to="/terms" style={{ textDecoration: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'transparent'}>Terms & Condition</Link>
        <Link to="/about" style={{ textDecoration: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'transparent'}>About us</Link>
        <Link to="/contact" style={{ textDecoration: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'transparent'}>Contact Us</Link>
      </div>

      <form className="topbar-search" onSubmit={handleSearch} style={{ flex: '0 1 480px', margin: '0 auto', marginRight: '32px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', color: '#64748b' }} />
          <input 
            aria-label="Global search" 
            placeholder="Search equipment, rentals, customers…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="appshell-search-input"
            style={{ 
              width: '100%', height: '38px', padding: '0 16px 0 40px', border: 'none', 
              borderRadius: '19px', outline: 'none', color: '#1e293b', 
              backgroundColor: '#f1f5f9', fontSize: '14px', fontWeight: 500,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      </form>

      <div className="topbar-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              className="topbar-icon" 
              aria-label="Favorites" 
              onClick={() => setWishlistOpen(!wishlistOpen)}
            >
              <Heart size={18} color="#fff" fill={wishlist.length > 0 ? '#fff' : 'none'} />
              {wishlist.length > 0 && <span className="counter badge-wishlist">{wishlist.length}</span>}
            </button>
            {wishlistOpen && (
              <div className="profile-dropdown" style={{ width: '300px', right: '-50px' }}>
                <div style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid var(--odoo-border)' }}>
                  My Wishlist ({wishlist.length})
                </div>
                {wishlist.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Your wishlist is empty.
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {wishlist.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-glass)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#f0f0f0' }}>
                          {item.image ? (
                            <img src={getMediaUrl(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>⚙️</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>${item.base_price}/day</div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ padding: '8px' }}>
                  <button onClick={() => { setWishlistOpen(false); navigate('/'); }} style={{ width: '100%', padding: '8px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                    Continue Exploring
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {user && <Link className="topbar-icon" to="/cart" aria-label="Cart"><ShoppingCart size={18} />{cartCount > 0 && <span className="counter">{cartCount}</span>}</Link>}
        {user && <button className="topbar-icon" aria-label="Notifications"><Bell size={18} /></button>}
        {user ? (
          <div style={{ position: 'relative' }}>
            <div className="account-menu" style={{ cursor: 'pointer' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span className="avatar">
                {user.avatar ? <img src={getMediaUrl(user.avatar)} alt="" /> : user.username?.slice(0, 1).toUpperCase()}
              </span>
              <span className="account-copy">
                {user.username}
                <small>{user.role}</small>
              </span>
              <ChevronDown size={14} style={{ opacity: 0.7, marginLeft: '4px' }} />
            </div>
            
            {dropdownOpen && (
              <div className="profile-dropdown">
                {user.role === 'admin' ? (
                  <>
                    <span className="dropdown-label">Workspace</span>
                    <NavItem to="/admin" icon={LayoutDashboard}>Overview</NavItem>
                    <NavItem to="/" icon={PackageSearch}>Equipment</NavItem>
                    <NavItem to="/profile" icon={ClipboardList}>My rentals</NavItem>
                    <NavItem to="/cart" icon={ShoppingCart}>Rental cart</NavItem>
                    
                    <span className="dropdown-label">Operations</span>
                    <NavItem to="/admin" icon={CalendarDays}>Rental operations</NavItem>
                    <NavItem to="/admin" icon={Boxes}>Inventory</NavItem>
                    
                    <span className="dropdown-label">Account</span>
                    <NavItem to="/profile" icon={UserRound}>My profile</NavItem>
                  </>
                ) : (
                  <>
                    <NavItem to="/profile" icon={ClipboardList}>My rentals</NavItem>
                    <NavItem to="/profile" icon={UserRound}>My profile</NavItem>
                  </>
                )}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={signOut}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link className="btn-secondary" to="/login" style={{ padding: '8px 16px', fontWeight: 600, background: '#fff', color: '#6B4668', border: '1px solid #e2e8f0', textDecoration: 'none', borderRadius: '6px' }}>Sign in</Link>
            <Link className="btn btn-primary" to="/signup" style={{ padding: '8px 16px', fontWeight: 600, background: '#6B4668', color: '#fff', border: 'none', textDecoration: 'none', borderRadius: '6px' }}>Start now</Link>
          </div>
        )}
      </div>
    </header>
    <main className="app-content">{children}</main>
  </div>;
};
