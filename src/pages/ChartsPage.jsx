import { useQuery } from '@tanstack/react-query'
// import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useLedger } from '../store/ledger'
import { fetchChartSummary } from '../services/chartService'
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1']

export default function ChartsPage() {

  const { currentId: ledgerId, month } = useLedger()

  const { data = { byCategory: {}, daily: [] } } = useQuery({
    queryKey: ['charts', ledgerId, month],
    // queryFn: () => axios.get('/charts/summary', { params: { ledgerId, month } }).then((r) => r.data),
    queryFn: () => fetchChartSummary({ ledgerId, mode: 'month', selectedDate: month }),
    enabled: !!ledgerId, // 只有在有 ledgerId 时才拉数据
})

  const pieData = Object.entries(data.byCategory).map(([name, value]) => ({ name, value }))
  const lineData = data.daily.map(([date, value]) => ({ date, value }))

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-bold mb-2">By Category</h3>
        <PieChart width={300} height={300}>
          <Pie data={pieData} cx={150} cy={150} outerRadius={100} dataKey="value" label>
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div>
        <h3 className="font-bold mb-2">Daily Trend</h3>
        <LineChart width={400} height={300} data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  )
}
