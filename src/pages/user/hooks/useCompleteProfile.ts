import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LocationOption {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const useCompleteProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    travelStyle: [] as string[],
    budget: [500000, 2000000] as [number, number],
    amenities: [] as string[],
    locations: [] as string[],
    tripPurpose: [] as string[],
    personalInfo: {} as Record<string, string>,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<{ id: string; title: string; description: string } | null>(null);
  const [inputValue, setInputValue] = useState('');

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const personalInfoFields = [
    { id: 'dreamDestination', title: 'Nơi tôi luôn muốn đến', description: 'Bạn luôn muốn đi đến đâu?' },
    { id: 'job', title: 'Công việc của tôi', description: 'Bạn làm công việc gì?' },
    { id: 'favoriteSong', title: 'Bài hát yêu thích thời trung học', description: 'Bài hát yêu thích của bạn thời trung học là gì?' },
    { id: 'pets', title: 'Thú cưng', description: 'Bạn có nuôi thú cưng không?' },
    { id: 'birthDecade', title: 'Thập niên tôi sinh ra', description: 'Thập niên bạn sinh ra' },
    { id: 'school', title: 'Nơi tôi từng theo học', description: 'Bạn từng theo học ở đâu?' },
    { id: 'timeSpent', title: 'Tôi dành quá nhiều thời gian để', description: 'Bạn dành quá nhiều thời gian để làm gì?' },
    { id: 'funFact', title: 'Sự thật thú vị về tôi', description: 'Sự thật thú vị về bạn là gì?' },
    { id: 'uselessSkill', title: 'Kỹ năng vô dụng nhất của tôi', description: 'Kỹ năng vô dụng nhất của bạn là gì?' },
    { id: 'languages', title: 'Ngôn ngữ của tôi', description: 'Ngôn ngữ bạn sử dụng' },
    { id: 'alwaysThinking', title: 'Thứ mà tôi luôn nghĩ đến', description: 'Bạn hay nghĩ đến điều gì?' },
    { id: 'biographyTitle', title: 'Tên sách tiểu sử của tôi sẽ là', description: 'Tên sách tiểu sử của bạn sẽ là gì?' },
  ];

  const amenitiesOptions = [
    'WiFi miễn phí',
    'Bể bơi',
    'Gym',
    'Spa',
    'Nhà hàng',
    'Bar',
    'Dịch vụ phòng',
    'Bãi đậu xe',
    'Thú cưng được phép',
    'Máy lạnh',
    'Bếp riêng',
    'Ban công',
    'View biển',
    'View núi',
  ];

  const locationOptions: LocationOption[] = [
    {
      id: 'beach',
      name: 'Biển',
      description: 'Nha Trang, Đà Nẵng, Phú Quốc',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'mountain',
      name: 'Núi',
      description: 'Sapa, Đà Lạt, Mù Cang Chải',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'city',
      name: 'Thành phố',
      description: 'Hà Nội, TP.HCM, Hội An',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'countryside',
      name: 'Nông thôn',
      description: 'Mai Châu, Ninh Bình, Cần Thơ',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
  ];

  

  const handleSelection = (category: keyof typeof formData, value: string) => {
    setFormData(prev => {
      if (category === 'budget') return prev;
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handlePersonalInfoChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [fieldId]: value },
    }));
  };

  const openModal = (field: { id: string; title: string; description: string }) => {
    setCurrentField(field);
    setInputValue(formData.personalInfo[field.id] || '');
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (currentField) {
      handlePersonalInfoChange(currentField.id, inputValue);
    }
    setIsModalVisible(false);
    setCurrentField(null);
    setInputValue('');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentField(null);
    setInputValue('');
  };

  const handleBudgetChange = (value: number | number[]) => {
    setFormData(prev => ({ ...prev, budget: value as [number, number] }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        const filledFields = Object.keys(formData.personalInfo).filter(
          key => formData.personalInfo[key] && formData.personalInfo[key].trim() !== ''
        );
        if (filledFields.length < 1) {
          message.warning('Vui lòng điền ít nhất 1 thông tin cá nhân để tiếp tục');
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (formData.amenities.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 tiện ích quan trọng');
          return false;
        }
        return true;
      case 4:
        if (formData.locations.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 loại địa điểm yêu thích');
          return false;
        }
        return true;
      case 5:
        if (formData.tripPurpose.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 mục đích chuyến đi');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    message.success('Hồ sơ đã được hoàn thiện thành công!');
    navigate('/users/profile');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStepCompletionStatus = (step: number) => {
    switch (step) {
      case 1:
        const filledFields = Object.keys(formData.personalInfo).filter(
          key => formData.personalInfo[key] && formData.personalInfo[key].trim() !== ''
        );
        return filledFields.length >= 3;
      case 2:
        return true;
      case 3:
        return formData.amenities.length > 0;
      case 4:
        return formData.locations.length > 0;
      case 5:
        return formData.tripPurpose.length > 0;
      default:
        return false;
    }
  };

  return {
    navigate,
    currentStep,
    formData,
    isModalVisible,
    currentField,
    inputValue,
    totalSteps,
    progress,
    personalInfoFields,
    amenitiesOptions,
    locationOptions,
    setCurrentStep,
    setFormData,
    setIsModalVisible,
    setCurrentField,
    setInputValue,
    handleSelection,
    handlePersonalInfoChange,
    openModal,
    handleModalOk,
    handleModalCancel,
    handleBudgetChange,
    validateCurrentStep,
    handleNext,
    handleBack,
    handleComplete,
    formatCurrency,
    getStepCompletionStatus,
  };
};