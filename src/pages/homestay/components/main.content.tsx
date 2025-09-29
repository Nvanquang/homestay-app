import React from 'react';
import {
  Row,
  Col,
  Typography,
  Card,
  Avatar,
  Tag,
  Button,
  DatePicker,
  Select,
  Rate,
  Spin,
} from 'antd';
import StickyBox from 'react-sticky-box';
import {
  WifiOutlined,
  DesktopOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  FlagOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import styles from '@/styles/homestaydetail.module.scss';
import { useHomestayDetail } from '../hooks/useHomestayDetail';
import { IHomestay } from '@/types/backend';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/config/utils';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

const amenities = [
  { icon: <WifiOutlined />, text: 'Wi-Fi' },
  { icon: <DesktopOutlined />, text: 'TV' },
  { icon: <HomeOutlined />, text: 'Phòng trong nhà' },
  { icon: <UserOutlined />, text: 'Bàn' },
  { icon: <CalendarOutlined />, text: 'Phòng tắm' },
];

interface IProps {
  homestayDetail?: IHomestay | null;
}

const HomestayMainContentUI: React.FC<IProps> = ({ homestayDetail }) => {
  const {
    bookingLoading,
    dateWarning,
    costWarning,
    guests,
    setGuests,
    dates,
    startDate,
    endDate,
    bookedDates,
    costTotal,
    datebetween,
    handleBooking,
    handleDateChange,
    disabledDate,
  } = useHomestayDetail({ homestayDetail });

  const dateRender = (current: any) => {
    const isBooked = bookedDates.includes(current.format('YYYY-MM-DD'));
    const isPast = current.toDate() < new Date(new Date().setHours(0, 0, 0, 0));
    return (
      <div
        style={{
          opacity: isBooked || isPast ? 0.4 : 1,
          textDecoration: isBooked ? 'line-through' : undefined,
          pointerEvents: isBooked || isPast ? 'none' : undefined,
          color: isBooked || isPast ? '#888' : undefined,
        }}
      >
        {current.date()}
      </div>
    );
  };

  return (
    <div className={styles[`main-content`]} style={{ paddingLeft: 20 }}>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={16}>
          <div className={styles.contentHeader}>
            <Title level={2} className={styles.homestayTitle}>
              Phòng tại {homestayDetail?.address}
            </Title>
            <Paragraph type="secondary" className={styles.homestaySubtitle}>
              Phòng tắm khép kín • {homestayDetail?.guests || 2} khách •{' '}
              {homestayDetail?.nightAmount
                ? `${homestayDetail.nightAmount.toLocaleString('vi-VN')}đ/đêm`
                : 'Liên hệ'}
            </Paragraph>
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.ratingRow}>
              <CheckCircleFilled
                className={styles.ratingIcon}
              />
              <Text strong className={styles.ratingText}>
                Được khách yêu thích
              </Text>
              <Rate
                allowHalf
                disabled
                value={Number(homestayDetail?.averageRating)}
                className={styles.ratingStars}
              />
              <Text strong className={styles.ratingScore}>
                {(homestayDetail?.averageRating || 0).toFixed(1)}
              </Text>
              <Text type="secondary" className={styles.ratingCount}>
                ({homestayDetail?.totalReviews} đánh giá)
              </Text>
            </div>
          </div>

          <Card className={styles.hostCard} bordered={false}>
            <Card.Meta
              avatar={
                <Avatar
                  size={64}
                  className={styles.hostAvatar}
                  src={homestayDetail?.host?.avatar || undefined}
                  icon={
                    !homestayDetail?.host?.avatar && (
                      <UserOutlined
                      />
                    )
                  }
                />
              }
              title={
                <div className={styles.hostInfo}>
                  <span className={styles.hostName}>
                    Host: {homestayDetail?.host?.name || 'Chủ nhà'}
                  </span>
                  <Tag color="blue" className={styles.superhostTag}>
                    Superhost
                  </Tag>
                </div>
              }
              description={
                <div className={styles.hostDescription}>
                  <span>11 tháng kinh nghiệm đón tiếp khách</span>
                  <div className={styles.hostStats}>
                    <Text type="secondary">Phản hồi trong 1 giờ</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">Tỷ lệ hủy 0%</Text>
                  </div>
                </div>
              }
            />
          </Card>

          <div className={styles.amenitiesSection}>
            <Title level={4} className={styles.sectionTitle}>
              Tiện nghi nổi bật
            </Title>
            <div className={styles.amenitiesGrid}>
              {amenities.map((item, index) => (
                <div key={index} className={styles.amenityItem}>
                  <div className={styles.amenityIcon}>{item.icon}</div>
                  <span className={styles.amenityText}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.descriptionSection}>
            <Title level={4} className={styles.sectionTitle}>
              Mô tả
            </Title>
            <Paragraph className={styles.descriptionText}>
              {homestayDetail?.description ||
                'Chưa có mô tả chi tiết cho homestay này.'}
            </Paragraph>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <StickyBox
            offsetTop={24}
            offsetBottom={24}
            className={styles.bookingAffix}
          >
            <Card className={styles.bookingCard} bordered={false}>
              <div className={styles.bookingHeader}>
                <div className={styles.priceInfo}>
                  <Text className={styles.priceLabel}>Giá mỗi đêm</Text>
                  <Title level={3} className={styles.priceAmount}>
                    {homestayDetail?.nightAmount
                      ? `${homestayDetail.nightAmount.toLocaleString('vi-VN')}đ`
                      : 'Liên hệ'}
                  </Title>
                </div>
                {startDate && endDate && (
                  <div className={styles.totalInfo}>
                    <Title level={4} className={styles.totalAmount}>
                      {formatCurrency(costTotal)}
                    </Title>
                    <Text type="secondary" className={styles.totalNights}>
                      cho {datebetween} đêm
                    </Text>
                  </div>
                )}
              </div>

              <div className={styles.bookingForm}>
                <div className={styles.dateSection}>
                  <Text strong className={styles.formLabel}>
                    Chọn ngày
                  </Text>
                  <RangePicker
                    className={styles.datePicker}
                    value={dates as any}
                    format="DD/MM/YYYY"
                    placeholder={['Nhận phòng', 'Trả phòng']}
                    onChange={handleDateChange}
                    disabledDate={disabledDate}
                    dateRender={dateRender}
                  />
                </div>

                <div className={styles.guestsSection}>
                  <Text strong className={styles.formLabel}>
                    Số khách
                  </Text>
                  <Select
                    className={styles.guestsSelect}
                    value={guests}
                    onChange={value => setGuests(value)}
                    placeholder="Chọn số khách"
                  >
                    {[...Array(10)].map((_, i) => (
                      <Select.Option key={i + 1} value={i + 1}>
                        {i + 1} khách
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {dateWarning && (
                  <div className={styles.dateWarning}>{dateWarning}</div>
                )}

                {costWarning && (
                  <div className={styles.dateWarning}>{costWarning}</div>
                )}

                <Button
                  type="primary"
                  size="large"
                  loading={bookingLoading}
                  className={styles.bookingBtn}
                  onClick={handleBooking}
                  block
                  disabled={!startDate || !endDate || costTotal === 0}
                >
                  {bookingLoading ? <Spin size="small" /> : 'Đặt phòng'}
                </Button>

                <div className={styles.bookingFooter}>
                  <Text type="secondary" className={styles.bookingNote}>
                    Bạn sẽ không bị tính phí ngay
                  </Text>
                </div>
              </div>

              <div className={styles.reportFlag}>
                <FlagOutlined
                  className={styles.reportIcon}
                />
                <Text type="secondary" className={styles.reportText}>
                  Báo cáo nhà/phòng cho thuê này
                </Text>
              </div>
            </Card>
          </StickyBox>
        </Col>
      </Row>
    </div>
  );
};

export default HomestayMainContentUI;