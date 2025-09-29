import { useState, useEffect } from 'react';
import { Form, message, notification } from 'antd';
import { callCreateUser, callGetRoles, callUpdateUser } from '@/config/api';
import { 
  isSuccessResponse, 
  validateVietnamesePhoneNumber, 
  cleanPhoneNumber, 
  getPhoneValidationErrorMessage,
  formatPhoneForBackend 
} from '@/config/utils';
import { IBackendError, IUser } from '@/types/backend';

export interface IRoleSelect {
  label: string;
  value: string;
  key?: string;
}

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: IUser | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

export const useModalUser = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }: IProps) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<IRoleSelect[]>([]);
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

  useEffect(() => {
    if (openModal && dataInit?.id) {
      if (dataInit.phoneNumber) {
        setPhoneValue(dataInit.phoneNumber);
        setPhoneError('');
      }
      if (dataInit.role) {
        const roleData = [{
          label: dataInit.role.name,
          value: dataInit.role.id,
          key: dataInit.role.id,
        }];
        setRoles(roleData);
        form.setFieldsValue({
          ...dataInit,
          role: roleData[0],
        });
      } else {
        form.setFieldsValue({
          ...dataInit,
          role: undefined,
        });
      }
    } else {
      form.resetFields();
      setPhoneValue('');
      setPhoneError('');
      setRoles([]);
    }
  }, [openModal, dataInit, form]);

  const handleReset = () => {
    form.resetFields();
    setDataInit(null);
    setRoles([]);
    setPhoneValue('');
    setPhoneError('');
    setOpenModal(false);
  };

  const fetchRoleList = async (name: string): Promise<IRoleSelect[]> => {
    const res = await callGetRoles(`page=1&size=100&name=/${name}/i`);
    if (res && res.data) {
      return res.data.result.map(item => ({
        label: item.name as string,
        value: item.id as string,
        key: item.id as string,
      }));
    }
    return [];
  };

  const submitUser = async (valuesForm: any) => {
    const { userName, password, email, phoneNumber, verified, fullName, gender, role } = valuesForm;

    // Additional validation
    if (!dataInit?.id && (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password))) {
      notification.error({
        message: 'Mật khẩu không hợp lệ',
        description: 'Mật khẩu phải dài ít nhất 8 ký tự, chứa chữ hoa, số và ký tự đặc biệt.',
        duration: 2,
      });
      return;
    }

    if (!userName || userName.length < 3 || /[^a-zA-Z0-9]/.test(userName)) {
      notification.error({
        message: 'Tên đăng nhập không hợp lệ',
        description: 'Tên đăng nhập phải dài ít nhất 3 ký tự và không chứa ký tự đặc biệt.',
        duration: 2,
      });
      return;
    }

    if (!role || !role.value) {
      notification.error({
        message: 'Vai trò không hợp lệ',
        description: 'Vui lòng chọn một vai trò.',
        duration: 2,
      });
      return;
    }

    const user = {
      gender,
      userName,
      fullName,
      email,
      phoneNumber: formatPhoneForBackend(phoneNumber),
      verified,
      roleId: role.value,
      ...(dataInit?.id ? {} : { password }),
    };

    try {
      const res = dataInit?.id
        ? await callUpdateUser(dataInit.id, user)
        : await callCreateUser(user as any);

      if (isSuccessResponse(res) && res.data) {
        message.success(dataInit?.id ? 'Cập nhật user thành công' : 'Thêm mới user thành công');
        handleReset();
        reloadTable();
      } else {
        const errRes = res as IBackendError;
        notification.error({
          message: 'Có lỗi xảy ra',
          description: errRes.detail || 'Không thể lưu user.',
          duration: 2,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể lưu user. Vui lòng thử lại.',
        duration: 2,
      });
    }
  };

  return {
    form,
    roles,
    phoneValue,
    phoneError,
    setRoles,
    setPhoneValue,
    setPhoneError,
    handlePhoneChange,
    handleReset,
    fetchRoleList,
    submitUser,
  };
};