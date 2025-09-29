import { useState } from 'react';
import { Form, message, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import { 
  isSuccessResponse, 
  validateVietnamesePhoneNumber, 
  cleanPhoneNumber, 
  getPhoneValidationErrorMessage,
  formatPhoneForBackend 
} from '@/config/utils';
import { IBackendError, IUser } from '@/types/backend';

export const useRegister = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = cleanPhoneNumber(value);
    setPhoneValue(cleanValue);
    form.setFieldValue('phoneNumber', cleanValue);
    if (cleanValue && !validateVietnamesePhoneNumber(cleanValue)) {
      setPhoneError(getPhoneValidationErrorMessage('vietnam'));
    } else {
      setPhoneError('');
    }
  };

  const onFinish = async (values: IUser) => {
    const { userName, password, confirmPassword, email, phoneNumber, fullName, gender } = values;

    // Additional validation
    if (!userName || userName.length < 3 || /[^a-zA-Z0-9]/.test(userName)) {
      notification.error({
        message: 'Tên đăng nhập không hợp lệ',
        description: 'Tên đăng nhập phải dài ít nhất 3 ký tự và không chứa ký tự đặc biệt.',
        duration: 5,
      });
      return;
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      notification.error({
        message: 'Mật khẩu không hợp lệ',
        description: 'Mật khẩu phải dài ít nhất 8 ký tự, chứa chữ hoa, số và ký tự đặc biệt.',
        duration: 5,
      });
      return;
    }

    if (password !== confirmPassword) {
      notification.error({
        message: 'Mật khẩu không khớp',
        description: 'Mật khẩu xác nhận không khớp với mật khẩu.',
        duration: 5,
      });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notification.error({
        message: 'Email không hợp lệ',
        description: 'Vui lòng nhập email hợp lệ.',
        duration: 5,
      });
      return;
    }

    if (!phoneNumber || !validateVietnamesePhoneNumber(phoneNumber)) {
      notification.error({
        message: 'Số điện thoại không hợp lệ',
        description: getPhoneValidationErrorMessage('vietnam'),
        duration: 5,
      });
      return;
    }

    if (!fullName || fullName.length < 2) {
      notification.error({
        message: 'Họ và tên không hợp lệ',
        description: 'Họ và tên phải dài ít nhất 2 ký tự.',
        duration: 5,
      });
      return;
    }

    if (!gender) {
      notification.error({
        message: 'Giới tính không hợp lệ',
        description: 'Vui lòng chọn giới tính.',
        duration: 5,
      });
      return;
    }

    setIsSubmit(true);
    try {
      const res = await callRegister(
        userName,
        password as string,
        confirmPassword as string,
        email,
        formatPhoneForBackend(phoneNumber),
        fullName,
        gender
      );
      setIsSubmit(false);

      if (isSuccessResponse(res) && res?.status === 200) {
        message.success('Đăng ký tài khoản thành công!');
        localStorage.setItem('verifyEmail', email);
        navigate('/verify-otp');
      } else {
        const errRes = res as IBackendError;
        notification.error({
          message: 'Có lỗi xảy ra',
          description: errRes.detail || 'Không thể đăng ký tài khoản.',
          duration: 5,
        });
      }
    } catch (error) {
      setIsSubmit(false);
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể đăng ký tài khoản. Vui lòng thử lại.',
        duration: 5,
      });
    }
  };

  return {
    form,
    isSubmit,
    phoneValue,
    phoneError,
    handlePhoneChange,
    onFinish,
  };
};