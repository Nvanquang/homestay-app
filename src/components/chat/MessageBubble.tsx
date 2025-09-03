import React from 'react';
import { Avatar } from 'antd';
import dayjs from 'dayjs';
import { Message, User } from './types';
import '@/styles/MessageBubble.scss';

interface MessageBubbleProps {
  message: Message;
  sender: User;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, isCurrentUser }) => {
  
  return (
    <div className={`message-bubble ${isCurrentUser ? 'message-bubble--sent' : 'message-bubble--received'}`}>
      {!isCurrentUser && (
        <Avatar 
          src={sender.avatar} 
          size={32}
          className="message-bubble__avatar"
        />
      )}
      
      <div className="message-bubble__content">
        {!isCurrentUser && (
          <div className="message-bubble__sender">
            {sender.fullName} - {sender.role === 'host' ? 'Chủ nhà' : 'Khách'}
          </div>
        )}
        
        <div className={`message-bubble__text ${isCurrentUser ? 'message-bubble__text--sent' : 'message-bubble__text--received'}`}>
          {message.content}
        </div>
        
        <div className="message-bubble__timestamp">
          {dayjs(message.timestamp).format('h:mm A')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
