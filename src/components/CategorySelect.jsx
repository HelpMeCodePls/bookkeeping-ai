import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function CategorySelect({ value, onChange }) {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/categories").then((r) => r.data),
  });
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const addMut = useMutation({
    mutationFn: () =>
      axios.post("/categories", { label: newLabel, icon: newIcon || "🗂️" }),
    onSuccess: () => {
      qc.invalidateQueries(["categories"]);
      setAdding(false);
    },
  });

  return (
    <div className="relative">
      <select
        className="input w-full pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select category…</option>
        {cats.map((c) => (
          <option key={c.key} value={c.key}>
            {c.icon} {c.label}
          </option>
        ))}
        <option value="__add">➕ Add new…</option>
      </select>

      {value === "__add" && !adding && onChange("") && setAdding(true)}

      {adding && (
        <div className="absolute z-20 top-full mt-2 bg-card dark:bg-gray-800 p-4 rounded-xl shadow-card w-64">
          <h4 className="mb-2 font-semibold">New Category</h4>
          <input
            className="input w-full mb-2"
            placeholder="Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <input
            className="input w-full mb-3"
            placeholder="Icon (emoji)"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={() => addMut.mutate()}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
