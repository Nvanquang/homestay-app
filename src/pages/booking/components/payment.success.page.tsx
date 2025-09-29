import React from 'react';
import { Row, Col, Card, Typography, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import styles from '@/styles/paymentSuccess.module.scss';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';

const { Title, Paragraph } = Typography;

const PaymentSuccessPage = () => {

  const { loading, check, title, message, handleGoHome } = usePaymentSuccess();

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
                  <CheckCircleFilled style={{ fontSize: 64, color: '#52c41a' }} />
                  : 
                  <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
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