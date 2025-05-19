
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetail from "./pages/OrderDetail";
import Admin from "./pages/admin/Admin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSupplyChain from "./pages/admin/AdminSupplyChain";

// Auth pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:productId" element={<ProductDetail />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/categories/:categoryId" element={<CategoryDetail />} />
    <Route path="/services" element={<Services />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    
    {/* Protected routes */}
    <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
    <Route path="/orders/:orderId" element={<AuthGuard><OrderDetail /></AuthGuard>} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
    <Route path="/order-confirmation" element={<AuthGuard><OrderConfirmation /></AuthGuard>} />
    
    {/* Auth routes */}
    <Route path="/auth/sign-in" element={<SignIn />} />
    <Route path="/auth/sign-up" element={<SignUp />} />
    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />
    
    {/* Admin routes */}
    <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
    <Route path="/admin/products" element={<AuthGuard><AdminProducts /></AuthGuard>} />
    <Route path="/admin/categories" element={<AuthGuard><AdminCategories /></AuthGuard>} />
    <Route path="/admin/orders" element={<AuthGuard><AdminOrders /></AuthGuard>} />
    <Route path="/admin/supply-chain" element={<AuthGuard><AdminSupplyChain /></AuthGuard>} />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
