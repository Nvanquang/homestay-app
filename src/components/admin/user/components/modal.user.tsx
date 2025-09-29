import { ModalForm, ProFormText, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Col, Form, Row, Input } from 'antd';
import { isMobile } from 'react-device-detect';
import { useModalUser } from '../hooks/useModalUser';
import { DebounceSelect } from './debouce.select';
import { IRoleSelect } from '../hooks/useModalUser';
import { validateVietnamesePhoneNumber } from '@/config/utils';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: any | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

const ModalUser = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }: IProps) => {
  const {
    form,
    roles,
    phoneValue,
    phoneError,
    setRoles,
    handlePhoneChange,
    handleReset,
    fetchRoleList,
    submitUser,
  } = useModalUser({ openModal, setOpenModal, dataInit, setDataInit, reloadTable });

  return (
    <ModalForm
      title={<>{dataInit?.id ? 'Cập nhật User' : 'Tạo mới User'}</>}
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
      onFinish={submitUser}
      initialValues={dataInit?.id ? {
        ...dataInit,
        role: dataInit.role ? { label: dataInit.role.name, value: dataInit.role.id } : undefined,
      } : {}}
    >
      <Row gutter={16}>
        <Col lg={6} md={6} sm={24} xs={24}>
          <ProFormText
            label="Username"
            name="userName"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 3, message: 'Tên đăng nhập phải dài ít nhất 3 ký tự' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên đăng nhập không được chứa ký tự đặc biệt' },
            ]}
            placeholder="Nhập username"
          />
        </Col>
        <Col lg={6} md={6} sm={24} xs={24}>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
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
          <ProFormText.Password
            disabled={dataInit?.id ? true : false}
            label="Password"
            name="password"
            rules={[
              { required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' },
              {
                validator: (_, value) => {
                  if (dataInit?.id || !value) return Promise.resolve();
                  if (value.length < 8) {
                    return Promise.reject(new Error('Mật khẩu phải dài ít nhất 8 ký tự'));
                  }
                  if (!/[A-Z]/.test(value)) {
                    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một chữ hoa'));
                  }
                  if (!/[0-9]/.test(value)) {
                    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một số'));
                  }
                  if (!/[!@#$%^&*]/.test(value)) {
                    return Promise.reject(new Error('Mật khẩu phải chứa ít nhất một ký tự đặc biệt'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            placeholder="Nhập password"
          />
        </Col>
        <Col lg={12} md={12} sm={24} xs={24}>
          <ProFormText
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { type: 'email', message: 'Vui lòng nhập email hợp lệ' },
            ]}
            placeholder="Nhập email"
          />
        </Col>
        <Col lg={12} md={12} sm={24} xs={24}>
          <ProFormText
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
            placeholder="Nhập họ và tên"
          />
        </Col>
        <Col lg={6} md={6} sm={24} xs={24}>
          <ProFormSelect
            name="gender"
            label="Giới Tính"
            valueEnum={{
              MALE: 'Nam',
              FEMALE: 'Nữ',
              OTHER: 'Khác',
            }}
            placeholder="Chọn giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          />
        </Col>
        <Col lg={6} md={6} sm={24} xs={24}>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <DebounceSelect
              allowClear={false}
              showSearch
              value={roles[0]}
              placeholder="Chọn vai trò"
              fetchOptions={fetchRoleList}
              onChange={(newValue: IRoleSelect | IRoleSelect[]) => {
                if (newValue) {
                  setRoles([newValue as IRoleSelect]);
                  form.setFieldValue('role', newValue);
                } else {
                  setRoles([]);
                  form.setFieldValue('role', undefined);
                }
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col lg={6} md={6} sm={24} xs={24}>
          <ProFormSwitch
            label="Trạng thái xác thực"
            name="verified"
            checkedChildren="ACTIVE"
            unCheckedChildren="INACTIVE"
            initialValue={true}
            fieldProps={{
              defaultChecked: true,
            }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default ModalUser;