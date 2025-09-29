import React from 'react';
import {
  Card, Table, Button, Typography, Alert, Empty, Row, Col, Select, DatePicker, Space, Badge, Breadcrumb, Tag, Tooltip, Spin,
} from 'antd';
import { FilterOutlined, SortAscendingOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useBookingHistories } from '../hooks/useBookingHistories';
import { IBooking } from '@/types/backend';
import { convertSlug, formatCurrency, getStatusConfig } from '@/config/utils';
import ViewDetailBooking from '@/components/booking/view.booking.histories';
import ReviewModal from '@/components/booking/review.modal';
import { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import '@/styles/bookingHistory.scss';

const { Title, Text: AntText } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingHistoryPage: React.FC = () => {
  const {
    userId,
    loading,
    error,
    filteredAndSortedBookings,
    statusFilter,
    dateRange,
    openViewDetail,
    dataInit,
    openReviewModal,
    reviewBookingId,
    reviewHomestayId,
    setDataInit,
    setOpenViewDetail,
    fetchBookingHistory,
    handleStatusFilterChange,
    handleDateRangeChange,
    handleViewDetailClose,
    handleReviewModalClose,
    handleReviewSuccess,
    navigate,
    handleCreateReview,
  } = useBookingHistories();

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
        <AntText strong style={{ color: 'red' }}>
          {formatCurrency(amount)}
        </AntText>
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
              icon={<EyeOutlined />}
              onClick={() => {
                handleViewDetailClose(); // Đóng trước để reset
                setTimeout(() => {
                  setDataInit(record);
                  setOpenViewDetail(true);
                }, 0);
              }}
            />
          </Tooltip>
          {(!record.isReviewed) ? (
            <Tooltip title="Đánh giá">
              <Button
                type="text"
                style={{ color: 'orange' }}
                icon={<StarOutlined />}
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
      <div className="filters-container">
        <div className={'breadcrumb-container'}>
          <Breadcrumb
            items={[
              {
                title: (
                  <a onClick={() => navigate('/')}>
                    Home
                  </a>
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
              <FilterOutlined />
              Bộ lọc & Sắp xếp
            </Title>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div className="filter-group">
                <Title level={5} className="filter-label">Trạng thái</Title>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="filter-select"
                  placeholder="Chọn trạng thái"
                  suffixIcon={<SortAscendingOutlined />}
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
                <Title level={5} className="filter-label">Khoảng thời gian</Title>
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
                <Title level={5} className="filter-label">Kết quả</Title>
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

      <div className="content-section">
        {loading ? (
          <div className="loading-state">
            <Card className="loading-card">
              <div className="loading-content">
                <Spin size="large" />
                <Title level={3}>Đang tải chuyến đi của bạn...</Title>
                <Title level={5}>Đang tải chuyến đi của bạn...</Title>
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
                      {filteredAndSortedBookings.length === 0
                        ? "Chưa có chuyến đi nào"
                        : "Không tìm thấy kết quả"
                      }
                    </Title>
                    <Title level={5}>
                      {filteredAndSortedBookings.length === 0
                        ? "Hãy bắt đầu khám phá và đặt chỗ homestay đầu tiên của bạn!"
                        : "Thử điều chỉnh bộ lọc để xem thêm kết quả"
                      }
                    </Title>
                  </div>
                }
              >
                {filteredAndSortedBookings.length === 0 && (
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
              <Table
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

      <ViewDetailBooking
        open={openViewDetail}
        onClose={handleViewDetailClose}
        dataInit={dataInit}
      />

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

export default BookingHistoryPage;