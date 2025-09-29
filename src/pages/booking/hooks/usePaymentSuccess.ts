import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { PaymentNotification, useWebSocket } from '@/contexts/WebSocketContext';
import { callGetBookingStatus } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';

export const usePaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const bookingId = params?.get("vnp_TxnRef");

  const [check, setCheck] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const paymentNotifications = useAppSelector(state => state.notifications.paymentNotifications);
  const { subscribeToPayment, unsubscribeFromPayment, connectionState } = useWebSocket();

  const resolvedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setCheck(false);
      setTitle('Lỗi thanh toán!');
      setMessage('Không tìm thấy thông tin đặt chỗ.');
      setLoading(false);
      return;
    }
    const bid = Number(bookingId);
    if (connectionState === 'CONNECTED') {
      subscribeToPayment(bid);
    }
    return () => {
      unsubscribeFromPayment();
    };
  }, [bookingId, connectionState, subscribeToPayment, unsubscribeFromPayment]);

  useEffect(() => {
    if (!bookingId) {
      setCheck(false);
      setTitle('Lỗi thanh toán!');
      setMessage('Không tìm thấy thông tin đặt chỗ.');
      setLoading(false);
      return;
    }

    const existingNotification = paymentNotifications.find(
      notif => notif.bookingId === Number(bookingId)
    );

    if (existingNotification) {
      resolvedRef.current = true;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      displayPaymentResult(existingNotification);
      return;
    }

    const storedNotification = localStorage.getItem(`payment_${bookingId}`);
    if (storedNotification) {
      try {
        const notification: PaymentNotification = JSON.parse(storedNotification);
        resolvedRef.current = true;
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        displayPaymentResult(notification);
        localStorage.removeItem(`payment_${bookingId}`);
        return;
      } catch (error) {
        localStorage.removeItem(`payment_${bookingId}`);
      }
    }
  }, [bookingId, paymentNotifications]);

  useEffect(() => {
    if (!bookingId) return;
    resolvedRef.current = false;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!resolvedRef.current) {
        checkPaymentStatusAPI();
        resolvedRef.current = true;
      }
    }, 20000);

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [bookingId]);

  const displayPaymentResult = (notification: PaymentNotification) => {
    if (notification.status === 'success') {
      setCheck(true);
      setTitle('Thanh toán thành công!');
      setMessage(notification.message);
    } else {
      setCheck(false);
      setTitle('Thanh toán không thành công!');
      setMessage(notification.message || 'Thanh toán không thành công! Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  const checkPaymentStatusAPI = async () => {
    try {
      const res = await callGetBookingStatus(String(bookingId));
      if (isSuccessResponse(res) && res.status === 200 && res.data) {
        if (res.data.status === 'BOOKED') {
          setCheck(true);
          setTitle('Thanh toán thành công!');
          setMessage('Đặt chỗ của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.');
        } else {
          setCheck(false);
          setTitle('Thanh toán không thành công!');
          setMessage('Thanh toán không thành công! Vui lòng thử lại sau.');
        }
      } else {
        setCheck(false);
        setTitle('Lỗi hệ thống!');
        setMessage('Không thể xác minh trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.');
      }
    } catch (error) {
      setCheck(false);
      setTitle('Lỗi hệ thống!');
      setMessage('Không thể xác minh trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return { loading, check, title, message, handleGoHome };
};