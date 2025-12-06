'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, Loader2, User, Bot, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import getSocketService from '../lib/socket';
import { messageAPI } from '../lib/api';
import styles from '../styles/ChatInterface.module.css';
import { useEventData } from '@/hooks/useEventData';

interface Message {
  id: string;
  eventId?: string;
  question: string;
  answer?: string;
  status: string;
  userName: string;
  userEmail?: string;
  userId: string;
  createdAt: string;
  questionType?: string;
  answeredBy?: string;
  answerSource?: string;
  confidence?: number;
}

interface TypingUser {
  userId: string;
  userName: string;
}

const ChatInterface: React.FC = () => {
  const { user, event } = useEventData();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketServiceRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);

    if (!event || !user) return;

    // Initialize socket service on client side only
    socketServiceRef.current = getSocketService();
    if (!socketServiceRef.current) return;

    // Connect to socket
    const socket = socketServiceRef.current.connect();
    socketServiceRef.current.joinEvent(event.id, user.id, user.name);

    // Load existing messages
    loadMessages();

    // Socket event listeners
    socketServiceRef.current.on('receive-answer', handleReceiveAnswer);
    socketServiceRef.current.on('question-escalated', handleQuestionEscalated);
    socketServiceRef.current.on('ai-processing', handleAIProcessing);
    socketServiceRef.current.on('typing', handleTyping);
    socketServiceRef.current.on('error', handleError);

    return () => {
      if (socketServiceRef.current) {
        socketServiceRef.current.off('receive-answer', handleReceiveAnswer);
        socketServiceRef.current.off('question-escalated', handleQuestionEscalated);
        socketServiceRef.current.off('ai-processing', handleAIProcessing);
        socketServiceRef.current.off('typing', handleTyping);
        socketServiceRef.current.off('error', handleError);
      }
    };
  }, [event, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getByEvent(event.id, user.id);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleReceiveAnswer = (message) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (exists) {
        return prev.map(m => m.id === message.id ? message : m);
      }
      return [...prev, message];
    });
    setIsLoading(false);
  };

  const handleQuestionEscalated = (data) => {
    setIsLoading(false);
    // Show notification that question was sent to organizer
  };

  const handleAIProcessing = () => {
    setIsLoading(true);
  };

  const handleTyping = ({ userId, userName, isTyping }) => {
    if (userId === user.id) return;

    setTypingUsers(prev => {
      if (isTyping) {
        return [...prev.filter(u => u.userId !== userId), { userId, userName }];
      }
      return prev.filter(u => u.userId !== userId);
    });
  };

  const handleError = (error) => {
    console.error('Socket error:', error);
    alert(error.message || 'An error occurred');
    setIsLoading(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || !socketServiceRef.current) return;

    const questionData = {
      eventId: event.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      question: inputMessage.trim(),
      questionType
    };

    // Add message optimistically
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      eventId: event.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      question: inputMessage.trim(),
      questionType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    socketServiceRef.current.sendQuestion(questionData);
    setInputMessage('');
    setIsLoading(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!socketServiceRef.current) return;

    // Send typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketServiceRef.current.sendTyping({
      eventId: event.id,
      userId: user.id,
      userName: user.name,
      isTyping: true
    });

    typingTimeoutRef.current = setTimeout(() => {
      if (socketServiceRef.current) {
        socketServiceRef.current.sendTyping({
          eventId: event.id,
          userId: user.id,
          userName: user.name,
          isTyping: false
        });
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMessage = (message) => {
    const isUser = true; // All questions are from user perspective in this view
    const hasAnswer = message.answer && message.status === 'answered';

    return (
      <div key={message.id} className={styles.messageContainer}>
        {/* User Question */}
        <div className={`${styles.message} ${styles.userMessage}`}>
          <div className={styles.messageAvatar}>
            <User size={20} />
          </div>
          <div className={styles.messageContent}>
            <div className={styles.messageHeader}>
              <span className={styles.messageAuthor}>{message.userName}</span>
              <span className={styles.messageTime}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
              {message.questionType === 'personalized' && (
                <span className={styles.messageBadge}>Private</span>
              )}
            </div>
            <div className={styles.messageText}>{message.question}</div>
          </div>
        </div>

        {/* AI/Organizer Answer */}
        {hasAnswer && (
          <div className={`${styles.message} ${styles.aiMessage}`}>
            <div className={styles.messageAvatar}>
              <Bot size={20} />
            </div>
            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <span className={styles.messageAuthor}>
                  {message.responseSource === 'ai' ? 'AI Assistant' : 'Organizer'}
                </span>
                <span className={styles.messageTime}>
                  {formatDistanceToNow(new Date(message.answeredAt), { addSuffix: true })}
                </span>
                {message.responseSource === 'ai' && message.aiConfidence && (
                  <span className={styles.messageConfidence}>
                    {Math.round(message.aiConfidence * 100)}% confident
                  </span>
                )}
              </div>
              <div className={styles.messageText}>{message.answer}</div>
            </div>
          </div>
        )}

        {/* Pending Status */}
        {!hasAnswer && message.status === 'escalated' && (
          <div className={`${styles.message} ${styles.statusMessage}`}>
            <Loader2 className={styles.spinning} size={16} />
            <span>Waiting for organizer response...</span>
          </div>
        )}
      </div>
    );
  };

  if (!mounted) {
    return <div className={styles.chatLoading}>Loading...</div>;
  }

  if (!event || !user) {
    return <div className={styles.chatLoading}>Loading...</div>;
  }

  return (
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <MessageCircle size={24} />
        <div className={styles.chatHeaderInfo}>
          <h2>{event.name}</h2>
          <p>Ask questions and get instant AI-powered responses</p>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.map(renderMessage)}

        {typingUsers.length > 0 && (
          <div className={styles.typingIndicator}>
            <Loader2 className={styles.spinning} size={16} />
            <span>{typingUsers.map(u => u.userName).join(', ')} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className={styles.chatInputContainer} onSubmit={handleSendMessage}>
        <div className={styles.questionTypeSelector}>
          <label>
            <input
              type="radio"
              value="general"
              checked={questionType === 'general'}
              onChange={(e) => setQuestionType(e.target.value)}
            />
            <span>General (shared with all)</span>
          </label>
          <label>
            <input
              type="radio"
              value="personalized"
              checked={questionType === 'personalized'}
              onChange={(e) => setQuestionType(e.target.value)}
            />
            <span>Private (only for you)</span>
          </label>
        </div>

        <div className={styles.chatInputWrapper}>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className={styles.chatInput}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.chatSendButton}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? <Loader2 className={styles.spinning} size={20} /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
