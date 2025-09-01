import { useState } from 'react';
import { Row, Col, Card, Typography, InputNumber, Button, Select, Image, Rate, Descriptions, DatePicker, notification, Spin, Input, Breadcrumb } from 'antd';
import styles from '@/styles/checkout.module.scss';
import { Link, useLocation } from 'react-router-dom';
import dayjs from 'dayjs'
import { callCreateBooking } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { IBackendError } from '@/types/backend';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CheckoutSection = () => {
    const [note, setNote] = useState<string>('');
    let location = useLocation();
    const { homestayId, homestayName, userId, costTotal, checkin, checkout, guests, datebetween, hoemstayImage, averageRating, availabilities } = location.state || {};
    const bookedMainForm = [checkin, checkout];
    const [bookingLoading, setBookingLoading] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');
    const [startDate, setStartDate] = useState<string | null>(bookedMainForm[0] ? dayjs(bookedMainForm[0]).format('YYYY-MM-DD') : null);
    const [endDate, setEndDate] = useState<string | null>(bookedMainForm[1] ? dayjs(bookedMainForm[1]).format('YYYY-MM-DD') : null);


    const handlePaymentMethodChange = (value: string) => {
        setPaymentMethod(value);
    };

    const handlePayment = async () => {
        try {
            setBookingLoading(true);
            const res = await callCreateBooking(userId, homestayId, String(startDate), String(endDate), guests.toString(), note);

            if (isSuccessResponse(res) && res?.status === 201 && res.data?.payment?.vnpUrl) {
                window.location.assign(res.data.payment.vnpUrl);
            }
        } catch (error) {
            const errMes = error as IBackendError;
            notification.error({
                message: 'Có lỗi xảy ra',
                description: errMes.message
            });
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className={styles.checkoutSection} style={{ marginTop: 130 }}>
            {/* Breadcrumb */}
            <div className={styles['breadcrumb-container']}>
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
                            title: (
                                <Link to={`/homestay/detail?id=${homestayId}`}>
                                    Chi tiết homestay
                                </Link>
                            ),
                        },
                        {
                            title: 'Checkout',
                        },
                    ]}
                />
            </div>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={12}>
                    <Card>
                        <Title level={3}>Xác nhận và thanh toán</Title>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="1. Thêm phương thức thanh toán">
                                <Select value={paymentMethod} onChange={handlePaymentMethodChange} style={{ width: '200px' }}>
                                    <Option value="vnpay">vnpay</Option>
                                    <Option value="momo">momo</Option>
                                </Select>
                            </Descriptions.Item>
                            <Descriptions.Item label="2. Ghi chú cho homestay">
                                <Paragraph>
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Bạn muốn nhắn gì cho homestay? (ví dụ: giờ đến, yêu cầu đặc biệt...)"
                                        style={{ width: '100%' }}
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </Paragraph>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Descriptions title="Chi tiết giá" column={1} bordered style={{ marginTop: '20px' }}>
                            <Descriptions.Item label="Ngày nhận phòng">
                                <Text>{startDate ? dayjs(startDate).format('DD/MM/YYYY') : '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày trả phòng">
                                <Text>{endDate ? dayjs(endDate).format('DD/MM/YYYY') : '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách">
                                <InputNumber
                                    value={guests}
                                    min={guests}
                                    disabled
                                    style={{ width: '100px' }}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label={datebetween + " đêm"}>
                                <Text>{costTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thay đổi">
                                <Text type="secondary">Chưa có</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng VND">
                                <Text strong>{costTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</Text>
                            </Descriptions.Item>
                        </Descriptions>
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
                                onClick={handlePayment}
                                block
                                disabled={!startDate || !endDate}
                            >
                                {bookingLoading ? <Spin size="small" /> : 'Thanh toán'}
                            </Button>
                        </Access>

                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CheckoutSection;
