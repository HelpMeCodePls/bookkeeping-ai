import { useEffect, useRef, useState } from "react";
import { Send, Mic, Maximize2, MessageSquare, Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { sendMessageToAI, sendImageToOCR } from "../api/aiHandler";
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 添加文件类型验证
    if (!file.type.match('image.*')) {
      addMessage({ 
        role: 'bot', 
        content: '❌ Please upload an image file (JPEG, PNG, etc.)' 
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];
      addMessage({ role: 'user', content: '[Uploaded a receipt for OCR]' });
      setLoading(true);
      try {
        const result = await sendImageToOCR(base64Image);
        addMessage({ role: 'bot', content: `🧾 OCR Result:\n${result}` });
      } catch {
        addMessage({ role: 'bot', content: 'OCR failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

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

            {/* 修改输入栏部分 */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-2 border-t flex items-center gap-2">
              <input
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask me about your budget..."
                disabled={isLoading}
              />
              
              {/* 添加了tooltip的上传按钮 */}
              <div className="relative group">
                <label className="text-gray-500 hover:text-blue-500 cursor-pointer">
                  <Upload size={18} />
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Upload receipt (Image Only)
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-solid border-l-transparent border-r-transparent border-t-gray-800"></div>
                </div>
              </div>

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