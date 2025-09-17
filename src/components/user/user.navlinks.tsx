import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  SettingOutlined,
  HistoryOutlined,
  HeartOutlined,
  MessageOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { message, Modal } from 'antd';
import styles from '@/styles/userProfile.module.scss';
import { IUser } from '@/types/backend';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { useAppDispatch } from '@/redux/hooks';

interface UserNavLinksProps {
  userData?: IUser;
}

const UserNavLinks: React.FC<UserNavLinksProps> = ({ userData }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


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

  const navItems = [
    {
      key: 'profile',
      path: '/users/profile',
      icon: <EditOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      text: 'Hồ sơ cá nhân'
    },
    {
      key: 'edit',
      path: '/users/edit',
      icon: <SettingOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      text: 'Chỉnh sửa hồ sơ'
    },
    {
      key: 'bookings',
      path: '/booking/history',
      icon: <HistoryOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      text: 'Lịch sử đặt phòng'
    },
    {
      key: 'favorites',
      path: '/users/favorites',
      icon: <HeartOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      text: 'Yêu thích'
    },
    {
      key: 'messages',
      path: '/messages',
      icon: <MessageOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />,
      text: 'Tin nhắn'
    }
  ];

  return (
    <div className={styles.navLinks}>
      {navItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          state={item.key === 'edit' && userData ? { userData } : undefined}
          className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
        >
          {item.icon}
          <span className={styles.navText}>{item.text}</span>
        </Link>
      ))}

      <button
        className={`${styles.navItem} ${styles.logoutButton}`}
        onClick={handleLogout}
        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
      >
        <LogoutOutlined className={styles.navIcon} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
        <span className={styles.navText}>Đăng xuất</span>
      </button>
    </div>
  );
};

export default UserNavLinks;
