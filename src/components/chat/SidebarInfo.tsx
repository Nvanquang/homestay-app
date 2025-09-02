import React from 'react';
import { Card, Button, Image, Typography, Divider, Space, Tag } from 'antd';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IHomestay } from '@/types/backend';
import '@/styles/SidebarInfo.scss';

const { Title, Text } = Typography;

interface SidebarInfoProps {
  homestayInfo: IHomestay;
}

const SidebarInfo: React.FC<SidebarInfoProps> = ({ homestayInfo }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'maintenance': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Tạm ngưng';
      case 'maintenance': return 'Bảo trì';
      default: return status;
    }
  };

  return (
    <div className="sidebar-info">
      <Card className="sidebar-info__card" bodyStyle={{ padding: 0 }}>
        <div className="sidebar-info__image-container">
          <Image
            src={homestayInfo.images?.[0] || '/placeholder-homestay.jpg'}
            alt={homestayInfo.name}
            className="sidebar-info__image"
            preview={false}
          />
          <div className="sidebar-info__rating">
            <StarFilled style={{ color: '#ff5a5f', fontSize: '12px' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
            <span>{homestayInfo.averageRating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
        
        <div className="sidebar-info__content">
          <Title level={5} className="sidebar-info__title">
            {homestayInfo.name}
          </Title>
          
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div className="sidebar-info__location">
              <EnvironmentOutlined style={{ color: '#717171' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <Text type="secondary">{homestayInfo.address}</Text>
            </div>
            
            <Divider style={{ margin: 0 }} />
            
            <div className="sidebar-info__homestay-details">
              <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                Thông tin homestay
              </Title>
              
              <div className="sidebar-info__detail-item">
                <UserOutlined style={{ color: '#717171' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                <div>
                  <Text strong>Sức chứa:</Text>
                  <br />
                  <Text>{homestayInfo.guests} khách</Text>
                </div>
              </div>
              
              <div className="sidebar-info__description">
                <Text strong>Mô tả:</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {homestayInfo.description}
                </Text>
              </div>
            </div>
            
            <Divider style={{ margin: 0 }} />
            
            <div className="sidebar-info__status">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Trạng thái:</Text>
                <Tag color={getStatusColor(homestayInfo.status)}>
                  {getStatusText(homestayInfo.status)}
                </Tag>
              </div>
            </div>
            
            <div className="sidebar-info__price">
              <Text strong style={{ fontSize: '16px' }}>
                Giá/đêm: {homestayInfo.nightAmount ? formatPrice(homestayInfo.nightAmount) : 'Liên hệ'}
              </Text>
            </div>
            
            <div className="sidebar-info__actions">
              <Button type="primary" block className="sidebar-info__book-btn">
                Đặt phòng
              </Button>
              <Button block style={{ marginTop: 8 }}>
                Xem chi tiết
              </Button>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SidebarInfo;
