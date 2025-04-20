import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function ChatbotDrawer() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);

  const send = async () => {
    if (!msg.trim()) return;
    // 追加用户消息
    setHistory((h) => [...h, { role: "user", content: msg }]);
    setMsg("");
    try {
      const { data } = await axios.post("/agent/chat", { message: msg });
      setHistory((h) => [...h, { role: "bot", content: data.reply }]);
    } catch {
      setHistory((h) => [...h, { role: "bot", content: "Error: Api failed" }]);
    }
  };

  return (
    <>
      {/* 悬浮按钮 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-brand text-white p-3 rounded-full shadow-lg hover:bg-brand/90"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* 抽屉 */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 w-80 max-w-full h-full bg-card dark:bg-gray-800 border-l flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">AI Assistant</h3>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* 消息历史 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {history.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 max-w-[75%] ${
                    m.role === "user"
                      ? "ml-auto bg-brand text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* 输入框 */}
            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2
                           focus:outline-none focus:ring-1 focus:ring-brand bg-white dark:bg-gray-800"
                placeholder="Type a message…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} className="btn-primary">
                Send
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
