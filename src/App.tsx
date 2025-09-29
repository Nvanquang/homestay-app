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
import BookingHistory from './pages/booking/booking.histories';
import notificationService from '@/config/notificationService';
import { fetchConversation } from './redux/slice/conversationSlide';

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
  const authUser = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  const notifInitRef = useRef(false); // has initialized SW + permission + got token
  const lastRegisteredRef = useRef<{ userId?: string; token?: string }>({});

  // Ensure we have Notification permission so chat notifications can show
  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
    
  }, []);

  // 1) Initialize notifications ASAP on app start (register SW + ask permission + get token)
  useEffect(() => {
    const initNotif = async () => {
      try {
        if (notifInitRef.current) return;
        const ok = await notificationService.initialize();
        if (ok) {
          notifInitRef.current = true;
        }
      } catch (e) {
      }
    };
    initNotif();
  }, []);

  // 2) Once user is authenticated, send token to server (if available)
  useEffect(() => {
    const registerTokenForUser = async () => {
      try {
        if (!isAuthenticated || !authUser?.id) {
          return;
        }
        const token = notificationService.getToken();
        if (!token) {
          return;
        }
        const uid = String(authUser.id);
        if (lastRegisteredRef.current.userId === uid && lastRegisteredRef.current.token === token) {
          return; // already registered for this user+token
        }
        const ok = await notificationService.sendTokenToServer(token, uid);
        if (ok) {
          lastRegisteredRef.current = { userId: uid, token };
        }
      } catch (e) {
      }
    };
    dispatch(fetchConversation(authUser.id));
    registerTokenForUser();
  }, [isAuthenticated, authUser?.id]);

  // 3) Reset trackers on logout to allow re-init/register for next login
  useEffect(() => {
    if (!isAuthenticated) {
      lastRegisteredRef.current = {};
      // Keep notifInitRef so SW/permission persists; token can be reused.
    }
  }, [isAuthenticated]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutApp><LayoutClient /></LayoutApp>,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "homestay/:id", element: <ClientHomestayDetailPage /> },
        { path: "/homestay-search", element: <HomestayListPage /> },
        {
          path: "book/checkout/:homestayId",
          element:
            <ProtectedRoute>
              <CheckoutSection />
            </ProtectedRoute>
        },
        {
          path: "/payments/payment-callback",
          element:
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
        },
        {
          path: "/messages",
          element:
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
        },
        {
          path: "/users/profile",
          element:
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
        },
        {
          path: "/users/edit",
          element:
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
        },
        {
          path: "/users/complete-profile",
          element:
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
        },
        {
          path: "/booking/history",
          element:
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
        },
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
      element: 
        <ProtectedRoute>
          <VerifyOtpPage />
        </ProtectedRoute>,
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