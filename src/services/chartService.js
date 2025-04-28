import { api } from "../api/client";

/**
 * 获取汇总统计
 * @param {Object} p
 * @param {string} p.ledgerId  账本 ID
 * @param {string} [p.mode]    all | month | week | year
 * @param {string} [p.selectedDate]  "2025-05" / "2025-05-01~2025-05-07" / "2025"
 * @returns {Promise<{byCategory:Object, daily:Array}>}
 */
export const fetchChartSummary = ({ ledgerId, mode = "all", selectedDate }) =>
  api
    .get("/charts/summary", {
      params: { ledgerId, mode, selectedDate }
    })
    .then(r => r.data);
