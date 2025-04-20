/**
 * 这里是一些常用的工具函数 
 */


export function calculateSpent(records, ledgerId) {
    const monthlySpent = {};
    records
      .filter(r => r.ledger_id === ledgerId && r.status === 'confirmed')
      .forEach(r => {
        const month = r.date.slice(0, 7);
        monthlySpent[month] = (monthlySpent[month] || 0) + Number(r.amount || 0);
      });
    return monthlySpent;
  }
  