import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalculatorPopover({ onConfirm }) {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);

  const handleButtonClick = (val) => {
    setExpr((prev) => prev + val);
  };

  const handleClear = () => {
    setExpr('');
    setResult(null);
  };

  const handleBackspace = () => {
    setExpr((prev) => prev.slice(0, -1));
  };

  const handleCalc = () => {
    try {
      const evaluated = Function(`'use strict'; return (${expr})`)();
      const fixed = Number(evaluated.toFixed(2));
      setExpr(String(fixed));  // 🔥直接把结果塞回输入框
      setResult(fixed);        // （其实可以不再用 result 了，但保留也可以）
    } catch {
      alert('Invalid expression');
    }
  };
  

  const handleApply = () => {
    if (result !== null) {
      onConfirm(result);
      setOpen(false);
      setExpr('');
      setResult(null);
    } else {
      alert('Please calculate first.');
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} type="button" className="ml-2 text-muted hover:text-brand">
        🧮
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className="fixed inset-0 bg-black/10 z-20"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Calculator 本体 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 mt-2 bg-card dark:bg-gray-800 p-4 rounded-xl shadow-card w-72 z-30"
            >
              {/* 输入框 */}
              <input
                className="input w-full mb-3 text-right font-mono"
                placeholder="0"
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
              />


              {/* 数字键盘 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['7', '8', '9', '+',
                  '4', '5', '6', '-',
                  '1', '2', '3', '*',
                  '0', '.', '←', '/'
                ].map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-lg p-2 rounded"
                    onClick={() => {
                      if (key === 'C') handleClear();
                      else if (key === '←') handleBackspace();
                      else handleButtonClick(key);
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* = 和 Apply */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCalc}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded flex-1 py-2 font-semibold"
                >
                  =
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="btn-primary flex-1 py-2"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
