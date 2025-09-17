import React from 'react';
import { Drawer, Descriptions } from 'antd';
import { IBooking } from '@/types/backend';
import dayjs from 'dayjs';

interface ViewDetailBookingProps {
  open: boolean;
  onClose: () => void;
  dataInit: IBooking | null;
}

const ViewDetailBooking: React.FC<ViewDetailBookingProps> = ({ open, onClose, dataInit }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Drawer
      title="Chi tiết đặt phòng"
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      maskClosable={false}
    >
      <Descriptions title="" bordered column={2} layout="vertical">
        <Descriptions.Item label="Tên homestay">{dataInit?.homestay?.name}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{dataInit?.homestay?.address}</Descriptions.Item>
        <Descriptions.Item label="Khách hàng">{dataInit?.user?.fullName}</Descriptions.Item>
        <Descriptions.Item label="Ngày nhận phòng">
          {dataInit?.checkinDate ? dayjs(dataInit.checkinDate).format('DD/MM/YYYY') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày trả phòng">
          {dataInit?.checkoutDate ? dayjs(dataInit.checkoutDate).format('DD/MM/YYYY') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng khách">{dataInit?.guests ?? 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Giảm giá">
          {dataInit?.discount ? formatCurrency(dataInit.discount) : 'Không có'}
        </Descriptions.Item>
        <Descriptions.Item label="Tạm tính">
          {dataInit?.subtotal ? formatCurrency(dataInit.subtotal) : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {dataInit?.totalAmount ? formatCurrency(dataInit.totalAmount) : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{dataInit?.note || 'Không có ghi chú'}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default ViewDetailBooking;