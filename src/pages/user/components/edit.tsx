import React from 'react';
import { Card, Button, Form, Input, Select, Upload } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from '@/styles/userProfile.module.scss';
import { useEditProfile } from '../hooks/useEditProfile';
import { validateVietnamesePhoneNumber } from '@/config/utils';

const { Option } = Select;

const EditProfileUI: React.FC = () => {
  const {
    userData,
    form,
    loadingSave,
    dataLogo,
    phoneValue,
    phoneError,
    handlePhoneChange,
    handleSubmit,
    handleRemoveFile,
    beforeUpload,
    handleChange,
    handleUploadFileLogo,
  } = useEditProfile();

  return (
    <div className={styles.profileContainer} style={{ marginTop: 100 }}>
      <div className={styles.profileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/users/profile">
            <Button type="text" icon={<ArrowLeftOutlined style={{}} />} size="large">
              Quay lại
            </Button>
          </Link>
          <h1 className={styles.headerTitle}>Chỉnh sửa hồ sơ</h1>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Card className={styles.userInfoCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              fullName: userData.fullName,
              userName: userData.userName,
              phoneNumber: userData.phoneNumber,
              gender: userData.gender,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  className="avatar-uploader"
                  maxCount={1}
                  multiple={false}
                  customRequest={handleUploadFileLogo}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  onRemove={(file) => handleRemoveFile(file)}
                  showUploadList={false}
                >
                  <img
                    src={dataLogo.length > 0 ? dataLogo[0].fileName : userData.avatar}
                    alt="avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </Upload>
              </div>
              <div style={{ color: '#717171', fontSize: '14px' }}>
                Nhấp để thay đổi ảnh đại diện
              </div>
            </div>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input size="large" placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Tên đăng nhập"
              name="userName"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input size="large" placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Số điện thoại không được để trống!' },
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
                placeholder="Nhập số điện thoại"
                maxLength={12}
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select size="large" placeholder="Chọn giới tính">
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loadingSave}
                icon={!loadingSave && <SaveOutlined style={{}} />}
                style={{
                  background: '#ff385c',
                  borderColor: '#ff385c',
                  height: '48px',
                  padding: '0 32px',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                {loadingSave ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfileUI;