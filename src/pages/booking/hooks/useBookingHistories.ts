import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { callGetBookingHistory } from '@/config/api';
import { IBackendError, IBooking } from '@/types/backend';
import { isSuccessResponse } from '@/config/utils';
import { notification } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import type { RangePickerProps } from 'antd/es/date-picker';

type RangeValue = RangePickerProps['value'];

export const useBookingHistories = () => {
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

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking =>
        booking.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(booking => {
        const checkinDate = dayjs(booking.checkinDate);
        return checkinDate.isAfter(dayjs(startDate).startOf('day')) &&
          checkinDate.isBefore(dayjs(endDate).endOf('day'));
      });
    }

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
    fetchBookingHistory();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates: RangeValue) => {
    setDateRange(dates);
  };

  return {
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
    handleCreateReview, // Thêm để sử dụng trong columns của UI
  };
};