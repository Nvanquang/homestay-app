import React from 'react';
import { Button, Avatar, Card, Tag, Divider, Image, Typography } from 'antd';
import { EnvironmentOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined, StarFilled } from '@ant-design/icons';
import { convertSlug } from '@/config/utils';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface BookingInfoProps {
  currentConversation: any;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const BookingInfo: React.FC<BookingInfoProps> = ({
  currentConversation,
  showSidebar,
  setShowSidebar
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  const navigate = useNavigate();

  if (!currentConversation) {
    return null;
  }

  const handleViewDetailHomestay = (homestayId: string, homestayName: string) => {
    if (homestayName) {
      const slug = convertSlug(homestayName);
      navigate(`/homestay/${slug}?id=${homestayId}`)
    }
  }

  return (
    <div className={`airbnb-chat__sidebar ${!showSidebar ? 'airbnb-chat__sidebar--collapsed' : ''}`}>
      {showSidebar ? (
        <Card className="airbnb-chat__homestay-card" bodyStyle={{ padding: 0 }}>
          <div className="airbnb-chat__property-image">
            <Button
              type="text"
              icon={<EyeInvisibleOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
              onClick={() => setShowSidebar(false)}
              className="airbnb-chat__sidebar-toggle"
              title="Ẩn thông tin homestay"
            />
            <Image
              src={currentConversation.homestayInfo.image || '/placeholder-homestay.jpg'}
              alt={currentConversation.homestayInfo.name}
              preview={false}
            />
            <div className="airbnb-chat__property-rating">
              <StarFilled style={{ color: '#ff5a5f' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <span>4.8</span>
            </div>
          </div>

          <div className="airbnb-chat__booking-content">
            <Title level={5} className="airbnb-chat__property-title">
              {currentConversation.homestayInfo.name}
            </Title>

            <div className="airbnb-chat__property-location">
              <EnvironmentOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <Text type="secondary">{currentConversation.homestayInfo.address}</Text>
            </div>

            <Divider />

            <div className="airbnb-chat__homestay-details">
              <Title level={5} className="airbnb-chat__section-title">
                Thông tin homestay
              </Title>

              <div className="airbnb-chat__detail-row">
                <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                <div>
                  <Text strong>Sức chứa</Text>
                  <br />
                  <Text>{currentConversation.homestayInfo.guests} khách</Text>
                </div>
              </div>

              <div className="airbnb-chat__description">
                <Text strong>Mô tả:</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {currentConversation.homestayInfo.description}
                </Text>
              </div>
            </div>

            <Divider />

            <div className="airbnb-chat__homestay-status">
              <div className="airbnb-chat__status-row">
                <Text strong>Trạng thái:</Text>
                <Tag color={currentConversation.homestayInfo.status === 'active' ? 'green' : 'orange'}>
                  {currentConversation.homestayInfo.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                </Tag>
              </div>

              <div className="airbnb-chat__price-row">
                <Text strong style={{ fontSize: '16px' }}>
                  Giá/đêm: {formatPrice(currentConversation.homestayInfo.nightAmount)}
                </Text>
              </div>

              <div className="airbnb-chat__rating-row">
                <StarFilled style={{ color: '#ff5a5f', marginRight: 4 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                <Text strong>{currentConversation.homestayInfo.averageRating?.toFixed(1) || 'N/A'}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>({currentConversation.homestayInfo.totalReviews || 0} đánh giá)</Text>
              </div>
            </div>

            <div className="airbnb-chat__actions">
              <Button type="primary" block className="airbnb-chat__primary-btn">
                Đặt phòng
              </Button>
              <Button
                block
                className="airbnb-chat__secondary-btn"
                onClick={() => handleViewDetailHomestay(currentConversation.homestayInfo.id, currentConversation.homestayInfo.name)}
              >
                Xem chi tiết homestay
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          type="text"
          icon={<EyeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          onClick={() => setShowSidebar(true)}
          className="airbnb-chat__sidebar-show"
          title="Hiện thông tin homestay"
        />
      )}
    </div>
  );
};

export default BookingInfo;
