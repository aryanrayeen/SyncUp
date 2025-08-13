import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../lib/axios";

const botIcon = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="#fff" />
    <g>
      <rect x="18" y="24" width="28" height="20" rx="10" stroke="#4F46E5" strokeWidth="2" fill="none" />
      <circle cx="28" cy="34" r="2" fill="#4F46E5" />
      <circle cx="36" cy="34" r="2" fill="#4F46E5" />
      <path d="M28 40c1.5 2 6.5 2 8 0" stroke="#4F46E5" strokeWidth="2" fill="none" />
      <rect x="40" y="20" width="8" height="8" rx="4" stroke="#4F46E5" strokeWidth="2" fill="none" />
    </g>
  </svg>
);

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "How may I help you?" }
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
    setMessages([...messages, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const res = await axios.post("/chatbot", { message: input });
      setMessages((msgs) => [...msgs, { sender: "bot", text: res.data.reply }]);
    } catch {
      setMessages((msgs) => [...msgs, { sender: "bot", text: "Sorry, something went wrong." }]);
    }
    setInput("");
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
  }, [messages, open]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Icon always visible, grayed out when chat is open */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2 }}
        className={`btn btn-circle btn-lg shadow-xl ${open ? 'bg-gray-300 cursor-pointer' : 'btn-primary'}`}
        style={{ opacity: open ? 0.5 : 1 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {botIcon}
      </motion.button>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-80 bg-base-100 rounded-xl shadow-2xl border border-base-300 flex flex-col"
          >
            <div className="px-4 pt-4 pb-2">
              <div className="flex justify-center mb-2">
                <span className="badge badge-lg badge-primary text-lg">Helper Bot</span>
              </div>
              <div ref={chatRef} className="overflow-y-auto h-48 mb-2 flex flex-col gap-2">
                {messages.map((msg, i) => (
                  <div key={i} className={msg.sender === "bot" ? "text-primary" : "text-base-content text-right"}>
                    <span className="font-bold">{msg.sender === "bot" ? "Bot" : "You"}:</span> {msg.text}
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSend} className="px-4 pb-4">
              <input
                ref={inputRef}
                type="text"
                className="input input-bordered w-full rounded-xl"
                placeholder="Enter Text Here"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatBot;
