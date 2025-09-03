import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../lib/axios";

const botIcon = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#fff" />
    <g>
      <rect x="9" y="12" width="14" height="10" rx="5" stroke="#10B981" strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="17" r="1" fill="#10B981" />
      <circle cx="18" cy="17" r="1" fill="#10B981" />
      <path d="M14 20c0.75 1 3.25 1 4 0" stroke="#10B981" strokeWidth="1.5" fill="none" />
      <rect x="20" y="10" width="4" height="4" rx="2" stroke="#10B981" strokeWidth="1.5" fill="none" />
    </g>
  </svg>
);

const sendIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your SyncUp assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  // Ensure input stays focused when messages update and chat is open
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    
    try {
      // Use the public API endpoint
      const res = await axios.post("/public/chat", { message: userMessage });
      setMessages((msgs) => [...msgs, { sender: "bot", text: res.data.reply }]);
    } catch (error) {
      console.error('Chat error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setMessages((msgs) => [...msgs, { 
        sender: "bot", 
        text: "I'm having trouble connecting right now. Please try again in a moment!" 
      }]);
    }
    
    setLoading(false);
    // Refocus input after async updates
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Icon */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open 
            ? 'bg-gray-400 opacity-70' 
            : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105'
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {botIcon}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  {botIcon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">SyncUp Assistant</h3>
                  <p className="text-emerald-100 text-xs">Always ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white hover:text-emerald-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-emerald-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendIcon}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatBot;
