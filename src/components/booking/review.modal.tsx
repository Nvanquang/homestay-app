import React, { useState } from 'react';
import { Modal, Rate, Input, Button, Form, message, notification } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { IReview, IBooking } from '@/types/backend';
import { callCreateReview } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';

const { TextArea } = Input;

interface ReviewModalProps {
  open: boolean;
  onClose: (v: boolean) => void;
  bookingId: string | null;
  homestayId: string | null;
  onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, bookingId, homestayId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { rating: number; comment?: string }) => {
    if (!bookingId || !homestayId) return;

    // Defensive check: ensure comment is provided and not only whitespace
    if (!values.comment || !values.comment.trim()) {
      message.error('Vui lòng nhập nhận xét trước khi gửi.');
      return;
    }

    setLoading(true);
    try {
      const reviewData: IReview = {
        rating: values.rating,
        comment: values.comment || '',
        homestayId: homestayId,
        bookingId: bookingId,
      };

      const response = await callCreateReview(reviewData);
      
      if (isSuccessResponse(response)) {
        notification.success({
          message: 'Thành công',
          description: 'Đánh giá của bạn đã được gửi thành công!',
          duration: 3
        });
        form.resetFields();
        onClose(false);
        onSuccess?.();
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
          duration: 3
        });
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
        duration: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose(false);
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      maskClosable={false}
    >

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          rating: 5
        }}
      >
        <Form.Item
          label="Đánh giá của bạn"
          name="rating"
          rules={[
            { required: true, message: 'Vui lòng chọn số sao đánh giá!' }
          ]}
        >
          <Rate 
            style={{ fontSize: '24px' }}
            character={<StarOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Nhận xét"
          name="comment"
          rules={[
            { required: true, message: 'Vui lòng nhập nhận xét!' },
            { whitespace: true, message: 'Nội dung nhận xét không được chỉ có khoảng trắng!' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về homestay này..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button 
            onClick={handleCancel}
            style={{ marginRight: '8px' }}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: '#ff385c',
              borderColor: '#ff385c'
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewModal;
