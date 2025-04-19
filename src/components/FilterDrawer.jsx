import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function FilterDrawer({ open, onClose, filters, setFilters }) {
  const { data: cats = [] } = useQuery({
    queryKey: ['categories'],
    queryFn : () => axios.get('/categories').then(r=>r.data),
  })
  const toggleCat = (key) =>
    setFilters(prev => {
      const set = new Set(prev.categories)
      set.has(key) ? set.delete(key) : set.add(key)
      return { ...prev, categories: Array.from(set) }
    })

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
          transition={{ type:'tween', duration:0.25 }}
          className="fixed top-0 right-0 w-72 h-full bg-card dark:bg-gray-800 border-l flex flex-col z-50"
        >
          <header className="p-4 flex justify-between items-center border-b">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={onClose}><X size={20}/></button>
          </header>

          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {/* category */}
            <div>
              <h4 className="mb-2 font-medium">Category</h4>
              <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                  <button
                    key={c.key}
                    onClick={()=>toggleCat(c.key)}
                    className={`px-2 py-1 rounded-md border text-sm
                      ${filters.categories.includes(c.key)
                        ? 'bg-brand/10 border-brand text-brand'
                        : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* split member */}
            <div>
              <h4 className="mb-2 font-medium">Split With</h4>
              <input
                className="input w-full"
                placeholder="Teammate email"
                value={filters.split}
                onChange={e=>setFilters({ ...filters, split:e.target.value })}
              />
            </div>
          </div>

          <footer className="p-4 border-t flex justify-end">
            <button className="btn-ghost mr-2" onClick={()=>setFilters({ categories:[], split:'' })}>
              Clear
            </button>
            <button className="btn-primary" onClick={onClose}>Apply</button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
