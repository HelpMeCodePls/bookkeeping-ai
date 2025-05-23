// src/pages/ChatbotPage.jsx
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  User,
  Upload,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendMessageToAI, sendImageToOCR } from "../api/aiHandler";
import { useChatStore } from "../store/chatStore";
import { useState } from "react";
import { useAuthStore } from "../store/auth";

export default function ChatbotPage() {
  const { msg, setMsg, history, addMessage, isLoading, setLoading } =
    useChatStore();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  // const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const send = async (text = msg) => {
    if (!text.trim() || isLoading) return;
    addMessage({ role: "user", content: text });
    setMsg("");
    setLoading(true);
    try {
      const aiReply = await sendMessageToAI(text, userId);
      addMessage({ role: "bot", content: aiReply });
    } catch {
      addMessage({ role: "bot", content: "Sorry, an error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);

    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMsg(transcript);
      setIsListening(false);
    };
    recognition.start();
  };

  // const handleUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   if (!file.type.match('image.*')) {
  //     addMessage({
  //       role: 'bot',
  //       content: '❌ Please upload an image file (JPEG, PNG, etc.)'
  //     });
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onload = async () => {
  //     const base64Image = reader.result.split(',')[1];
  //     addMessage({ role: 'user', content: '[Uploaded a receipt for OCR]' });
  //     setLoading(true);

  //     try {
  //       const result = await sendImageToOCR(base64Image);
  //       if (result.includes('error') || result.includes('fail')) {
  //         throw new Error(result);
  //       }
  //       addMessage({ role: 'bot', content: result });
  //     } catch (error) {
  //       console.error('OCR Error:', error);
  //       addMessage({
  //         role: 'bot',
  //         content: 'Failed to process receipt. Please ensure the image is clear and try again.'
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   reader.readAsDataURL(file);
  // };

  const suggestions = [
    "Show me today's expenses",
    "What did I spend most on?",
    "How much did I spend on food this month?",
    "Give me a summary of my transport costs",
    "Which category did I spend the most on over the past 3 months?",
    "Which ledger had the highest total expense in April?",
  ];
  

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-brand"
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Sparkles size={16} />
              <h3 className="text-sm font-medium">Try asking me about:</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => send(s)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
                >
                  <p className="text-sm">{s}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {history.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[85%] ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 mt-1 ${
                  m.role === "user" ? "ml-3" : "mr-3"
                }`}
              >
                {m.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                )}
              </div>
              <div
                className={`rounded-xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-brand text-white rounded-tr-none"
                    : "bg-gray-100 shadow-sm rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%]">
              <div className="mr-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot size={16} />
                </div>
              </div>
              <div className="bg-gray-100 shadow-sm rounded-xl rounded-tl-none px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-brand bg-gray-50"
          placeholder="Ask about your expenses..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={isLoading}
        />

        {/* 
  <div className="relative group">
    <label className={
      `w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all
      ${isLoading ? 'bg-gray-300 text-gray-500' : 'bg-brand/10 text-brand hover:bg-brand/20'}`
    }>
      <div className="relative">
        <Upload size={20} strokeWidth={2} />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-gray-200">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-3.5-3.5L12 18" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        className="hidden" 
        disabled={isLoading}
      />
    </label>
    <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
      Upload receipt (Image only)
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-solid border-l-transparent border-r-transparent border-t-gray-800"></div>
    </div>
  </div> */}

        <div className="relative group">
          <button
            onClick={() => startVoiceInput()}
            disabled={isLoading}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all
        ${
          isLoading
            ? "bg-gray-300 text-gray-500"
            : "bg-brand/10 text-brand hover:bg-brand/20"
        }`}
          >
            <Mic size={20} strokeWidth={2} />
            {isListening && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </button>
          <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Voice input
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-solid border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>

        <button
          onClick={() => send()}
          disabled={isLoading || !msg.trim()}
          className={`rounded-full w-12 h-12 flex items-center justify-center transition-all
      ${
        isLoading || !msg.trim()
          ? "bg-gray-300 text-gray-500"
          : "bg-brand text-white hover:bg-brand/90"
      }`}
        >
          <Send size={20} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
