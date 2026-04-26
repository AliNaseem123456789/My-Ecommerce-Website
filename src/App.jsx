import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { CartProvider, CartContext } from "./components/context/CartContext";
import LandingPage from "./pages/LandingPage";
import Footer from "./components/Footer";
import MobileSearch from "./components/MobileSearch";
import { AuthProvider } from "./components/context/AuthContext";
import AboutUs from "./pages/static/AboutUs";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import TermsConditions from "./pages/static/TermsAndConditions";
import ContactUs from "./pages/static/ContactUs";
import RefundReturns from "./pages/static/RefundReturns";
import Wishlist from "./pages/Wishlist";
import CartSidebar from "./components/CartSidebar";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoutes";
import LoginRequired from "./pages/LoginRequired";
import Home from "./pages/Home";
import { WishlistProvider } from "./components/context/WishlistContext";
import Checkout from "./pages/Checkout";
import Breadcrumbs from "./components/Breadcrumbs";
import NotFoundPage from "./pages/NotFoundPage";
import FAQ from "./pages/static/FAQ";
import FloatingChat from "./components/FloatingChat";

function AppWrapper() {
  const { isSidebarOpen, closeSidebar } = useContext(CartContext);
  const location = useLocation();

  // Do not show sidebar on the main cart page
  const showSidebar = isSidebarOpen && location.pathname !== "/cart";

  // Get userId from localStorage or your auth context
  const userId = localStorage.getItem("userId") || null;

  // Different bot configurations based on route
  const getBotConfig = () => {
    const path = location.pathname;

    // Product/shop pages - use ecommerce bot
    if (
      path === "/shop" ||
      path.startsWith("/product") ||
      path === "/cart" ||
      path === "/checkout" ||
      path === "/wishlist"
    ) {
      return {
        botId: "ecommerce",
        title: "Shop Assistant",
        primaryColor: "#3B82F6",
        welcomeMessage:
          "Hello! Need help with your purchase? I can help you find products, check prices, and track orders! 🛒",
      };
    }

    // Account pages - use ecommerce bot with account focus
    if (path === "/account" || path === "/track-order") {
      return {
        botId: "ecommerce",
        title: "Account Support",
        primaryColor: "#3B82F6",
        welcomeMessage:
          "Hi there! Need help with your account, orders, or returns? I'm here to help! 👤",
      };
    }

    // FAQ/Help pages
    if (path === "/faq" || path === "/contact-us") {
      return {
        botId: "ecommerce",
        title: "Help Center",
        primaryColor: "#3B82F6",
        welcomeMessage:
          "Welcome to the Help Center! How can I assist you today? 📚",
      };
    }

    // Default for all other pages (home, about, etc.)
    return {
      botId: "ecommerce",
      title: "Need Help?",
      primaryColor: "#3B82F6",
      welcomeMessage: "Hi there! How can I help you with your shopping today?",
    };
  };

  const botConfig = getBotConfig();

  return (
    <>
      {/* Conditional Navbar */}
      {location.pathname !== "/" &&
        !location.pathname.startsWith("/products") && <Navbar />}

      {/* Conditional Breadcrumbs */}
      {location.pathname !== "/" &&
        location.pathname !== "/home" &&
        location.pathname !== "/Home" &&
        !location.pathname.startsWith("/product") && <Breadcrumbs />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<MobileSearch />} />
        {/* Footer-related routes */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/refund-returns" element={<RefundReturns />} />
        <Route path="/NotFoundPage" element={<NotFoundPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login-required" element={<LoginRequired />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-order"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>

      {/* Cart Sidebar */}
      {showSidebar && <CartSidebar onClose={closeSidebar} />}

      {/* Footer */}
      <Footer />
      <FloatingChat
        botId={botConfig.botId}
        apiUrl="https://chatbot-gateway.onrender.com"
        title={botConfig.title}
        welcomeMessage={botConfig.welcomeMessage}
        primaryColor={botConfig.primaryColor}
        userId={userId}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <AppWrapper />
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
