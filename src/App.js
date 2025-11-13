
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import AddressForm from './pages/AddressForm';
import MyOrders from './pages/MyOrders';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/admin/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import AddProducts from './pages/admin/AddProducts';
import ViewProducts from './pages/admin/ViewProducts';
import ListProduct from './pages/admin/ListProduct';
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

// const ProtectedUserRoute = ({ children }) => {
//   const { isUser } =useAuth();
  
//   if (!isUser()) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

function App() {
  return (
    <main>
      <Toaster position='bottom-right' />
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
        </Route>
        {/* Admin routes */}
        {/* <Route path='/admin'>
         
          <Route path='login' element={<AdminLogin />} />
          <Route
            path='*'
            element={
              
              <ProtectedAdminRoute>
                <Sidebar />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path='add-product' element={<AddProducts />} />
            <Route path='list-product' element={<ListProducts />} />
          </Route>
        </Route> */}

    {/* Tuyến đường riêng dành cho Admin */}
        {/* <Route path='/admin' element={<AdminRoute />}>
          <Route path='*'
            element={
              
              <ProtectedAdminRoute>
                <Sidebar />
              </ProtectedAdminRoute>
            }>
            <Route index element={<Dashboard />} />
            <Route path='add-product' element={<AddProducts />} />
            <Route path='list-product' element={<ViewProducts />} />
            <Route path='list-promotion' element={<ViewProducts />} />
            <Route path='list-banner' element={<ViewProducts />} />
            <Route path='list-about' element={<ViewProducts />} />
            <Route path='list-comment' element={<ViewProducts />} />
            <Route path='list-blog' element={<ViewProducts />} />
          </Route>
          <Route path="login" element={<MainLayout><Login /></MainLayout>} />
        </Route> */}
        <Route path='/admin' element={<Sidebar />}>
        <Route index element={<Dashboard />} />
            <Route path='add-product' element={<AddProducts />} />
            {/* <Route path='list-product' element={<ListProduct />} /> */}
            <Route path='list-product' element={<ViewProducts />} />
            <Route path='list-promotion' element={<ViewProducts />} />
            <Route path='list-banner' element={<ViewProducts />} />
            <Route path='list-about' element={<ViewProducts />} />
            <Route path='list-comment' element={<ViewProducts />} />
            <Route path='list-blog' element={<ViewProducts />} />
        </Route>

        {/* Tuyến đường riêng dành cho User */}
        <Route path= '/' element={<UserRoute />}>
          <Route path='cart' element={<MainLayout><Cart /></MainLayout>} />
          <Route path='address-form' element={<MainLayout><AddressForm /></MainLayout>} />
          <Route path='my-orders' element={<MainLayout><MyOrders /></MainLayout>} />
          
        </Route>
      </Routes>
      </AuthProvider>
      {/* {isAdmin && <Footer />} */}
    </main>
  );
}

export default App;
