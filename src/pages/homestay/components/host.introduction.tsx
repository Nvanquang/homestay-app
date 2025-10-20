import React, { useState } from 'react';
import { 
  Card, 
  Avatar, 
  Rate, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Divider,
  Badge,
} from 'antd';
import { 
  StarOutlined, 
  MessageOutlined, 
  CheckCircleOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  TrophyOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import HostChatModal from './host.chat.modal';
import styles from '../view/hostintroduction.module.scss';
import { useAppSelector } from '@/redux/hooks';

const { Title, Text, Paragraph } = Typography;

// Fake host data interface
interface IHostData {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  isSuperhost: boolean;
  joinDate: string;
  reviewCount: number;
  rating: number;
  responseRate: number;
  responseTime: string;
  hostingYears: number;
  location: string;
  bio: string;
  languages: string[];
}

// Enhanced fake host data
const fakeHostData: IHostData = {
  id: '1',
  name: 'Admin',
  avatar: 'https://marketplace.canva.com/b0LFw/MAFW8jb0LFw/1/tl/canva-boy-avatar-illustration-set-collection-MAFW8jb0LFw.png',
  isVerified: true,
  isSuperhost: true,
  joinDate: '2021-03-15',
  reviewCount: 247,
  rating: 4.89,
  responseRate: 100,
  responseTime: '30 phút',
  hostingYears: 3,
  location: 'Ba Đình, Hà Nội',
  bio: 'Chào mừng bạn đến với không gian ấm cúng của chúng tôi! 🏡 Là cặp vợ chồng trẻ yêu thích du lịch và giao lưu văn hóa, chúng tôi luôn mong muốn chia sẻ những trải nghiệm tuyệt vời nhất về Hà Nội với các bạn. Homestay của chúng tôi được thiết kế theo phong cách hiện đại kết hợp nét truyền thống Việt Nam, tạo nên không gian vừa quen thuộc vừa mới lạ.',
  languages: ['Tiếng Việt', 'English', '中文']
};

// Enhanced Host Stats Component
const HostStats: React.FC<{ hostData: IHostData }> = ({ hostData }) => {
  return (
    <div className={styles['host-stats']}>
      <Row gutter={[16, 12]}>
        <Col span={24}>
          <Space size="large" wrap>
            <div className={styles['stat-item']}>
              <div className={styles['stat-number']}>{hostData.reviewCount}</div>
              <Text type="secondary" className={styles['stat-label']}>Đánh giá</Text>
            </div>
            <div className={styles['stat-item']}>
              <Space align="center">
                <div className={styles['stat-number']}>{hostData.rating}</div>
                <StarOutlined className={styles['star-icon']} />
              </Space>
              <Text type="secondary" className={styles['stat-label']}>Xếp hạng</Text>
            </div>
            <div className={styles['stat-item']}>
              <div className={styles['stat-number']}>{hostData.hostingYears}</div>
              <Text type="secondary" className={styles['stat-label']}>Năm kinh nghiệm</Text>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

// Enhanced Host Info Box Component
const HostInfoBox: React.FC<{ hostData: IHostData; onOpenChat: () => void }> = ({ hostData, onOpenChat }) => {
  const handleMessageHost = () => {
    onOpenChat();
  };

  return (
    <div className={styles['host-info-section']}>
      <Card className={styles['host-info-card']} bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className={styles['info-stats']}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles['info-stat-item']}>
                  <ClockCircleOutlined className={styles['info-icon']} />
                  <div>
                    <div className={styles['info-value']}>{hostData.responseTime}</div>
                    <Text type="secondary" className={styles['info-label']}>Thời gian phản hồi</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles['info-stat-item']}>
                  <SafetyCertificateOutlined className={styles['info-icon']} />
                  <div>
                    <div className={styles['info-value']}>{hostData.responseRate}%</div>
                    <Text type="secondary" className={styles['info-label']}>Tỉ lệ phản hồi</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            icon={<MessageOutlined />}
            onClick={handleMessageHost}
            className={styles['premium-message-button']}
            block
          >
            💬 Nhắn tin cho host
          </Button>
        </Space>
      </Card>
    </div>
  );
};

// Premium Host Card Component
const HostCard: React.FC<{ hostData: IHostData; onOpenChat: () => void }> = ({ hostData, onOpenChat }) => {
  const user = useAppSelector(state => state.account.user);
  
  return (
    <div className={styles['premium-host-card']}>
      <Card className={styles['host-main-card']} bordered={false}>
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} lg={16}>
            <div className={styles['host-profile-section']}>
              <div className={styles['host-avatar-section']}>
                <Badge.Ribbon 
                  color={hostData.isSuperhost ? "#FF385C" : "#00A699"}
                  className={styles['host-ribbon']}
                >
                  <div className={styles['avatar-wrapper']}>
                    <Avatar 
                      size={120} 
                      src={user?.avatar !== null ? user.avatar : <UserOutlined />}
                      className={styles['premium-avatar']}
                    />
                    {hostData.isVerified && (
                      <div className={styles['verified-badge-premium']}>
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </div>
                </Badge.Ribbon>
              </div>
              
              <div className={styles['host-info-text']}>
                <Title level={2} className={styles['host-name']}>{hostData.name}</Title>
                <Text className={styles['host-title']}>
                  {hostData.isSuperhost ? "🏆 Superhost" : "Host"} • Tham gia từ {dayjs(hostData.joinDate).format('YYYY')}
                </Text>
                <div className={styles['host-badges']}>
                  <Space wrap>
                    <span className={styles['badge-item']}>
                      <TrophyOutlined /> Kinh nghiệm {hostData.hostingYears}+ năm
                    </span>
                    <span className={styles['badge-item']}>
                      <HeartOutlined /> {hostData.reviewCount} khách hài lòng
                    </span>
                  </Space>
                </div>
                <HostStats hostData={hostData} />
              </div>
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <HostInfoBox hostData={hostData} onOpenChat={onOpenChat} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// Enhanced Host Bio Component
const HostBio: React.FC<{ hostData: IHostData }> = ({ hostData }) => {
  return (
    <div className={styles['premium-host-bio']}>
      <Card className={styles['bio-card']} bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} className={styles['bio-title']}>Giới thiệu về host</Title>
            <Paragraph className={styles['bio-text']}>
              {hostData.bio}
            </Paragraph>
          </div>
          
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <div className={styles['bio-info-item']}>
                <EnvironmentOutlined className={styles['bio-icon']} />
                <div>
                  <Text strong>Địa điểm</Text>
                  <br />
                  <Text type="secondary">{hostData.location}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles['bio-info-item']}>
                <SafetyCertificateOutlined className={styles['bio-icon']} />
                <div>
                  <Text strong>Ngôn ngữ</Text>
                  <br />
                  <Text type="secondary">{hostData.languages.join(', ')}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles['bio-info-item']}>
                <ClockCircleOutlined className={styles['bio-icon']} />
                <div>
                  <Text strong>Tham gia</Text>
                  <br />
                  <Text type="secondary">{dayjs(hostData.joinDate).format('MMMM YYYY')}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

// Main Host Introduction Component
const HostIntroduction: React.FC = () => {
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  const handleOpenChat = () => {
    setIsChatModalVisible(true);
  };

  const handleCloseChat = () => {
    setIsChatModalVisible(false);
  };

  const hostInfo = {
    name: fakeHostData.name,
    avatar: fakeHostData.avatar,
    responseTime: fakeHostData.responseTime,
    isOnline: true
  };

  return (
    <div className={styles['host-introduction']}>
      <Title level={2} className={styles['section-title']}>
        Gặp gỡ host của bạn
      </Title>
      
      <HostCard hostData={fakeHostData} onOpenChat={handleOpenChat} />
      
      <Divider />
      
      <HostBio hostData={fakeHostData} />

      <HostChatModal 
        visible={isChatModalVisible}
        onClose={handleCloseChat}
        hostInfo={hostInfo}
      />
    </div>
  );
};

export default HostIntroduction;
