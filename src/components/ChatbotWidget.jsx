import { useEffect, useRef, useState } from "react";
import { Send, Mic, Maximize2, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { sendMessageToAI } from "../api/aiHandler";
import { useChatStore } from "../store/chatStore";

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [open, setOpen] = useState(false);

  const {
    msg,
    setMsg,
    history,
    isLoading,
    setLoading,
    addMessage,
  } = useChatStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  if (location.pathname === "/chatbot") return null;

  const send = async (text = msg) => {
    if (!text.trim() || isLoading) return;

    addMessage({ role: "user", content: text });
    setMsg("");
    setLoading(true);

    try {
      const aiReply = await sendMessageToAI(text);
      addMessage({ role: "bot", content: aiReply });
    } catch {
      addMessage({ role: "bot", content: "Sorry, I encountered an error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    "📊 Show weekly summary",
    "📈 pending trends",
    "➕ Add expense",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="chatbot-widget"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-[340px] h-[400px] rounded-xl shadow-lg border bg-white flex flex-col"
          >
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-100 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">🤖</div>
                Spendora Assistant
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => navigate("/chatbot"), 200);
                  }}
                >
                  <Maximize2 size={16} />
                </button>
                <button onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>

            {/* 聊天内容区域 */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-sm">
              <AnimatePresence initial={false}>
                {history.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`px-3 py-2 rounded-lg max-w-[75%] ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 italic">
                  Spendora Assistant is thinking...
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入栏 */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-2 border-t flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask me about your budget..."
                disabled={isLoading}
              />
              <button className="text-gray-500 hover:text-blue-500" onClick={() => alert("Voice not implemented")}>
                <Mic size={18} />
              </button>
              <button
                onClick={() => send()}
                disabled={!msg.trim() || isLoading}
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
              >
                <Send size={16} />
              </button>
            </motion.div>

            {/* 快捷按钮 */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-3 py-2 flex gap-2 flex-wrap text-sm border-t bg-gray-50">
              {quickReplies.map((text, i) => (
                <button
                  key={i}
                  onClick={() => send(text.replace(/^[^a-zA-Z]+/, ""))}
                  className="bg-white border rounded-md px-2 py-1 hover:bg-gray-100 transition-colors"
                >
                  {text}
                </button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-open-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
          >
            <MessageSquare size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
