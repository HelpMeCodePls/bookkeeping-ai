import { http, HttpResponse } from "msw";
import { records } from "../mockData";

export const chartsHandlers = [
  http.get("/charts/summary", ({ request }) => {
    const url = new URL(request.url);
    const ledgerId = url.searchParams.get("ledgerId");
    const mode = url.searchParams.get("mode"); // all / month / week / year
    const selectedDate = url.searchParams.get("selectedDate");

    let filtered = records.filter((r) => r.ledger_id === ledgerId);

    if (mode !== "all" && selectedDate) {
      if ((mode === "month" || mode === "year") && selectedDate.length >= 7) {
        filtered = filtered.filter((r) => r.date?.startsWith(selectedDate));
      } else if (mode === "week" && selectedDate.includes("~")) {
        const [start, end] = selectedDate.split("~").map((s) => s.trim());
        const startDate = new Date(start);
        const endDate = new Date(end);
        filtered = filtered.filter((r) => {
          const recDate = new Date(r.date);
          return recDate >= startDate && recDate <= endDate;
        });
      }
    }

    const byCategory = {};
    for (const r of filtered) {
      if (!byCategory[r.category]) byCategory[r.category] = 0;
      byCategory[r.category] += Number(r.amount || 0);
    }

    const dailyMap = {};
    for (const r of filtered) {
      if (!dailyMap[r.date]) dailyMap[r.date] = 0;
      dailyMap[r.date] += Number(r.amount || 0);
    }
    const daily = Object.entries(dailyMap).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return HttpResponse.json({ byCategory, daily });
  }),
];
