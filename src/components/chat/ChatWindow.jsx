import React, { useState, useRef, useEffect } from 'react';
import { ChatService } from '../../services/chatService';
import Message from './Message';
import MessageInput from './MessageInput';
import './Chat.css';

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (!chat?.id) return;

    const unsubscribe = ChatService.subscribeToChatMessages(chat.id, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content, attachments = []) => {
    if (!content.trim() && attachments.length === 0) return;
    
    await ChatService.sendMessage(
      chat.id,
      currentUser.uid,
      content,
      attachments.length > 0 ? 'media' : 'text',
      attachments
    );
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Удалить сообщение?')) {
      await ChatService.deleteMessage(chat.id, messageId);
    }
  };

  if (!chat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h3>Выберите чат для начала общения</h3>
          <p>Отправляйте сообщения, файлы и совершайте звонки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-info">
          <div className="chat-avatar">
            {chat.isGroup ? '👥' : chat.participantsInfo?.[0]?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <h3>{chat.isGroup ? chat.chatName : chat.participantsInfo?.[0]?.username}</h3>
            {!chat.isGroup && (
              <span className="status">
                {chat.participantsInfo?.[0]?.online ? 'online' : 'offline'}
              </span>
            )}
          </div>
        </div>
        <div className="chat-actions">
          <button className="icon-button" title="Начать звонок">
            📞
          </button>
          <button className="icon-button" title="Настройки чата">
            ⚙️
          </button>
        </div>
      </div>

      <div className="messages-container" ref={chatWindowRef}>
        {loading ? (
          <div className="loading-messages">Загрузка сообщений...</div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <p>Начните общение первым!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              currentUser={currentUser}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
