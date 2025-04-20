import { http, HttpResponse } from 'msw';
import { records, ledgers, notes, demoUserId } from '../mockData';
import { calculateSpent } from '../utils';

/**
 * 账单记录 Records 相关接口
 */
export const recordHandlers = [
  // 获取账本下的所有记录
  http.get('/ledgers/:id/records', ({ params, request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const cats = (url.searchParams.get('categories') || '').split(',').filter(Boolean);
    const split = url.searchParams.get('split');
    const collaborator = url.searchParams.get('collaborator');

    const data = records.filter(r => {
      if (r.ledger_id !== params.id) return false;
      if (month && (!r.date || !r.date.startsWith(month))) return false;
      if (cats.length > 0 && (!r.category || !cats.includes(r.category.toLowerCase()))) return false;
      if (split && !(r.split || []).some(s => s.user_id === split)) return false;
      if (collaborator && r.createdBy !== collaborator) return false;
      return true;
    });

    return HttpResponse.json(data);
  }),

  // 添加新记录
  http.post('/ledgers/:id/records', async ({ params, request }) => {
    const body = await request.json();
    const currentUserId = body.user_id || demoUserId;

    const newRec = {
      ...body,
      id: crypto.randomUUID(),
      ledger_id: params.id,
      createdBy: currentUserId,
      updatedBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      split: (body.split || []).map(s => ({
        ...s,
        amount: Number(s.amount) || 0,
      })),
    };

    records.unshift(newRec);

    // 更新账本 spent
    const ledger = ledgers.find(l => l._id === params.id);
    if (ledger) {
      ledger.spent = calculateSpent(records, params.id);
    }

    // 通知账本所有协作者
    ledger.collaborators.forEach(collaborator => {
      notes.unshift({
        id: crypto.randomUUID(),
        type: 'record',
        content: `New record "${newRec.description || 'Unnamed'}" added`,
        is_read: false,
        created_at: Date.now(),
        ledgerId: params.id,
        recordId: newRec.id,
        user_id: collaborator.userId,
      });
    });

    return HttpResponse.json(records.filter(r => r.ledger_id === params.id), { status: 201 });
  }),

  // 更新一条记录
  http.put('/records/:id', async ({ params, request }) => {
    const body = await request.json();
    records.forEach((r, index) => {
      if (r.id === params.id) {
        records[index] = {
          ...r,
          ...body,
          updatedBy: demoUserId,
          updatedAt: new Date().toISOString(),
        };
      }
    });

    const record = records.find(r => r.id === params.id);
    if (record) {
      const ledger = ledgers.find(l => l._id === record.ledger_id);
      if (ledger) {
        ledger.spent = calculateSpent(records, record.ledger_id);
      }
    }

    return HttpResponse.json({ ok: true });
  }),

  // 删除一条记录
  http.delete('/records/:id', ({ params }) => {
    const record = records.find(r => r.id === params.id);
    if (!record) return HttpResponse.error('Record not found', { status: 404 });

    const ledger = ledgers.find(l => l._id === record.ledger_id);
    if (ledger) {
      ledger.spent = calculateSpent(records, record.ledger_id);
    }

    const index = records.findIndex(r => r.id === params.id);
    records.splice(index, 1);

    return HttpResponse.json({ ok: true });
  }),

  // 获取所有未完成的记录
  http.get('/records/incomplete', () =>
    HttpResponse.json(records.filter(r => r.status === 'incomplete'))
  ),
];
