import React, { useState, useEffect } from 'react';
import Search from '@/components/client/search.client';
import styles from '@/styles/client.module.scss';
import { ISearchHomestayRequest } from '@/types/backend';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogout } from '@/config/api';
import { Avatar, Dropdown, message, Modal, Space } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { HistoryOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, MessageOutlined, QqOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';

interface HeaderProps {
  onSearch?: (searchData: ISearchHomestayRequest) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
  const roleName = useAppSelector(state => state.account.user.role.name);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('homestay');
  const [searchData, setSearchData] = useState<ISearchHomestayRequest & { address?: string }>({
    longitude: 105.8342,
    latitude: 21.0278,
    radius: 10000,
    status: 'AVAILABLE'
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Auto collapse when scrolling down significantly
      if (scrollY > 200 && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  // Reset header state when navigating to new pages
  useEffect(() => {
    setIsScrolled(false);
    setIsExpanded(false);
  }, [location.pathname]);


  const handleSearch = (searchData: ISearchHomestayRequest) => {
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    // Don't scroll to top - just expand the header
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearchDataChange = (newData: Partial<ISearchHomestayRequest & { address?: string }>) => {
    setSearchData(prev => ({ ...prev, ...newData }));
  };

  // Khóa thanh header khi đang ở trang tin nhắn
  const isMessageRoute = location.pathname.startsWith('/message') || location.pathname.startsWith('/book/checkout') || location.pathname.startsWith('/user');
  const effectiveScrolled = isMessageRoute ? true : isScrolled;
  const effectiveExpanded = isMessageRoute ? false : isExpanded;
  const headerClass = `${styles.header} ${effectiveScrolled ? styles.scrolled : ''} ${effectiveExpanded ? styles.expanded : ''}`;

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        const res = await callLogout();
        if (res && +res.status === 200) {
          dispatch(setLogoutAction({}));
          message.success('Đăng xuất thành công');
          navigate('/')
        }
      },
    });
  };

  const itemsUserDropdown = [
    {
      label: <Link to={'/'}>Trang chủ</Link>,
      key: 'home',
      icon: <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    ...(roleName === 'SUPER_ADMIN' || roleName === 'HOST'
      ? [{
        label: <Link to={'/admin'}>Quản trị hệ thống</Link>,
        key: 'admin',
        icon: <SettingOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      }]
      : []),
    {
      label: <Link to={'/users/profile'}>Hồ sơ</Link>,
      key: 'profile',
      icon: <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    {
      label: <Link to={'/messages'}>Tin nhắn</Link>,
      key: 'messages',
      icon: <MessageOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    {
      label: <Link to={'/booking/history'}>Lịch sử đặt phòng</Link>,
      key: 'travels',
      icon: <HistoryOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    {
      label: <label
        style={{ cursor: 'pointer' }}
        onClick={() => handleLogout()}
      >Đăng xuất</label>,
      key: 'logout',
      icon: <LogoutOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    },
  ];

  const itemsMenuDropdown = [
    {
      label: <Link to={'/'}>Trang chủ</Link>,
      key: 'home',
      icon: <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    {
      label: <Link to={'/login'}>Đăng nhập or Đăng ký</Link>,
      key: 'login',
      icon: <LoginOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },

  ];

  return (
    <header className={headerClass}>
      <div className={styles.headerContainer}>
        <div className={styles.headerTop}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src="https://cdn-icons-png.flaticon.com/512/5977/5977574.png" alt="" style={{ width: 35, height: 35 }} />
            Airbnb
          </Link>

          {/* Navigation - Hidden when scrolled, shown when expanded */}
          {(!isMessageRoute && (!effectiveScrolled || effectiveExpanded)) && (
            <nav className={styles.navigation}>
              <a
                href="#homestay"
                className={`${styles.navTab} ${activeTab === 'homestay' ? styles.active : ''}`}
                onClick={() => handleTabClick('homestay')}
              >
                🏠 Nơi lưu trú
              </a>
              <a
                href="#experience"
                className={`${styles.navTab} ${activeTab === 'experience' ? styles.active : ''}`}
                onClick={() => handleTabClick('experience')}
              >
                🚲 Trải nghiệm
              </a>
              <a
                href="#service"
                className={`${styles.navTab} ${activeTab === 'service' ? styles.active : ''}`}
                onClick={() => handleTabClick('service')}
              >
                🥡 Dịch vụ
              </a>
            </nav>
          )}

          {/* Search Bar - Shown when scrolled but not expanded */}
          {(!isMessageRoute && effectiveScrolled && !effectiveExpanded) && (
            <div className={styles.scrolledSearchContainer}>
              <Search
                isScrolled={true}
                searchData={searchData}
                onSearch={handleSearch}
                onExpand={handleExpand}
                onSearchDataChange={handleSearchDataChange}
              />
            </div>
          )}

          {/* Header Actions */}
          <div className={styles.headerActions}>
            <Dropdown menu={{ items: isAuthenticated ? itemsUserDropdown : itemsMenuDropdown }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                {
                  isAuthenticated ? (
                    <Space>
                      {user?.name}
                      <Avatar style={{backgroundColor: '#000000'}} src={user?.avatar !== null ? user.avatar : <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />
                    </Space>
                  ) : (
                    <button className={styles.actionButton} title="Menu">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                      </svg>
                    </button>
                  )
                }
              </Space>
            </Dropdown>
          </div>
        </div>

        {/* Search Section - Shown when not scrolled or when expanded */}
        {(!isMessageRoute && (!effectiveScrolled || effectiveExpanded)) && (
          <div className={styles.headerBottom}>
            <Search
              isScrolled={false}
              searchData={searchData}
              onSearch={handleSearch}
              onExpand={handleExpand}
              onSearchDataChange={handleSearchDataChange}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;