import React from 'react';
import ChatInterface from '../../components/chat/chat.interface';

/**
 * Chat Page Component
 * 
 * This is the main chat page that renders the complete Airbnb-style chat interface.
 * To use this component, simply import and render it in your App.tsx:
 * 
 * import ChatPage from './pages/chat';
 * 
 * function App() {
 *   return (
 *     <div className="App">
 *       <ChatPage />
 *     </div>
 *   );
 * }
 */
const ChatPage: React.FC = () => {
  return <ChatInterface />;
};

export default ChatPage;
