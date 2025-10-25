import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from './components/ProtectedRoute';
import AddProduct from "./pages/Products/AddProduct";
import ManageProduct from "./pages/Products/ManageProduct";
import { ProductDetailsWrapper } from "./pages/Products/ProductDetails";
import AttributeManagementPage from "./pages/Products/Attributes/AttributeManagementPage";
import AddBrand from "./pages/Brands/AddBrand";
import AddCategory from "./pages/Categories/AddCategory";
import CategoryList from "./pages/Categories/CategoryList";
import CategoryOrder from "./pages/Categories/CategoryOrder";
import StateList from "./pages/Locations/StateList";
import ZipcodeList from "./pages/Locations/ZipcodeList";
import CountryList from "./pages/Locations/CountryList";
import SliderList from "./pages/Sliders/SliderList";
import { CustomerList, AddCustomer, CustomerDetail } from "./pages/Customers";
import { OrderList, OrderDetails } from "./pages/Orders";
import { TransactionList, TransactionDetails } from "./pages/Transactions";
import QuoteRequestList from "./pages/QuoteRequests/QuoteRequestList";
import QuoteRequestDetails from "./pages/QuoteRequests/QuoteRequestDetails";
import { AddPromoCode, PromoCodeList } from "./pages/PromoCodes";
import Reports from "./pages/Reports/Reports";

import { CategoryProvider } from "./context/CategoryContext";
import { CustomerProvider } from "./context/CustomerContext";
import { OrderProvider } from "./context/OrderContext";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import GlobalLoadingIndicator from "./components/ui/loading/GlobalLoadingIndicator";
import ToastContainer from "./components/ui/toast/ToastContainer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Home from "./pages/Dashboard/Home";
import { authUtils } from "./services/auth";
import { EditProductWrapper } from "./pages/Products/EditProduct";

// Component to redirect authenticated users away from auth pages
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  const hasValidStoredAuth = authUtils.getToken() && 
                            authUtils.getCurrentUser() && 
                            !authUtils.isTokenExpired() && 
                            authUtils.isValidTokenFormat();
  
  const redirectedWithError = !!(location.state as any)?.error;
  
  if (isAuthenticated && hasValidStoredAuth && !isLoading && !redirectedWithError) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>; 
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes - Redirect to dashboard if already authenticated */}
      <Route path="/signin" element={
        <AuthGuard>
          <SignIn />
        </AuthGuard>
      } />
      <Route path="/signup" element={
        <AuthGuard>
          <SignUp />
        </AuthGuard>
      } />
      
      {/* Protected Routes (admin-only) */}
      <Route element={<ProtectedRoute requireAdmin />}>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route index path="/" element={<Home />} />

          {/* Products Routes */}
          <Route path="/product/manage" element={<ManageProduct />} />
          <Route path="/product/add" element={<AddProduct />} />
          <Route path="/product/details/:id" element={<ProductDetailsWrapper />} />
          {/* Edit Product (wrapped with AttributeProvider) */}
          <Route path="/product/edit/:id" element={<EditProductWrapper />} />
          <Route path="/product/attributes" element={<AttributeManagementPage />} />

          {/* Categories Routes */}
          <Route path="/category/add" element={<AddCategory />} />
          <Route path="/category/list" element={<CategoryList />} />
          <Route path="/category/order" element={<CategoryOrder />} />
          
          {/* Brand Routes */}
          <Route path="/brand/add" element={<AddBrand />} />
          
          {/* Customer Routes */}
          <Route path="/customer/list" element={<CustomerList />} />
          <Route path="/customer/add" element={<AddCustomer />} />
          <Route path="/customer/edit/:id" element={<AddCustomer />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          
          {/* Order Routes */}
          <Route path="/order/list" element={
            <ErrorBoundary>
              <OrderList />
            </ErrorBoundary>
          } />
          <Route path="/order/details/:id" element={
            <ErrorBoundary>
              <OrderDetails />
            </ErrorBoundary>
          } />
          
          {/* Transaction Routes */}
          <Route path="/transaction/list" element={<TransactionList />} />
          <Route path="/transaction/details/:id" element={<TransactionDetails />} />
          
          {/* Quote Request Routes */}
          <Route path="/quote/list" element={<QuoteRequestList />} />
          <Route path="/quote/details/:id" element={<QuoteRequestDetails />} />
          
          {/* Promo Code Routes */}
          <Route path="/promo/list" element={<PromoCodeList />} />
          <Route path="/promo/add" element={<AddPromoCode />} />
          
          {/* Location Routes */}
          <Route path="/location/state" element={<StateList />} />
          <Route path="/location/zipcode" element={<ZipcodeList />} />
          <Route path="/location/country" element={<CountryList />} />
          
          {/* Slider Routes */}
          <Route path="/sliders" element={<SliderList />} />
          
          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* Ui Elements */}
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />
          
          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>
      </Route>
      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <CustomerProvider>
          <OrderProvider>
            <CategoryProvider>
              <Router>
                <ScrollToTop />
                <GlobalLoadingIndicator position="top" />
                <ToastContainer position="top-right" />
                <AppRoutes />
              </Router>
            </CategoryProvider>
          </OrderProvider>
        </CustomerProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}
