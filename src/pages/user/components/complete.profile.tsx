import React from 'react';
import { Slider, message, Modal, Input } from 'antd';
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined,
  CheckCircleFilled,
  CompassOutlined,
  EditOutlined,
  HeartOutlined,
  HomeOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from '@/styles/profileCompletion.module.scss';
import { useCompleteProfile } from '../hooks/useCompleteProfile';

interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tripPurposes: PreferenceOption[] = [
  {
    id: 'family',
    title: 'Gia đình',
    description: 'Chuyến đi cùng gia đình',
    icon: <HomeOutlined />,
  },
  {
    id: 'couple',
    title: 'Cặp đôi',
    description: 'Chuyến đi lãng mạn',
    icon: <HeartOutlined />,
  },
  {
    id: 'friends',
    title: 'Bạn bè',
    description: 'Chuyến đi cùng bạn bè',
    icon: <StarOutlined />,
  },
  {
    id: 'solo',
    title: 'Một mình',
    description: 'Du lịch khám phá bản thân',
    icon: <CompassOutlined />,
  },
];

const ProfileCompletionUI: React.FC = () => {
  const {
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
    setInputValue,
    openModal,
    handleModalOk,
    handleModalCancel,
    handleSelection,
    handleBudgetChange,
    handleNext,
    handleBack,
    formatCurrency,
    getStepCompletionStatus,
  } = useCompleteProfile();

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
                  <EditOutlined className={styles.editIcon} />
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
          <CheckCircleFilled className={styles.successIcon} />
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
            <ArrowLeftOutlined style={{}} /> Quay lại
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
          {currentStep < totalSteps && <ArrowRightOutlined style={{}} />}
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionUI;