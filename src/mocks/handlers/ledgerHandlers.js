import { http, HttpResponse } from 'msw';
import { nanoid } from 'nanoid';
import { users, ledgers, records } from '../mockData'; // 引入 mock 数据
import { calculateSpent } from '../utils'; // 引入计算支出函数

/** Ledger 相关 handlers */
export const ledgerHandlers = [

  // 获取单个账本
  http.get('/ledgers/:id', ({ params }) => {
    const ledger = ledgers.find(l => l._id === params.id);
    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }
    const monthlySpent = calculateSpent(records, params.id);

    ledger.spent = monthlySpent;
    return HttpResponse.json({ ...ledger, spent: monthlySpent });
  }),

  // 获取用户所有账本
  http.get('/ledgers', ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const myId = token.replace('stub-jwt-', '') || 'user3';

    const userLedgers = ledgers
      .filter(l => l.owner === myId || l.collaborators.some(c => c.userId === myId))
      .map(l => ({
        ...l,
        collaborators: l.collaborators.map(c => ({
          ...c,
          name: users.find(u => u.id === c.userId)?.name || c.email,
          avatar: users.find(u => u.id === c.userId)?.avatar || '👤',
        }))
      }));

    return HttpResponse.json(Array.isArray(userLedgers) ? userLedgers : []);
  }),

  // 新建账本
  http.post('/ledgers', async ({ request }) => {
    const { name, budget, token } = await request.json();
    const ownerId = (token || '').replace('stub-jwt-', '') || 'user3';

    const newLedger = {
      _id: nanoid(),
      name,
      owner: ownerId,
      budgets: {
        default: budget,
        months: {},
        categoryDefaults: {},
        categoryBudgets: {}
      },
      spent: {},
      collaborators: [{
        userId: ownerId,
        email: users.find(u => u.id === ownerId)?.email || '',
        permission: 'OWNER',
        joinedAt: new Date().toISOString()
      }]
    };

    ledgers.push(newLedger);
    return HttpResponse.json(newLedger, { status: 201 });
  }),

  // 更新账本预算
  http.patch('/ledgers/:id/budgets', async ({ params, request }) => {
    const { month, category, budget, setDefault } = await request.json();
    const ledger = ledgers.find(l => l._id === params.id);

    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }

    ledger.budgets = ledger.budgets || { default: 0, months: {}, categoryDefaults: {}, categoryBudgets: {} };

    if (!category) {
      // 月预算
      if (setDefault) {
        ledger.budgets.default = Number(budget);
      } else {
        ledger.budgets.months[month] = Number(budget);
      }
    } else {
      // 分类预算
      if (setDefault) {
        ledger.budgets.categoryDefaults[category] = Number(budget);
      } else {
        ledger.budgets.categoryBudgets[month] = ledger.budgets.categoryBudgets[month] || {};
        ledger.budgets.categoryBudgets[month][category] = Number(budget);
      }
    }

    return HttpResponse.json({ ok: true });
  }),

  // 获取当前用户对账本的权限
  http.get('/ledgers/:id/permission', ({ params, request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const myId = token.replace('stub-jwt-', '') || 'user3';

    const ledger = ledgers.find(l => l._id === params.id);
    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }

    if (ledger.owner === myId) {
      return HttpResponse.json({ permission: 'OWNER' });
    }

    const collaborator = ledger.collaborators.find(c => c.userId === myId);
    if (collaborator) {
      return HttpResponse.json({ permission: collaborator.permission });
    }

    return HttpResponse.json({ permission: 'VIEWER' });
  }),

];
