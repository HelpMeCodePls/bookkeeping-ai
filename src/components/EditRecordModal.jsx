import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import CalculatorPopover from '../components/CalculatorPopover'; // ✅ 已有
// import CategorySelect from '../components/CategorySelect'; // ✅ 新增导入
import CategoryPopover from './CategoryPopover';
import { useLedger } from '../store/ledger'; 

export default function EditRecordModal({ open, onClose, record = {}, isNew = false, onSubmit }) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({ defaultValues: record });
  const qc = useQueryClient();
  const { currentId: ledgerId } = useLedger();

  const handleSave = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      if (isNew) {
        await axios.post(`/ledgers/${ledgerId}/records`, data);
      } else {
        await axios.put(`/records/${record.id}`, data);
      }
    }
    qc.invalidateQueries(['records']);
    qc.invalidateQueries(['incomplete']);
    onClose();
  };

  React.useEffect(() => {
    reset(record);
  }, [record, reset]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card dark:bg-gray-800 rounded-xl p-6 w-[320px]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h3 className="font-semibold mb-4">{isNew ? 'Add Record' : 'Edit Record'}</h3>

            <form className="space-y-3" onSubmit={handleSubmit(handleSave)}>
              
              {/* 金额 + 计算器 */}
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Amount"
                  {...register('amount')}
                />
                <CalculatorPopover onConfirm={(v) => setValue('amount', v)} />
              </div>

              {/* 日期 */}
              <input
                className="input w-full"
                type="date"
                {...register('date')}
              />

              {/* 分类选择 */}
              <CategoryPopover
                value={watch('category')}
                onChange={(v) => setValue('category', v)}
              />

              {/* 描述 */}
              <input
                className="input w-full"
                placeholder="Description"
                {...register('description')}
              />

              {/* 按钮区 */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button className="btn-primary" type="submit">
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
