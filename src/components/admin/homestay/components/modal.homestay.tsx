import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Col, Form, Row, Upload, Modal, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import { useModalHomestay } from '../hooks/useModalHomestay';
import { validateVietnamesePhoneNumber } from '@/config/utils';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: any | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

const ModalHomestay = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }: IProps) => {
  const {
    form,
    amenities,
    fileList,
    previewOpen,
    previewImage,
    phoneValue,
    phoneError,
    setFileList,
    setPreviewOpen,
    setPreviewImage,
    handlePhoneChange,
    handleReset,
    beforeUpload,
    handleFileChange,
    handlePreview,
    submitHomestay,
  } = useModalHomestay({ openModal, setOpenModal, dataInit, setDataInit, reloadTable });

  return (
    <>
      <ModalForm
        title={<>{dataInit?.id ? 'Cập nhật Homestay' : 'Tạo mới Homestay'}</>}
        open={openModal}
        modalProps={{
          onCancel: handleReset,
          afterClose: handleReset,
          destroyOnClose: true,
          width: isMobile ? '100%' : 900,
          keyboard: false,
          maskClosable: false,
          okText: <>{dataInit?.id ? 'Cập nhật' : 'Tạo mới'}</>,
          cancelText: 'Hủy',
        }}
        scrollToFirstError
        preserve={false}
        form={form}
        onFinish={submitHomestay}
      >
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label="Tên Homestay"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên' },
                { min: 3, message: 'Tên homestay phải dài ít nhất 3 ký tự' },
              ]}
              placeholder="Nhập tên homestay"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label="Địa chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ' },
                { min: 5, message: 'Địa chỉ phải dài ít nhất 5 ký tự' },
              ]}
              placeholder="Nhập địa chỉ"
            />
          </Col>
          <Col lg={24} md={24} sm={24} xs={24}>
            <ProFormTextArea
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải dài ít nhất 10 ký tự' },
              ]}
              placeholder="Nhập mô tả"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormSelect
              name="amenities"
              label="Tiện ích"
              mode="multiple"
              options={amenities}
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tiện ích' }]}
              placeholder="Chọn tiện ích"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormDigit
              name="guests"
              label="Số khách tối đa"
              rules={[
                { required: true, message: 'Vui lòng nhập số khách' },
                { type: 'number', min: 1, message: 'Số khách tối đa phải lớn hơn 0' },
              ]}
              placeholder="Nhập số khách"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                {
                  validator: (_, value) => {
                    if (!value || validateVietnamesePhoneNumber(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Số điện thoại không hợp lệ'));
                  },
                },
              ]}
              validateStatus={phoneError ? 'error' : ''}
              help={phoneError}
            >
              <Input
                value={phoneValue}
                onChange={handlePhoneChange}
                placeholder="Nhập số điện thoại (0xxxxxxxxx hoặc +84xxxxxxxxx)"
                maxLength={12}
              />
            </Form.Item>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormSelect
              name="status"
              label="Trạng thái"
              valueEnum={{
                INACTIVE: 'INACTIVE',
                ACTIVE: 'ACTIVE',
                CLOSED: 'CLOSED',
              }}
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              placeholder="Chọn trạng thái"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              name="longitude"
              label="Kinh độ"
              rules={[
                { required: true, message: 'Vui lòng nhập kinh độ' },
                {
                  validator: (_, value) => {
                    if (!value || (isFinite(+value) && +value >= -180 && +value <= 180)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Kinh độ phải là số từ -180 đến 180'));
                  },
                },
              ]}
              placeholder="Nhập kinh độ"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              name="latitude"
              label="Vĩ độ"
              rules={[
                { required: true, message: 'Vui lòng nhập vĩ độ' },
                {
                  validator: (_, value) => {
                    if (!value || (isFinite(+value) && +value >= -90 && +value <= 90)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Vĩ độ phải là số từ -90 đến 90'));
                  },
                },
              ]}
              placeholder="Nhập vĩ độ"
            />
          </Col>
          <Col span={24}>
            <Form.Item
              label="Ảnh Homestay (JPG, JPEG, PNG) - Tối đa 5 ảnh"
              rules={[{ required: true, message: 'Vui lòng upload ít nhất một ảnh' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                onPreview={handlePreview}
                beforeUpload={beforeUpload}
                multiple
              >
                {fileList.length >= 5 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
      <Modal
        open={previewOpen}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={isMobile ? '100%' : 600}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ModalHomestay;