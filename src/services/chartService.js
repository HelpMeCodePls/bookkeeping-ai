import { api } from "../api/client";

export const fetchChartSummary = ({ ledgerId, mode = "all", selectedDate }) =>
  api
    .get("/charts/summary", {
      params: { ledgerId, mode, selectedDate },
    })
    .then((r) => r.data);
