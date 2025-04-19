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
        amount: 20.5,
        category: "Food",
        date: "2025-04-17",
        status: "confirmed",
        description: "Pizza",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 15.75,
        category: "Transport",
        date: "2025-04-20",
        status: "confirmed",
        description: "Taxi",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 50,
        category: "Entertainment",
        date: "2025-04-23",
        status: "Incomplete",
        description: "Movie",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 100,
        category: "Travel",
        date: "2025-04-21",
        status: "confirmed",
        description: "Hotel",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 200,
        category: "Groceries",
        date: "2025-04-22",
        status: "confirmed",
        description: "",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 75.5,
        category: "Food",
        date: "2025-04-23",
        status: "confirmed",
        description: "",
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
        date: "2025-03-02",
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
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 60,
        category: "Health",
        date: "2024-12-15",
        status: "confirmed",
        description: "Doctor visit",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 150,
        category: "Home",
        date: "2024-11-10",
        status: "confirmed",
        description: "Furniture",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 80,
        category: "Sports",
        date: "2024-10-05",
        status: "confirmed",
        description: "Gym membership",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 40,
        category: "Music",
        date: "2024-09-25",
        status: "confirmed",
        description: "Guitar strings",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 25,
        category: "Drinks",
        date: "2024-08-20",
        status: "confirmed",
        description: "Cocktails",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 300,
        category: "Electronics",
        date: "2024-07-15",
        status: "confirmed",
        description: "Headphones",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 500,
        category: "Car",
        date: "2024-06-10",
        status: "confirmed",
        description: "Car repair",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 20,
        category: "Charity",
        date: "2024-05-05",
        status: "confirmed",
        description: "Donation",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 90,
        category: "Education",
        date: "2024-04-01",
        status: "confirmed",
        description: "Online course",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 35,
        category: "Beauty",
        date: "2024-03-15",
        status: "confirmed",
        description: "Haircut",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 120,
        category: "Insurance",
        date: "2024-02-10",
        status: "confirmed",
        description: "Car insurance",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 250,
        category: "Travel",
        date: "2024-01-05",
        status: "confirmed",
        description: "Train tickets",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 15,
        category: "Food",
        date: "2023-12-20",
        status: "confirmed",
        description: "Burger",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 70,
        category: "Transport",
        date: "2023-11-15",
        status: "confirmed",
        description: "Bus pass",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 45,
        category: "Groceries",
        date: "2023-10-10",
        status: "confirmed",
        description: "Weekly groceries",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 110,
        category: "Entertainment",
        date: "2023-09-05",
        status: "confirmed",
        description: "Theater tickets",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 220,
        category: "Travel",
        date: "2023-08-01",
        status: "confirmed",
        description: "Weekend getaway",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 35,
        category: "Food",
        date: "2023-07-20",
        status: "confirmed",
        description: "Dinner",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 55,
        category: "Transport",
        date: "2023-06-15",
        status: "confirmed",
        description: "Taxi ride",
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 75,
        category: "Groceries",
        date: "2023-05-10",
        status: "confirmed",
        description: "Monthly groceries",
    },
];

let ledgers = [
    {
      _id: 'demoLedger',
      name: 'Default Ledger',
      budgets: { 
        default: 1000,
        months: { '2025-04': 2000 },
        categoryDefaults: {},
        categoryBudgets: { '2025-04': { 'Food': 500, 'Transport': 300 } }
      },
      spent: calculateSpent('demoLedger'), // 初始化时计算 spent
      collaborators: []
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


/* ===== 辅助函数 ===== */
function calculateSpent(ledgerId) {
    const monthlySpent = {};
    records
      .filter(r => 
        r.ledger_id === ledgerId && 
        r.status === 'confirmed' // 确保只计算 confirmed 记录
      )
      .forEach(r => {
        const month = r.date.slice(0, 7); // YYYY-MM
        monthlySpent[month] = (monthlySpent[month] || 0) + Number(r.amount || 0);
      });
    return monthlySpent;
  }

/* ===== handlers 开始 ===== */
export const handlers = [
  /* ===== auth ===== */
  http.post("/auth/google", async () =>
    HttpResponse.json({
      access_token: "stub-jwt",
      user: { _id: "1", username: "Demo User" },
    })
  ),

  /* ===== categories ===== */
  http.get("/categories", () => HttpResponse.json(categories)),
  
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
  http.get('/ledgers/:id/records', ({ params, request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const cats = (url.searchParams.get('categories')||'').split(',').filter(Boolean);
    const split = url.searchParams.get('split');

    const data = records.filter(r => {
      if (r.ledger_id !== params.id) return false;
      if (month && !r.date.startsWith(month)) return false;
      if (cats.length && !cats.includes(r.category)) return false;
      if (split && !(r.split||[]).some(s=>s.email===split)) return false;
      return true;
    });
    return HttpResponse.json(data);
  }),

  http.post("/ledgers/:id/records", async ({ params, request }) => {
    const body = await request.json();
    const newRec = { ...body, id: nanoid(), ledger_id: params.id };
    records.unshift(newRec);
    
    // 更新相关账本的 spent 数据
    const ledger = ledgers.find(l => l._id === params.id);
    if (ledger) {
      const monthlySpent = calculateSpent(params.id);
      ledger.spent = monthlySpent;
    }
    
    return HttpResponse.json(newRec, { status: 201 });
  }),

  http.put("/records/:id", async ({ params, request }) => {
    const body = await request.json();
    records = records.map((r) => (r.id === params.id ? { ...r, ...body } : r));
    
    // 更新相关账本的 spent 数据
    const record = records.find(r => r.id === params.id);
    if (record) {
      const ledger = ledgers.find(l => l._id === record.ledger_id);
      if (ledger) {
        const monthlySpent = calculateSpent(record.ledger_id);
        ledger.spent = monthlySpent;
      }
    }
    
    return HttpResponse.json({ ok: true });
  }),

  http.delete("/records/:id", ({ params }) => {
    const record = records.find(r => r.id === params.id);
    records = records.filter((r) => r.id !== params.id);
    
    // 更新相关账本的 spent 数据
    if (record) {
      const ledger = ledgers.find(l => l._id === record.ledger_id);
      if (ledger) {
        const monthlySpent = calculateSpent(record.ledger_id);
        ledger.spent = monthlySpent;
      }
    }
    
    return HttpResponse.json({ ok: true });
  }),

  http.get("/records/incomplete", () =>
    HttpResponse.json(records.filter((r) => r.status === "incomplete"))
  ),

  /* ===== ledgers ===== */
  http.get("/ledgers", () => HttpResponse.json(ledgers)),

  http.post("/ledgers", async ({ request }) => {
    const body = await request.json();
    const newLedger = { 
      _id: nanoid(), 
      ...body, 
      collaborators: [],
      budgets: {
        default: 0,
        months: {},
        categoryDefaults: {},
        categoryBudgets: {}
      },
      spent: {}
    };
    ledgers.push(newLedger);
    return HttpResponse.json(newLedger, { status: 201 });
  }),

  http.get('/ledgers/:id', ({ params }) => {
    const ledger = ledgers.find(l => l._id === params.id);
    if (!ledger) return HttpResponse.error('Not found', { status: 404 });
    
    // 确保 spent 数据是最新的
    const monthlySpent = calculateSpent(params.id);
    ledger.spent = monthlySpent;
    
    return HttpResponse.json({
      ...ledger,
      spent: monthlySpent
    });
  }),

  http.patch('/ledgers/:id/budgets', async ({ params, request }) => {
    const { month, category, budget, setDefault } = await request.json();
    
    const ledger = ledgers.find(l => l._id === params.id);
    if (!ledger) {
      return HttpResponse.error('Ledger not found', { status: 404 });
    }
  
    // 初始化 budgets 对象如果不存在
    ledger.budgets = ledger.budgets || {
      default: 0,
      months: {},
      categoryDefaults: {},
      categoryBudgets: {}
    };
    
    // 处理月预算
    if (!category) {
      if (setDefault) {
        ledger.budgets.default = Number(budget);
      } else {
        ledger.budgets.months = ledger.budgets.months || {};
        ledger.budgets.months[month] = Number(budget);
      }
    }
    // 处理分类预算
    else {
      ledger.budgets.categoryBudgets = ledger.budgets.categoryBudgets || {};
      ledger.budgets.categoryBudgets[month] = ledger.budgets.categoryBudgets[month] || {};
      
      if (setDefault) {
        ledger.budgets.categoryDefaults = ledger.budgets.categoryDefaults || {};
        ledger.budgets.categoryDefaults[category] = Number(budget);
      } else {
        ledger.budgets.categoryBudgets[month][category] = Number(budget);
      }
    }
    
    return HttpResponse.json({ ok: true });
  }),

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
  http.get("/charts/summary", ({ request }) => {
    const url = new URL(request.url);
    const ledgerId = url.searchParams.get('ledgerId');
    const mode = url.searchParams.get('mode');
    const selectedDate = url.searchParams.get('selectedDate');

    let filtered = records.filter(r => r.ledger_id === ledgerId);
    
    if (mode !== 'all' && selectedDate) {
      if (mode === 'month') {
        filtered = filtered.filter(r => r.date.startsWith(selectedDate));
      } else if (mode === 'year') {
        filtered = filtered.filter(r => r.date.startsWith(selectedDate));
      } else if (mode === 'week') {
        const [start, end] = selectedDate.split('~').map(s => s.trim());
        const startDate = new Date(start);
        const endDate = new Date(end);

        filtered = filtered.filter(r => {
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
    const daily = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0]));

    return HttpResponse.json({ byCategory, daily });
  }),
];