import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '@/styles/paymentSuccess.module.scss';
import { callGetBookingStatus } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';
import { PaymentNotification } from '@/contexts/WebSocketContext';

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
      console.log('Using existing payment notification from Redux:', existingNotification);
      displayPaymentResult(existingNotification);
      return;
    }

    // Check localStorage for notification (backup)
    const storedNotification = localStorage.getItem(`payment_${bookingId}`);
    if (storedNotification) {
      try {
        const notification: PaymentNotification = JSON.parse(storedNotification);
        console.log('Using stored payment notification:', notification);
        displayPaymentResult(notification);
        // Clean up
        localStorage.removeItem(`payment_${bookingId}`);
        return;
      } catch (error) {
        console.error('Error parsing stored notification:', error);
        localStorage.removeItem(`payment_${bookingId}`);
      }
    }

    // Fallback to API call with timeout
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.log('No WebSocket notification received, falling back to API...');
        checkPaymentStatusAPI();
      }
    }, 3000); // 30 second timeout

    // Cleanup timeout if component unmounts
    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [bookingId, paymentNotifications]);

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
      console.log('Checking payment status via API for booking:', bookingId);
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
      console.error('Payment status check failed:', error);
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