import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from 'axios'
import { fetchCategories, addCategory } from "../services/categoryService";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export default function CategoryPopover({ value, onChange }) {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    // queryFn: () => axios.get('/categories').then((r) => r.data),
    queryFn: fetchCategories,
  });

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    direction: "bottom",
  });

  const addMut = useMutation({
    // mutationFn: () => axios.post('/categories', { label: newLabel, icon: newIcon || '🗂️' }),
    mutationFn: () => addCategory({ label: newLabel, icon: newIcon || "🗂️" }),
    onSuccess: () => {
      qc.invalidateQueries(["categories"]);
      setAdding(false);
      setNewLabel("");
      setNewIcon("");
    },
  });

  useEffect(() => {
    if (open && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      const direction =
        spaceBelow < 300 && spaceAbove > spaceBelow ? "top" : "bottom";

      let left = buttonRect.left;
      const popoverWidth = 288; // 72 * 4rem
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 10;
      }

      setPosition({
        top:
          direction === "bottom" ? buttonRect.bottom + 8 : buttonRect.top - 8,
        left,
        direction,
      });
    }
  }, [open, adding]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="input w-full flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        {value || "Select category…"}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/10 z-20"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={popoverRef}
              initial={{
                opacity: 0,
                scale: 0.95,
                y: position.direction === "bottom" ? 10 : -10,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: position.direction === "bottom" ? 10 : -10,
              }}
              className="fixed z-30 bg-card dark:bg-gray-800 rounded-xl shadow-card w-72 overflow-y-auto"
              style={{
                top: position.direction === "bottom" ? position.top : "auto",
                bottom:
                  position.direction === "top"
                    ? window.innerHeight - position.top
                    : "auto",
                left: position.left,
                maxHeight:
                  position.direction === "bottom"
                    ? `calc(100vh - ${position.top + 20}px)`
                    : `calc(${position.top - 20}px)`,
              }}
            >
              <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {(cats || []).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                      onClick={() => {
                        onChange(c.key);
                        setOpen(false);
                      }}
                      title={c.label}
                      style={{ minHeight: "48px" }}
                    >
                      <div className="text-xl">{c.icon}</div>
                      <div className="truncate">{c.label}</div>
                    </button>
                  ))}
                </div>

                {!adding ? (
                  <button
                    type="button"
                    className="btn-ghost w-full flex items-center justify-center gap-2"
                    onClick={() => setAdding(true)}
                  >
                    <Plus size={16} /> Add New
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      className="input w-full"
                      placeholder="Label"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      autoFocus
                    />
                    <input
                      className="input w-full"
                      placeholder="Icon (emoji)"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                    />

                    <div className="grid grid-cols-6 gap-1">
                      {[
                        "🛒",
                        "🎮",
                        "🍔",
                        "✈️",
                        "🏠",
                        "💼",
                        "🎁",
                        "📚",
                        "🍻",
                        "🎵",
                      ].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          className="text-2xl hover:scale-110 transition"
                          onClick={() => setNewIcon(emo)}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-ghost"
                        onClick={() => setAdding(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => addMut.mutate()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
