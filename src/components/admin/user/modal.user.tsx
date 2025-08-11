import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callGetRoles, callUpdateUser } from "@/config/api";
import { IBackendError, IUser } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";
import { isSuccessResponse } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IRoleSelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [roles, setRoles] = useState<IRoleSelect[]>([]);

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit.role) {
                setRoles([
                    {
                        label: dataInit.role?.name,
                        value: dataInit.role?.id,
                        key: dataInit.role?.id,
                    }
                ])
            }
            form.setFieldsValue({
                ...dataInit,
                role: { label: dataInit.role?.name, value: dataInit.role?.id },
            })
        }

    }, [dataInit]);

    const submitUser = async (valuesForm: any) => {
        const { userName, password, email, phoneNumber, verified, fullName, gender, role } = valuesForm;
        if (dataInit?.id) {
            //update
            const user = {
                gender,
                userName,
                fullName,
                phoneNumber,
                verified,
                roleId: role.id,
            }

            const res = await callUpdateUser(dataInit.id, user);
            if (isSuccessResponse(res) && res.data) {
                message.success("Cập nhật user thành công");
                handleReset();
                reloadTable();
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: errRes.detail
                });
            }
        } else {
            //create
            const user = {
                userName,
                password,
                email,
                phoneNumber,
                fullName,
                gender,
                roleId: role.value,
            }
            const res = await callCreateUser(user);
            if (isSuccessResponse(res) && res.data) {
                message.success("Thêm mới user thành công");
                handleReset();
                reloadTable();
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: errRes.detail
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setRoles([]);
        setOpenModal(false);
    }

    async function fetchRoleList(name: string): Promise<IRoleSelect[]> {
        const res = await callGetRoles(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật User" : "Tạo mới User"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitUser}
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    role: { label: dataInit.role?.name, value: dataInit.role?.id },
                    // company: { label: dataInit.company?.name, value: dataInit.company?.id },
                } : {}}
            >
                <Row gutter={16}>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Username"
                            name="userName"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập username"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Số điện thoại"
                            name="phoneNumber"
                            initialValue="+84"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số điện thoại"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataInit?.id ? true : false}
                            label="Password"
                            name="password"
                            rules={[{ required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập password"
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
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
                        <ProForm.Item
                            name="role"
                            label="Vai trò"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}

                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={roles}
                                value={roles}
                                placeholder="Chọn công vai trò"
                                fetchOptions={fetchRoleList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRoles(newValue as IRoleSelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
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
            </ModalForm >
        </>
    )
}

export default ModalUser;
