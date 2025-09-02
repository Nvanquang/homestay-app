import React, { useEffect, useState } from 'react';
import { List, Avatar, Typography, Badge, Input, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Conversation } from './types';
import '@/styles/ConversationListPanel.scss';
import { useAppSelector } from '@/redux/hooks';
import { callGetConversationsByUser } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';

const { Text } = Typography;

interface ConversationListPanelProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationListPanel: React.FC<ConversationListPanelProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect
}) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const userId = useAppSelector(state => state.account.user.id);
  const [conversationsData, setConversations] = useState<Conversation[]>([]);

  const filteredConversations = showUnreadOnly
    ? conversations.filter(conv => {
      const unreadCount = conv.unreadCount ?? parseInt(conv.id.slice(-1)) % 3;
      return unreadCount > 0;
    })
    : conversations;

  useEffect(() => {
    const init = async () => {
      const res = await callGetConversationsByUser(userId);
      if (isSuccessResponse(res) && res.data) {
        setConversations(res.data);
      }
     }
    init();
  }, [userId]);
  return (
    <div className="conversation-panel">
      <div className="conversation-panel__header">
        <div className="conversation-panel__search">
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện"
            prefix={<SearchOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
            className="conversation-panel__search-input"
          />
        </div>
        <Button
          type={showUnreadOnly ? "primary" : "text"}
          icon={<FilterOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          className="conversation-panel__filter-btn"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          title="Lọc tin nhắn chưa đọc"
        />
      </div>

      <List
        className="conversation-panel__list"
        dataSource={filteredConversations}
        renderItem={(conversation) => {
          const lastMessage = conversation.lastMessage;
          // Use unreadCount from conversation or fallback to generated count
          const unreadCount = conversation.unreadCount ?? parseInt(conversation.id.slice(-1)) % 3;

          return (
            <List.Item
              className={`conversation-panel__item ${activeConversationId === conversation.id ? 'conversation-panel__item--active' : ''
                }`}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="conversation-panel__item-content">
                <Avatar
                  size={48}
                  src={conversation.participants.find(p => p.role === 'host')?.avatar || conversation.participants[0]?.avatar}
                  className="conversation-panel__avatar"
                />

                <div className="conversation-panel__info">
                  <div className="conversation-panel__header-row">
                    <Text strong className="conversation-panel__name">
                      {conversation.title}
                    </Text>
                    <div className="conversation-panel__meta">
                      <Text type="secondary" className="conversation-panel__time">
                        {dayjs(conversation.lastActivity).format('HH:mm')}
                      </Text>
                      {unreadCount > 0 && (
                        <Badge count={unreadCount} size="small" className="conversation-panel__badge" />
                      )}
                    </div>
                  </div>

                  <Text type="secondary" ellipsis className="conversation-panel__preview">
                    {lastMessage?.content || 'Chưa có tin nhắn'}
                  </Text>

                  <div className="conversation-panel__homestay-info">
                    <Text type="secondary" className="conversation-panel__property">
                      📍 {conversation.homestayInfo.address}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default ConversationListPanel;
