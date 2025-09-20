import React, { useState } from 'react';
import { Slider, message, Modal, Input } from 'antd';
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined,
  CheckCircleFilled,
  HomeOutlined,
  HeartOutlined,
  CompassOutlined,
  StarOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styles from '@/styles/profileCompletion.module.scss';

interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface LocationOption {
  id: string;
  name: string;
  description: string;
  image: string;
}

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    travelStyle: [] as string[],
    budget: [500000, 2000000] as [number, number],
    amenities: [] as string[],
    locations: [] as string[],
    tripPurpose: [] as string[],
    personalInfo: {} as Record<string, string>
  });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<{id: string, title: string, description: string} | null>(null);
  const [inputValue, setInputValue] = useState('');

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Personal Information Fields
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
    { id: 'biographyTitle', title: 'Tên sách tiểu sử của tôi sẽ là', description: 'Tên sách tiểu sử của bạn sẽ là gì?' }
  ];

  // Amenities Options
  const amenitiesOptions = [
    'WiFi miễn phí', 'Bể bơi', 'Gym', 'Spa', 'Nhà hàng', 
    'Bar', 'Dịch vụ phòng', 'Bãi đậu xe', 'Thú cưng được phép',
    'Máy lạnh', 'Bếp riêng', 'Ban công', 'View biển', 'View núi'
  ];

  // Location Options
  const locationOptions: LocationOption[] = [
    {
      id: 'beach',
      name: 'Biển',
      description: 'Nha Trang, Đà Nẵng, Phú Quốc',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'mountain',
      name: 'Núi',
      description: 'Sapa, Đà Lạt, Mù Cang Chải',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'city',
      name: 'Thành phố',
      description: 'Hà Nội, TP.HCM, Hội An',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'countryside',
      name: 'Nông thôn',
      description: 'Mai Châu, Ninh Bình, Cần Thơ',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];

  // Trip Purpose Options
  const tripPurposes: PreferenceOption[] = [
    {
      id: 'family',
      title: 'Gia đình',
      description: 'Chuyến đi cùng gia đình',
      icon: <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    },
    {
      id: 'couple',
      title: 'Cặp đôi',
      description: 'Chuyến đi lãng mạn',
      icon: <HeartOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    },
    {
      id: 'friends',
      title: 'Bạn bè',
      description: 'Chuyến đi cùng bạn bè',
      icon: <StarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    },
    {
      id: 'solo',
      title: 'Một mình',
      description: 'Du lịch khám phá bản thân',
      icon: <CompassOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    }
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
      personalInfo: { ...prev.personalInfo, [fieldId]: value }
    }));
  };

  // Modal handlers
  const openModal = (field: {id: string, title: string, description: string}) => {
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
      case 1: // Personal Info - yêu cầu ít nhất 3 trường
        const filledFields = Object.keys(formData.personalInfo).filter(
          key => formData.personalInfo[key] && formData.personalInfo[key].trim() !== ''
        );
        if (filledFields.length < 1) {
          message.warning('Vui lòng điền ít nhất 1 thông tin cá nhân để tiếp tục');
          return false;
        }
        return true;
      
      case 2: // Budget - luôn có giá trị mặc định, không cần validate
        return true;
      
      case 3: // Amenities - yêu cầu chọn ít nhất 1
        if (formData.amenities.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 tiện ích quan trọng');
          return false;
        }
        return true;
      
      case 4: // Locations - yêu cầu chọn ít nhất 1
        if (formData.locations.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 loại địa điểm yêu thích');
          return false;
        }
        return true;
      
      case 5: // Trip Purpose - yêu cầu chọn ít nhất 1
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
      currency: 'VND'
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
        return true; // Budget luôn có giá trị
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        const filledCount = Object.keys(formData.personalInfo).filter(
          key => formData.personalInfo[key] && formData.personalInfo[key].trim() !== ''
        ).length;
        
        return (
          <div>
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>Thông tin cá nhân</h2>
              <p className={styles.stepDescription}>
                Chia sẻ về bản thân để chúng tôi hiểu rõ hơn về bạn. 
                <strong> Vui lòng điền ít nhất 3 thông tin để tiếp tục.</strong>
              </p>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: filledCount >= 3 ? '#51cf66' : '#ff6b6b' }}>
                Đã điền: {filledCount}/12 thông tin (tối thiểu: 1)
              </div>
            </div>
            <div className={styles.personalInfoList}>
              {personalInfoFields.map((field) => (
                <div 
                  key={field.id} 
                  className={styles.personalInfoItem}
                  onClick={() => openModal(field)}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{field.title}</div>
                    <div className={styles.itemValue}>
                      {formData.personalInfo[field.id] || field.description}
                    </div>
                  </div>
                  <EditOutlined className={styles.editIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitle}>Ngân sách cho mỗi đêm?</h2>
            <p className={styles.stepDescription}>
              Cho chúng tôi biết khoảng ngân sách bạn muốn chi cho mỗi đêm nghỉ.
            </p>
            <div className={styles.budgetSelector}>
              <div className={styles.budgetRange}>
                <div className={styles.rangeLabels}>
                  <span>500,000 VNĐ</span>
                  <span>5,000,000 VNĐ</span>
                </div>
                <Slider
                  range
                  min={500000}
                  max={5000000}
                  step={100000}
                  value={formData.budget}
                  onChange={handleBudgetChange}
                  trackStyle={[{ backgroundColor: '#ff385c' }]}
                  handleStyle={[
                    { borderColor: '#ff385c' },
                    { borderColor: '#ff385c' }
                  ]}
                />
                <div className={styles.selectedRange}>
                  {formatCurrency(formData.budget[0])} - {formatCurrency(formData.budget[1])}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitle}>Tiện ích quan trọng?</h2>
            <p className={styles.stepDescription}>
              Chọn những tiện ích mà bạn cho là quan trọng khi lưu trú.
              <strong> Vui lòng chọn ít nhất 1 tiện ích để tiếp tục.</strong>
            </p>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: formData.amenities.length > 0 ? '#51cf66' : '#ff6b6b' }}>
              Đã chọn: {formData.amenities.length} tiện ích
            </div>
            <div className={styles.amenitiesGrid}>
              {amenitiesOptions.map((amenity) => (
                <div
                  key={amenity}
                  className={`${styles.amenityTag} ${
                    formData.amenities.includes(amenity) ? styles.selected : ''
                  }`}
                  onClick={() => handleSelection('amenities', amenity)}
                >
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitle}>Địa điểm yêu thích?</h2>
            <p className={styles.stepDescription}>
              Chọn những loại địa điểm mà bạn thường muốn khám phá.
              <strong> Vui lòng chọn ít nhất 1 loại địa điểm để tiếp tục.</strong>
            </p>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: formData.locations.length > 0 ? '#51cf66' : '#ff6b6b' }}>
              Đã chọn: {formData.locations.length} loại địa điểm
            </div>
            <div className={styles.locationGrid}>
              {locationOptions.map((location) => (
                <div
                  key={location.id}
                  className={`${styles.locationCard} ${
                    formData.locations.includes(location.id) ? styles.selected : ''
                  }`}
                  onClick={() => handleSelection('locations', location.id)}
                >
                  <div 
                    className={styles.locationImage}
                    style={{ backgroundImage: `url(${location.image})` }}
                  />
                  <div className={styles.locationContent}>
                    <div className={styles.locationName}>{location.name}</div>
                    <div className={styles.locationDescription}>{location.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitle}>Mục đích chuyến đi?</h2>
            <p className={styles.stepDescription}>
              Bạn thường đi du lịch với ai? Điều này giúp chúng tôi gợi ý những nơi phù hợp.
              <strong> Vui lòng chọn ít nhất 1 mục đích để hoàn thành.</strong>
            </p>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: formData.tripPurpose.length > 0 ? '#51cf66' : '#ff6b6b' }}>
              Đã chọn: {formData.tripPurpose.length} mục đích
            </div>
            <div className={styles.preferencesGrid}>
              {tripPurposes.map((purpose) => (
                <div
                  key={purpose.id}
                  className={`${styles.preferenceCard} ${
                    formData.tripPurpose.includes(purpose.id) ? styles.selected : ''
                  }`}
                  onClick={() => handleSelection('tripPurpose', purpose.id)}
                >
                  <div className={styles.preferenceIcon}>{purpose.icon}</div>
                  <div className={styles.preferenceTitle}>{purpose.title}</div>
                  <div className={styles.preferenceDescription}>{purpose.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep > totalSteps) {
    return (
      <div className={styles.completionContainer} style={{ marginTop: 100 }}>
        <div className={styles.completionSuccess}>
          <CheckCircleFilled className={styles.successIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
          <h1 className={styles.successTitle}>Hoàn thành!</h1>
          <p className={styles.successMessage}>
            Cảm ơn bạn đã hoàn thiện hồ sơ. Chúng tôi sẽ sử dụng thông tin này để gợi ý những địa điểm và trải nghiệm phù hợp nhất với sở thích của bạn.
          </p>
          <Link to="/users/profile">
            <button className={styles.successButton}>
              Về trang hồ sơ
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.completionContainer} style={{ marginTop: 100 }}>
      {/* Personal Info Modal */}
      <Modal
        title={currentField?.title}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        className={styles.personalInfoModal}
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>{currentField?.description}</p>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập thông tin của bạn..."
            className={styles.modalInput}
            autoFocus
          />
        </div>
      </Modal>
      <div className={styles.completionHeader}>
        <h1 className={styles.headerTitle}>Hoàn thiện hồ sơ</h1>
        <p className={styles.headerSubtitle}>
          Giúp chúng tôi hiểu rõ sở thích của bạn để có thể gợi ý những trải nghiệm tuyệt vời nhất.
        </p>
        <div className={styles.progressIndicator}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressText}>
            Bước {currentStep} / {totalSteps}
            {!getStepCompletionStatus(currentStep) && currentStep !== 2 && (
              <span style={{ color: '#ff6b6b', fontSize: '12px', marginLeft: '8px' }}>
                • Chưa hoàn thành
              </span>
            )}
            {getStepCompletionStatus(currentStep) && (
              <span style={{ color: '#51cf66', fontSize: '12px', marginLeft: '8px' }}>
                • Đã hoàn thành
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.stepContainer}>
        {renderStep()}
      </div>

      <div className={styles.actionButtons}>
        {currentStep > 1 && (
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeftOutlined style={{}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> Quay lại
          </button>
        )}
        
        {currentStep === 1 && (
          <Link to="/users/profile">
            <button className={styles.backButton}>
              Bỏ qua
            </button>
          </Link>
        )}

        <button 
          className={styles.nextButton} 
          onClick={handleNext}
        >
          {currentStep === totalSteps ? 'Hoàn thành' : 'Tiếp tục'} 
          {currentStep < totalSteps && <ArrowRightOutlined style={{}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;
