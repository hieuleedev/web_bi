import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, Conversation, Product, User } from '../types';

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string, sender: User, imageUrl?: string) => void;
  startProductChat: (product: Product, sender: User) => string;
  totalUnreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_CONV_KEY = 'bibi_chat_convs';
const CHAT_MSG_KEY = 'bibi_chat_msgs';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    productId: 'prod-1',
    productTitle: 'Đầm Dạ Hội Ánh Kim Sa Cao Cấp - Sparkling Rose Gold',
    productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
    participants: [
      { id: 'user-seller-1', name: 'Bi Bi Boutique (Linh Bi)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', role: 'seller' },
      { id: 'user-buyer-1', name: 'Hoàng Mai Yến', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', role: 'buyer' }
    ],
    lastMessage: 'Dạ đầm này có sẵn size M vừa vặn với chiều cao 1m62 bạn nhé!',
    lastMessageTime: '2026-09-16T15:30:00Z',
    unreadCount: 1,
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-buyer-1',
      senderName: 'Hoàng Mai Yến',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      content: 'Chào shop! Mình cao 1m62 nặng 50kg thì đầm này mặc size gì vừa ạ? Mình muốn thuê đi tiệc ngày 20 tới.',
      timestamp: '2026-09-16T15:20:00Z',
      isRead: true,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-seller-1',
      senderName: 'Bi Bi Boutique (Linh Bi)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      content: 'Dạ đầm này có sẵn size M vừa vặn với chiều cao 1m62 bạn nhé! Váy ôm đuôi cá có độ co giãn nhẹ và đi kèm giày cao gót 7-10cm sẽ cực kỳ tôn dáng ạ.',
      timestamp: '2026-09-16T15:30:00Z',
      isRead: false,
    }
  ]
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(CHAT_CONV_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(CHAT_MSG_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CHAT_CONV_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(CHAT_MSG_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (conversationId: string, content: string, sender: User, imageUrl?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      content,
      imageUrl,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: content,
              lastMessageTime: newMsg.timestamp,
            }
          : conv
      )
    );
  };

  const startProductChat = (product: Product, sender: User): string => {
    const existing = conversations.find(
      (c) =>
        c.productId === product.id &&
        c.participants.some((p) => p.id === sender.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.featuredImage,
      participants: [
        { id: sender.id, name: sender.name, avatar: sender.avatar, role: sender.role },
        { id: product.sellerId, name: product.sellerName, avatar: product.sellerAvatar, role: 'seller' },
      ],
      lastMessage: `Quan tâm sản phẩm: ${product.title}`,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };

    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: newId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      content: `Xin chào! Tôi đang quan tâm đến sản phẩm "${product.title}" (${product.type === 'buy' ? 'Mua' : product.type === 'rent' ? 'Thuê' : 'Mua/Thuê'}).`,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [initialMsg] }));
    setActiveConversationId(newId);

    return newId;
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startProductChat,
        totalUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
