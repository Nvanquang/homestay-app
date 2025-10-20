import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callGetAvailabilities, callGetReviewsByHomestay } from '@/config/api';
import { IHomestay, IReview } from '@/types/backend';
import { formatCurrency, isSuccessResponse } from '@/config/utils';
import queryString from 'query-string';
import { message } from 'antd';
import { useAppSelector } from '@/redux/hooks';

interface IProps {
    homestayDetail?: IHomestay | null;
}

export const useHomestayDetail = ({ homestayDetail }: IProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id"); // homestay id
    const userId = useAppSelector(state => state.account.user.id);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [dateWarning, setDateWarning] = useState<string | null>(null);
    const [costWarning, setCostWarning] = useState<string | null>(null);
    const [guests, setGuests] = useState(2);
    const [dates, setDates] = useState<any>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [costTotal, setCostTotal] = useState<number>(0);
    const [datebetween, setDateBetween] = useState<number>(0);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [reviews, setReviews] = useState<IReview[]>([]);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);

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
            setBookedDates(res.data.result.map((item: any) => item.date));
        }
    };

    const calculateDaysBetween = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end.getTime() - start.getTime();
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        return diffInDays;
    };

    const calculateBookingCost = async (start: string, end: string) => {
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
            const startDateObj = new Date(start);
            const endDateObj = new Date(end);
            const availList = res.data.result.filter((item: any) => {
                const itemDate = new Date(item.date);
                return itemDate >= startDateObj && itemDate < endDateObj;
            });
            setAvailabilities(res.data.result);
            const total = availList.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
            setCostTotal(total);
            setDateBetween(calculateDaysBetween(start, end));

            if (total === 0) {
                setCostWarning('Chưa có dữ liệu đặt phòng!');
            } else {
                setCostWarning(null);
            }
        } else {
            setCostTotal(0);
            setCostWarning('Chưa có dữ liệu đặt phòng!');
        }
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
                availabilities: availabilities,
            },
        });
    };

    const handleDateChange = (values: any) => {
        if (values && values[0] && values[1] && values.length === 2) {
            const start = values[0];
            const end = values[1];
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
    };

    const disabledDate = (current: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDate = current.toDate();
        currentDate.setHours(0, 0, 0, 0);
        return currentDate <= today || bookedDates.includes(current.format('YYYY-MM-DD'));
    };

    // review
    useEffect(() => {
        fetchReviews();
    }, [current, pageSize, homestayDetail]);

    const fetchReviews = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;

        const res = await callGetReviewsByHomestay(String(homestayDetail?.id), query);
        if (isSuccessResponse(res) && res?.data) {
            setReviews(res.data.result);
        }
        setIsLoading(false)
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    return {
        homestayDetail,
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
        reviews,
        handleOnchangePage,
        current,
        pageSize,
    };
};