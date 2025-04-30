import { http, HttpResponse } from 'msw';
import { nanoid } from 'nanoid';
import { users, ledgers, records } from '../mockData'; 
import { calculateSpent } from '../utils'; 


export const ledgerHandlers = [

  http.get('/ledgers/:id', ({ params }) => {
    const ledger = ledgers.find(l => l._id === params.id);
    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }
    const monthlySpent = calculateSpent(records, params.id);

    ledger.spent = monthlySpent;
    return HttpResponse.json({ ...ledger, spent: monthlySpent });
  }),

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


  http.patch('/ledgers/:id/budgets', async ({ params, request }) => {
    const { month, category, budget, setDefault } = await request.json();
    const ledger = ledgers.find(l => l._id === params.id);

    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }

    ledger.budgets = ledger.budgets || { default: 0, months: {}, categoryDefaults: {}, categoryBudgets: {} };

    if (!category) {

      if (setDefault) {
        ledger.budgets.default = Number(budget);
      } else {
        ledger.budgets.months[month] = Number(budget);
      }
    } else {

      if (setDefault) {
        ledger.budgets.categoryDefaults[category] = Number(budget);
      } else {
        ledger.budgets.categoryBudgets[month] = ledger.budgets.categoryBudgets[month] || {};
        ledger.budgets.categoryBudgets[month][category] = Number(budget);
      }
    }

    return HttpResponse.json({ ok: true });
  }),


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
