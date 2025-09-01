import React, { useState, useEffect, useRef } from 'react';
import { Calendar, theme, Input } from 'antd';
import type { CalendarProps } from 'antd';
import dayjs from 'dayjs';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import styles from '@/styles/client.module.scss';
import { ISearchHomestayRequest } from '@/types/backend';
import { POPULAR_LOCATIONS, PopularLocation } from '@/config/utils';
import { useNavigate } from 'react-router-dom';

type Dayjs = ReturnType<typeof dayjs>;

interface SearchProps {
  isScrolled?: boolean;
  searchData?: ISearchHomestayRequest & { address?: string };
  onSearch?: (searchData: ISearchHomestayRequest) => void;
  onExpand?: () => void;
  onSearchDataChange?: (newData: Partial<ISearchHomestayRequest & { address?: string }>) => void;
}

const Search: React.FC<SearchProps> = ({ 
  isScrolled = false, 
  searchData = {
    radius: 1000000,
    status: 'AVAILABLE'
  },
  onSearch, 
  onExpand,
  onSearchDataChange 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'dates' | 'guests' | null>(null);
  const [activeDateType, setActiveDateType] = useState<'checkin' | 'checkout' | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setActiveDateType(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    return `${date.date()} thg ${date.month() + 1}`;
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchData);
      navigate(`/homestay-search?${new URLSearchParams({
        latitude: searchData.latitude?.toString() || '',
        longitude: searchData.longitude?.toString() || '',
        radius: searchData.radius?.toString() || '',
        checkin: searchData.checkinDate || '',
        checkout: searchData.checkoutDate || '',
        guests: searchData.guests?.toString() || '',
        available: searchData.status || ''
      })}`, {state: {
        latitude: searchData.latitude,
        longitude: searchData.longitude,
        radius: searchData.radius,
        checkin: searchData.checkinDate,
        checkout: searchData.checkoutDate,
        guests: searchData.guests,
        available: searchData.status
      }});
    }
  };

  const handleSectionClick = (type: string) => {
    if (onExpand) {
      onExpand();
    }
    
    let targetDropdown: 'location' | 'dates' | 'guests' | null = null;
    
    switch (type) {
      case 'location':
        targetDropdown = 'location';
        break;
      case 'checkin':
      case 'checkout':
        targetDropdown = 'dates';
        setActiveDateType(type === 'checkin' ? 'checkin' : 'checkout');
        break;
      case 'guests':
        targetDropdown = 'guests';
        break;
    }
    
    if (activeDropdown === targetDropdown) {
      setActiveDropdown(null);
      setActiveDateType(null);
      setSlideDirection(null);
    } else {
      const dropdownOrder = ['location', 'dates', 'guests'];
      const currentIndex = dropdownOrder.indexOf(activeDropdown || '');
      const targetIndex = dropdownOrder.indexOf(targetDropdown || '');
      
      if (currentIndex !== -1 && targetIndex !== -1) {
        setSlideDirection(targetIndex > currentIndex ? 'left' : 'right');
      } else {
        setSlideDirection('left');
      }
      
      setActiveDropdown(targetDropdown);
    }
  };

  const handleDateSelect = (date: Dayjs) => {
    if (onSearchDataChange && activeDateType) {
      const dateString = date.format('YYYY-MM-DD');
      if (activeDateType === 'checkin') {
        onSearchDataChange({ checkinDate: dateString });
        setActiveDateType('checkout');
      } else if (activeDateType === 'checkout') {
        onSearchDataChange({ checkoutDate: dateString });
        
        // Tự động chuyển sang dropdown guests sau khi chọn checkout date
        setTimeout(() => {
          setActiveDropdown('guests');
          setActiveDateType(null);
          setSlideDirection('left');
        }, 300);
      }
    }
  };

  const handleGuestChange = (guests: number) => {
    if (onSearchDataChange) {
      onSearchDataChange({ guests });
    }
    
    // Đóng dropdown sau khi chọn số khách
    setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Xử lý chọn location với tọa độ
  const handleLocationSelect = (location: PopularLocation) => {
    if (onSearchDataChange) {
      onSearchDataChange({ 
        address: location.displayName,
        latitude: location.latitude,
        longitude: location.longitude,
        // radius: location.radius * 1000 // Chuyển km sang mét
      });
    }
    
    // Tự động chuyển sang dropdown dates sau khi chọn location
    setTimeout(() => {
      setActiveDropdown('dates');
      setActiveDateType('checkin');
      setSlideDirection('left');
    }, 300);
  };

  const getSearchValue = (type: string) => {
    switch (type) {
      case 'location':
        return searchData.address || 'Tìm kiếm điểm đến';
      case 'checkin':
        return searchData.checkinDate ? formatDate(searchData.checkinDate) : 'Thêm ngày';
      case 'checkout':
        return searchData.checkoutDate ? formatDate(searchData.checkoutDate) : 'Thêm ngày';
      case 'guests':
        return searchData.guests ? `${searchData.guests} khách` : 'Thêm khách';
      default:
        return '';
    }
  };

  const getScrolledSearchValue = (type: string) => {
    switch (type) {
      case 'location':
        return searchData.address || 'Địa điểm';
      case 'dates':
        return searchData.checkinDate ? formatDate(searchData.checkinDate) : 'Thời gian';
      case 'guests':
        return searchData.guests ? `${searchData.guests} khách` : 'Thêm khách';
      default:
        return '';
    }
  };

  const calendarWrapperStyle: React.CSSProperties = {
    width: '100%',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };

  // Kiểm tra xem có section nào đang active không
  const hasActiveSection = activeDropdown !== null;

  if (isScrolled) {
    return (
      <div ref={searchRef} className={styles.searchWrapper}>
              <div 
        className={`${styles.searchContainer} ${hasActiveSection ? styles.hasActiveSection : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          <div 
            className={`${styles.searchSection} ${activeDropdown === 'location' ? styles.active : ''} ${activeDropdown === 'location' ? styles.transitioning : ''}`} 
            onClick={() => handleSectionClick('location')}
          >
            <span className={styles.searchValue}>
              {getScrolledSearchValue('location')}
            </span>
          </div>
          <div 
            className={`${styles.searchSection} ${activeDropdown === 'dates' && (activeDateType === 'checkin' || !activeDateType) ? styles.active : ''} ${activeDropdown === 'dates' ? styles.transitioning : ''}`} 
            onClick={() => handleSectionClick('checkin')}
          >
            <span className={styles.searchValue}>
              {getScrolledSearchValue('dates')}
            </span>
          </div>
          <div 
            className={`${styles.searchSection} ${activeDropdown === 'guests' ? styles.active : ''} ${activeDropdown === 'guests' ? styles.transitioning : ''}`} 
            onClick={() => handleSectionClick('guests')}
          >
            <span className={styles.searchValue}>
              {getScrolledSearchValue('guests')}
            </span>
          </div>
          <button 
            className={styles.searchButton} 
            onClick={handleSearchClick}
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>

        {activeDropdown === 'location' && (
          <div 
            className={`${styles.dropdown} ${slideDirection === 'left' ? styles.slideLeft : slideDirection === 'right' ? styles.slideRight : styles.fadeIn}`}
          >
            <LocationDropdown 
              onSelect={handleLocationSelect}
              currentLocation={searchData.address}
              onClose={() => setActiveDropdown(null)}
            />
          </div>
        )}
        {activeDropdown === 'dates' && (
          <div 
            className={`${styles.dropdown} ${slideDirection === 'left' ? styles.slideLeft : slideDirection === 'right' ? styles.slideRight : styles.fadeIn}`}
          >
            <DateDropdown 
              onSelect={handleDateSelect}
              checkinDate={searchData.checkinDate}
              checkoutDate={searchData.checkoutDate}
              activeDateType={activeDateType}
              onClose={() => {
                setActiveDropdown(null);
                setActiveDateType(null);
              }}
              calendarWrapperStyle={calendarWrapperStyle}
            />
          </div>
        )}
        {activeDropdown === 'guests' && (
          <div 
            className={`${styles.dropdown} ${slideDirection === 'left' ? styles.slideLeft : slideDirection === 'right' ? styles.slideRight : styles.fadeIn}`}
          >
            <GuestDropdown 
              onSelect={handleGuestChange}
              currentGuests={Number(searchData.guests)}
              onClose={() => setActiveDropdown(null)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={searchRef} className={styles.searchWrapper}>
      <div 
        className={`${styles.searchContainer} ${hasActiveSection ? styles.hasActiveSection : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`${styles.searchSection} ${activeDropdown === 'location' ? styles.active : ''} ${activeDropdown === 'location' ? styles.transitioning : ''}`} 
          onClick={() => handleSectionClick('location')}
        >
          <div className={styles.dateSection}>
            <span className={styles.searchLabel}>Địa điểm</span>
            {searchData.address && (
              <button
                className={styles.clearButton}
                onClick={e => {
                  e.stopPropagation();
                  if (onSearchDataChange) onSearchDataChange({ address: undefined });
                }}
                title="Xóa địa điểm"
              >×</button>
            )}
            <span className={`${styles.searchValue} ${!searchData.address ? styles.placeholder : ''}`}>
              {getSearchValue('location')}
            </span>
          </div>
        </div>
        <div 
          className={`${styles.searchSection} ${activeDropdown === 'dates' && activeDateType === 'checkin' ? styles.active : ''} ${activeDropdown === 'dates' ? styles.transitioning : ''}`} 
          onClick={() => handleSectionClick('checkin')}
        >
          <div className={styles.dateSection}>
            <span className={styles.searchLabel}>Nhận phòng</span>
            {searchData.checkinDate && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  if (onSearchDataChange) {
                    onSearchDataChange({ checkinDate: undefined });
                  }
                }}
              >
                ×
              </button>
            )}
            <span className={`${styles.searchValue} ${!searchData.checkinDate ? styles.placeholder : ''}`}>
              {getSearchValue('checkin')}
            </span>
          </div>
        </div>
        <div 
          className={`${styles.searchSection} ${activeDropdown === 'dates' && activeDateType === 'checkout' ? styles.active : ''} ${activeDropdown === 'dates' ? styles.transitioning : ''}`} 
          onClick={() => handleSectionClick('checkout')}
        >
          <div className={styles.dateSection}>
            <span className={styles.searchLabel}>Trả phòng</span>
            {searchData.checkoutDate && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  if (onSearchDataChange) {
                    onSearchDataChange({ checkoutDate: undefined });
                  }
                }}
              >
                ×
              </button>
            )}
            <span className={`${styles.searchValue} ${!searchData.checkoutDate ? styles.placeholder : ''}`}>
              {getSearchValue('checkout')}
            </span>
          </div>
        </div>
        <div 
          className={`${styles.searchSection} ${activeDropdown === 'guests' ? styles.active : ''} ${activeDropdown === 'guests' ? styles.transitioning : ''}`} 
          onClick={() => handleSectionClick('guests')}
        >
          <div className={styles.dateSection}>
            <span className={styles.searchLabel}>Khách</span>
            {searchData.guests && (
              <button
                className={styles.clearButton}
                onClick={e => {
                  e.stopPropagation();
                  if (onSearchDataChange) onSearchDataChange({ guests: undefined });
                }}
                title="Xóa số khách"
              >×</button>
            )}
            <span className={`${styles.searchValue} ${!searchData.guests ? styles.placeholder : ''}`}>
              {getSearchValue('guests')}
            </span>
          </div>
        </div>
        <button 
          className={styles.searchButton} 
          onClick={handleSearchClick}
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </div>

      {activeDropdown === 'location' && (
        <div 
          className={`${styles.dropdown} ${slideDirection ? styles[`slide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)}`] : ''}`}
          style={{ animation: slideDirection ? `dropdownSlide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)} 0.3s cubic-bezier(0.4, 0, 0.2, 1)` : undefined }}
        >
          <LocationDropdown 
            onSelect={handleLocationSelect}
            currentLocation={searchData.address}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
      )}
      {activeDropdown === 'dates' && (
        <div 
          className={`${styles.dropdown} ${slideDirection ? styles[`slide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)}`] : ''}`}
          style={{ animation: slideDirection ? `dropdownSlide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)} 0.3s cubic-bezier(0.4, 0, 0.2, 1)` : undefined }}
        >
          <DateDropdown 
            onSelect={handleDateSelect}
            checkinDate={searchData.checkinDate}
            checkoutDate={searchData.checkoutDate}
            activeDateType={activeDateType}
            onClose={() => {
              setActiveDropdown(null);
              setActiveDateType(null);
            }}
            calendarWrapperStyle={calendarWrapperStyle}
          />
        </div>
      )}
      {activeDropdown === 'guests' && (
        <div 
          className={`${styles.dropdown} ${slideDirection ? styles[`slide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)}`] : ''}`}
          style={{ animation: slideDirection ? `dropdownSlide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)} 0.3s cubic-bezier(0.4, 0, 0.2, 1)` : undefined }}
        >
          <GuestDropdown 
            onSelect={handleGuestChange}
            currentGuests={Number(searchData.guests)}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
      )}
    </div>
  );
};

// Dropdown Components
interface LocationDropdownProps {
  onSelect: (location: PopularLocation) => void;
  currentLocation?: string;
  onClose: () => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({ onSelect, currentLocation, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<PopularLocation[]>(POPULAR_LOCATIONS);

  // Lọc locations theo search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLocations(POPULAR_LOCATIONS);
    } else {
      const filtered = POPULAR_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm]);

  return (
    <div className={styles.dropdownContent}>
      <div className={styles.locationSearchHeader}>
        <Input
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          size="large"
          className={styles.locationSearchInput}
        />
      </div>
      
      <div className={styles.locationList}>
        <div className={styles.locationSection}>
                     <h4 className={styles.locationSectionTitle}>
             <StarOutlined style={{ marginRight: 8, color: '#faad14' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
             Địa điểm phổ biến
           </h4>
          
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className={`${styles.locationItem} ${currentLocation === location.displayName ? styles.selectedLocation : ''}`}
              onClick={() => onSelect(location)}
            >
              <div className={styles.locationItemContent}>
                <div className={styles.locationItemImage}>
                  <img 
                    src={location.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=40&fit=crop'} 
                    alt={location.name}
                    className={styles.locationImage}
                  />
                </div>
                <div className={styles.locationItemInfo}>
                  <div className={styles.locationName}>{location.displayName}</div>
                  <div className={styles.locationDescription}>{location.description}</div>
                                     <div className={styles.locationRadius}>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredLocations.length === 0 && (
          <div className={styles.noResults}>
            <p>Không tìm thấy địa điểm phù hợp</p>
            <p>Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface DateDropdownProps {
  onSelect: (date: Dayjs) => void;
  checkinDate?: string;
  checkoutDate?: string;
  activeDateType: 'checkin' | 'checkout' | null;
  onClose: () => void;
  calendarWrapperStyle: React.CSSProperties;
}

const DateDropdown: React.FC<DateDropdownProps> = ({ 
  onSelect, 
  checkinDate, 
  checkoutDate, 
  activeDateType,
  onClose,
  calendarWrapperStyle 
}) => {
  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  const currentMonth = dayjs();
  const nextMonth = currentMonth.add(1, 'month');

  const renderCell = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    const isBeforeToday = date.isBefore(today, 'day');
    const isCheckin = checkinDate && date.isSame(dayjs(checkinDate), 'day');
    const isCheckout = checkoutDate && date.isSame(dayjs(checkoutDate), 'day');
    let cellClass = styles.calendarDay;
    if (isCheckin || (activeDateType === 'checkin' && isCheckin)) cellClass += ' ' + styles.selectedCheckin;
    if (isCheckout || (activeDateType === 'checkout' && isCheckout)) cellClass += ' ' + styles.selectedCheckout;
    return (
      <div
        className={cellClass}
        style={isBeforeToday ? { pointerEvents: 'none', opacity: 0.4, background: '#f5f5f5' } : {}}
        onClick={() => !isBeforeToday && onSelect(date)}
      >
        {date.date()}
      </div>
    );
  };

  return (
    <div className={styles.dropdownContent}>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarWrapper} style={calendarWrapperStyle}>
          <Calendar 
            fullscreen={false} 
            onPanelChange={onPanelChange}
            value={undefined}
            dateFullCellRender={renderCell}
            disabledDate={date => (date as any).isBefore(dayjs().startOf('day'), 'day')}
          />
        </div>
        <div className={styles.calendarWrapper} style={calendarWrapperStyle}>
          <Calendar 
            fullscreen={false} 
            onPanelChange={onPanelChange}
            value={undefined}
            dateFullCellRender={renderCell}
            disabledDate={date => (date as any).isBefore(dayjs(checkinDate || dayjs().startOf('day')), 'day')}
            defaultValue={nextMonth as any}
          />
        </div>
      </div>
    </div>
  );
};

interface GuestDropdownProps {
  onSelect: (guests: number) => void;
  currentGuests?: number;
  onClose: () => void;
}

const GuestDropdown: React.FC<GuestDropdownProps> = ({ onSelect, currentGuests, onClose }) => {
  const [guests, setGuests] = useState(currentGuests || 1);

  const handleGuestChange = (increment: boolean) => {
    const newGuests = increment ? guests + 1 : Math.max(1, guests - 1);
    setGuests(newGuests);
  };

  return (
    <div className={styles.dropdownContent}>
      <div className={styles.guestSelector}>
        <div className={styles.guestControl}>
          <span>Số khách</span>
          <div className={styles.guestButtons}>
            <button 
              className={styles.guestButton}
              onClick={() => handleGuestChange(false)}
              disabled={guests <= 1}
            >
              -
            </button>
            <span className={styles.guestCount}>{guests}</span>
            <button 
              className={styles.guestButton}
              onClick={() => handleGuestChange(true)}
            >
              +
            </button>
          </div>
        </div>
        <button 
          className={styles.confirmButton}
          onClick={() => onSelect(guests)}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default Search;