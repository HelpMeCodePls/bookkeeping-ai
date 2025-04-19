import { http, HttpResponse } from "msw";
import { nanoid } from "nanoid";
// import { mockSocket } from "./browser";
// import { mockWebSocket } from "./browser"; // 引入 mockWebSocket


/* ===== demo 数据 ===== */
const demoLedgerId = "demoLedger";

/* ===== demo 数据 ===== */
const demoUserId = "user1";

let users = [
  {
    id: demoUserId,
    name: "Demo User",
    email: "ozijunw@gmail.com",
    avatar: "👤"
  },
  {
    id: "user2",
    name: "Alice Smith",
    email: "olivia.zijun.wei@gmail.com",
    avatar: "👩"
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "👨"
  }
];

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
        category: "food",
        date: "2025-04-17",
        status: "confirmed",
        description: "Latte",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 20.5,
        category: "food",
        date: "2025-04-17",
        status: "confirmed",
        description: "Pizza",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 15.75,
        category: "transport",
        date: "2025-04-20",
        status: "confirmed",
        description: "Taxi",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 50,
        category: "entertainment",
        date: "2025-04-23",
        status: "Incomplete",
        description: "Movie",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 100,
        category: "travel",
        date: "2025-04-21",
        status: "confirmed",
        description: "Hotel",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 200,
        category: "groceries",
        date: "2025-04-22",
        status: "confirmed",
        description: "",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 75.5,
        category: "food",
        date: "2025-04-23",
        status: "confirmed",
        description: "",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 45,
        category: "transport",
        date: "2025-04-16",
        status: "confirmed",
        description: "Uber",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 30,
        category: "groceries",
        date: "2025-03-15",
        status: "incomplete",
        description: "",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 100,
        category: "entertainment",
        date: "2025-03-02",
        status: "confirmed",
        description: "Concert",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 200,
        category: "travel",
        date: "2025-01-10",
        status: "confirmed",
        description: "Flight to Paris",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 60,
        category: "health",
        date: "2024-12-15",
        status: "confirmed",
        description: "Doctor visit",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 150,
        category: "home",
        date: "2024-11-10",
        status: "confirmed",
        description: "Furniture",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 80,
        category: "sports",
        date: "2024-10-05",
        status: "confirmed",
        description: "Gym membership",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 40,
        category: "music",
        date: "2024-09-25",
        status: "confirmed",
        description: "Guitar strings",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 25,
        category: "drinks",
        date: "2024-08-20",
        status: "confirmed",
        description: "Cocktails",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 300,
        category: "electronics",
        date: "2024-07-15",
        status: "confirmed",
        description: "Headphones",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 500,
        category: "car",
        date: "2024-06-10",
        status: "confirmed",
        description: "Car repair",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 20,
        category: "charity",
        date: "2024-05-05",
        status: "confirmed",
        description: "Donation",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 90,
        category: "education",
        date: "2024-04-01",
        status: "confirmed",
        description: "Online course",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 35,
        category: "beauty",
        date: "2024-03-15",
        status: "confirmed",
        description: "Haircut",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 120,
        category: "insurance",
        date: "2024-02-10",
        status: "confirmed",
        description: "Car insurance",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 250,
        category: "travel",
        date: "2024-01-05",
        status: "confirmed",
        description: "Train tickets",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 15,
        category: "food",
        date: "2023-12-20",
        status: "confirmed",
        description: "Burger",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 70,
        category: "transport",
        date: "2023-11-15",
        status: "confirmed",
        description: "Bus pass",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 45,
        category: "groceries",
        date: "2023-10-10",
        status: "confirmed",
        description: "Weekly groceries",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 110,
        category: "entertainment",
        date: "2023-09-05",
        status: "confirmed",
        description: "Theater tickets",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 220,
        category: "travel",
        date: "2023-08-01",
        status: "confirmed",
        description: "Weekend getaway",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 35,
        category: "food",
        date: "2023-07-20",
        status: "confirmed",
        description: "Dinner",
        createdBy: "user2",
        updatedBy: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 55,
        category: "transport",
        date: "2023-06-15",
        status: "confirmed",
        description: "Taxi ride",
        createdBy: "user3",
        updatedBy: "user3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: nanoid(),
        ledger_id: demoLedgerId,
        amount: 75,
        category: "groceries",
        date: "2023-05-10",
        status: "confirmed",
        description: "Monthly groceries",
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
];

let ledgers = [
    {
      _id: 'demoLedger',
      name: 'Default Ledger',
      owner: 'user1', // 添加所有者字段
      budgets: { 
        default: 1000,
        months: { '2025-04': 2000 },
        categoryDefaults: {},
        categoryBudgets: { '2025-04': { 'Food': 500, 'Transport': 300 } }
      },
      spent: calculateSpent('demoLedger'),
      collaborators: [
        {
          userId: demoUserId,
          email: "demo@example.com",
          permission: "OWNER", // OWNER/EDITOR/VIEWER
          joinedAt: new Date().toISOString()
        }
      ]
    },
  ];

// 更新 notes 数据
let notes = [
    {
      id: nanoid(),
      type: 'collaboration', // collaboration/record/budget
      content: "You have been added to ledger 'Family Budget' as editor",
      is_read: false,
      created_at: Date.now(),
      ledgerId: 'demoLedger',
      metadata: {
        permission: 'EDITOR'
      },
      user_id: 'user1'
    },
    {
      id: nanoid(),
      type: 'record',
      content: "Alice modified record 'Grocery shopping' in 'Family Budget'",
      is_read: false,
      created_at: Date.now() - 3600000,
      ledgerId: 'demoLedger',
      recordId: records[0].id,
      user_id: 'user1'
    },
    {
      id: nanoid(),
      type: 'budget',
      content: "Monthly budget exceeded in 'Food' category",
      is_read: true,
      created_at: Date.now() - 86400000,
      ledgerId: 'demoLedger',
      metadata: {
        category: 'Food',
        amount: 550,
        budget: 500
      },
      user_id: 'user2'
    }
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
  http.post('/auth/google', async ({ request }) => {
    const { email } = await request.json()   // 假设前端按钮传不同 email
    const user = users.find(u => u.email === email) || users[0]
    return HttpResponse.json({
        access_token: `stub-jwt-${user.id}`,  
      user,
    })
  }),

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
// 在 handlers.js 中修改 GET /ledgers/:id/records 处理器
http.get('/ledgers/:id/records', ({ params, request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const cats = (url.searchParams.get('categories') || '').split(',').filter(Boolean);
    const split = url.searchParams.get('split');
  
    const data = records.filter(r => {
      if (r.ledger_id !== params.id) return false;
      if (month && !r.date.startsWith(month)) return false;
      if (cats.length > 0 && !cats.includes(r.category)) return false; // 修复这里
      if (split && !(r.split||[]).some(s=>s.email===split)) return false;
      return true;
    });
    return HttpResponse.json(data);
  }),

  http.post("/ledgers/:id/records", async ({ params, request }) => {
    const body = await request.json();
    const newRec = { 
      ...body, 
      id: nanoid(), 
      ledger_id: params.id,
      createdBy: demoUserId,
      updatedBy: demoUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    records.unshift(newRec); 
    
    // 更新相关账本的 spent 数据
    const ledger = ledgers.find(l => l._id === params.id);
    if (ledger) {
      const monthlySpent = calculateSpent(params.id);
      ledger.spent = monthlySpent;
    }
    
    // 添加新账单成功后，直接加通知
notes.unshift({
    id: nanoid(),
    // user_id: demoUserId, [TODO 后期要改成通知所有有权限的人！]
    type: 'record',
    content: `New record "${newRec.description || 'Unnamed'}" added`,
    is_read: false,
    created_at: Date.now(),
    ledgerId: params.id,
    recordId: newRec.id,
    // user_id: 
  });

  
    return HttpResponse.json(newRec, { status: 201 });
  }),

  http.put("/records/:id", async ({ params, request }) => {
    const body = await request.json();
    records = records.map((r) => 
      r.id === params.id 
        ? { 
            ...r, 
            ...body, 
            updatedBy: demoUserId,
            updatedAt: new Date().toISOString()
          } 
        : r
    );
    
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

//   http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
//     const { email } = await request.json();
//     ledgers = ledgers.map((l) =>
//       l._id === params.id
//         ? { ...l, collaborators: [...l.collaborators, { email }] }
//         : l
//     );
//     return HttpResponse.json({ ok: true });
//   }),



  /* ===== notifications ===== */

//   http.get("/notifications", () => HttpResponse.json(notes)),

//   http.get("/notifications/unread_count", () =>
//     HttpResponse.json({ count: notes.filter((n) => !n.is_read).length })
//   ),

//   http.patch("/notifications/:id", ({ params }) => {
//     notes = notes.map((n) =>
//       n.id === params.id ? { ...n, is_read: true } : n
//     );
//     return HttpResponse.json({ ok: true });
//   }),

//   // 添加通知
//   http.post('/notifications', async ({ request }) => {
//     const body = await request.json()
//     const newNote = {
//       id: nanoid(),
//       ...body,
//       is_read: false,
//       created_at: Date.now()
//     }
//     notes.unshift(newNote)
    
//     // 使用 mockSocket 代替 worker
//     mockSocket.emit('notification', newNote)
    
//     return HttpResponse.json(newNote)
//   }),
  
//   // 标记通知已读
//   http.patch('/notifications/:id', ({ params }) => {
//     notes = notes.map(n => 
//       n.id === params.id ? { ...n, is_read: true } : n
//     )
//     return HttpResponse.json({ ok: true })
//   }),

// 获取所有通知，按时间倒序（最新在上）
http.get("/notifications", ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const projectId = url.searchParams.get('project_id')
    const token = url.searchParams.get('token')
  
    console.log('收到 user_id:', userId, 'project_id:', projectId)
  
    return HttpResponse.json(
      notes
        .sort((a, b) => b.created_at - a.created_at)
    )
  }),
  
  // 获取未读通知数量
  http.get("/notifications/unread_count", ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const projectId = url.searchParams.get('project_id')
    const token = url.searchParams.get('token')
  
    console.log('收到 user_id:', userId, 'project_id:', projectId)
  
    // 这里其实可以用 userId 和 projectId 来筛选 notes
    // 但因为我们 mock 的 notes 没有真正记录 userId 和 projectId
    // 所以，简单返回所有未读数就可以了
    return HttpResponse.json({
      count: notes.filter(n => !n.is_read).length,
    })
  }),
  

  // 新增一条通知
  http.post("/notifications", async ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const myId = token?.replace('stub-jwt-', '') || demoUserId;  // 解析真实id！

    const body = await request.json();
    const newNote = {
      id: nanoid(),
        user_id: myId,  // 这里可以用 token 解析出来的 id
      ...body,
      is_read: false,
      created_at: Date.now(),
    };
    notes.unshift(newNote);
    return HttpResponse.json(newNote);
  }),
  
  // 标记通知为已读
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

    /* ===== 用户相关 ===== */
    http.get("/users", () => HttpResponse.json(users)),

    http.get("/users/me", () => 
      HttpResponse.json(users.find(u => u.id === demoUserId))
    ),
  
    /* ===== 协作相关 ===== */
    // 获取账本协作者列表
    http.get("/ledgers/:id/collaborators", ({ params }) => {
      const ledger = ledgers.find(l => l._id === params.id);
      if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
      // 合并协作者信息
      const collaborators = ledger.collaborators.map(c => {
        const user = users.find(u => u.id === c.userId);
        return {
          ...c,
          name: user?.name || c.email,
          avatar: user?.avatar || '👤'
        };
      });
      
      return HttpResponse.json(collaborators);
    }),
  
    // 添加协作者
    http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
        const { email, permission = "EDITOR" } = await request.json();
        const ledger = ledgers.find(l => l._id === params.id);
        if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
        const user = users.find(u => u.email === email);
        if (!user) return HttpResponse.error('User not found', { status: 404 });
      
        if (ledger.collaborators.some(c => c.userId === user.id)) {
          return HttpResponse.error('User already collaborator', { status: 400 });
        }
      
        const newCollaborator = {
          userId: user.id,
          email: user.email,
          permission,
          joinedAt: new Date().toISOString()
        };
        ledger.collaborators.push(newCollaborator);
      
        // 直接创建一条新通知
        notes.unshift({
          id: nanoid(),
            user_id: user.id, // 对吗？
          type: 'collaboration',
          content: `You were added to ledger "${ledger.name}" as ${permission.toLowerCase()}`,
          is_read: false,
          created_at: Date.now(),
          ledgerId: params.id
        });
      
        return HttpResponse.json(newCollaborator);
      }),
  
    // 移除协作者
    http.delete("/ledgers/:id/collaborators/:userId", ({ params }) => {
      const ledger = ledgers.find(l => l._id === params.id);
      if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
      // 不能移除所有者
      if (ledger.owner === params.userId) {
        return HttpResponse.error('Cannot remove owner', { status: 400 });
      }
      
      const index = ledger.collaborators.findIndex(c => c.userId === params.userId);
      if (index === -1) return HttpResponse.error('Collaborator not found', { status: 404 });
      
      ledger.collaborators.splice(index, 1);

      notes.unshift({
        id: nanoid(),
        user_id: params.userId, // 对吗？
        type: 'collaboration',
        content: `You were removed from ledger "${ledger.name}"`,
        is_read: false,
        created_at: Date.now(),
        ledgerId: params.id
      });
      
      return HttpResponse.json({ ok: true });
    }),
  
    // 更新协作者权限
    http.patch("/ledgers/:id/collaborators/:userId", async ({ params, request }) => {
      const { permission } = await request.json();
      const ledger = ledgers.find(l => l._id === params.id);
      if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
      const collaborator = ledger.collaborators.find(c => c.userId === params.userId);
      if (!collaborator) return HttpResponse.error('Collaborator not found', { status: 404 });
      
      collaborator.permission = permission;
      return HttpResponse.json({ ok: true });
    }),
  
    // 获取用户权限
// 🛠️ handlers.js 追加
http.get('/ledgers/:id/permission', ({ params, request }) => {
  const token = new URL(request.url).searchParams.get('token') || '';
  const myId = token.replace('stub-jwt-', '') || demoUserId;
  
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



    // handlers.js
    http.get('/ledgers', ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get('token') || '';
        const myId = token.replace('stub-jwt-', '') || demoUserId;
    
        const userLedgers = ledgers
          .filter(l => l.owner === myId || l.collaborators.some(c => c.userId === myId))
          .map(l => ({
            ...l,
            collaborators: l.collaborators.map(c => ({
              ...c,
              name: users.find(u => u.id === c.userId)?.name || c.email,
              avatar: users.find(u => u.id === c.userId)?.avatar || '👤',
            })),
          }));
    
        // 👉这里加保险，不管怎样都返回数组
        return HttpResponse.json(Array.isArray(userLedgers) ? userLedgers : []);
      }),

      http.post('/ledgers', async ({ request }) => {
        const { name, budget, token } = await request.json()
        const owner = (token || '').replace('stub-jwt-','') || demoUserId
        const newLedger = {
          _id: nanoid(),
          name,
          owner,
          budgets:{ default:budget, months:{}, categoryDefaults:{}, categoryBudgets:{} },
          collaborators: [{
            userId: owner,
            email: (users.find(u => u.id === owner)?.email) || '', // ⭐ 加上email！
            permission: 'OWNER',
            joinedAt: new Date().toISOString()
          }],
        }
        ledgers.push(newLedger)
        return HttpResponse.json(newLedger, { status:201 })
      })
      
      
  
];

