'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAI } from '@/components/AI';
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBotWindow({ isOpen, onClose }: ChatBotProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { messages, inputMessage, setInputMessage, botLoading, messagesLoading, sendMessage, loadChatHistory, clearChatHistory, scrollToBottom, messagesEndRef } =
    useAI("WINDOW");

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

  // Suggested questions, general and friendly to new users
  const suggestedQuestions = [
    // About the website
    "I'm new to CODi, what features are available to me?",
    "How can you help improve my marketing strategy?",

    // About marketing but generalised
    "What does ROI mean in marketing?",
    "Can you explain what a sales funnel is?",
    "What is a brand persona?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage); // Don't use any reports or summary in reply
    setInputMessage("");
  };

  // Clear current and previous messages
  const handleClearChat = () => {
    setInputMessage("");
    clearChatHistory();
  }

  // Prevents the chat window from rendering when it isn't supposed to
  if (!isOpen || authLoading || !user?.id) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="text-white p-4 rounded-t-2xl" style={{ background: '#365B5E' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">AskCODi</h3>
              <p className="text-sm text-white/80">AI Marketing Expert</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              disabled={botLoading || messagesLoading}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
              </svg>
            </button>
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-gray-500 pt-2 pb-1">
          <div className="flex items-center justify-center mx-auto">
            <img
              src="/logos/side.png"
              alt="CODi Logo"
              className="chatbot-logo-animate"
              style={{ width: '280px', height: 'auto' }}
            />
          </div>
          <h4 className="font-medium text-gray-700">Hello, I'm AskCODi!</h4>
          <p className="text-sm mb-1">Ask me anything about CODi or marketing.</p>
        </div>

        {/* Suggested Questions */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{ backgroundColor: '#FFF4ED', color: '#E59853' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE8D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF4ED'}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {messages.map((msg, index) => (
          <div key={msg.id} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs" style={{ background: 'linear-gradient(135deg, #365B5E, #A3BCBA)' }}>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>

            {/* AI Response */}
            {msg.response && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md max-w-xs" style={{ backgroundColor: '#FFF4ED', color: '#333' }}>
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 text-sm" {...props} />, // Paragraph spacing
                      ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2" {...props} />, // List spacing
                      li: ({ node, ...props }) => <li className="ml-4 list-disc text-sm" {...props} />,
                    }}
                  >
                    {msg.response}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {botLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ backgroundColor: '#FFF4ED' }}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#E59853' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#E59853', animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#E59853', animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm" style={{ color: '#E59853' }}>AskCODi is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* Chat Messages Loading Message */}
        <div className="relative bottom-0 left-0 w-full flex justify-start px-4 py-3 bg-gray-50 bg-opacity-80">
          {messagesLoading && (
            <div className="flex space-x-1 mt-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about CODi or marketing..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={botLoading || messagesLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || botLoading || messagesLoading}
            className="text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#E59853' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#D4873E')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E59853'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes chatbotScaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .chatbot-logo-animate {
          animation: chatbotScaleIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}


