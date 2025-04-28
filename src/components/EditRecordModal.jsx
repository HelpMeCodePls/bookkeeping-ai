import { useForm, useFieldArray } from "react-hook-form";
// import axios from "axios";
import { fetchCollaborators } from "../handlers/collaboratorHandlers";
import {
    createRecord,
    updateRecord,
  } from "../handlers/recordHandlers";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import CalculatorPopover from "../components/CalculatorPopover";
import CategoryPopover from "./CategoryPopover";
import { useLedger } from "../store/ledger";
import usePermission from "../hooks/usePermission";
import { useAuthStore } from "../store/auth";
import React from "react";

export default function EditRecordModal({
  open,
  onClose,
  record = {},
  isNew = false,
  onSubmit,
}) {
  const user = useAuthStore((s) => s.user);
  const { currentId: ledgerId } = useLedger();
  const { register, handleSubmit, reset, setValue, watch, control } = useForm({
    defaultValues: {
      ...(record ?? {}),
      split: record?.split || [],
      date: record?.date || new Date().toISOString().split("T")[0],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "split" });
  const qc = useQueryClient();
  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators", ledgerId],
    // queryFn: () =>
    //   axios.get(`/ledgers/${ledgerId}/collaborators`).then((r) => r.data),
    queryFn: () => fetchCollaborators(ledgerId),
    enabled: !!ledgerId,
  });
  const { data: permission } = usePermission(record?.ledger_id);
  const isReadOnly = permission?.permission === "VIEWER";
  const commonRatios = [25, 33, 50, 66, 75, 100];

  const handleSave = async (data) => {
    try {
      // 1. 自动处理 split ratio/amount
      if (data.split?.length > 0 && data.amount) {
        // 确保 ratio 是数字且有效
        data.split = data.split.map((s) => ({
          ...s,
          ratio: Math.min(100, Math.max(0, Number(s.ratio || 0))),
        }));

        // 计算每个 split 的金额 (直接按比例计算，不考虑总和)
        data.split = data.split.map((s) => ({
          user_id: s.userId,
          ratio: s.ratio,
          amount: (data.amount * s.ratio) / 100, // 直接按比例计算
        }));
      }

      // 2. 判断 status
      if (!data.amount || !data.date || !data.category) {
        data.status = "incomplete";
      } else {
        data.status = "confirmed";
      }

      // 3. 设置创建者/更新者
      if (isNew) {
        data.createdBy = user?.id;
        data.updatedBy = user?.id;
      } else {
        data.updatedBy = user?.id;
      }

      // 4. 保存
      const payload = {
        ...data,
        ledger_id: ledgerId, // 确保有 ledger_id
        split: data.split || [],
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        if (isNew) {
          // await axios.post(`/ledgers/${ledgerId}/records`, payload);
          await createRecord(ledgerId, payload);
        } else {
          // await axios.put(`/records/${record.id}`, payload);
          await updateRecord(record.id, payload);
        }
      }

      // 5. 刷新
      qc.invalidateQueries(["records"]);
      qc.invalidateQueries(["incomplete"]);
      onClose();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleAddSplit = () => {
    append({ userId: "", ratio: 50 });
  };

  const handleUserChange = (index, value) => {
    setValue(`split.${index}.userId`, value);
    const ratio = watch(`split.${index}.ratio`);
    if (!ratio) {
      setValue(`split.${index}.ratio`, 50); // 选人时，如果没设置过，默认 50%
    }
  };

  React.useEffect(() => {
    reset(record);
    reset({
      ...(record ?? {}),
      split: record?.split?.length > 0 ? record.split : [], // 只有有split才给split
    });
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
            <h3 className="font-semibold mb-4">
              {isNew ? "Add Record" : "Edit Record"}
            </h3>

            <form className="space-y-3" onSubmit={handleSubmit(handleSave)}>
              {/* 金额 + 计算器 */}
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Amount"
                  {...register("amount", { valueAsNumber: true })}
                />
                <CalculatorPopover onConfirm={(v) => setValue("amount", v)} />
              </div>

              {/* 日期 */}
              <input
                className="input w-full"
                type="date"
                {...register("date")}
              />

              {/* 分类 */}
              <CategoryPopover
                value={watch("category")}
                onChange={(v) => setValue("category", v)}
              />

              {/* 描述 */}
              <input
                className="input w-full"
                placeholder="Description"
                {...register("description")}
              />

              {/* Split 分账 */}
              <div>
                <label className="text-sm font-medium">Split</label>
                <div className="space-y-2 mt-2">
                  {fields.map((f, i) => {
                    const selectedUser = collaborators.find(
                      (c) => c.userId === watch(`split.${i}.userId`)
                    );
                    return (
                      <div
                        key={f.id}
                        className="flex flex-col gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <select
                            className="input flex-1"
                            {...register(`split.${i}.userId`, {
                              required: true,
                            })}
                            onChange={(e) =>
                              handleUserChange(i, e.target.value)
                            }
                          >
                            <option value="">Select collaborator...</option>
                            {collaborators.length === 0 ? (
                              <option disabled>Loading collaborators...</option>
                            ) : (
                              collaborators
                                .filter(
                                  (c) =>
                                    c.userId !== user?.id &&
                                    c.permission !== "OWNER"
                                )
                                .map((c) => (
                                  <option key={c.userId} value={c.userId}>
                                    {c.name || c.email} ({c.avatar})
                                  </option>
                                ))
                            )}
                          </select>

                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-red-600 p-1"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Ratio 按钮 */}
                        {selectedUser && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex gap-1 flex-wrap">
                              {commonRatios.map((ratio) => (
                                <button
                                  type="button"
                                  key={ratio}
                                  className={`px-2 py-1 text-xs rounded ${
                                    watch(`split.${i}.ratio`) === ratio
                                      ? "bg-brand text-white"
                                      : "bg-gray-200 hover:bg-gray-300"
                                  }`}
                                  onClick={() =>
                                    setValue(`split.${i}.ratio`, ratio)
                                  }
                                >
                                  {ratio}%
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 w-24">
                              <input
                                type="number"
                                className="input w-full"
                                {...register(`split.${i}.ratio`, {
                                  valueAsNumber: true,
                                  min: 0,
                                  max: 100,
                                })}
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="btn-ghost mt-1 text-sm"
                    onClick={handleAddSplit}
                  >
                    + Add split
                  </button>
                </div>
              </div>

              {/* 保存取消 */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                {!isReadOnly && (
                  <button className="btn-primary" type="submit">
                    Save
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
