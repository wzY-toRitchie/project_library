import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Lazy loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const Cart = React.lazy(() => import('./pages/Cart'));
const BookDetail = React.lazy(() => import('./pages/BookDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Payment = React.lazy(() => import('./pages/Payment'));
const PaymentReturn = React.lazy(() => import('./pages/PaymentReturn'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminBooks = React.lazy(() => import('./pages/AdminBooks'));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminCategories = React.lazy(() => import('./pages/AdminCategories'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const AdminCoupons = React.lazy(() => import('./pages/AdminCoupons'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const ContactSupport = React.lazy(() => import('./pages/ContactSupport'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const AiRecommend = React.lazy(() => import('./pages/AiRecommend'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback'));
const OrderConfirm = React.lazy(() => import('./pages/OrderConfirm'));
const NewArrivals = React.lazy(() => import('./pages/NewArrivals'));
const HotRankings = React.lazy(() => import('./pages/HotRankings'));
const OrderDetail = React.lazy(() => import('./pages/OrderDetail'));
const AuthorDetail = React.lazy(() => import('./pages/AuthorDetail'));
const CategoryBrowse = React.lazy(() => import('./pages/CategoryBrowse'));
const About = React.lazy(() => import('./pages/About'));
const Legal = React.lazy(() => import('./pages/Legal'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const AdminReviews = React.lazy(() => import('./pages/AdminReviews'));
const AdminPointsRules = React.lazy(() => import('./pages/AdminPointsRules'));

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
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
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
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/payment-return" element={<PaymentReturn />} />
                <Route path="/order-confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
                <Route path="/contact" element={<ContactSupport />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/ai-recommend" element={<AiRecommend />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/hot-rankings" element={<HotRankings />} />
                <Route path="/order-detail/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/author/:name" element={<AuthorDetail />} />
                <Route path="/category" element={<CategoryBrowse />} />
                <Route path="/category/:id" element={<CategoryBrowse />} />
                <Route path="/about" element={<About />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Route>

              {/* Admin Interface Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="points-rules" element={<AdminPointsRules />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>

              {/* 404 Not Found */}
              <Route element={<UserLayout />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
            <ThemeToggle />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
