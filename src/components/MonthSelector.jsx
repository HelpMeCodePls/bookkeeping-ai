// components/MonthSelector.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLedger } from '../store/ledger'
import dayjs from 'dayjs'

export default function MonthSelector() {
  const { month, setMonth } = useLedger()
  const change = (delta) => {
    setMonth(dayjs(month + '-01').add(delta, 'month').format('YYYY-MM'))
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={()=>change(-1)}><ChevronLeft size={18}/></button>
      <span className="w-24 text-center font-medium">{month}</span>
      <button onClick={()=>change(1)}><ChevronRight size={18}/></button>
    </div>
  )
}
