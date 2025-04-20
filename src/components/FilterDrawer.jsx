import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useLedger } from '../store/ledger'

export default function FilterDrawer({ 
  open, 
  onClose, 
  filters, 
  setFilters,
  categories: propCategories 
}) {
  // 使用传入的 categories 或从 API 获取
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(r=>r.data),
    enabled: !propCategories // 如果没有传入 categories 才获取
  });
  
  const { currentId: ledgerId } = useLedger();

   const { data: collaborators = [] } = useQuery({
       queryKey: ['collaborators', ledgerId],
       queryFn: () => axios.get(`/ledgers/${ledgerId}/collaborators`).then(r => r.data),
       enabled: open && !!ledgerId
     });

  const cats = propCategories || fetchedCategories;
  const [expandedSection, setExpandedSection] = useState('categories');
  
  const toggleCat = (key) => {
    setFilters(prev => {
      const set = new Set(prev.categories);
      set.has(key) ? set.delete(key) : set.add(key);
      return { ...prev, categories: Array.from(set) };
    });
  };

  const toggleAllCategories = (selectAll) => {
    setFilters(prev => ({
      ...prev,
      categories: selectAll ? cats.map(c => c.key) : []
    }));
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed top-0 right-0 w-80 h-full bg-card dark:bg-gray-800 border-l flex flex-col z-50 shadow-xl"
        >
          <header className="p-4 flex justify-between items-center border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {/* Categories Section */}
            <div className="border-b dark:border-gray-700">
              <button
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => toggleSection('categories')}
              >
                <div className="flex items-center">
                  <span className="font-medium">Categories</span>
                  {filters.categories.length > 0 && (
                    <span className="ml-2 text-xs bg-brand/10 text-brand rounded-full px-2 py-1">
                      {filters.categories.length} selected
                    </span>
                  )}
                </div>
                {expandedSection === 'categories' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {expandedSection === 'categories' && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex justify-between mb-2">
                    <button
                      onClick={() => toggleAllCategories(true)}
                      className="text-xs text-brand hover:underline"
                    >
                      Select all
                    </button>
                    <button
                      onClick={() => toggleAllCategories(false)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {cats.map(c => (
                      <button
                        key={c.key}
                        onClick={() => toggleCat(c.key)}
                        className={`flex items-center p-2 rounded-md border text-sm transition-colors
                          ${filters.categories.includes(c.key)
                            ? 'bg-brand/10 border-brand text-brand'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        {filters.categories.includes(c.key) && (
                          <Check size={16} className="mr-1" />
                        )}
                        <span className="mr-1">{c.icon}</span>
                        <span className="truncate">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
{/* Collaborators Section */}
<div className="border-b dark:border-gray-700">
  <button
    className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"
    onClick={() => toggleSection('collaborators')}
  >
    <span className="font-medium">Collaborators</span>
    {expandedSection === 'collaborators' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
  </button>
  
  {expandedSection === 'collaborators' && (
    <div className="px-4 pb-4 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {collaborators.map(c => (
          <button
            key={c.userId}
            onClick={() => setFilters(prev => ({
              ...prev,
              collaborator: prev.collaborator === c.userId ? '' : c.userId
            }))}
            className={`flex items-center p-2 rounded-md border text-sm transition-colors
              ${filters.collaborator === c.userId
                ? 'bg-brand/10 border-brand text-brand'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <span className="mr-2">{c.avatar}</span>
            <span className="truncate">{c.name || c.email}</span>
          </button>
        ))}
      </div>
    </div>
  )}
</div>

          </div>

          <footer className="p-4 border-t dark:border-gray-700 flex justify-between">
            <button 
              className="btn-ghost"
              onClick={() => setFilters({ categories: [], split: '' })}
            >
              Reset All
            </button>
            <button 
              className="btn-primary"
              onClick={onClose}
            >
              Apply Filters
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}