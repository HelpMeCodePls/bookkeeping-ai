import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ledgerId = 'demoLedger';

export default function AddRecord() {
  const { register, handleSubmit, setValue } = useForm();
  const nav = useNavigate();
  const [split, setSplit] = useState([{ email: '', ratio: 50 }]); // 新增 split 初始值

  const onSubmit = async (data) => {
    await axios.post(`/ledgers/${ledgerId}/records`, { ...data, split });
    nav('/records');
  };

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // 上传到 OCR stub
    const { data } = await axios.post('/ocr/upload', file, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    Object.entries(data).forEach(([k, v]) => setValue(k, v));
  };

  // 更新 split 的某一行
  const update = (index, field, value) => {
    setSplit((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: field === 'ratio' ? Number(value) : value } : s))
    );
  };

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Add Record</h2>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="border px-2 py-1 w-full" placeholder="Amount" {...register('amount')} />
        <input className="border px-2 py-1 w-full" type="date" {...register('date')} />
        <input className="border px-2 py-1 w-full" placeholder="Category" {...register('category')} />
        <input className="border px-2 py-1 w-full" placeholder="Description (Optional)" {...register('description')} />

        {/* 处理 OCR 小票上传 */}
        <div>
          <label className="block mb-1">Receipt (OCR)</label>
          <input type="file" accept="image/*" onChange={handleOCR} />
        </div>

        {/* 处理 Split 分账 */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Split (Optional)</h3>

          {split.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="border px-2 py-1 flex-1"
                placeholder="Email"
                value={s.email}
                onChange={(e) => update(i, 'email', e.target.value)}
              />
              <input
                className="border px-2 py-1 w-20"
                type="number"
                value={s.ratio}
                min={0}
                max={100}
                onChange={(e) => update(i, 'ratio', e.target.value)}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSplit([...split, { email: '', ratio: 50 }])}
            className="text-blue-600 text-sm hover:underline mt-2"
          >
            + Add Split
          </button>
        </div>

        {/* 保存按钮 */}
        <button className="bg-blue-600 text-white px-4 py-1 rounded w-full mt-4" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}
