import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Boxes, CalendarDays, ClipboardList, LayoutDashboard, LogOut, PackageSearch, Search, ShoppingCart, UserRound, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getMediaUrl } from '../api/index.js';

const NavItem = ({ to, icon: Icon, children }) => <NavLink to={to} end={to === '/'} className="nav-link"><Icon /> <span>{children}</span></NavLink>;

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const signOut = () => { logout(); navigate('/login'); };

  const hideSidebar = user?.role === 'admin' && location.pathname === '/admin';

  return <div className={`app-shell ${user && !hideSidebar ? 'with-sidebar' : ''}`}>
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark"><Boxes size={17} /></span>RentalHub ERP</Link>
      
      <div className="topbar-links" style={{ display: 'flex', gap: '20px', marginLeft: '16px', fontSize: '13px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>Products</Link>
        <Link to="/terms" style={{ textDecoration: 'none', color: '#fff' }}>Terms & Condition</Link>
        <Link to="/about" style={{ textDecoration: 'none', color: '#fff' }}>About us</Link>
        <Link to="/contact" style={{ textDecoration: 'none', color: '#fff' }}>Contact Us</Link>
      </div>

      <div className="topbar-search"><Search size={15} /><input aria-label="Global search" placeholder="Search equipment, rentals, customers…" /></div>
      <div className="topbar-actions">
        {user && <button className="topbar-icon" aria-label="Favorites"><Heart size={18} /></button>}
        {user && <Link className="topbar-icon" to="/cart" aria-label="Cart"><ShoppingCart size={18} />{cartCount > 0 && <span className="counter">{cartCount}</span>}</Link>}
        {user && <button className="topbar-icon" aria-label="Notifications"><Bell size={18} /></button>}
        {user ? <div className="account-menu" style={{ cursor: 'pointer' }}><span className="avatar">{user.avatar ? <img src={getMediaUrl(user.avatar)} alt="" /> : user.username?.slice(0, 1).toUpperCase()}</span><span className="account-copy">{user.username}<small>{user.role}</small></span><ChevronDown size={14} style={{ opacity: 0.7, marginLeft: '4px' }} /><button className="topbar-icon" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></div> : <><Link className="btn-secondary" to="/login">Sign in</Link><Link className="btn btn-primary" to="/signup">Start now</Link></>}
      </div>
    </header>
    {user && !hideSidebar && <aside className="sidebar"><nav className="sidebar-nav">
      <span className="nav-label">Workspace</span>
      {user.role === 'admin' && <NavItem to="/admin" icon={LayoutDashboard}>Overview</NavItem>}
      <NavItem to="/" icon={PackageSearch}>Equipment</NavItem>
      <NavItem to="/profile" icon={ClipboardList}>My rentals</NavItem>
      <NavItem to="/cart" icon={ShoppingCart}>Rental cart</NavItem>
      {user.role === 'admin' && <><span className="nav-label">Operations</span><NavItem to="/admin" icon={CalendarDays}>Rental operations</NavItem><NavItem to="/admin" icon={Boxes}>Inventory</NavItem></>}
      <span className="nav-label">Account</span><NavItem to="/profile" icon={UserRound}>My profile</NavItem>
    </nav></aside>}
    <main className="app-content">{children}</main>
  </div>;
};
