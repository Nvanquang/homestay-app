import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, Avatar, Upload, message, notification } from 'antd';
import { ArrowLeftOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mockUserData } from '@/data/mockUserData';
import styles from '@/styles/userProfile.module.scss';
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import { callUploadSingleFile, IAvatar, callUpdateUser } from '@/config/api';
import { cleanPhoneNumber, getPhoneValidationErrorMessage, isSuccessResponse, validateVietnamesePhoneNumber } from '@/config/utils';
import { IBackendError, IUser } from '@/types/backend';

interface UploadRequestOption {
  file: string | RcFile | Blob;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onProgress?: (event: { percent: number }) => void;
}

const { Option } = Select;

const EditProfile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData as IUser || mockUserData;

  const [form] = Form.useForm();
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);
  const [dataLogo, setDataLogo] = useState<IAvatar[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [value, setValue] = useState<string>("");
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clean input using utility function
    const cleanValue = cleanPhoneNumber(value);

    setPhoneValue(cleanValue);

    // Validate using utility function
    if (cleanValue && !validateVietnamesePhoneNumber(cleanValue)) {
      setPhoneError(getPhoneValidationErrorMessage('vietnam'));
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoadingSave(true);
      
      if (!userData.id) {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không tìm thấy thông tin người dùng',
          duration: 3
        });
        return;
      }

      // Prepare update data
      const updateData = {
        fullName: values.fullName,
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        // Include avatar if it was updated
        ...(dataLogo.length > 0 && { avatar: dataLogo[0].fileName })
      };

      const response = await callUpdateUser(userData.id.toString(), updateData);

      if (isSuccessResponse(response)) {
        notification.success({
          message: 'Thành công',
          description: 'Hồ sơ đã được cập nhật thành công!',
          duration: 2
        });
        
        // Redirect to profile page
        navigate('/users/profile');
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
          duration: 3
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
        duration: 3
      });
    } finally {
      setLoadingSave(false);
    }
  };


  const handleRemoveFile = (file: UploadFile) => {
    setDataLogo([])
  }

  const handlePreview = async (file: UploadFile) => {
    if (!file.originFileObj) {
      setPreviewImage(file.url || '');
      setPreviewOpen(true);
      setPreviewTitle(file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : ''));
      return;
    }
    getBase64(file.originFileObj, (url: string) => {
      setPreviewImage(url);
      setPreviewOpen(true);
      setPreviewTitle(file.name || (file.url ? file.url.substring(file.url.lastIndexOf('/') + 1) : ''));
    });
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoadingUpload(true);
    }
    if (info.file.status === 'done') {
      setLoadingUpload(false);
    }
    if (info.file.status === 'error') {
      setLoadingUpload(false);
      message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
    }
  };

  const handleUploadFileLogo = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    const res = await callUploadSingleFile(file as RcFile, "avatar");
    if (res !== null) {
      // Tạo URL đầy đủ cho avatar từ fileName
      const avatarUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${res}`;
      console.log(avatarUrl);
      setDataLogo([{
        fileName: avatarUrl,
      }])

      // Gọi API update user để lưu avatar
      try {
        if (!userData.id) {
          throw new Error('User ID không tồn tại');
        }

        const updateRes = await callUpdateUser(userData.id.toString(), {
          avatar: avatarUrl
        });

        if (isSuccessResponse(updateRes)) {
          notification.success({
            message: 'Thành công',
            description: 'Cập nhật avatar thành công!',
            duration: 2
          });
        } else {
          notification.error({
            message: 'Có lỗi xảy ra',
            description: 'Không thể lưu avatar vào hệ thống',
            duration: 2
          });
        }
      } catch (error) {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không thể cập nhật avatar',
          duration: 2
        });
      }

      if (onSuccess) onSuccess('ok')
    } else {
      if (onError) {
        const resErr = res as IBackendError;
        notification.error({
          message: 'Có lỗi xảy ra',
          description: resErr.detail,
          duration: 2
        });
      }
    }
  };
  return (
    <div className={styles.profileContainer} style={{ marginTop: 100 }}>
      <div className={styles.profileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/users/profile">
            <Button type="text" icon={<ArrowLeftOutlined style={{}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} size="large">
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
            {/* Avatar Upload */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={120}
                  src={dataLogo.length > 0 ? dataLogo[0].fileName : userData.avatar}
                  style={{ marginBottom: '16px' }}
                />
                <Upload
                  maxCount={1}
                  multiple={false}
                  customRequest={handleUploadFileLogo}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  onRemove={(file) => handleRemoveFile(file)}
                  onPreview={handlePreview}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined style={{}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                    size="large"
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '-8px',
                      background: '#ff385c',
                      borderColor: '#ff385c'
                    }}
                  />
                </Upload>
              </div>
              <div style={{ color: '#717171', fontSize: '14px' }}>
                Nhấp để thay đổi ảnh đại diện
              </div>
            </div>

            {/* Form Fields */}
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
                  }
                }
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

            {/* Submit Button */}
            <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loadingSave}
                icon={!loadingSave && <SaveOutlined style={{}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                style={{
                  background: '#ff385c',
                  borderColor: '#ff385c',
                  height: '48px',
                  padding: '0 32px',
                  borderRadius: '8px',
                  fontWeight: '600'
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

export default EditProfile;
