import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, Conversation, Product, User } from '../types';
import { supabase } from '../lib/supabase';

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string, sender: User, imageUrl?: string) => Promise<void>;
  startProductChat: (product: Product, sender: User) => string;
  totalUnreadCount: number;
  isRealtimeConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_CONV_KEY = 'bibi_chat_convs_v2';
const CHAT_MSG_KEY = 'bibi_chat_msgs_v2';

const INITIAL_CONVERSATIONS: Conversation[] = [];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';
let socket: Socket | null = null;

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
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Khởi tạo kết nối Socket.IO Realtime
  useEffect(() => {
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 6000
      });

      socket.on('connect', () => {
        console.log('⚡ [Chat Realtime]: Kết nối Socket.IO thành công');
        setIsRealtimeConnected(true);
        if (activeConversationId) {
          socket?.emit('join_conversation', activeConversationId);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 [Chat Realtime]: Ngắt kết nối Socket.IO');
        setIsRealtimeConnected(false);
      });

      // Nhận tin nhắn mới từ người khác trong thời gian thực (0s delay)
      socket.on('new_message', (incoming: ChatMessage) => {
        setMessages((prev) => {
          const list = prev[incoming.conversationId] || [];
          if (list.some((m) => m.id === incoming.id)) return prev;
          return {
            ...prev,
            [incoming.conversationId]: [...list, incoming]
          };
        });

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === incoming.conversationId
              ? {
                  ...conv,
                  lastMessage: incoming.content,
                  lastMessageTime: incoming.timestamp,
                }
              : conv
          )
        );
      });

      return () => {
        socket?.disconnect();
      };
    } catch (err) {
      console.warn('Không thể kết nối Socket.IO:', err);
    }
  }, []);

  // Tự động chuyển phòng chat realtime khi activeConversationId thay đổi
  useEffect(() => {
    if (activeConversationId && socket?.connected) {
      socket.emit('join_conversation', activeConversationId);
    }
  }, [activeConversationId]);

  // Fetch and sync messages realtime from Supabase (chạy song song dự phòng)
  useEffect(() => {
    async function fetchAllMessages() {
      try {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          const grouped: Record<string, ChatMessage[]> = {};
          data.forEach((row: any) => {
            const msg: ChatMessage = {
              id: row.id,
              conversationId: row.conversation_id,
              senderId: row.sender_id,
              senderName: row.sender_name,
              senderAvatar: row.sender_avatar,
              content: row.content,
              imageUrl: row.image_url,
              timestamp: row.created_at,
              isRead: row.is_read
            };
            if (!grouped[row.conversation_id]) {
              grouped[row.conversation_id] = [];
            }
            grouped[row.conversation_id].push(msg);
          });
          setMessages(grouped);
        }
      } catch (e) {
        console.warn('Error fetching messages from Supabase', e);
      }
    }
    fetchAllMessages();

    // Subscribe to new incoming messages realtime from Supabase
    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const row = payload.new;
          const incoming: ChatMessage = {
            id: row.id,
            conversationId: row.conversation_id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            senderAvatar: row.sender_avatar,
            content: row.content,
            imageUrl: row.image_url,
            timestamp: row.created_at,
            isRead: row.is_read
          };
          setMessages((prev) => {
            const list = prev[row.conversation_id] || [];
            if (list.some((m) => m.id === incoming.id)) return prev;
            return {
              ...prev,
              [row.conversation_id]: [...list, incoming]
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_CONV_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(CHAT_MSG_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (conversationId: string, content: string, sender: User, imageUrl?: string) => {
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

    // 1. Gửi tin nhắn qua Socket.IO Realtime
    if (socket?.connected) {
      socket.emit('send_message', {
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        content,
        imageUrl
      });
    } else {
      // 2. Gửi qua REST API Backend
      fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: sender.id,
          senderName: sender.name,
          senderAvatar: sender.avatar,
          content,
          imageUrl
        })
      }).catch(() => {});
    }

    // 3. Dự phòng ghi vào Supabase
    try {
      await supabase.from('messages').insert({
        id: newMsg.id,
        conversation_id: conversationId,
        sender_id: sender.id,
        sender_name: sender.name,
        sender_avatar: sender.avatar,
        content: newMsg.content,
        image_url: newMsg.imageUrl || null,
        is_read: true
      });
    } catch (e) {
      // ignore
    }
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
        isRealtimeConnected,
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
