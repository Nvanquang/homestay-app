import React from 'react';
import { HomeOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '@/styles/userProfile.module.scss';

interface Activity {
  id: number;
  type: string;
  title: string;
  date: Date;
  status: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />;
      case 'review':
        return <StarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />;
      default:
        return <CalendarOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />;
    }
  };

  return (
    <div className={styles.recentActivities}>
      {activities.map((activity) => (
        <div key={activity.id} className={styles.activityItem}>
          <div className={styles.activityIcon}>
            {getActivityIcon(activity.type)}
          </div>
          <div className={styles.activityContent}>
            <div className={styles.activityTitle}>{activity.title}</div>
            <div className={styles.activityDate}>
              {dayjs(activity.date).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
