import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Badge,
  Tooltip,
  Breadcrumb,
  notification,
} from 'antd';
import {
  StarOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { callGetBookingHistory } from '@/config/api';
import { IBackendError, IBooking } from '@/types/backend';
import { convertSlug, formatCurrency, getStatusConfig, isSuccessResponse } from '@/config/utils';
import dayjs from 'dayjs';
import _ from 'lodash';
import '@/styles/bookingHistory.scss';
import ViewDetailBooking from '@/components/booking/view.booking.histories';
import ReviewModal from '@/components/booking/review.modal';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

import type { RangePickerProps } from 'antd/es/date-picker';

type RangeValue = RangePickerProps['value'];


const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector(state => state.account.user.id);

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IBooking | null>(null);
  const [openReviewModal, setOpenReviewModal] = useState<boolean>(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewHomestayId, setReviewHomestayId] = useState<string | null>(null);

  const fetchBookingHistory = async () => {
    if (!userId) {
      setError('Vui lòng đăng nhập để xem lịch sử đặt chỗ');
      return;
    }

    setLoading(true);
    setError(null);


    const response = await callGetBookingHistory(parseInt(userId));

    if (isSuccessResponse(response)) {
      // Handle both single booking and paginated response
      let bookingData: IBooking[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          bookingData = response.data;
        }
      }
      setLoading(false);
      setBookings(bookingData);
    } else {
      const errMes = response as IBackendError;
      notification.error({
        message: 'Có lỗi xảy ra',
        description: errMes.detail,
        duration: 2
      });
    }

  };

  useEffect(() => {
    fetchBookingHistory();
  }, [userId]);

  const columns: ColumnsType<IBooking> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Homestay',
      key: 'homestayName',
      width: 200,
      ellipsis: true,
      render: (_, record: IBooking) => (
        <Link to={`/homestay/${convertSlug(record.homestay?.name)}?id=${record.homestay?.id}`}>
          {record.homestay?.name}
        </Link>
      ),
    },
    {
      title: 'Ngày nhận phòng',
      dataIndex: 'checkinDate',
      key: 'checkinDate',
      width: 130,
      sorter: (a, b) => dayjs(a.checkinDate).unix() - dayjs(b.checkinDate).unix(),
      defaultSortOrder: 'descend',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả phòng',
      dataIndex: 'checkoutDate',
      key: 'checkoutDate',
      width: 130,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số khách',
      dataIndex: 'guests',
      key: 'guests',
      width: 80,
      align: 'center',
      render: (guests: number) => `${guests} người`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Tag color={statusConfig.color}>
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount: number) => (
        <Text strong style={{ color: 'red' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              style={{ color: 'blue' }}
              icon={<EyeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
              onClick={() => {
                setDataInit(record);
                setOpenViewDetail(true);
              }}
            />
          </Tooltip>
          {(!record.isReviewed) ? (
            <Tooltip title="Đánh giá">
              <Button
                type="text"
                style={{ color: 'orange' }}
                icon={<StarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                onClick={() => handleCreateReview(record.id!, record.homestay.id!)}
              />
            </Tooltip>
          ) : (
            <div style={{ width: 32, height: 32 }} />
          )}
        </Space>
      ),
    },
  ];

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking =>
        booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(booking => {
        const checkinDate = dayjs(booking.checkinDate);
        return checkinDate.isAfter(dayjs(startDate).startOf('day')) &&
          checkinDate.isBefore(dayjs(endDate).endOf('day'));
      });
    }

    // Sort by checkin date (most recent first)
    return _.orderBy(filtered, ['checkinDate'], ['desc']);
  }, [bookings, statusFilter, dateRange]);

  

  const handleCreateReview = (bookingId: string, homestayId: string) => {
    setReviewHomestayId(homestayId);
    setReviewBookingId(bookingId);
    setOpenReviewModal(true);
  };

  const handleViewDetailClose = () => {
    setReviewHomestayId(null);
    setOpenViewDetail(false);
    setDataInit(null);
  };

  const handleReviewModalClose = (open: boolean) => {
    setOpenReviewModal(open);
    if (!open) {
      setReviewBookingId(null);
      setReviewHomestayId(null);
    }
  };

  const handleReviewSuccess = () => {
    // Optionally refresh booking data or show success message
    fetchBookingHistory();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates: RangeValue) => {
    setDateRange(dates);
  };

  if (!userId) {
    return (
      <div className="booking-history-container">
        <Alert
          message="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để xem lịch sử đặt chỗ."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="modern-booking-history" style={{ marginTop: 200 }}>
      {/* Filters Section */}
      <div className="filters-container">
        {/* Breadcrumb */}
        <div className={'breadcrumb-container'}>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/">
                    Home
                  </Link>
                ),
              },
              {
                title: 'Lịch sử đặt phòng',
              },
            ]}
          />
        </div>
        <Card className="filters-card">
          <div className="filters-header">
            <Title level={4} className="filters-title">
              <FilterOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              Bộ lọc & Sắp xếp
            </Title>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div className="filter-group">
                <Text strong className="filter-label">Trạng thái</Text>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="filter-select"
                  placeholder="Chọn trạng thái"
                  suffixIcon={<SortAscendingOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                  style={{ width: 180 }}
                >
                  <Option value="all">
                    <Space>
                      <div className="status-dot all"></div>
                      Tất cả
                    </Space>
                  </Option>
                  <Option value="completed">
                    <Space>
                      <div className="status-dot completed"></div>
                      Hoàn thành
                    </Space>
                  </Option>
                  <Option value="booked">
                    <Space>
                      <div className="status-dot booked"></div>
                      Đã đặt
                    </Space>
                  </Option>
                  <Option value="payment_failed">
                    <Space>
                      <div className="status-dot payment_failed"></div>
                      Thanh toán thất bại
                    </Space>
                  </Option>
                  <Option value="cancelled">
                    <Space>
                      <div className="status-dot cancelled"></div>
                      Đã hủy
                    </Space>
                  </Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={10}>
              <div className="filter-group">
                <Text strong className="filter-label">Khoảng thời gian</Text>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                  className="filter-date-picker"
                />
              </div>
            </Col>

            <Col xs={24} md={6}>
              <div className="filter-actions">
                <Text strong className="filter-label">Kết quả</Text>
                <div className="results-info">
                  <Badge
                    count={filteredAndSortedBookings.length}
                    style={{ backgroundColor: '#ff385c' }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-state">
            <Card className="loading-card">
              <div className="loading-content">
                <Spin size="large" />
                <Title level={3}>Đang tải chuyến đi của bạn...</Title>
                <Text>Vui lòng chờ trong giây lát</Text>
              </div>
            </Card>
          </div>
        ) : error ? (
          <div className="error-state">
            <Card className="error-card">
              <Alert
                message="Không thể tải dữ liệu"
                description={error}
                type="error"
                showIcon
                action={
                  <Button type="primary" onClick={fetchBookingHistory}>
                    Thử lại
                  </Button>
                }
              />
            </Card>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="empty-state">
            <Card className="empty-card">
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 120 }}
                description={
                  <div className="empty-description">
                    <Title level={3}>
                      {bookings.length === 0
                        ? "Chưa có chuyến đi nào"
                        : "Không tìm thấy kết quả"
                      }
                    </Title>
                    <Text>
                      {bookings.length === 0
                        ? "Hãy bắt đầu khám phá và đặt chỗ homestay đầu tiên của bạn!"
                        : "Thử điều chỉnh bộ lọc để xem thêm kết quả"
                      }
                    </Text>
                  </div>
                }
              >
                {bookings.length === 0 && (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate('/')}
                    className="explore-button"
                  >
                    Khám phá homestay
                  </Button>
                )}
              </Empty>
            </Card>
          </div>
        ) : (
          <div className="bookings-table">
            <Card>
              <Table<IBooking>
                columns={columns}
                dataSource={filteredAndSortedBookings}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} chuyến đi`,
                }}
                scroll={{ x: 800 }}
                size="middle"
              />
            </Card>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      <ViewDetailBooking
        open={openViewDetail}
        onClose={handleViewDetailClose}
        dataInit={dataInit}
      />

      {/* Review Modal */}
      <ReviewModal
        open={openReviewModal}
        onClose={handleReviewModalClose}
        bookingId={reviewBookingId}
        homestayId={reviewHomestayId}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default BookingHistory;
