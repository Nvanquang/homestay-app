import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Button } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '@/styles/paymentSuccess.module.scss';
import { callGetBookingStatus } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';

const { Title, Paragraph } = Typography;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const bookingId = params?.get("vnp_TxnRef");

  const [check, setCheck] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string | null>(null);


  useEffect(() => {
    const fetchStatus = async () => {
      const res = await callGetBookingStatus(String(bookingId));
      if (isSuccessResponse(res) && res.status === 200 && res.data ) {
        if (res.data.status === 'BOOKED') {
          setCheck(true);
          setTitle('Thanh toán thành công!');
          setMessage('Đặt chỗ của bạn đã được xác nhận. Cam ơn bạn đã sử dụng dịch vụ của chúng tôi.');
        }
        else {
          setCheck(false);
          setTitle('Thanh toán không thành công!');
          setMessage('Thanh toán không thành công! Vui lòng thử lại sau.');
        }
      }
    };
    fetchStatus();
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Row gutter={32} justify="center" style={{ minHeight: '80vh', alignItems: 'center', marginTop: 250, marginBottom: 50 }}>
      <Col span={8}>
        <Card className={styles['payment-success-container']}>
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
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentSuccessPage;