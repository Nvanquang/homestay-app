import { Conversation, User, Message, HomestayInfo, ConversationMessages } from './types';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Quốc Khanh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    role: 'host'
  },
  {
    id: '2', 
    name: 'Baileys Ho',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    role: 'guest'
  }
];

export const mockHomestayInfo: HomestayInfo = {
  id: 'homestay-1',
  name: 'Forest Studio & Bathtub | Private Kitchen, Balcony',
  description: 'Căn studio ấm cúng với bồn tắm ngoài trời, bếp riêng và ban công view rừng thông. Không gian yên tĩnh, lý tưởng cho cặp đôi hoặc gia đình nhỏ muốn trải nghiệm thiên nhiên Đà Lạt.',
  images: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
  guests: 4,
  address: 'Đà Lạt, Lâm Đồng',
  status: 'active',
  nightAmount: 800000,
  averageRating: 4.8,
  totalReviews: 127
};

export const mockMessages: Message[] = [
  {
    id: uuidv4(),
    content: 'Xin chào! Cảm ơn bạn đã đặt phòng tại Forest Studio của chúng tôi. Chúng tôi rất mong được đón tiếp bạn! 🏡',
    senderId: '1',
    timestamp: new Date('2024-03-10T14:30:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Chào anh Quốc Khanh! Cảm ơn anh đã chấp nhận đặt phòng. Em rất háo hức cho chuyến đi này. Em có một vài câu hỏi về chỗ nghỉ ạ.',
    senderId: '2',
    timestamp: new Date('2024-03-10T14:45:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Dạ, em cứ hỏi thoải mái nhé! Anh sẽ trả lời chi tiết để em có chuyến đi tuyệt vời nhất. Anh đã chuẩn bị mọi thứ cho em rồi 😊',
    senderId: '1',
    timestamp: new Date('2024-03-10T14:47:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Anh ơi, chỗ nghỉ có gần trung tâm Đà Lạt không ạ? Và có dịch vụ đưa đón từ sân bay không? Em bay về muộn nên hơi lo về việc di chuyển.',
    senderId: '2',
    timestamp: new Date('2024-03-10T15:20:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Chỗ nghỉ cách trung tâm khoảng 5km thôi, rất thuận tiện đi chợ đêm và các điểm tham quan. Về đưa đón sân bay, anh có thể hỗ trợ với phí 200k/lượt. Hoặc em có thể đặt Grab, khoảng 150k.',
    senderId: '1',
    timestamp: new Date('2024-03-10T15:25:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Tuyệt vời! Còn về bữa sáng thì sao anh? Có phục vụ bữa sáng không ạ? Em thích ăn sáng kiểu Việt Nam.',
    senderId: '2',
    timestamp: new Date('2024-03-10T16:15:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Có nhé! Anh có thể chuẩn bị bữa sáng Việt Nam với phở, bánh mì, cà phê sữa đá. Phí 80k/người/bữa. Hoặc em có thể tự nấu ở bếp riêng, anh đã chuẩn bị đầy đủ dụng cụ.',
    senderId: '1',
    timestamp: new Date('2024-03-10T16:18:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Anh ơi, em thấy có bồn tắm trong mô tả. Có phải là bồn tắm ngoài trời không ạ? Em rất thích trải nghiệm đó!',
    senderId: '2',
    timestamp: new Date('2024-03-10T18:30:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Đúng rồi! Bồn tắm nằm ở ban công riêng, view nhìn ra rừng thông rất đẹp. Buổi tối ngâm trong bồn tắm ngắm sao trời Đà Lạt thật tuyệt vời. Anh sẽ chuẩn bị nến thơm và khăn tắm cao cấp.',
    senderId: '1',
    timestamp: new Date('2024-03-10T18:35:00'),
    type: 'text'
  },
  {
    id: uuidv4(),
    content: 'Quá tuyệt! Cảm ơn anh đã trả lời chi tiết. Em đang rất mong chờ chuyến đi này. Anh có gợi ý nào về địa điểm tham quan gần đó không ạ?',
    senderId: '2',
    timestamp: new Date('2024-03-10T19:39:00'),
    type: 'text'
  }
];

// Separate messages data for each conversation
export const mockConversationMessages: { [key: string]: ConversationMessages } = {
  'conv-1': {
    conversationId: 'conv-1',
    messages: mockMessages
  },
  'conv-2': {
    conversationId: 'conv-2',
    messages: [
      {
        id: uuidv4(),
        content: 'Chào anh! Em muốn hỏi về việc check-in sớm được không ạ?',
        senderId: '2',
        timestamp: new Date('2024-03-09T16:20:00'),
        type: 'text'
      },
      {
        id: uuidv4(),
        content: 'Chào em! Check-in sớm được nhé, từ 12h trưa. Anh sẽ chuẩn bị phòng sẵn.',
        senderId: '3',
        timestamp: new Date('2024-03-09T16:25:00'),
        type: 'text'
      }
    ]
  },
  'conv-3': {
    conversationId: 'conv-3',
    messages: [
      {
        id: uuidv4(),
        content: 'Chào chị! Em muốn hỏi về việc hủy booking được không ạ? Có phí hủy không?',
        senderId: '2',
        timestamp: new Date('2024-03-08T10:15:00'),
        type: 'text'
      },
      {
        id: uuidv4(),
        content: 'Chào em! Tùy vào thời gian hủy nhé. Nếu hủy trước 7 ngày thì không có phí, sau đó sẽ tính 50% phí đặt phòng.',
        senderId: '4',
        timestamp: new Date('2024-03-08T10:20:00'),
        type: 'text'
      }
    ]
  }
};

// Optimized conversations with only lastMessage
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Quốc Khanh',
    participants: [mockUsers[0], mockUsers[1]], // host + guest
    lastMessage: {
      id: uuidv4(),
      content: 'Quá tuyệt! Cảm ơn anh đã trả lời chi tiết. Em đang rất mong chờ chuyến đi này. Anh có gợi ý nào về địa điểm tham quan gần đó không ạ?',
      senderId: '2',
      timestamp: new Date('2024-03-10T19:39:00'),
      type: 'text'
    },
    homestayInfo: mockHomestayInfo,
    lastActivity: new Date('2024-03-10T19:39:00'),
    unreadCount: 0
  },
  {
    id: 'conv-2',
    title: 'Nguyễn Văn A',
    participants: [
      {
        id: '3',
        name: 'Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        role: 'host'
      },
      mockUsers[1] // guest (Baileys Ho)
    ],
    lastMessage: {
      id: uuidv4(),
      content: 'Chào em! Check-in sớm được nhé, từ 12h trưa. Anh sẽ chuẩn bị phòng sẵn.',
      senderId: '3',
      timestamp: new Date('2024-03-09T16:25:00'),
      type: 'text'
    },
    homestayInfo: {
      ...mockHomestayInfo,
      id: 'homestay-2',
      name: 'Mountain View Villa | 2BR with Garden',
      description: 'Villa 2 phòng ngủ với view núi tuyệt đẹp, có vườn riêng và không gian rộng rãi. Phù hợp cho gia đình hoặc nhóm bạn muốn nghỉ dưỡng thư giãn.',
      images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
      guests: 6,
      nightAmount: 1200000,
      averageRating: 4.6,
      totalReviews: 89
    },
    lastActivity: new Date('2024-03-09T16:25:00'),
    unreadCount: 1
  },
  {
    id: 'conv-3',
    title: 'Trần Thị B',
    participants: [
      {
        id: '4',
        name: 'Trần Thị B',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
        role: 'host'
      },
      mockUsers[1] // guest (Baileys Ho)
    ],
    lastMessage: {
      id: uuidv4(),
      content: 'Chào em! Tùy vào thời gian hủy nhé. Nếu hủy trước 7 ngày thì không có phí, sau đó sẽ tính 50% phí đặt phòng.',
      senderId: '4',
      timestamp: new Date('2024-03-08T10:20:00'),
      type: 'text'
    },
    homestayInfo: {
      ...mockHomestayInfo,
      id: 'homestay-3',
      name: 'Cozy Apartment | City Center',
      description: 'Căn hộ ấm cúng ngay trung tâm thành phố, tiện lợi di chuyển đến các điểm tham quan. Phù hợp cho khách du lịch một mình hoặc cặp đôi.',
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
      guests: 2,
      address: 'Quận 1, TP. Hồ Chí Minh',
      nightAmount: 600000,
      averageRating: 4.3,
      totalReviews: 56,
      status: 'active'
    },
    lastActivity: new Date('2024-03-08T10:20:00'),
    unreadCount: 2
  }
];

export const mockConversation: Conversation = mockConversations[0];

// Additional mock homestay data
export const mockHomestays: HomestayInfo[] = [
  mockHomestayInfo,
  {
    id: 'homestay-2',
    name: 'Mountain View Villa | 2BR with Garden',
    description: 'Villa 2 phòng ngủ với view núi tuyệt đẹp, có vườn riêng và không gian rộng rãi. Phù hợp cho gia đình hoặc nhóm bạn muốn nghỉ dưỡng thư giãn.',
    images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
    guests: 6,
    address: 'Đà Lạt, Lâm Đồng',
    status: 'active',
    nightAmount: 1200000,
    averageRating: 4.6,
    totalReviews: 89
  },
  {
    id: 'homestay-3',
    name: 'Cozy Apartment | City Center',
    description: 'Căn hộ ấm cúng ngay trung tâm thành phố, tiện lợi di chuyển đến các điểm tham quan. Phù hợp cho khách du lịch một mình hoặc cặp đôi.',
    images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
    guests: 2,
    address: 'Quận 1, TP. Hồ Chí Minh',
    status: 'active',
    nightAmount: 600000,
    averageRating: 4.3,
    totalReviews: 56
  }
];

// Helper function to get messages for a specific conversation
export const getConversationMessages = (conversationId: string): ConversationMessages | null => {
  return mockConversationMessages[conversationId] || null;
};
