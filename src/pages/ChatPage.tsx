import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Image as ImageIcon,
  User as UserIcon,
  Sparkles,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { formatTimeAgo } from '../utils/helpers';

interface ChatPageProps {
  onBack?: () => void;
  onViewProduct?: (productId: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onBack, onViewProduct }) => {
  const { conversations, messages, activeConversationId, setActiveConversationId, sendMessage } = useChat();
  const { currentUser } = useAuth();

  const [inputMessage, setInputMessage] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const currentMessages = activeConv ? messages[activeConv.id] || [] : [];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeConv || !currentUser) return;

    sendMessage(activeConv.id, text.trim(), currentUser);
    setInputMessage('');
  };

  const quickQuestions = [
    'Chào shop! Mẫu này cuối tuần này còn trống lịch thuê không ạ?',
    'Mình cao 1m62 nặng 50kg mặc size nào thì vừa vặn nhất?',
    'Shop có hỗ trợ giao trước 1 ngày để thử đồ không?',
    'Chính sách hoàn cọc bên mình mất bao lâu ạ?'
  ];

  return (
    <div className="bg-[#faf9f8] min-h-screen py-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">
                Tin Nhắn & Tư Vấn Trang Phục
              </h1>
              <p className="text-xs text-gray-500">Trao đổi trực tiếp giữa người thuê, người mua và chủ đồ</p>
            </div>
          </div>
        </div>

        {/* Chat Main Window */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[700px]">
          
          {/* Conversation list - Left (4 cols) */}
          <div className="md:col-span-4 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Hộp Thư ({conversations.length})
              </h3>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {conversations.map((conv) => {
                const otherUser = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
                const isActive = conv.id === (activeConv?.id);

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-brand-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-brand-500/20"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold text-xs text-gray-900 truncate">
                          {otherUser.name}
                        </h4>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-gray-400">
                            {formatTimeAgo(conv.lastMessageTime)}
                          </span>
                        )}
                      </div>

                      {conv.productTitle && (
                        <p className="text-[11px] text-brand-600 truncate mt-0.5 font-medium">
                          Sp: {conv.productTitle}
                        </p>
                      )}

                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation - Right (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-white">
            {activeConv ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConv.participants.find((p) => p.id !== currentUser?.id)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">
                        {activeConv.participants.find((p) => p.id !== currentUser?.id)?.name || 'Chủ shop'}
                      </h4>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Đang hoạt động phản hồi nhanh
                      </span>
                    </div>
                  </div>

                  {activeConv.productId && onViewProduct && (
                    <button
                      onClick={() => onViewProduct(activeConv.productId!)}
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-3 py-1 bg-brand-50 rounded-lg border border-brand-200"
                    >
                      Xem sản phẩm
                    </button>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#faf9f8]/60">
                  {currentMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.senderAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                          />
                        )}

                        <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                            {formatTimeAgo(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick suggestions */}
                <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-thin">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] whitespace-nowrap bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1 rounded-full border border-gray-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn tư vấn size, lịch thuê..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-md shadow-brand-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
