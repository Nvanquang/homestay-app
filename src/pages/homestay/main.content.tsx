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
import { isSuccessResponse } from '@/config/utils';
import queryString from 'query-string';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
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
  totalReviews?: number;
  averageRating?: number;
}

const HomestayMainContent = (props: IProps) => {
  const { homestayDetail, totalReviews, averageRating } = props;

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const id = params?.get("id"); // homestay id

  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [dates, setDates] = useState<any>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

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
        userId: '1',
        costTotal: costTotal,
        checkin: startDate,
        checkout: endDate,
        guests: guests,
        datebetween: datebetween,
        hoemstayImage: homestayDetail?.images?.[0],
        averageRating: averageRating,
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
    } else {
      setCostTotal(0);
    }
  }


  return (
    <div className={styles[`main-content`]}>
      <Row gutter={16}>
        {/* Main Description Column */}
        <Col xs={24} md={16}>
          <Title level={2}>Phòng tại {homestayDetail?.address}</Title>
          <Paragraph type="secondary">Phòng tắm khép kín</Paragraph>
          <div className={styles.ratingRow}>
            <CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
            <Text strong>Được khách yêu thích</Text>
            <Rate allowHalf disabled value={Number(averageRating)} style={{ margin: '0 8px' }} />
            <Text strong>{averageRating}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>({totalReviews} đánh giá)</Text>
          </div>
          <Card className={styles.hostCard} bordered={false}>
            <Card.Meta
              avatar={<Avatar style={{ backgroundColor: '#000000ff' }} icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />}
              title={<span>Host: Viên <Tag color="blue">Superhost</Tag></span>}
              description={<span>11 tháng kinh nghiệm đón tiếp khách</span>}
            />
          </Card>
          <div className={styles.amenitiesSection}>
            <Title level={4} style={{ marginBottom: 12 }}>Tiện nghi nổi bật</Title>
            <List
              grid={{ gutter: 12, column: 3 }}
              dataSource={amenities}
              renderItem={item => (
                <List.Item className={styles.amenityItem}>
                  {item.icon}
                  <span style={{ marginLeft: 8 }}>{item.text}</span>
                </List.Item>
              )}
            />
          </div>

        </Col>
        {/* Booking Sidebar Column */}
        <Col xs={24} md={8}>
          <StickyBox offsetTop={24} offsetBottom={24} className={styles.bookingAffix}>
            <Card
              className={styles.bookingCard}
              bordered={false}>
              {(startDate && endDate) && (
                <Title level={4} style={{ marginBottom: 0 }}>
                  {costTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ <Text type="secondary">cho {datebetween} đêm</Text>
                </Title>
              )}
              <div style={{ margin: '16px 0' }}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dates as any}
                  format="DD/MM/YYYY"
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
                  disabledDate={current =>
                    bookedDates.includes(current.format('YYYY-MM-DD'))
                  }
                  dateRender={current => {
                    const isBooked = bookedDates.includes(current.format('YYYY-MM-DD'));
                    return (
                      <div style={{
                        opacity: isBooked ? 0.4 : 1,
                        textDecoration: isBooked ? 'line-through' : undefined,
                        pointerEvents: isBooked ? 'none' : undefined,
                        color: isBooked ? '#888' : undefined
                      }}>
                        {current.date()}
                      </div>
                    );
                  }}
                />
                <Select
                  style={{ width: '100%', marginTop: 12 }}
                  value={guests}
                  onChange={value => setGuests(value)}
                >
                  {[...Array(10)].map((_, i) => (
                    <Select.Option key={i + 1} value={i + 1}>
                      {i + 1} khách
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {dateWarning && (
                <div style={{ color: 'red', marginBottom: 8 }}>{dateWarning}</div>
              )}
              < Access
                permission={ALL_PERMISSIONS.BOOKING.CREATE}
                hideChildren
              >
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  loading={bookingLoading}
                  className={styles.bookingBtn}
                  onClick={handleBooking}
                  block
                  disabled={!startDate || !endDate}
                >
                  {bookingLoading ? <Spin size="small" /> : 'Đặt phòng'}
                </Button>
              </Access>

              <div className={styles.reportFlag}>
                <FlagOutlined style={{ marginRight: 6 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                <Text type="secondary">Báo cáo nhà/phòng cho thuê này</Text>
              </div>
            </Card>
          </StickyBox>
        </Col>
      </Row>
    </div>
  );
};

export default HomestayMainContent;
