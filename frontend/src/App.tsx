import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Cart from './pages/Cart';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminSettings from './pages/AdminSettings';
import Checkout from './pages/Checkout';
import ContactSupport from './pages/ContactSupport';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import OAuthCallback from './pages/OAuthCallback';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Wrapper for MainLayout to use with Outlet
const UserLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Auth Routes (No Header/Footer) */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* User Interface Routes */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/contact" element={<ContactSupport />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Route>

              {/* Admin Interface Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Not Found */}
              <Route element={<UserLayout />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <ThemeToggle />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
