import React from 'react';
import ConversationListPanel from './ConversationListPanel';
import { Conversation } from './types';

interface ConversationListProps {
  conversationsData: Conversation[];
  selectedConversation: string | null;
  onConversationSelect: (conversationId: string) => void;
  currentUser: any;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversationsData,
  selectedConversation,
  onConversationSelect
}) => {
  return (
    <ConversationListPanel
      conversations={conversationsData.length > 0 ? conversationsData : []}
      activeConversationId={selectedConversation || undefined}
      onConversationSelect={onConversationSelect}
    />
  );
};

export default ConversationList;
