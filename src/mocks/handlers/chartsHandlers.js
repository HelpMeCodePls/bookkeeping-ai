import { http, HttpResponse } from 'msw';
import { records } from '../mockData'; // 引用模拟 records 数据

/** 图表与分析模块 handlers */
export const chartsHandlers = [

  // 获取账本的分类统计、每日统计
  http.get("/charts/summary", ({ request }) => {
    const url = new URL(request.url);
    const ledgerId = url.searchParams.get('ledgerId');
    const mode = url.searchParams.get('mode'); // all / month / week / year
    const selectedDate = url.searchParams.get('selectedDate');

    // 先筛选出 ledgerId 匹配的记录
    let filtered = records.filter(r => r.ledger_id === ledgerId);

    // 再根据 mode 和 selectedDate进一步筛
    if (mode !== 'all' && selectedDate) {
      if ((mode === 'month' || mode === 'year') && selectedDate.length >= 7) {
        filtered = filtered.filter(r => r.date?.startsWith(selectedDate));
      } else if (mode === 'week' && selectedDate.includes('~')) {
        const [start, end] = selectedDate.split('~').map(s => s.trim());
        const startDate = new Date(start);
        const endDate = new Date(end);
        filtered = filtered.filter(r => {
          const recDate = new Date(r.date);
          return recDate >= startDate && recDate <= endDate;
        });
      }
    }

    // 分类统计
    const byCategory = {};
    for (const r of filtered) {
      if (!byCategory[r.category]) byCategory[r.category] = 0;
      byCategory[r.category] += Number(r.amount || 0);
    }

    // 每日统计
    const dailyMap = {};
    for (const r of filtered) {
      if (!dailyMap[r.date]) dailyMap[r.date] = 0;
      dailyMap[r.date] += Number(r.amount || 0);
    }
    const daily = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0]));

    return HttpResponse.json({ byCategory, daily });
  }),

];
