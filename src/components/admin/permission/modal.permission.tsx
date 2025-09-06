import { ModalForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { callCreatePermission, callUpdatePermission } from "@/config/api";
import { IBackendError, IPermission } from "@/types/backend";
import { useEffect } from "react";
import { isSuccessResponse } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPermission | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalPermission = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue(dataInit)
        }
    }, [dataInit])

    const submitPermission = async (valuesForm: any) => {
        const { name, apiPath, method, module } = valuesForm;
        if (dataInit?.id) {
            //update
            const permission = {
                name,
                apiPath, method, module
            }

            const res = await callUpdatePermission(String(dataInit.id), permission);
            if (isSuccessResponse(res) && res.data) {
                message.success("Cập nhật permission thành công");
                handleReset();
                reloadTable();
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: errRes.detail,
                    duration: 2
                });
            }
        } else {
            //create
            const permission = {
                name,
                apiPath, method, module
            }
            const res = await callCreatePermission(permission);
            if (isSuccessResponse(res) && res.data) {
                message.success("Thêm mới permission thành công");
                handleReset();
                reloadTable();
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: errRes.detail,
                    duration: 2
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật Permission" : "Tạo mới Permission"}</>}
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
                onFinish={submitPermission}
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên Permission"
                            name="name"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập name"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="API Path"
                            name="apiPath"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập path"
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="method"
                            label="Method"
                            valueEnum={{
                                GET: 'GET',
                                POST: 'POST',
                                PATCH: 'PATCH',
                                DELETE: 'DELETE',
                            }}
                            placeholder="Please select a method"
                            rules={[{ required: true, message: 'Vui lòng chọn method!' }]}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="module"
                            label="Thuộc Module"
                            valueEnum={{
                                AMENITY: 'AMENITY',
                                BOOKING: 'BOOKING',
                                HOMESTAY: 'HOMESTAY',
                                PERMISSION: 'PERMISSION',
                                HOMESTAY_IMAGE: 'HOMESTAY_IMAGE',
                                ROLE: 'ROLE',
                                USER: 'USER',
                                AVAILABILITY: 'AVAILABILITY',
                                PAYMENT: 'PAYMENT',
                                REVIEW: 'REVIEW',
                                CONVERSATION: 'CONVERSATION',
                                MESSAGE: 'MESSAGE'
                            }}
                            placeholder="Please select a module"
                            rules={[{ required: true, message: 'Vui lòng chọn module!' }]}
                        />
                    </Col>

                </Row>
            </ModalForm>
        </>
    )
}

export default ModalPermission;
