import React, { useState } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space,
  Divider,
  Row,
  Col,
  message as antMessage
} from 'antd';
import { 
  CloseOutlined, 
  SendOutlined,
  CalendarOutlined,
  HomeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import styles from '@/styles/hostchatmodal.module.scss';
import { callCreateConversation } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Interfaces
interface IBookingInfo {
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  guests: number;
}

interface IHostInfo {
  name: string;
  avatar: string;
  responseTime: string;
  isOnline: boolean;
}

interface IHostChatModalProps {
  visible: boolean;
  onClose: () => void;
  hostInfo: IHostInfo;
}

// Fake data
const fakeBookingInfo: IBookingInfo = {
  checkIn: '15 tháng 9, 2024',
  checkOut: '18 tháng 9, 2024',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  guests: 2
};



// Booking Info Component
const BookingInfoSection: React.FC<{ bookingInfo: IBookingInfo }> = ({ bookingInfo }) => {  
  return (
    <div className={styles['booking-info-section']}>
      <Row gutter={[16, 8]} align="middle">
        <Col span={24}>
          <Space size="large" wrap>
            <div className={styles['info-item']}>
              <CalendarOutlined className={styles['info-icon']} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <div>
                <Text strong>Nhận phòng - Trả phòng</Text>
                <br />
                <Text type="secondary">
                  {bookingInfo.checkIn} - {bookingInfo.checkOut}
                </Text>
              </div>
            </div>
            <div className={styles['info-item']}>
              <ClockCircleOutlined className={styles['info-icon']} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <div>
                <Text strong>Thời gian</Text>
                <br />
                <Text type="secondary">
                  Nhận phòng từ {bookingInfo.checkInTime} • Trả phòng vào {bookingInfo.checkOutTime}
                </Text>
              </div>
            </div>
            <div className={styles['info-item']}>
              <HomeOutlined className={styles['info-icon']} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <div>
                <Text strong>Số khách</Text>
                <br />
                <Text type="secondary">{bookingInfo.guests} khách</Text>
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

// Host Status Component
const HostStatusSection: React.FC<{ hostInfo: IHostInfo }> = ({ hostInfo }) => {
  return (
    <div className={styles['host-status-section']}>
      <Space align="center">
        <div className={styles['host-avatar-container']}>
          <Avatar src={hostInfo.avatar} size={40} />
          {hostInfo.isOnline && <div className={styles['online-indicator']} />}
        </div>
        <div>
          <Text strong>{hostInfo.name}</Text>
          <br />
          <Text type="secondary" className={styles['response-time']}>
            {hostInfo.isOnline ? 'Đang online' : `Thường phản hồi trong vòng ${hostInfo.responseTime}`}
          </Text>
        </div>
      </Space>
    </div>
  );
};

// Message Input Component
const MessageInput: React.FC<{ 
  onSendMessage: (text: string) => void;
  loading: boolean;
}> = ({ onSendMessage, loading }) => {
  const [messageText, setMessageText] = useState('');  

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles['message-input-section']}>
      <div className={styles['input-container']}>
        <TextArea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn của bạn..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          className={styles['message-textarea']}
        />
        <Button
          type="primary"
          icon={<SendOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          onClick={handleSend}
          loading={loading}
          className={styles['send-button']}
          size="large"
          disabled={!messageText.trim()}
        >
          Gửi tin nhắn
        </Button>
      </div>
    </div>
  );
};

// Main Host Chat Modal Component
const HostChatModal: React.FC<IHostChatModalProps> = ({ 
  visible, 
  onClose, 
  hostInfo 
}) => {
  const [loading, setLoading] = useState(false);
  const userId = useAppSelector((state) => state.account.user?.id);  

  const handleSendMessage = async (text: string) => {
    setLoading(true);

    const res = await callCreateConversation({
      userId: userId,
      hostId: '1',
      homestayId: '3',
      firstMessage: text
    });
    
    if (isSuccessResponse(res) && res.status === 200 && res.data) {
      setLoading(false);
      antMessage.success('Tin nhắn đã được gửi thành công!');
      onClose(); // Close modal after sending
    } else {
      setLoading(false);
      antMessage.error('Tin nhắn không thể gửi!');
    }
  };

  return (
    <Modal
      title={
        <div className={styles['modal-header']}>
          <Title level={4} className={styles['modal-title']}>
            Nhắn tin với host
          </Title>
          <Text type="secondary">Gửi tin nhắn để bắt đầu cuộc trò chuyện</Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className={styles['chat-modal']}
      closeIcon={<CloseOutlined className={styles['close-icon']} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
    >
      <div className={styles['modal-content']}>
        {/* Booking Info Section */}
        <BookingInfoSection bookingInfo={fakeBookingInfo} />
        
        <Divider />
        
        {/* Host Status Section */}
        <HostStatusSection hostInfo={hostInfo} />
        
        <Divider />
        
        {/* Message Input Section */}
        <div className={styles['compose-section']}>
          <Text strong className={styles['compose-title']}>Soạn tin nhắn</Text>
          <Text type="secondary" className={styles['compose-subtitle']}>
            Hãy giới thiệu bản thân và đặt câu hỏi về homestay
          </Text>
          <MessageInput onSendMessage={handleSendMessage} loading={loading} />
        </div>
      </div>
    </Modal>
  );
};

export default HostChatModal;
