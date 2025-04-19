import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function AlertsPage() {
  const qc = useQueryClient()
  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn : () => axios.get('/notifications').then(r=>r.data)
  })

  const mark = useMutation({
    mutationFn: (id) => axios.patch(`/notifications/${id}`),
    onSuccess : () => qc.invalidateQueries(['notes'])
  })

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Alerts</h2>
      {notes.map(n => (
        <div key={n.id} className="border p-3 rounded flex justify-between">
          <span>{n.content}</span>
          {!n.is_read && <button className="btn-ghost" onClick={()=>mark.mutate(n.id)}>Mark read</button>}
        </div>
      ))}
      {!notes.length && <p>No alerts 🎉</p>}
    </div>
  )
}
