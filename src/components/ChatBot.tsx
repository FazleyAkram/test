'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  type: string;
  createdAt: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyReports = {
  "report1": {
    "title": "Sales Performance Q1",
    "data": [
      { "region": "North", "sales": 120000 },
      { "region": "South", "sales": 95000 },
      { "region": "East", "sales": 87000 },
      { "region": "West", "sales": 102000 }
    ]
  },
  "report2": {
    "title": "Website Traffic",
    "data": [
      { "page": "/home", "visits": 15000 },
      { "page": "/products", "visits": 12000 },
      { "page": "/contact", "visits": 3000 }
    ]
  },
  "report3": {
    "title": "Customer Feedback",
    "data": [
      { "customerId": "C001", "rating": 5, "comment": "Excellent service" },
      { "customerId": "C002", "rating": 4, "comment": "Good, but delivery was slow" },
      { "customerId": "C003", "rating": 3, "comment": "Average experience" }
    ]
  }
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('ChatBot render:', { isOpen, user: user?.id, authLoading });

  // Load chat history on component mount
  useEffect(() => {
    if (user?.id && isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/chat?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chatHistory || []);
        setMessages(data.chatHistory || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user?.id) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: userMessage,
      response: '',
      type: 'USER_QUERY',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user.id,
          reports: dummyReports
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: data.messageId,
          message: userMessage,
          response: data.response,
          type: 'SYSTEM_RESPONSE',
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev.filter(m => m.id !== `user-${Date.now()}`), aiMessage]);
        
        // Reload chat history to include new message
        await loadChatHistory();
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message: userMessage,
        response: 'Sorry, I encountered an error. Please try again.',
        type: 'SYSTEM_RESPONSE',
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev.filter(m => m.id !== `user-${Date.now()}`), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "How can I improve my campaign CTR?",
    "What does ROAS mean and how do I optimize it?",
    "How should I segment my audience?",
    "What metrics should I focus on for e-commerce?",
    "How can I optimize my Google Ads budget?"
  ];

  if (!isOpen || authLoading || !user?.id) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">CODI Assistant</h3>
              <p className="text-sm text-blue-100">AI Marketing Expert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-700 mb-2">Welcome to CODI!</h4>
            <p className="text-sm">Ask me anything about marketing, campaigns, or analytics.</p>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                💡 <strong>Pro Tip:</strong> Add a Google AI API key to your .env file for enhanced AI responses!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={msg.id} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs">
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>

            {/* AI Response */}
            {msg.response && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-xs">

                  <p className="text-sm whitespace-pre-wrap"><ReactMarkdown>{msg.response}</ReactMarkdown></p>

                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">CODI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about marketing..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}


