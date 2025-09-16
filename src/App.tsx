import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import ScrollToTop from '@/components/ScrollToTop';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import PermissionPage from './pages/admin/permission';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import BookingPage from './pages/admin/booking';
import TransactionPage from './pages/admin/transaction';
import HomestayTabs from './pages/admin/homestay/homestay.tabs';
import HomePage from './pages/home';
import VerifyOtpPage from './pages/auth/verify.otp';
import ClientHomestayDetailPage from './pages/homestay/detail';
import Header from './components/client/header.client';
import Footer from './components/client/footer.client';
import { ISearchHomestayRequest } from './types/backend';
import CheckoutSection from './pages/booking/checkout';
import PaymentSuccessPage from './pages/booking/payment.success.page';
import HomestayListPage from './pages/homestay/homestay.search';
import ChatPage from './pages/chat';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ChatWebSocketProvider } from './contexts/ChatWebSocketContext';
import ProfilePage from './pages/user/profile';
import EditProfile from './pages/user/edit';
import CompleteProfile from './pages/user/complete.profile';

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);


  const handleSearch = (searchData: ISearchHomestayRequest) => {

  };

  return (
    <div className='layout-app' ref={rootRef}>
      <ScrollToTop />
      <Header onSearch={handleSearch} />
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutApp><LayoutClient /></LayoutApp>,
      // errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "homestay/:id", element: <ClientHomestayDetailPage /> },
        { path: "book/checkout/:homestayId", element: <CheckoutSection /> },
        { path: "/payments/payment-callback", element: <PaymentSuccessPage /> },
        { path: "/homestay-search", element: <HomestayListPage /> },
        { path: "/messages", element: <ChatPage /> },
        { path: "/users/profile", element: <ProfilePage /> },
        { path: "/users/edit", element: <EditProfile /> },
        { path: "/users/complete-profile", element: <CompleteProfile /> },
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },
        {
          path: "homestay",
          element:
            <ProtectedRoute>
              <HomestayTabs />
            </ProtectedRoute>
        },
        {
          path: "booking",
          element:
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
        },
        {
          path: "transaction",
          element:
            <ProtectedRoute>
              <TransactionPage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        }
      ],
    },

    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },

    {
      path: "/verify-otp",
      element: <VerifyOtpPage />,
    },
  ]);

  return (
    <WebSocketProvider>
      <ChatWebSocketProvider>
        <RouterProvider router={router} />
      </ChatWebSocketProvider>
    </WebSocketProvider>
  )
}