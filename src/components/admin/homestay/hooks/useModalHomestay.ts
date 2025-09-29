import { useEffect, useState } from 'react';
import { Form, message, notification, Upload } from 'antd';
import { callCreateHomestay, callGetAmenities, callUpdateHomestay } from '@/config/api';
import {
  isSuccessResponse,
  validateVietnamesePhoneNumber,
  cleanPhoneNumber,
  getPhoneValidationErrorMessage,
  formatPhoneForBackend
} from '@/config/utils';
import { IAmenity, IBackendError, IHomestay } from '@/types/backend';

interface IAmenitySelect {
  label: string;
  value: string;
  key?: string;
}

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: IHomestay | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

export const useModalHomestay = ({ openModal, setOpenModal, dataInit, setDataInit, reloadTable }: IProps) => {
  const [form] = Form.useForm();
  const [amenities, setAmenities] = useState<IAmenitySelect[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [initialAmenities, setInitialAmenities] = useState<number[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const fetchAmenities = async (): Promise<IAmenitySelect[]> => {
    const res = await callGetAmenities('page=1&size=100');
    if (res && res.data) {
      return res.data.result.map((item: any) => ({
        label: item.name,
        value: String(item.id),
        key: String(item.id),
      }));
    }
    return [];
  };

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
    const init = async () => {
      const allAmenities = await fetchAmenities();
      setAmenities(allAmenities);

      if (dataInit?.id) {
        const selectedAmenities = (dataInit.amenities as IAmenity[])
          ?.filter(a => a.id !== undefined)
          .map(a => ({
            label: a.name,
            value: String(a.id),
            key: String(a.id),
          })) || [];

        const initialAmenityIds = (dataInit.amenities as IAmenity[])
          ?.filter(a => a.id !== undefined)
          .map(a => +a.id!)
          .sort((a, b) => a - b) || [];
        setInitialAmenities(initialAmenityIds);

        const initialImageUrls = dataInit.images ? [...dataInit.images].sort() : [];
        setInitialImages(initialImageUrls);

        setPhoneValue(dataInit.phoneNumber || '');
        setPhoneError('');

        form.setFieldsValue({
          name: dataInit.name || '',
          address: dataInit.address || '',
          description: dataInit.description || '',
          guests: dataInit.guests || undefined,
          phoneNumber: dataInit.phoneNumber || '',
          longitude: dataInit.longitude || '',
          latitude: dataInit.latitude || '',
          amenities: selectedAmenities,
          status: dataInit.status || undefined,
        });

        if (dataInit.images && dataInit.images.length > 0) {
          setFileList(
            dataInit.images.map((url: string, index: number) => ({
              uid: `-${index}`,
              name: `image-${index}.jpg`,
              status: 'done',
              url,
            }))
          );
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
        setInitialAmenities([]);
        setInitialImages([]);
        setPhoneValue('');
        setPhoneError('');
      }
    };

    if (openModal) {
      init().catch(error => {
        notification.error({
          message: 'Lỗi khởi tạo',
          description: 'Không thể tải dữ liệu homestay.',
          duration: 2,
        });
      });
    }
  }, [openModal, dataInit, form]);

  const handleReset = () => {
    form.resetFields();
    setDataInit(null);
    setFileList([]);
    setInitialAmenities([]);
    setInitialImages([]);
    setPhoneValue('');
    setPhoneError('');
    setOpenModal(false);
  };

  const beforeUpload = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      notification.error({
        message: 'Lỗi upload',
        description: 'Chỉ được upload file JPG, JPEG hoặc PNG!',
        duration: 2,
      });
      return Upload.LIST_IGNORE;
    }

    const isUnder2MB = file.size <= 2 * 1024 * 1024;
    if (!isUnder2MB) {
      notification.error({
        message: 'Lỗi upload',
        description: 'Kích thước file phải nhỏ hơn 2MB!',
        duration: 2,
      });
      return Upload.LIST_IGNORE;
    }

    const isUnderLimit = fileList.length < 5;
    if (!isUnderLimit) {
      notification.error({
        message: 'Lỗi upload',
        description: 'Chỉ được upload tối đa 5 ảnh!',
        duration: 2,
      });
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const handleFileChange = ({ fileList: newList }: any) => {
    const validFiles = newList.filter((file: any) => {
      if (file.status === 'error') return false;
      if (file.originFileObj) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const isValidType = allowedTypes.includes(file.originFileObj.type);
        const isUnder2MB = file.originFileObj.size <= 2 * 1024 * 1024;
        if (!isValidType || !isUnder2MB) {
          return false;
        }
      }
      return true;
    });
    setFileList(validFiles.slice(0, 5));
  };

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
    const { name, address, status, guests, phoneNumber, description, longitude, latitude, amenities: selectedAmenities } = values;

    // Additional validation
    if (!name || name.length < 3) {
      notification.error({
        message: 'Tên homestay không hợp lệ',
        description: 'Tên homestay phải dài ít nhất 3 ký tự.',
        duration: 2,
      });
      return;
    }

    if (!address || address.length < 5) {
      notification.error({
        message: 'Địa chỉ không hợp lệ',
        description: 'Địa chỉ phải dài ít nhất 5 ký tự.',
        duration: 2,
      });
      return;
    }

    if (!description || description.length < 10) {
      notification.error({
        message: 'Mô tả không hợp lệ',
        description: 'Mô tả phải dài ít nhất 10 ký tự.',
        duration: 2,
      });
      return;
    }

    if (!guests || guests < 1) {
      notification.error({
        message: 'Số khách không hợp lệ',
        description: 'Số khách tối đa phải lớn hơn 0.',
        duration: 2,
      });
      return;
    }

    if (!phoneNumber || !validateVietnamesePhoneNumber(phoneNumber)) {
      notification.error({
        message: 'Số điện thoại không hợp lệ',
        description: getPhoneValidationErrorMessage('vietnam'),
        duration: 2,
      });
      return;
    }

    if (!longitude || isNaN(+longitude) || +longitude < -180 || +longitude > 180) {
      notification.error({
        message: 'Kinh độ không hợp lệ',
        description: 'Kinh độ phải là số từ -180 đến 180.',
        duration: 2,
      });
      return;
    }

    if (!latitude || isNaN(+latitude) || +latitude < -90 || +latitude > 90) {
      notification.error({
        message: 'Vĩ độ không hợp lệ',
        description: 'Vĩ độ phải là số từ -90 đến 90.',
        duration: 2,
      });
      return;
    }

    if (!selectedAmenities || selectedAmenities.length === 0) {
      notification.error({
        message: 'Tiện ích không hợp lệ',
        description: 'Vui lòng chọn ít nhất một tiện ích.',
        duration: 2,
      });
      return;
    }

    const currentAmenities = selectedAmenities
      .map((item: any) => (typeof item === 'object' ? +item.value : +item))
      .sort((a: number, b: number) => a - b) || [];

    const currentImages = fileList
      .filter(file => file.url && file.status === 'done')
      .map(file => file.url)
      .sort();

    const deletedImages = initialImages.filter(url => !currentImages.includes(url));

    const actualFiles = fileList
      .filter(file => file.originFileObj && file.status !== 'error')
      .map(file => file.originFileObj);

    if (actualFiles.length === 0 && currentImages.length === 0) {
      notification.error({
        message: 'Ảnh homestay không hợp lệ',
        description: 'Vui lòng upload ít nhất một ảnh homestay.',
        duration: 2,
      });
      return;
    }

    let homestay: IHomestay;
    let apiCall;

    if (dataInit?.id) {
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
        deletedImages: deletedImagesToSend,
      };

      apiCall = callUpdateHomestay(dataInit.id.toString(), homestay, actualFiles, 'homestay');
    } else {
      homestay = {
        name,
        description,
        status,
        guests,
        phoneNumber: formatPhoneForBackend(phoneNumber),
        address,
        longitude: +longitude,
        latitude: +latitude,
        amenities: currentAmenities,
        images: currentImages,
      };

      apiCall = callCreateHomestay(homestay, actualFiles, 'homestay');
    }

    try {
      const res = await apiCall;
      if (isSuccessResponse(res) && res.data) {
        message.success(dataInit?.id ? 'Cập nhật homestay thành công' : 'Thêm mới homestay thành công');
        handleReset();
        setTimeout(() => {
          reloadTable();
        }, 10000);
      } else {
        const errRes = res as IBackendError;
        notification.error({
          message: 'Có lỗi xảy ra',
          description: errRes.detail || 'Không thể lưu homestay.',
          duration: 2,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Có lỗi xảy ra',
        description: 'Không thể lưu homestay. Vui lòng thử lại.',
        duration: 2,
      });
    }
  };

  return {
    form,
    amenities,
    fileList,
    previewOpen,
    previewImage,
    initialAmenities,
    initialImages,
    phoneValue,
    phoneError,
    setFileList,
    setPreviewOpen,
    setPreviewImage,
    setInitialAmenities,
    setInitialImages,
    setPhoneValue,
    setPhoneError,
    fetchAmenities,
    handlePhoneChange,
    handleReset,
    beforeUpload,
    handleFileChange,
    handlePreview,
    submitHomestay,
  };
};