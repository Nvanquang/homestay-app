import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
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

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [location]);

  const handleSearch = (searchData: ISearchHomestayRequest) => {
      console.log('Search data:', searchData);
      // Có thể dispatch fetchHomestay({ query }) ở đây nếu muốn search
    };

  return (
    <div className='layout-app' ref={rootRef}>
      <Header onSearch={handleSearch}/>
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer/>
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
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "homestay/:id", element: <ClientHomestayDetailPage /> },
        { path: "book/checkout/:homestayId", element: <CheckoutSection /> },
        { path: "/payments/payment-callback", element: <PaymentSuccessPage /> }
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
    <>
      <RouterProvider router={router} />
    </>
  )
}