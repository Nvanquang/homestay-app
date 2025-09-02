import React from 'react';
import { Typography, Card, Space } from 'antd';
import ChatInterface from '../../components/chat/ChatInterface';
import './ChatDemo.scss';

const { Title, Paragraph } = Typography;

/**
 * Chat Demo Page - Showcases the Airbnb-style Chat Interface
 * 
 * This page demonstrates the complete chat interface with:
 * - Three-panel layout (conversations, chat, booking sidebar)
 * - Authentic Airbnb styling and colors
 * - Vietnamese conversation data
 * - Real-time message sending simulation
 * - Responsive design for mobile/desktop
 * 
 * To integrate into your app:
 * 1. Import ChatInterface component: import ChatInterface from './components/chat/ChatInterface';
 * 2. Use in your routing: <Route path="/messages" element={<ChatInterface />} />
 * 3. Customize mock data in ./components/chat/mockData.ts
 */
const ChatDemo: React.FC = () => {
  return (
    <div className="chat-demo">
      <div className="chat-demo__header">
        <Card className="chat-demo__info-card">
          <Space direction="vertical" size={8}>
            <Title level={4} style={{ margin: 0, color: '#ff5a5f' }}>
              🏠 Airbnb-Style Chat Interface
            </Title>
            <Paragraph style={{ margin: 0, fontSize: '14px', color: '#717171' }}>
              Giao diện chat tương tự Airbnb với thiết kế hiện đại, responsive và đầy đủ tính năng
            </Paragraph>
          </Space>
        </Card>
      </div>
      
      <div className="chat-demo__interface">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatDemo;
