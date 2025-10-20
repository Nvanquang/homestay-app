import React, { useEffect } from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import UserInfoCard from '@/components/user/userinfo.card';
import UserNavLinks from '@/components/user/user.navlinks';
import styles from '@/styles/userProfile.module.scss';
import { useAppSelector } from '@/redux/hooks';
import { callGetUserById } from '@/config/api';
import { calculateMembershipDuration, isSuccessResponse, mockUserData } from '@/config/utils';
import { useState } from 'react';
import { IUser } from '@/types/backend';

const UserProfile: React.FC = () => {
  const userId = useAppSelector(state => state.account?.user.id);
  const [dataUser, setDataUser] = useState<IUser | null>(null);

  useEffect(() => {
    const getUserById = async () => {
      const res = await callGetUserById(userId);
      if (isSuccessResponse(res) && res.data) {
        setDataUser(res.data);
      }
    };
    getUserById();
  }, [userId]);

  return (
    <div className={styles.profileContainer} style={{marginTop: 100}}>
      {/* Header Section */}
      <div className={styles.profileHeader}>
        <h1 className={styles.headerTitle}>Hồ sơ cá nhân</h1>
        <Link 
          to="/users/edit" 
          state={{ userData: dataUser || mockUserData }}
        >
          <Button 
            type="primary" 
            icon={<EditOutlined style={{}} />}
            size="large"
            style={{
              background: '#ff385c',
              borderColor: '#ff385c',
              height: '40px',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className={styles.profileContent}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* User Info Card */}
          <UserInfoCard 
            user={dataUser !== null ? dataUser : mockUserData}
            isVerified={dataUser?.isVerified}
            membershipDuration={calculateMembershipDuration(dataUser?.createdAt)}
          />

        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Navigation Links */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.cardTitle}>Menu</h3>
            <UserNavLinks userData={dataUser || mockUserData} />
          </div>

          {/* Profile Completion */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.cardTitle}>Hoàn thiện hồ sơ</h3>
            <div className={styles.profileCompletion}>
              <div className={styles.completionProgress}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '60%' }}></div>
                </div>
                <span className={styles.progressText}>60% hoàn thành</span>
              </div>
              <Link to="/users/complete-profile" className={styles.completeButton}>
                Hoàn thiện hồ sơ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
