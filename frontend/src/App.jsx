import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AppShell } from './components/AppShell.jsx';
import { Catalog } from './pages/Catalog.jsx';
import { ProductDetails } from './pages/ProductDetails.jsx';
import { Cart } from './pages/Cart.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { Profile } from './pages/Profile.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';
import { VendorSignup } from './pages/VendorSignup.jsx';
import { About } from './pages/About.jsx';
import { Terms } from './pages/Terms.jsx';
import { Contact } from './pages/Contact.jsx';

// Protected Route components
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Authenticating user session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - Outside AppShell */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />

        {/* App Routes - Inside AppShell */}
        <Route path="*" element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Authenticated Client Routes */}
              <Route path="/checkout" element={
                <ProtectedRoute roles={['client', 'admin']}>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute roles={['client', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Authenticated Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        } />
      </Routes>
    </Router>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
