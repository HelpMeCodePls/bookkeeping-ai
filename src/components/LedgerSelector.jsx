import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLedger } from '../store/ledger'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'

export default function LedgerSelector() {
  const { currentId, setId } = useLedger()
  const token = useAuthStore((s) => s.token)
  // 确保数据始终是数组格式
  const { data: ledgersResponse = [] } = useQuery({
    queryKey: ['ledgers', token],
    queryFn: async () => {
      try {
        const res = await axios.get('/ledgers', { params: { token } })
        // 处理可能的响应格式
        if (Array.isArray(res.data)) {
          return res.data
        } else if (Array.isArray(res.data?.data)) {
          return res.data.data
        } else if (Array.isArray(res.data?.ledgers)) {
          return res.data.ledgers
        }
        return []
      } catch (e) {
        console.error('Failed to fetch ledgers', e)
        return []
      }
    },
    enabled: !!token,
  })

  // 确保 ledgers 是数组
  const ledgers = Array.isArray(ledgersResponse) ? ledgersResponse : []
  const current = ledgers.find(l => l._id === currentId) || { name: 'Ledger' }
  const [open, setOpen] = useState(false)


  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-2 font-semibold">
        📂 {current.name}
        <ChevronDown size={16}/>
      </button>

      {open && (
        <div className="absolute mt-2 w-48 bg-card dark:bg-gray-800 shadow-card rounded-xl z-20">
          {ledgers.map(l => (
            <div
              key={l._id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${l._id===currentId?'bg-brand/10':''}`}
              onClick={()=>{ setId(l._id); setOpen(false) }}
            >
              {l.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
