import React, { lazy, Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { CartProvider, CartContext } from "./components/context/CartContext";
import LandingPage from "./pages/LandingPage";
import Footer from "./components/Footer";
import MobileSearch from "./components/MobileSearch";
import SearchResults from "./pages/SearchResults";
import OrderConfirmation from "./pages/OrderConfirmation";
import ResetPassword from "./pages/ResetPassword";
import TrackOrder from "./pages/TrackOrder";
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
import { CompareProvider } from "./components/context/CompareContext";
import CompareBar from "./components/CompareBar";
import CompareTab from "./components/Accountx/CompareTab";
import Checkout from "./pages/Checkout";
import Breadcrumbs from "./components/Breadcrumbs";
import NotFoundPage from "./pages/NotFoundPage";
import FAQ from "./pages/static/FAQ";
import FloatingChat from "./components/FloatingChat";
import RouteMeta from "./components/RouteMeta";
import AdminRoute from "./admin/AdminRoute";

// The admin area is a separate bundle. Storefront visitors never download it.
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/pages/Dashboard"));
const AdminProductsList = lazy(() => import("./admin/pages/ProductsList"));
const AdminProductForm = lazy(() => import("./admin/pages/ProductForm"));
const AdminCategories = lazy(() => import("./admin/pages/Categories"));
const AdminBrands = lazy(() => import("./admin/pages/Brands"));
const AdminCollections = lazy(() => import("./admin/pages/Collections"));
const AdminPromotions = lazy(() => import("./admin/pages/Promotions"));
const AdminLandingSections = lazy(() => import("./admin/pages/LandingPageSections"));
const AdminOrdersList = lazy(() => import("./admin/pages/OrdersList"));
const AdminOrderDetail = lazy(() => import("./admin/pages/OrderDetail"));
const AdminCustomers = lazy(() => import("./admin/pages/Customers"));
const AdminReviews = lazy(() => import("./admin/pages/Reviews"));
const AdminQuestions = lazy(() => import("./admin/pages/Questions"));
const AdminCoupons = lazy(() => import("./admin/pages/Coupons"));

function BootFallback() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}

function AppWrapper() {
  const { isSidebarOpen, closeSidebar } = useContext(CartContext);
  const location = useLocation();

  // Admin runs in its own shell: no storefront navbar, breadcrumbs, footer,
  // cart sidebar, compare bar or support chat widget.
  const isAdminArea = location.pathname.toLowerCase().startsWith("/admin");

  const showSidebar =
    isSidebarOpen && location.pathname !== "/cart" && !isAdminArea;
  const userId = localStorage.getItem("userId") || null;

  const getBotConfig = () => {
    const path = location.pathname;
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
    if (path === "/account" || path === "/track-order") {
      return {
        botId: "ecommerce",
        title: "Account Support",
        primaryColor: "#3B82F6",
        welcomeMessage:
          "Hi there! Need help with your account, orders, or returns? I'm here to help! 👤",
      };
    }
    if (path === "/faq" || path === "/contact-us") {
      return {
        botId: "ecommerce",
        title: "Help Center",
        primaryColor: "#3B82F6",
        welcomeMessage:
          "Welcome to the Help Center! How can I assist you today? ",
      };
    }

    return {
      botId: "ecommerce",
      title: "Need Help?",
      primaryColor: "#3B82F6",
      welcomeMessage: "Hi there! How can I help you with your shopping today?",
    };
  };

  const botConfig = getBotConfig();

  const showNavbar =
    !isAdminArea &&
    location.pathname !== "/" &&
    !location.pathname.startsWith("/products");

  const showBreadcrumbs =
    !isAdminArea &&
    location.pathname !== "/" &&
    location.pathname !== "/home" &&
    location.pathname !== "/Home" &&
    !location.pathname.startsWith("/product");

  return (
    <>
      <RouteMeta />
      {showNavbar && <Navbar />}
      {showBreadcrumbs && <Breadcrumbs />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/mobile-search" element={<MobileSearch />} />
        <Route path="/order/:id" element={<OrderConfirmation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/compare" element={<CompareTab />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<BootFallback />}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsList />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="landing" element={<AdminLandingSections />} />
          <Route path="orders" element={<AdminOrdersList />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {showSidebar && <CartSidebar onClose={closeSidebar} />}
      {!isAdminArea && <CompareBar />}
      {!isAdminArea && <Footer />}
      {!isAdminArea && (
        <FloatingChat
          botId={botConfig.botId}
          apiUrl="https://chatbot-gateway-production-bd16.up.railway.app"
          title={botConfig.title}
          welcomeMessage={botConfig.welcomeMessage}
          primaryColor={botConfig.primaryColor}
          userId={userId}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CompareProvider>
            <BrowserRouter>
              <AppWrapper />
            </BrowserRouter>
          </CompareProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
