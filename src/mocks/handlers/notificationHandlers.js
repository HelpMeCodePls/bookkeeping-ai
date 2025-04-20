import { http, HttpResponse } from 'msw';
import { nanoid } from 'nanoid';
import { notes } from '../mockData'; // 引入 mock notes 数据

/** Notification 相关 handlers */
export const notificationsHandlers = [

  // 获取当前用户的通知列表（按时间倒序）
  http.get("/notifications", ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const myId = token.replace('stub-jwt-', '') || 'user3';

    const userNotes = notes
      .filter(n => n.user_id === myId)
      .sort((a, b) => b.created_at - a.created_at);

    return HttpResponse.json(userNotes);
  }),

  // 获取未读通知数量
  http.get("/notifications/unread_count", ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const myId = token.replace('stub-jwt-', '') || 'user3';

    const count = notes.filter(n => n.user_id === myId && !n.is_read).length;

    return HttpResponse.json({ count });
  }),

  // 新增一条通知
  http.post("/notifications", async ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const myId = token.replace('stub-jwt-', '') || 'user3';

    const body = await request.json();
    const newNote = {
      id: nanoid(),
      user_id: myId,
      ...body,
      is_read: false,
      created_at: Date.now()
    };

    notes.unshift(newNote);

    return HttpResponse.json(newNote, { status: 201 });
  }),

  // 标记通知为已读
  http.patch("/notifications/:id", ({ params }) => {
    const { id } = params;
    const index = notes.findIndex(n => n.id === id);

    if (index !== -1) {
      notes[index].is_read = true;
      return HttpResponse.json({ ok: true });
    } else {
      return HttpResponse.error('Notification not found', { status: 404 });
    }
  }),

];
