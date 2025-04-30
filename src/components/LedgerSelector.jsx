import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useLedger } from "../store/ledger";
import { fetchLedgers } from "../handlers/ledgerHandlers";

export default function LedgerSelector() {
  const { currentId, currentName, selectLedger } = useLedger();
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);

  const { data: ledgers = [] } = useQuery({
    queryKey: ["ledgers", token],
    queryFn: fetchLedgers,
    enabled: !!token,
  });

  useEffect(() => {
    if (ledgers.length > 0 && !currentId) {
      selectLedger(ledgers[0]);
    }
  }, [ledgers, currentId, selectLedger]);

  return (
    <div className="relative">
      <button
        onClick={() => ledgers.length > 0 && setOpen((o) => !o)}
        className="flex items-center gap-2 font-semibold"
        disabled={ledgers.length === 0}
      >
        📂{" "}
        {currentName || (ledgers.length > 0 ? ledgers[0].name : "Loading...")}
        <ChevronDown size={16} />
      </button>

      {open && ledgers.length > 0 && (
        <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-md z-20 border border-gray-200">
          {ledgers.map((l) => (
            <div
              key={l._id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                l._id === currentId ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => {
                selectLedger(l);
                setOpen(false);
              }}
            >
              {l.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
