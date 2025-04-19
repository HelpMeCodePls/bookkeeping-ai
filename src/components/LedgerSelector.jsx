import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLedger } from '../store/ledger'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'

export default function LedgerSelector() {
  const { currentId, setId } = useLedger()
  const token = useAuthStore((s) => s.token)
  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers', token],
    queryFn : () => axios.get('/ledgers', { params: { token } }).then(r => r.data ?? []),
    enabled: !!token,
  })
  const current = ledgers.find(l => l._id === currentId) || { name:'Ledger' }
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
