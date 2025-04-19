// src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useLedger } from '../store/ledger' 

// const ledgerId = 'demoLedger'
// const budget = 1000 // demo，用 ledgers API 真数据时再替换

export default function Dashboard() {
    const { currentId: ledgerId, budget } = useLedger() 
  // 拉所有记录
  const { data: records = [] } = useQuery({
    queryKey: ['records-dashboard', ledgerId],
    queryFn: () => axios.get(`/ledgers/${ledgerId}/records`).then((r) => r.data),
    enabled: !!ledgerId, // 只有在有 ledgerId 时才拉数据
  })

  const spent = records.reduce((s, r) => s + Number(r.amount || 0), 0)
  const rest  = budget - spent

  const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25 },
  }

return (
    <motion.div
        className="p-6 grid grid-cols-3 gap-6"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
    >
        {/* 总支出卡片 */}
        <motion.div
            className="bg-white shadow rounded-xl p-4"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUp.transition}
        >
            <h3 className="text-gray-500 text-sm">Total Spent</h3>
            <p className="text-2xl font-semibold mt-1">${spent.toFixed(2)}</p>
        </motion.div>

        {/* 剩余额度 */}
        <motion.div
            className="bg-white shadow rounded-xl p-4"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUp.transition}
        >
            <h3 className="text-gray-500 text-sm">Budget Left</h3>
            <p className={`text-2xl font-semibold mt-1 ${rest < 0 ? 'text-red-600' : ''}`}>
                ${rest.toFixed(2)}
            </p>
        </motion.div>

        {/* 预算条 */}
        <motion.div
            className="col-span-3 bg-white shadow rounded-xl p-4"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUp.transition}
        >
            <h3 className="text-gray-500 text-sm mb-2">Monthly Budget Progress</h3>
            <div className="w-full h-4 bg-gray-200 rounded">
                <div
                    style={{ width: `${Math.min(spent / budget, 1) * 100}%` }}
                    className={`h-full rounded ${spent > budget ? 'bg-red-500' : 'bg-blue-600'}`}
                />
            </div>
            {spent > budget && (
                <p className="mt-2 text-sm text-red-600">
                    ⚠️ Budget exceeded by ${(spent - budget).toFixed(2)}
                </p>
            )}
        </motion.div>
    </motion.div>
)}
