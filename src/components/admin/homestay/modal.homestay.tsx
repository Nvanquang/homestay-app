import {
    ModalForm,
    ProFormText,
    ProFormDigit,
    ProFormSelect,
    ProFormTextArea
} from "@ant-design/pro-components";
import { Col, Form, Row, Upload, message, notification, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { isMobile } from "react-device-detect";
import { useEffect, useState } from "react";
import { callCreateHomestay, callGetAmenities, callUpdateHomestay } from "@/config/api";
import { IAmenity, IBackendError, IHomestay } from "@/types/backend";
import { isSuccessResponse } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IHomestay | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IAmenitySelect {
    label: string;
    value: string;
    key?: string;
}

const ModalHomestay = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [form] = Form.useForm();
    const [amenities, setAmenities] = useState<IAmenitySelect[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [initialAmenities, setInitialAmenities] = useState<number[]>([]);
    const [initialImages, setInitialImages] = useState<string[]>([]);

    // Lấy danh sách tiện ích từ API
    const fetchAmenities = async (): Promise<IAmenitySelect[]> => {
        const res = await callGetAmenities("page=1&size=100");
        if (res && res.data) {
            return res.data.result.map((item: any) => ({
                label: item.name,
                value: String(item.id),
                key: String(item.id)
            }));
        }
        return [];
    };

    // Xử lý khi mở modal (tạo mới hoặc update)
    useEffect(() => {
        const init = async () => {
            const allAmenities = await fetchAmenities();
            setAmenities(allAmenities);

            if (dataInit?.id) {
                // Chuyển amenities từ dataInit sang format phù hợp cho Select
                const selectedAmenities = (dataInit.amenities as IAmenity[])
                    ?.filter(a => a.id !== undefined)
                    .map((a) => ({
                        label: a.name,
                        value: String(a.id),
                        key: String(a.id)
                    })) || [];

                // Lưu initial amenities IDs (sắp xếp để dễ so sánh)
                const initialAmenityIds = (dataInit.amenities as IAmenity[])
                    ?.filter(a => a.id !== undefined)
                    .map(a => +a.id!)
                    .sort((a, b) => a - b) || [];
                setInitialAmenities(initialAmenityIds);

                // Lưu initial images URLs (sắp xếp để dễ so sánh)
                const initialImageUrls = dataInit.images ? [...dataInit.images].sort() : [];
                setInitialImages(initialImageUrls);

                // Đảm bảo dữ liệu đầy đủ cho form
                form.setFieldsValue({
                    name: dataInit.name || '',
                    address: dataInit.address || '',
                    description: dataInit.description || '',
                    guests: dataInit.guests || undefined,
                    phoneNumber: dataInit.phoneNumber || '',
                    longitude: dataInit.longitude || '',
                    latitude: dataInit.latitude || '',
                    amenities: selectedAmenities,
                    status: dataInit.status || undefined
                });

                if (dataInit.images && dataInit.images.length > 0) {
                    setFileList(
                        dataInit.images.map((url: string, index: number) => ({
                            uid: `-${index}`,
                            name: `image-${index}.jpg`,
                            status: "done",
                            url
                        }))
                    );
                } else {
                    setFileList([]);
                }
            } else {
                // Create
                form.resetFields();
                setFileList([]);
                setInitialAmenities([]);
                setInitialImages([]);
            }
        };

        if (openModal) {
            init().catch(error => {
                console.error("Error initializing modal:", error);
                notification.error({
                    message: "Lỗi khởi tạo",
                    description: "Không thể tải dữ liệu homestay.",
                    duration: 2
                });
            });
        }
    }, [openModal, dataInit]);

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setFileList([]);
        setInitialAmenities([]);
        setInitialImages([]);
        setOpenModal(false);
    };

    // Validate file type, size, and count before upload
    const beforeUpload = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const isValidType = allowedTypes.includes(file.type);
        if (!isValidType) {
            notification.error({
                message: 'Lỗi upload',
                description: 'Chỉ được upload file JPG, JPEG hoặc PNG!',
                duration: 2
            });
            return Upload.LIST_IGNORE;
        }

        const isUnder2MB = file.size <= 2 * 1024 * 1024; // 2MB
        if (!isUnder2MB) {
            notification.error({
                message: 'Lỗi upload',
                description: 'Kích thước file phải nhỏ hơn 2MB!',
                duration: 2
            });
            return Upload.LIST_IGNORE;
        }

        const isUnderLimit = fileList.length < 5;
        if (!isUnderLimit) {
            notification.error({
                message: 'Lỗi upload',
                description: 'Chỉ được upload tối đa 5 ảnh!',
                duration: 2
            });
            return Upload.LIST_IGNORE;
        }

        return false; // Prevent automatic upload
    };

    // Handle file list changes and ensure only valid files remain
    const handleFileChange = ({ fileList: newList }: any) => {
        const validFiles = newList.filter((file: any) => {
            if (file.status === 'error') return false;
            if (file.originFileObj) {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                const isValidType = allowedTypes.includes(file.originFileObj.type);
                const isUnder1MB = file.originFileObj.size <= 1 * 1024 * 1024;
                if (!isValidType || !isUnder1MB) {
                    return false;
                }
            }
            return true;
        });
        setFileList(validFiles.slice(0, 6));
    };

    // Handle image preview
    const handlePreview = async (file: any) => {
        if (file.url || file.preview) {
            setPreviewImage(file.url || file.preview);
            setPreviewOpen(true);
        } else if (file.originFileObj) {
            const reader = new FileReader();
            reader.readAsDataURL(file.originFileObj);
            reader.onload = () => {
                setPreviewImage(reader.result as string);
                setPreviewOpen(true);
            };
        }
    };

    const submitHomestay = async (values: any) => {
        const {
            name,
            address,
            status,
            guests,
            phoneNumber,
            description,
            longitude,
            latitude,
            amenities: selectedAmenities
        } = values;

        // Chuyển amenities thành danh sách ID kiểu number và sắp xếp
        const currentAmenities = selectedAmenities?.map((item: any) =>
            typeof item === "object" ? +item.value : +item
        ).sort((a: number, b: number) => a - b) || [];

        // Lấy danh sách URL ảnh hiện có từ fileList và sắp xếp
        const currentImages = fileList
            .filter(file => file.url && file.status === 'done')
            .map(file => file.url)
            .sort();

        // Tính danh sách ảnh bị xóa
        const deletedImages = initialImages.filter(url => !currentImages.includes(url));

        // Extract actual File objects (only for new uploads)
        const actualFiles = fileList
            .filter(file => file.originFileObj && file.status !== 'error')
            .map(file => file.originFileObj);

        // If no files and no existing images, handle it
        if (actualFiles.length === 0 && currentImages.length === 0) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Vui lòng upload ít nhất một ảnh homestay.",
                duration: 2
            });
            return;
        }

        let homestay: IHomestay;
        let apiCall;

        if (dataInit?.id) {
            // Update mode
            const amenitiesChanged = JSON.stringify(currentAmenities) !== JSON.stringify(initialAmenities);
            const amenitiesToSend = amenitiesChanged ? currentAmenities : null;

            const imagesChanged = JSON.stringify(currentImages) !== JSON.stringify(initialImages) || actualFiles.length > 0;
            const imagesToSend = imagesChanged ? currentImages : null;
            const deletedImagesToSend = imagesChanged ? deletedImages : null;

            homestay = {
                id: dataInit.id,
                name,
                description,
                status,
                guests,
                amenities: amenitiesToSend,
                deletedImages: deletedImagesToSend
            };

            apiCall = callUpdateHomestay(dataInit.id.toString(), homestay, actualFiles, "homestay");
        } else {
            // Create mode
            homestay = {
                name,
                description,
                status,
                guests,
                phoneNumber,
                address,
                longitude: longitude ? +longitude : undefined,
                latitude: latitude ? +latitude : undefined,
                amenities: currentAmenities,
                images: currentImages
            };

            apiCall = callCreateHomestay(homestay, actualFiles, "homestay");
        }

        try {
            const res = await apiCall;

            if (isSuccessResponse(res) && res.data) {
                message.success(dataInit?.id ? "Cập nhật homestay thành công" : "Thêm mới homestay thành công");
                handleReset();
                setTimeout(() => {
                    reloadTable();
                }, 9000); // Delay to allow backend processing handle save images with async
            } else {
                const errRes = res as IBackendError;
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: errRes.detail || "Không thể lưu homestay.",
                    duration: 2
                });
            }
        } catch (error) {
            console.error("Error submitting homestay:", error);
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Không thể lưu homestay. Vui lòng thử lại.",
                duration: 2
            });
        }
    };

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật Homestay" : "Tạo mới Homestay"}</>}
                open={openModal}
                modalProps={{
                    onCancel: handleReset,
                    afterClose: handleReset,
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
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
                            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            placeholder="Nhập tên homestay"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                            placeholder="Nhập địa chỉ"
                        />
                    </Col>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <ProFormTextArea
                            label="Mô tả"
                            name="description"
                            placeholder="Nhập mô tả"
                            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="amenities"
                            label="Tiện ích"
                            mode="multiple"
                            options={amenities}
                            placeholder="Chọn tiện ích"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormDigit
                            name="guests"
                            label="Số khách tối đa"
                            rules={[{ required: true, message: "Vui lòng nhập số khách" }]}
                            placeholder="Nhập số khách"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            name="phoneNumber"
                            label="Số điện thoại"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            placeholder="Nhập số điện thoại"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="status"
                            label="Trạng thái"
                            valueEnum={{
                                INACTIVE: 'INACTIVE',
                                ACTIVE: 'ACTIVE',
                                CLOSED: 'CLOSED'
                            }}
                            placeholder="Chọn trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            name="longitude"
                            label="Kinh độ"
                            rules={[{ required: true, message: "Vui lòng nhập kinh độ" }]}
                            placeholder="Nhập kinh độ"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            name="latitude"
                            label="Vĩ độ"
                            rules={[{ required: true, message: "Vui lòng nhập vĩ độ" }]}
                            placeholder="Nhập vĩ độ"
                        />
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Ảnh Homestay">
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleFileChange}
                                onPreview={handlePreview}
                                beforeUpload={beforeUpload}
                                multiple
                            >
                                {fileList.length >= 6 ? null : (
                                    <div>
                                        <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
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
                width={isMobile ? "100%" : 600}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default ModalHomestay;