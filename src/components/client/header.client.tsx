import React, { useState, useEffect } from 'react';
import Search from '@/components/client/search.client';
import styles from '@/styles/client.module.scss';
import { ISearchHomestayRequest } from '@/types/backend';
import { Link, useNavigate } from 'react-router-dom';
import { callLogout } from '@/config/api';
import { Avatar, Dropdown, message, Space } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { HomeOutlined, LoginOutlined, LogoutOutlined, MessageOutlined, QqOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';

interface HeaderProps {
  onSearch?: (searchData: ISearchHomestayRequest) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
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
    radius: 100000,
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

  const headerClass = `${styles.header} ${isScrolled ? styles.scrolled : ''} ${isExpanded ? styles.expanded : ''}`;

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && +res.status === 200) {
      dispatch(setLogoutAction({}));
      message.success('Đăng xuất thành công');
      navigate('/')
    }
  }

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
          icon: <SettingOutlined  onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
        }]
      : []),
    {
      label: <Link to={'/'}>Tin nhắn</Link>,
      key: 'messages',
      icon: <MessageOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
    },
    {
      label: <Link to={'/'}>Chuyến đi</Link>,
      key: 'travels',
      icon: <QqOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
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
            <svg viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 30C8.268 30 2 23.732 2 16S8.268 2 16 2s14 6.268 14 14-6.268 14-14 14z" />
              <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 22C10.486 26 6 21.514 6 16S10.486 6 16 6s10 4.486 10 10-4.486 10-10 10z" />
              <path d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
            </svg>
            Airbnb
          </Link>

          {/* Navigation - Hidden when scrolled, shown when expanded */}
          {(!isScrolled || isExpanded) && (
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
          {isScrolled && !isExpanded && (
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
                      Welcome {user?.name}
                      <Avatar style={{ backgroundColor: '#000000ff' }} icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />
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
        {(!isScrolled || isExpanded) && (
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