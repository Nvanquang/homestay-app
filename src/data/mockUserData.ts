import { IUser } from '@/types/backend';
import dayjs from 'dayjs';

// Mock user data based on IUser interface
export const mockUserData: IUser = {
  id: "user-123",
  userName: "nguyenvana",
  email: "nguyenvana@example.com", // This will be excluded from display
  phoneNumber: "0901234567",
  fullName: "Nguyễn Văn A",
  gender: "Nam",
  createdAt: new Date('2023-01-15'),
  avatar: "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg",
  role: {
    id: "role-1",
    name: "Khách hàng"
  }
};

export const mockRecentActivities = [
  {
    id: 1,
    type: 'booking',
    title: 'Đã đặt phòng tại Villa Đà Lạt',
    date: new Date('2024-09-10'),
    status: 'completed'
  },
  {
    id: 2,
    type: 'review',
    title: 'Đã đánh giá Homestay Sapa View',
    date: new Date('2024-09-05'),
    status: 'completed'
  },
  {
    id: 3,
    type: 'booking',
    title: 'Đã đặt phòng tại Beach House Nha Trang',
    date: new Date('2024-08-28'),
    status: 'completed'
  }
];
