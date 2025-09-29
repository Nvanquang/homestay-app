import React from 'react';
import { Avatar, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import { IUser } from '@/types/backend';
import dayjs from 'dayjs';
import styles from '@/styles/userProfile.module.scss';

interface UserInfoCardProps {
  user: IUser;
  isVerified?: boolean;
  membershipDuration?: string;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ 
  user, 
  isVerified = false, 
  membershipDuration = '' 
}) => {
  const formatJoinDate = (date: Date | null | undefined) => {
    if (!date) return 'Chưa xác định';
    return `Tham gia từ ${dayjs(date).format('MM/YYYY')}`;
  };

  return (
    <div className={styles.userInfoCard}>
      <div className={styles.userHeader}>
        <div className={styles.avatarContainer}>
          <Avatar
            size={120}
            src={user.avatar}
            icon={<UserOutlined />}
            className={styles.userAvatar}
          />
          {isVerified && (
            <div className={styles.verifiedBadge}>
              <CheckCircleFilled style={{}} />
            </div>
          )}
        </div>
        
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{user.fullName}</h1>
          <div className={styles.userRole}>
            <Tag color="blue">{user.role?.name || 'Thành viên'}</Tag>
            {isVerified && <Tag color="green">Đã xác minh</Tag>}
          </div>
          <div className={styles.joinDate}>
            <CalendarOutlined style={{}} />
            <span>{formatJoinDate(user.createdAt)}</span>
            {membershipDuration && membershipDuration !== '' && (
              <span>• {membershipDuration} thành viên</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
