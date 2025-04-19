import { http, HttpResponse } from "msw";
import { nanoid } from "nanoid";

/* ===== demo 数据 ===== */
const demoLedgerId = "demoLedger";

let categories = [
    { key: "food", label: "Food", icon: "🍔" },
    { key: "transport", label: "Transport", icon: "🚗" },
    { key: "groceries", label: "Groceries", icon: "🛒" },
    { key: "entertainment", label: "Entertainment", icon: "🎮" },
    { key: "travel", label: "Travel", icon: "✈️" },
    { key: "home", label: "Home", icon: "🏠" },
    { key: "work", label: "Work", icon: "💼" },
    { key: "gifts", label: "Gifts", icon: "🎁" },
    { key: "education", label: "Education", icon: "📚" },
    { key: "drinks", label: "Drinks", icon: "🍻" },
    { key: "music", label: "Music", icon: "🎵" },
    { key: "health", label: "Health", icon: "🏥" },
    { key: "pets", label: "Pets", icon: "🐶" },
    { key: "beauty", label: "Beauty", icon: "💄" },
    { key: "insurance", label: "Insurance", icon: "🛡️" },
    { key: "sports", label: "Sports", icon: "🏀" },
    { key: "electronics", label: "Electronics", icon: "📱" },
    { key: "car", label: "Car", icon: "🚙" },
    { key: "charity", label: "Charity", icon: "❤️" },
    { key: "other", label: "Other", icon: "✨" },
  ];
  

let records = [
  {
    id: nanoid(),
    ledger_id: demoLedgerId,
    amount: 12.3,
    category: "Food",
    date: "2025-04-17",
    status: "confirmed",
    description: "Latte",
  },
  {
    id: nanoid(),
    ledger_id: demoLedgerId,
    amount: 45,
    category: "Transport",
    date: "2025-04-16",
    status: "confirmed",
    description: "Uber",
  },
  {
    id: nanoid(),
    ledger_id: demoLedgerId,
    amount: 30,
    category: "Groceries",
    date: "2025-03-15",
    status: "incomplete",
    description: "",
  },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 100,
        category: "Entertainment",
        date: "2025-02-20",
        status: "confirmed",
        description: "Concert",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 200,
        category: "Travel",
        date: "2025-01-10",
        status: "confirmed",
        description: "Flight to Paris",
    },
];

let ledgers = [
  {
    _id: "demoLedger",
    name: "Default Ledger",
    budget: 1000,
    collaborators: [],
  },
];

let notes = [
  {
    id: nanoid(),
    content: "Partner added a record",
    is_read: false,
    created_at: Date.now(),
  },
];

/* ===== handlers 开始 ===== */
export const handlers = [
  /* ===== auth ===== */
  http.post("/auth/google", async () =>
    HttpResponse.json({
      access_token: "stub-jwt",
      user: { _id: "1", username: "Demo User" },
    })
  ),

  http.get("/categories", () => HttpResponse.json(categories)),
// 追加到 handlers.js
http.post('/categories', async ({ request }) => {
    const body = await request.json();
    categories.push({
      key: body.label.toLowerCase(),
      label: body.label,
      icon: body.icon || '🗂️',
    });
    return HttpResponse.json({ ok: true });
  }),
  

  /* ===== records ===== */
  // 获取账本下的所有记录（支持 keyword 筛选）
  http.get('/ledgers/:id/records', ({ params, request }) => {
    const url  = new URL(request.url)
    const month = url.searchParams.get('month') // '2025-05'
    const data  = records.filter(r => {
      if (r.ledger_id !== params.id) return false
      if (!month) return true
      return r.date.startsWith(month)          // ISO 'YYYY-MM-DD'
    })
    return HttpResponse.json(data)
  }),

  // 添加记录
  http.post("/ledgers/:id/records", async ({ params, request }) => {
    const body = await request.json();
    const newRec = { ...body, id: nanoid(), ledger_id: params.id };
    records.unshift(newRec);
    return HttpResponse.json(newRec, { status: 201 });
  }),

  // 更新记录
  http.put("/records/:id", async ({ params, request }) => {
    const body = await request.json();
    records = records.map((r) => (r.id === params.id ? { ...r, ...body } : r));
    return HttpResponse.json({ ok: true });
  }),

  // 删除记录
  http.delete("/records/:id", ({ params }) => {
    records = records.filter((r) => r.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  // 获取 incomplete 记录
  http.get("/records/incomplete", () =>
    HttpResponse.json(records.filter((r) => r.status === "incomplete"))
  ),

  /* ===== ledgers ===== */
  // 获取所有账本
  http.get("/ledgers", () => HttpResponse.json(ledgers)),

  // 新建账本
  http.post("/ledgers", async ({ request }) => {
    const body = await request.json();
    const newLedger = { _id: nanoid(), ...body, collaborators: [] };
    ledgers.push(newLedger);
    return HttpResponse.json(newLedger, { status: 201 });
  }),

  // 修改账本预算
// PATCH /ledgers/:id/budget  结构变更
/*
payload: { month:'2025-05', budget:1200 }
*/
http.patch('/ledgers/:id/budget', async ({ params, request }) => {
    const { month, budget } = await request.json()
    ledgers = ledgers.map(l =>
      l._id === params.id
        ? { ...l, budgets: { ...l.budgets, [month]: budget } }
        : l
    )
    return HttpResponse.json({ ok:true })
  }),

  // 添加协作者
  http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
    const { email } = await request.json();
    ledgers = ledgers.map((l) =>
      l._id === params.id
        ? { ...l, collaborators: [...l.collaborators, { email }] }
        : l
    );
    return HttpResponse.json({ ok: true });
  }),

  /* ===== notifications ===== */
  http.get("/notifications", () => HttpResponse.json(notes)),

  http.get("/notifications/unread_count", () =>
    HttpResponse.json({ count: notes.filter((n) => !n.is_read).length })
  ),

  http.patch("/notifications/:id", ({ params }) => {
    notes = notes.map((n) =>
      n.id === params.id ? { ...n, is_read: true } : n
    );
    return HttpResponse.json({ ok: true });
  }),

  /* ===== agent chat ===== */
  http.post("/agent/chat", async ({ request }) => {
    const { message } = await request.json();
    return HttpResponse.json({ reply: `🤖 Stub: "${message}" received.` });
  }),

  /* ===== OCR upload stub ===== */
  http.post("/ocr/upload", async () =>
    HttpResponse.json({
      amount: 20.5,
      date: "2025-04-18",
      category: "Food",
      description: "Mock OCR Starbucks",
    })
  ),

  /* ===== charts summary stub ===== */
  http.get("/charts/summary", () =>
    HttpResponse.json({
      byCategory: { Food: 100, Transport: 60, Groceries: 80 },
      daily: [
        ["2025-04-15", 80],
        ["2025-04-16", 45],
        ["2025-04-17", 12],
      ],
    })
  ),


];
