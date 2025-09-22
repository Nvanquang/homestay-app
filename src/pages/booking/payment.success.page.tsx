import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '@/styles/paymentSuccess.module.scss';
import { callGetBookingStatus } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';
import { PaymentNotification, useWebSocket } from '@/contexts/WebSocketContext';

const { Title, Paragraph } = Typography;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const bookingId = params?.get("vnp_TxnRef");

  const [check, setCheck] = React.useState<boolean | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);


  const paymentNotifications = useAppSelector(state => state.notifications.paymentNotifications);
  const { subscribeToPayment, unsubscribeFromPayment, connectionState } = useWebSocket();

  // Track resolution state and fallback timer to prevent race conditions
  const resolvedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);

  // Subscribe to the payment topic for this booking to receive websocket updates
  useEffect(() => {
    if (!bookingId) return;
    const bid = Number(bookingId);
    if (connectionState === 'CONNECTED') {
      subscribeToPayment(bid);
    }
    return () => {
      unsubscribeFromPayment();
    };
  }, [bookingId, connectionState, subscribeToPayment, unsubscribeFromPayment]);

  // Handle notifications from Redux/localStorage as they arrive
  useEffect(() => {
    if (!bookingId) {
      setCheck(false);
      setTitle('Lỗi thanh toán!');
      setMessage('Không tìm thấy thông tin đặt chỗ.');
      setLoading(false);
      return;
    }

    // Check if we already have a payment notification for this booking
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

    // Check localStorage for notification (backup)
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
        // Clean up
        localStorage.removeItem(`payment_${bookingId}`);
        return;
      } catch (error) {
        localStorage.removeItem(`payment_${bookingId}`);
      }
    }

    // No immediate resolution yet; just wait for websocket up to 20s.
    // The fallback timer is scheduled separately in another effect.
  }, [bookingId, paymentNotifications]);

  // Schedule fallback API after 20s ONLY if websocket/local hasn't resolved
  useEffect(() => {
    if (!bookingId) return;
    // Reset resolution for new booking
    resolvedRef.current = false;
    // Clear any previous timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    fallbackTimerRef.current = window.setTimeout(() => {
      if (!resolvedRef.current) {
        checkPaymentStatusAPI();
        resolvedRef.current = true;
      }
    }, 20000); // 20 seconds

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

  return (
    <Row gutter={32} justify="center" style={{ minHeight: '80vh', alignItems: 'center', marginTop: 250, marginBottom: 50 }}>
      <Col span={8}>
        <Card className={styles['payment-success-container']}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <Title level={3} style={{ marginTop: 16, color: '#1a1a1a' }}>
                Đang xử lý thanh toán...
              </Title>
              <Paragraph style={{ color: '#666', fontSize: 16 }}>
                Vui lòng chờ trong giây lát
              </Paragraph>
            </div>
          ) : (
            <>
              <div className={styles['success-icon']}>
                {check ? 
                  <CheckCircleFilled style={{ fontSize: 64, color: '#52c41a' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                  : 
                  <CloseCircleOutlined  style={{ fontSize: 64, color: '#ff4d4f' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                }
              </div>
              <Title level={1} style={{ textAlign: 'center', color: '#1a1a1a', fontWeight: 600 }}>
                {title}
              </Title>
              <Paragraph style={{ textAlign: 'center', color: '#666', fontSize: 16, lineHeight: 1.6 }}>
                {message}
              </Paragraph>
              <Button type="primary" shape="round" size="large" block onClick={handleGoHome} className={styles['home-button']}>
                Quay về trang chủ
              </Button>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentSuccessPage;