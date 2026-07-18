import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, Boxes, CalendarDays, ClipboardList, LayoutDashboard, LogOut, PackageSearch, Search, ShoppingCart, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const NavItem = ({ to, icon: Icon, children }) => <NavLink to={to} end={to === '/'} className="nav-link"><Icon /> <span>{children}</span></NavLink>;

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const signOut = () => { logout(); navigate('/login'); };

  return <div className={`app-shell ${user ? 'with-sidebar' : ''}`}>
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark"><Boxes size={17} /></span>RentalHub ERP</Link>
      <div className="topbar-search"><Search size={15} /><input aria-label="Global search" placeholder="Search equipment, rentals, customers…" /></div>
      <div className="topbar-actions">
        {user && <Link className="topbar-icon" to="/cart" aria-label="Cart"><ShoppingCart size={18} />{cartCount > 0 && <span className="counter">{cartCount}</span>}</Link>}
        {user && <button className="topbar-icon" aria-label="Notifications"><Bell size={18} /></button>}
        {user ? <div className="account-menu"><span className="avatar">{user.avatar ? <img src={`http://localhost:8000${user.avatar}`} alt="" /> : user.username?.slice(0, 1).toUpperCase()}</span><span className="account-copy">{user.username}<small>{user.role}</small></span><button className="topbar-icon" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></div> : <><Link className="btn-secondary" to="/login">Sign in</Link><Link className="btn btn-primary" to="/signup">Start now</Link></>}
      </div>
    </header>
    {user && <aside className="sidebar"><nav className="sidebar-nav">
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
