
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/admin/Sidebar';
import SidebarManager from './components/manager/SidebarManager';
import Dashboard from './pages/admin/Dashboard';
import AddProducts from './pages/admin/AddProducts';
import ViewProducts from './pages/admin/ViewProducts';
import ViewPromotion from './pages/admin/ViewPromotion';
import ViewCategory from './pages/admin/ViewCategory';
import ViewUser from './pages/admin/ViewUser';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminRoute from './components/AdminRoutes';
import UserRoute from './components/UserRoute';
import PublicRoute from './components/PublicRoutes';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
// import AdminLogin from './components/admin/Login';
// import { useUserContext } from './context/UserContext';
import { Navigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import AddCategory from './pages/admin/AddCategory';
import EditCategory from './pages/admin/EditCategory';
import AddPromotion from './pages/admin/AddPromotion';
import EditProduct from './pages/admin/EditProduct';
import AddUser from './pages/admin/AddUser';
import EditUser from './pages/admin/EditUser';
import EditPromotion from './pages/admin/EditPromotion';
import MyProfile from './pages/admin/MyProfile';
import UserProfile from './pages/UserProfile';
import UserOrderDetails from './pages/UserOrderDetails';
import UserAddress from './pages/UserAddress';
import Address from './pages/Address';
import ItemDetails from './pages/ItemDetails';
import PaymentStatus from './components/PaymentStatus';
import ViewOrder from './pages/admin/ViewOrder';
import Checkout from './pages/Checkout';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import ViewCoupon from './pages/admin/ViewCoupon';
import ViewReview from './pages/admin/ViewReview';
import CouponDetail from './pages/admin/CouponDetail';
import EditCoupon from './pages/admin/EditCoupon';
import OrderDetail from './pages/admin/OrderDetail';
import EditOrder from './pages/admin/EditOrder';
import AddCoupon from './pages/admin/AddCoupon';
import MyReview from './pages/MyReview';
import ManagerRoute from './components/ManagerRoutes';
import Reviews from './pages/Reviews';

const MainLayout = ({ children }) => {
  return (
    <div className='overflow-x-hidden text-textColor'>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin } =useAuth();
  
  if (!isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
const ProtectedManagerRoute = ({ children }) => {
  const { isManager } =useAuth();
  
  if (!isManager()) {
    return <Navigate to="/manager" replace />;
  }

  return children;
};


function App() {
  return (
    <main>
      <AuthProvider>
      <Routes>
        {/* Public routes with Header and Footer */}
        <Route path='/' element={<MainLayout><Home /></MainLayout>} />
        <Route path='/menu' element={<MainLayout><Menu /></MainLayout>} />
        <Route path='/blog' element={<MainLayout><Blog /></MainLayout>} />
        <Route path='/contact' element={<MainLayout><Contact /></MainLayout>} />
        <Route path='/login' element={<MainLayout><Login /></MainLayout>} />
        <Route path='/signup' element={<MainLayout><Signup /></MainLayout>} />
        <Route path='/forgot-password' element={<MainLayout><ForgotPassword /></MainLayout>} />
        
        <Route element={<PublicRoute />}>
          <Route path='/login' element={<MainLayout><Login /></MainLayout>} />
          <Route path='/signup' element={<MainLayout><Signup /></MainLayout>} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Route>
        
    {/* Tuyến đường riêng dành cho Admin */}
        <Route path='/admin' element={<AdminRoute />}>
          <Route path='*'
            element={
              
              <ProtectedAdminRoute>
                <Sidebar />
              </ProtectedAdminRoute>
            }>
            <Route index element={<Dashboard />} />
              <Route path='my-profile' element={<MyProfile />} />
              <Route path='list-order' element={<ViewOrder />} />
              <Route path='order-detail/:orderId' element={<OrderDetail />} />
              <Route path='edit-order/:orderId' element={<EditOrder />} />
              <Route path='list-user' element={<ViewUser />} />
              <Route path='add-user' element={<AddUser />} />
              <Route path='edit-user/:userId' element={<EditUser />} />
              <Route path='list-product' element={<ViewProducts />} />
              <Route path='add-product' element={<AddProducts />} />
              <Route path='edit-product/:id' element={<EditProduct />} />
              <Route path='list-category' element={<ViewCategory />} />
              <Route path='add-category' element={<AddCategory />} />
              <Route path='edit-category/:categoryId' element={<EditCategory />} />
              <Route path='list-promotion' element={<ViewPromotion />} />
              <Route path='add-promotion' element={<AddPromotion />} />
              <Route path='edit-promotion/:promotionId' element={<EditPromotion />} />
              <Route path='list-coupon' element={<ViewCoupon />} />
              <Route path='add-coupon' element={<AddCoupon />} />
              <Route path='coupon-detail/:couponCode' element={<CouponDetail />} />
              <Route path='edit-coupon/:couponCode' element={<EditCoupon />} />
              <Route path='list-review' element={<ViewReview />} />
              <Route path='list-comment' element={<ViewProducts />} />
              <Route path='list-blog' element={<ViewProducts />} />
          </Route>
          <Route path="login" element={<MainLayout><Login /></MainLayout>} />
        </Route>

        {/* Tuyến đường riêng dành cho Manager */}
        <Route path='/manager' element={<ManagerRoute />}>
          <Route path='*'
            element={
              
              <ProtectedManagerRoute>
                <SidebarManager />
              </ProtectedManagerRoute>
            }>
            <Route index element={<ViewOrder />} />
              <Route path='my-profile' element={<MyProfile />} />
              <Route path='list-order' element={<ViewOrder />} />
              <Route path='order-detail/:orderId' element={<OrderDetail />} />
              <Route path='edit-order/:orderId' element={<EditOrder />} />
              <Route path='list-product' element={<ViewProducts />} />
              <Route path='add-product' element={<AddProducts />} />
              <Route path='edit-product/:id' element={<EditProduct />} />
              <Route path='list-category' element={<ViewCategory />} />
              <Route path='add-category' element={<AddCategory />} />
              <Route path='edit-category/:categoryId' element={<EditCategory />} />
              <Route path='list-promotion' element={<ViewPromotion />} />
              <Route path='add-promotion' element={<AddPromotion />} />
              <Route path='edit-promotion/:promotionId' element={<EditPromotion />} />
              <Route path='list-coupon' element={<ViewCoupon />} />
              <Route path='add-coupon' element={<AddCoupon />} />
              <Route path='coupon-detail/:couponCode' element={<CouponDetail />} />
              <Route path='edit-coupon/:couponCode' element={<EditCoupon />} />
              <Route path='list-review' element={<ViewReview />} />
              <Route path='list-comment' element={<ViewProducts />} />
              <Route path='list-blog' element={<ViewProducts />} />
          </Route>
          <Route path="login" element={<MainLayout><Login /></MainLayout>} />
        </Route>

        {/* Tuyến đường riêng dành cho User */}
        <Route path= '/' element={<UserRoute />}>
         <Route path='/product-details/:productId' element={<MainLayout><ItemDetails /></MainLayout>} />
         <Route path='/product-details/:productId/reviews' element={<MainLayout><Reviews /></MainLayout>} />
          <Route path='/user-profile' element={<MainLayout><UserProfile /> </MainLayout>} />
          <Route path='/user-address' element={<MainLayout><UserAddress /></MainLayout>} />
          <Route path='/address' element={<MainLayout><Address /> </MainLayout>} />
          <Route path='/user-order-detail/:id' element={<MainLayout><UserOrderDetails /></MainLayout>} />
          <Route path='/cart' element={<MainLayout><Cart /></MainLayout>} />
          <Route path='/my-orders' element={<MainLayout><MyOrders /></MainLayout>} />
          <Route path='/my-review' element={<MainLayout><MyReview /></MainLayout>} />
          <Route path='/check-out' element={<MainLayout><Checkout /></MainLayout>} />
          <Route path='/payment-status' element={<MainLayout><PaymentStatus /></MainLayout>} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      </AuthProvider>
    </main>
  );
}

export default App;
