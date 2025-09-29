import { useState } from 'react';
import { Form, message, notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { callUploadSingleFile, IAvatar, callUpdateUser } from '@/config/api';
import { cleanPhoneNumber, getPhoneValidationErrorMessage, isSuccessResponse, mockUserData, validateVietnamesePhoneNumber } from '@/config/utils';
import { IBackendError, IUser } from '@/types/backend';
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload/interface';

interface UploadRequestOption {
  file: string | RcFile | Blob;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onProgress?: (event: { percent: number }) => void;
}

export const useEditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData as IUser || mockUserData;

  const [form] = Form.useForm();
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);
  const [dataLogo, setDataLogo] = useState<IAvatar[]>([]);
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = cleanPhoneNumber(value);
    setPhoneValue(cleanValue);
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
          duration: 3,
        });
        return;
      }

      const updateData = {
        fullName: values.fullName,
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        ...(dataLogo.length > 0 && { avatar: dataLogo[0].fileName }),
      };

      const response = await callUpdateUser(userData.id.toString(), updateData);
      if (isSuccessResponse(response)) {
        notification.success({
          message: 'Thành công',
          description: 'Hồ sơ đã được cập nhật thành công!',
          duration: 2,
        });
        navigate('/users/profile');
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
        duration: 3,
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const handleRemoveFile = (file: UploadFile) => {
    setDataLogo([]);
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
      message.error(info?.file?.error?.event?.message ?? 'Đã có lỗi xảy ra khi upload file.');
    }
  };

  const handleUploadFileLogo = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    const res = await callUploadSingleFile(file as RcFile, 'avatar');
    if (res !== null) {
      const avatarUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${res}`;
      setDataLogo([{ fileName: avatarUrl }]);
      try {
        if (!userData.id) {
          throw new Error('User ID không tồn tại');
        }
        const updateRes = await callUpdateUser(userData.id.toString(), { avatar: avatarUrl });
        if (isSuccessResponse(updateRes)) {
          notification.success({
            message: 'Thành công',
            description: 'Cập nhật avatar thành công!',
            duration: 2,
          });
        } else {
          notification.error({
            message: 'Có lỗi xảy ra',
            description: 'Không thể lưu avatar vào hệ thống',
            duration: 2,
          });
        }
      } catch (error) {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: 'Không thể cập nhật avatar',
          duration: 2,
        });
      }
      if (onSuccess) onSuccess('ok');
    } else {
      if (onError) {
        const resErr = res as IBackendError;
        notification.error({
          message: 'Có lỗi xảy ra',
          description: resErr.detail,
          duration: 2,
        });
      }
    }
  };

  return {
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
  };
};