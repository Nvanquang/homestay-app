import React, { useEffect, useState } from 'react';
import { IHomestay } from '@/types/backend';
import {
  Row, Col, Typography, Card, Avatar, Tag, List, Button, DatePicker, Select, Rate, Spin,
  message
} from 'antd';
import StickyBox from 'react-sticky-box';
import {
  WifiOutlined,
  DesktopOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  FlagOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import styles from '@/styles/homestaydetail.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { callGetAvailabilities } from '@/config/api';
import { formatCurrency, isSuccessResponse } from '@/config/utils';
import queryString from 'query-string';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { useAppSelector } from '@/redux/hooks';
const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

const amenities = [
  { icon: <WifiOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />, text: 'Wi-Fi' },
  { icon: <DesktopOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />, text: 'TV' },
  { icon: <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />, text: 'Phòng trong nhà' },
  { icon: <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />, text: 'Bàn' },
  { icon: <CalendarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />, text: 'Phòng tắm' },
];

interface IProps {
  homestayDetail?: IHomestay | null;
}

const HomestayMainContent = (props: IProps) => {
  const { homestayDetail } = props;

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const id = params?.get("id"); // homestay id

  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [costWarning, setCostWarning] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [dates, setDates] = useState<any>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const userId = useAppSelector(state => state.account.user.id);

  const [costTotal, setCostTotal] = useState<number>(0);
  const [datebetween, setDateBetween] = useState<number>(0);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetchBooked();
  }, [id]);

  const fetchBooked = async () => {
    const q: any = {
      page: 1,
      size: 100,
      filter: '',
    };
    let parts = [];
    parts.push(`homestayId ~ '${String(id)}'`);
    parts.push(`status ~ 'BOOKED'`);
    q.filter = parts.join(' and ');
    if (!q.filter) delete q.filter;

    const res = await callGetAvailabilities(queryString.stringify(q));
    if (isSuccessResponse(res) && res.data) {
      // Lưu danh sách ngày đã book dạng YYYY-MM-DD
      setBookedDates(res.data.result.map((item: any) => item.date));
    }
  }

  const calculateDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  const handleBooking = () => {
    if (!startDate || !endDate) {
      message.error('Vui lòng chọn ngày nhận phòng và trả phòng!');
      return;
    }
    setDateWarning(null);
    setBookingLoading(true);
    setTimeout(() => setBookingLoading(false), 2000);
    navigate(`/book/checkout/$homestayId=${id}?checkin=${startDate}&checkout=${endDate}&guests=${guests}`, {
      state: {
        homestayId: id,
        homestayName: homestayDetail?.name,
        userId: userId,
        costTotal: costTotal,
        checkin: startDate,
        checkout: endDate,
        guests: guests,
        datebetween: datebetween,
        hoemstayImage: homestayDetail?.images?.[0],
        averageRating: homestayDetail?.averageRating || 0,
        availabilities: availabilities
      }
    });
  };

  const calculateBookingCost = async (start: any, end: any) => {
    const q: any = {
      page: 1,
      size: 100,
      filter: '',
    };
    let parts = [];
    parts.push(`homestayId ~ '${String(id)}'`);
    parts.push(`status ~ 'AVAILABLE'`);
    q.filter = parts.join(' and ');
    if (!q.filter) delete q.filter;

    const res = await callGetAvailabilities(queryString.stringify(q));
    if (isSuccessResponse(res) && res.data) {
      // Lọc các ngày nằm trong khoảng start-end
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const availList = res.data.result.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDateObj && itemDate < endDateObj;
      });
      setAvailabilities(res.data.result);
      // Tính tổng tiền
      const total = availList.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
      setCostTotal(total);
      setDateBetween(calculateDaysBetween(start, end));
      
      // Kiểm tra nếu total = 0 thì hiển thị cảnh báo
      if (total === 0) {
        setCostWarning('Chưa có dữ liệu đặt phòng!');
      } else {
        setCostWarning(null);
      }
    } else {
      setCostTotal(0);
      setCostWarning('Chưa có dữ liệu đặt phòng!');
    }
  }


  return (
    <div className={styles[`main-content`]} style={{paddingLeft: 20}}>
      <Row gutter={[32, 24]}>
        {/* Main Description Column */}
        <Col xs={24} md={16}>
          <div className={styles.contentHeader}>
            <Title level={2} className={styles.homestayTitle}>
              Phòng tại {homestayDetail?.address}
            </Title>
            <Paragraph type="secondary" className={styles.homestaySubtitle}>
              Phòng tắm khép kín • {homestayDetail?.guests || 2} khách • {homestayDetail?.nightAmount ? `${homestayDetail.nightAmount.toLocaleString('vi-VN')}đ/đêm` : 'Liên hệ'}
            </Paragraph>
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.ratingRow}>
              <CheckCircleFilled className={styles.ratingIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              <Text strong className={styles.ratingText}>Được khách yêu thích</Text>
              <Rate 
                allowHalf 
                disabled 
                value={Number(homestayDetail?.averageRating)} 
                className={styles.ratingStars}
              />
              <Text strong className={styles.ratingScore}>{(homestayDetail?.averageRating || 0).toFixed(1)}</Text>
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
                  icon={!homestayDetail?.host?.avatar && <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} 
                />
              }
              title={
                <div className={styles.hostInfo}>
                  <span className={styles.hostName}>Host: {homestayDetail?.host?.name || 'Chủ nhà'}</span>
                  <Tag color="blue" className={styles.superhostTag}>Superhost</Tag>
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
                  <div className={styles.amenityIcon}>
                    {item.icon}
                  </div>
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
              {homestayDetail?.description || 'Chưa có mô tả chi tiết cho homestay này.'}
            </Paragraph>
          </div>
        </Col>

        {/* Booking Sidebar Column */}
        <Col xs={24} md={8}>
          <StickyBox offsetTop={24} offsetBottom={24} className={styles.bookingAffix}>
            <Card className={styles.bookingCard} bordered={false}>
              <div className={styles.bookingHeader}>
                <div className={styles.priceInfo}>
                  <Text className={styles.priceLabel}>Giá mỗi đêm</Text>
                  <Title level={3} className={styles.priceAmount}>
                    {homestayDetail?.nightAmount ? `${homestayDetail.nightAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                  </Title>
                </div>
                {(startDate && endDate) && (
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
                  <Text strong className={styles.formLabel}>Chọn ngày</Text>
                  <RangePicker
                    className={styles.datePicker}
                    value={dates as any}
                    format="DD/MM/YYYY"
                    placeholder={['Nhận phòng', 'Trả phòng']}
                    onChange={(values) => {
                      if (
                        values &&
                        values[0] &&
                        values[1] &&
                        values.length === 2
                      ) {
                        const start = values[0];
                        const end = values[1];
                        // Không cho chọn cùng ngày hoặc end <= start
                        if (end.isSame(start, 'day') || end.isBefore(start, 'day')) {
                          setDates(null);
                          setStartDate(null);
                          setEndDate(null);
                          message.error('Ngày trả phòng phải lớn hơn ngày nhận phòng!');
                          return;
                        }
                        setDates(values);
                        setStartDate(start.format('YYYY-MM-DD'));
                        setEndDate(end.format('YYYY-MM-DD'));
                        setDateWarning(null);
                        calculateBookingCost(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
                      } else {
                        setDates(values);
                        setStartDate(null);
                        setEndDate(null);
                      }
                    }}
                    disabledDate={current => {
                      // Không cho chọn ngày hôm nay và quá khứ
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentDate = current.toDate();
                      currentDate.setHours(0, 0, 0, 0);
                      
                      // Disable ngày hôm nay, quá khứ hoặc ngày đã được đặt
                      return currentDate <= today || bookedDates.includes(current.format('YYYY-MM-DD'));
                    }}
                    dateRender={current => {
                      const isBooked = bookedDates.includes(current.format('YYYY-MM-DD'));
                      const isPast = current.toDate() < new Date(new Date().setHours(0, 0, 0, 0));
                      
                      return (
                        <div style={{
                          opacity: (isBooked || isPast) ? 0.4 : 1,
                          textDecoration: isBooked ? 'line-through' : undefined,
                          pointerEvents: (isBooked || isPast) ? 'none' : undefined,
                          color: (isBooked || isPast) ? '#888' : undefined
                        }}>
                          {current.date()}
                        </div>
                      );
                    }}
                  />
                </div>

                <div className={styles.guestsSection}>
                  <Text strong className={styles.formLabel}>Số khách</Text>
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

                <Access
                  permission={ALL_PERMISSIONS.BOOKING.CREATE}
                  hideChildren
                >
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
                </Access>

                <div className={styles.bookingFooter}>
                  <Text type="secondary" className={styles.bookingNote}>
                    Bạn sẽ không bị tính phí ngay
                  </Text>
                </div>
              </div>

              <div className={styles.reportFlag}>
                <FlagOutlined className={styles.reportIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
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

export default HomestayMainContent;
