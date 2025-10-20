'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  type: string;
  source: string;
  createdAt: string;
}

export function useAI(messageSource: string) {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (reportId = null) => {
    if (!user?.id) return;
    
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/chat/load?source=${messageSource}&reportId=${reportId}`); // Include relevant import to filter by if parsed
      if (response.ok) {
        const data = await response.json();
        setMessages(data.chatHistory || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const clearChatHistory = async (reportId = null) => {
    if (!user?.id) return;

    try {
      setMessages([]); // Clear messages on the front end before clearing on the backend
      setMessagesLoading(true);
      const response = await fetch(`/api/chat/clear?source=${messageSource}&reportId=${reportId}`);
      if (response.ok) {
        await response.json();
        return;
      }
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (message: string, reports?: any, summary?: any) => {
    const userMessage = message.trim();
    if (!userMessage || !user?.id) return;

    // Handle no reports or summaries being included for context, mainly used for chat bot window
    reports = reports ?? {};
    summary = summary ?? {};

    const userMessageId = `user-${Date.now()}`;
    
    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      message: userMessage,
      response: '',
      type: 'USER_QUERY',
      source: messageSource,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setBotLoading(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          reports: reports,
          summary: summary,
          source: messageSource
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessageId
            ? { ...msg, response: data.response, type: 'SYSTEM_RESPONSE' }
            : msg
        )
      );
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update user message with error response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessageId
            ? {
              ...msg,
              response: 'Sorry, I encountered an error. Please try again.',
              type: 'SYSTEM_RESPONSE',
            }
          : msg
        )
      );
    } finally {
      setBotLoading(false);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    botLoading,
    messagesLoading,
    sendMessage,
    loadChatHistory,
    clearChatHistory,
    scrollToBottom,
    messagesEndRef
  };
}