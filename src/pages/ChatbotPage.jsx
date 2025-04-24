import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessageToAI } from '../api/aiHandler';
import { useChatStore } from '../store/chatStore';

export default function ChatbotPage() {
  const {
    msg,
    setMsg,
    history,
    addMessage,
    isLoading,
    setLoading,
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const send = async (text = msg) => {
    if (!text.trim() || isLoading) return;

    addMessage({ role: 'user', content: text });
    setMsg('');
    setLoading(true);

    try {
      const aiReply = await sendMessageToAI(text);
      addMessage({ role: 'bot', content: aiReply });
    } catch {
      addMessage({ role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Show me today's expenses",
    "Suggest a budget plan",
    "What did I spend most on?",
    "How much did I spend on food this month?",
    "Give me a summary of my transport costs"
  ];

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 顶部导航栏 */}
      <div className="p-4 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
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
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left shadow-sm transition-all"
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
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[85%] lg:max-w-[70%] ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 mt-1 ${m.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                {m.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                    <User size={16} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                )}
              </div>
              <div
                className={`rounded-xl px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-brand text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-gray-700 shadow-sm rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] lg:max-w-[70%]">
              <div className="mr-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 shadow-sm rounded-xl rounded-tl-none px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand bg-gray-50 dark:bg-gray-800 transition-all"
            placeholder="Ask about your expenses..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={isLoading}
          />
          <button 
            onClick={() => send()} 
            className="btn-primary rounded-full w-12 h-12 flex items-center justify-center"
            disabled={isLoading || !msg.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
