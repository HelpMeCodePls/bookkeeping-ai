// src/mocks/handlers.js

import { authHandlers } from './handlers/authHandlers';
import { recordHandlers } from './handlers/recordHandlers';
import { ledgerHandlers } from './handlers/ledgerHandlers';
import { collaboratorsHandlers } from './handlers/collaboratorsHandlers';
import { categoriesHandlers } from './handlers/categoriesHandlers';
import { notificationsHandlers } from './handlers/notificationHandlers';
import { ocrHandlers } from './handlers/ocrHandlers';
import { chatbotHandlers } from './handlers/chatbotHandlers';
import { chartsHandlers } from './handlers/chartsHandlers';
import { userHandlers } from './handlers/userHandlers';

export const handlers = [
  ...authHandlers,
  ...recordHandlers,
  ...ledgerHandlers,
  ...collaboratorsHandlers,
  ...categoriesHandlers,
  ...notificationsHandlers,
  ...ocrHandlers,
  ...chatbotHandlers,
    ...chartsHandlers,
    ...userHandlers,
];



// import { http, HttpResponse } from "msw";
// import { nanoid } from "nanoid";
// // import { mockSocket } from "./browser";
// // import { mockWebSocket } from "./browser"; // 引入 mockWebSocket



// const demoLedgerId = "demoLedger";

// const demoUserId = "user3";

// let users = [
//     {
//         id: "user1",
//         name: "Demo User",
//         email: "ozijunw@gmail.com",
//         avatar: "👤"
//     },
//     {
//         id: "user2",
//         name: "Alice Smith",
//         email: "olivia.zijun.wei@gmail.com",
//         avatar: "👩"
//     },
//     {
//         id: "user3",
//         name: "Olivia",
//         email: "olivia@outlook.com",
//         avatar: "🐢"
//     },
//     {
//         id: "user4",
//         name: "Antonio",
//         email: "antonio@outlook.com",
//         avatar: "🐟"
//     },
//     {
//         id: "user5",
//         name: "David",
//         email: "david@outlook.com",
//         avatar: "🐻"
//     },
//     {
//         id: "user6",
//         name: "Chenchen",
//         email: "chenchen@outlook.com",
//         avatar: "🦝"
//     }
// ];

// let categories = [
//     { key: "food", label: "Food", icon: "🍔" },
//     { key: "transport", label: "Transport", icon: "🚗" },
//     { key: "groceries", label: "Groceries", icon: "🛒" },
//     { key: "entertainment", label: "Entertainment", icon: "🎮" },
//     { key: "travel", label: "Travel", icon: "✈️" },
//     { key: "home", label: "Home", icon: "🏠" },
//     { key: "work", label: "Work", icon: "💼" },
//     { key: "gifts", label: "Gifts", icon: "🎁" },
//     { key: "education", label: "Education", icon: "📚" },
//     { key: "drinks", label: "Drinks", icon: "🍻" },
//     { key: "music", label: "Music", icon: "🎵" },
//     { key: "health", label: "Health", icon: "🏥" },
//     { key: "pets", label: "Pets", icon: "🐶" },
//     { key: "beauty", label: "Beauty", icon: "💄" },
//     { key: "insurance", label: "Insurance", icon: "🛡️" },
//     { key: "sports", label: "Sports", icon: "🏀" },
//     { key: "electronics", label: "Electronics", icon: "📱" },
//     { key: "car", label: "Car", icon: "🚙" },
//     { key: "charity", label: "Charity", icon: "❤️" },
//     { key: "other", label: "Other", icon: "✨" },
//   ];
  

// let records = [
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 12.3,
//         category: "food",
//         date: "2025-04-17",
//         status: "confirmed",
//         description: "Latte",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 50, amount: 6.15 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 20.5,
//         category: "food",
//         date: "2025-04-17",
//         status: "confirmed",
//         description: "Pizza",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 10.25 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 15.75,
//         category: "transport",
//         date: "2025-04-20",
//         status: "confirmed",
//         description: "Taxi",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 7.88 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 50,
//         category: "entertainment",
//         date: "2025-04-23",
//         status: "Incomplete",
//         description: "Movie",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 25 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 100,
//         category: "travel",
//         date: "2025-04-21",
//         status: "confirmed",
//         description: "Hotel",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 50 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 200,
//         category: "groceries",
//         date: "2025-04-22",
//         status: "confirmed",
//         description: "",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 100 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 75.5,
//         category: "food",
//         date: "2025-04-23",
//         status: "confirmed",
//         description: "",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 37.75 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 45,
//         category: "transport",
//         date: "2025-04-16",
//         status: "confirmed",
//         description: "Uber",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 22.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 30,
//         category: "groceries",
//         date: "2025-03-15",
//         status: "incomplete",
//         description: "",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 15 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 100,
//         category: "entertainment",
//         date: "2025-03-02",
//         status: "confirmed",
//         description: "Concert",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 50 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 200,
//         category: "travel",
//         date: "2025-01-10",
//         status: "confirmed",
//         description: "Flight to Paris",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 100 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 60,
//         category: "health",
//         date: "2024-12-15",
//         status: "confirmed",
//         description: "Doctor visit",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 30 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 150,
//         category: "home",
//         date: "2024-11-10",
//         status: "confirmed",
//         description: "Furniture",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 75 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 80,
//         category: "sports",
//         date: "2024-10-05",
//         status: "confirmed",
//         description: "Gym membership",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 40 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 40,
//         category: "music",
//         date: "2024-09-25",
//         status: "confirmed",
//         description: "Guitar strings",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 20 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 25,
//         category: "drinks",
//         date: "2024-08-20",
//         status: "confirmed",
//         description: "Cocktails",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 12.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 300,
//         category: "electronics",
//         date: "2024-07-15",
//         status: "confirmed",
//         description: "Headphones",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 150 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 500,
//         category: "car",
//         date: "2024-06-10",
//         status: "confirmed",
//         description: "Car repair",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 250 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 20,
//         category: "charity",
//         date: "2024-05-05",
//         status: "confirmed",
//         description: "Donation",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 10 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 90,
//         category: "education",
//         date: "2024-04-01",
//         status: "confirmed",
//         description: "Online course",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 45 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 35,
//         category: "beauty",
//         date: "2024-03-15",
//         status: "confirmed",
//         description: "Haircut",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 17.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 120,
//         category: "insurance",
//         date: "2024-02-10",
//         status: "confirmed",
//         description: "Car insurance",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 60 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 250,
//         category: "travel",
//         date: "2024-01-05",
//         status: "confirmed",
//         description: "Train tickets",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 125 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 15,
//         category: "food",
//         date: "2023-12-20",
//         status: "confirmed",
//         description: "Burger",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 7.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 70,
//         category: "transport",
//         date: "2023-11-15",
//         status: "confirmed",
//         description: "Bus pass",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 35 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 45,
//         category: "groceries",
//         date: "2023-10-10",
//         status: "confirmed",
//         description: "Weekly groceries",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 22.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 110,
//         category: "entertainment",
//         date: "2023-09-05",
//         status: "confirmed",
//         description: "Theater tickets",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 55 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 220,
//         category: "travel",
//         date: "2023-08-01",
//         status: "confirmed",
//         description: "Weekend getaway",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 110 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 35,
//         category: "food",
//         date: "2023-07-20",
//         status: "confirmed",
//         description: "Dinner",
//         createdBy: "user2",
//         updatedBy: "user2",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 17.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 55,
//         category: "transport",
//         date: "2023-06-15",
//         status: "confirmed",
//         description: "Taxi ride",
//         createdBy: "user3",
//         updatedBy: "user3",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 27.5 }]
//     },
//     {
//         id: nanoid(),
//         ledger_id: demoLedgerId,
//         amount: 75,
//         category: "groceries",
//         date: "2023-05-10",
//         status: "confirmed",
//         description: "Monthly groceries",
//         createdBy: "user1",
//         updatedBy: "user1",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         split: [{ user_id: "user4", ratio: 0.5, amount: 37.5 }]
//     },
// ];

// let ledgers = [
//     {
//       _id: 'demoLedger',
//       name: 'Default Ledger',
//       owner: 'user3', // 添加所有者字段
//       budgets: { 
//         default: 1000,
//         months: { '2025-04': 2000 },
//         categoryDefaults: {},
//         categoryBudgets: { '2025-04': { 'Food': 500, 'Transport': 300 } }
//       },
//       spent: calculateSpent('demoLedger'),
//       collaborators: [
//         {
//           userId: "user3",
//           email: "olivia@outlook.com",
//           permission: "OWNER", // OWNER/EDITOR/VIEWER
//           joinedAt: new Date().toISOString()
//         },
//         {
//           userId: "user4",
//           email: "charlie@example.com",
//             permission: "EDITOR",
//             joinedAt: new Date().toISOString()
//         },
//       ]
//     },
//   ];


// let notes = [
//     {
//       id: nanoid(),
//       type: 'collaboration', // collaboration/record/budget
//       content: "You have been added to ledger 'Family Budget' as editor",
//       is_read: false,
//       created_at: Date.now(),
//       ledgerId: 'demoLedger',
//       metadata: {
//         permission: 'EDITOR'
//       },
//       user_id: 'user3'
//     },
//     {
//       id: nanoid(),
//       type: 'record',
//       content: "Alice modified record 'Grocery shopping' in 'Family Budget'",
//       is_read: false,
//       created_at: Date.now() - 3600000,
//       ledgerId: 'demoLedger',
//       recordId: records[0].id,
//       user_id: 'user3'
//     },
//     {
//       id: nanoid(),
//       type: 'budget',
//       content: "Monthly budget exceeded in 'Food' category",
//       is_read: true,
//       created_at: Date.now() - 86400000,
//       ledgerId: 'demoLedger',
//       metadata: {
//         category: 'Food',
//         amount: 550,
//         budget: 500
//       },
//       user_id: 'user6'
//     }
//   ];




// function calculateSpent(ledgerId) {
//     const monthlySpent = {};
//     records
//       .filter(r => 
//         r.ledger_id === ledgerId && 
//         r.status === 'confirmed' 
//       )
//       .forEach(r => {
//         const month = r.date.slice(0, 7); // YYYY-MM
//         monthlySpent[month] = (monthlySpent[month] || 0) + Number(r.amount || 0);
//       });
//     return monthlySpent;
//   }


// export const handlers = [


//   /* ===== auth ===== */
// //   http.post('/auth/google', async ({ request }) => {
// //     const { id_token } = await request.json(); 

// //     console.log('Google ID Token:', id_token); 

// //     const user = users[0]; 
// //     // const { email } = await request.json()  
// //     // const user = users.find(u => u.email === email) 
// //     return HttpResponse.json({
// //         access_token: `stub-jwt-${user.id}`,  
// //       user,
// //     })
// //   }),


  

//   http.post('/auth/login', async ({ request }) => {
//     const { email } = await request.json()
//     const user = users.find(u => u.email === email)
    
//     if (!user) {
//       return HttpResponse.json(
//         { message: 'User not found' },
//         { status: 404 }
//       )
//     }
  
//     return HttpResponse.json({
//       access_token: `stub-jwt-${user.id}`,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar

//       }
//     })
//   }),

// // http.post('/auth/login', async ({ request }) => {
// //     const { email } = await request.json()
// //     const user = users.find(u => u.email === email)
    
// //     if (!user) {
// //       return HttpResponse.error('User not found', { status: 404 })
// //     }
  
// //     return HttpResponse.json({
// //       access_token: `stub-jwt-${user.id}`,  
// //       user,
// //     })
// //   }),
  
//   /* ===== categories ===== */
//   http.get("/categories", () => HttpResponse.json(categories)),
  
//   http.post('/categories', async ({ request }) => {
//     const body = await request.json();
//     categories.push({
//       key: body.label.toLowerCase(),
//       label: body.label,
//       icon: body.icon || '🗂️',
//     });
//     return HttpResponse.json({ ok: true });
//   }),

//   /* ===== records ===== */

// http.get('/ledgers/:id/records', ({ params, request }) => {
//     const url = new URL(request.url);
//     const month = url.searchParams.get('month');
//     const cats = (url.searchParams.get('categories') || '').split(',').filter(Boolean);
//     const split = url.searchParams.get('split');
//     const collaborator = url.searchParams.get('collaborator');
    
//     const data = records.filter(r => {
//         if (r.ledger_id !== params.id) return false;
//         if (month && (!r.date || !r.date.startsWith(month))) return false;
//         if (cats.length > 0 && (!r.category || !cats.includes(r.category.toLowerCase()))) return false;
//         if (split && !(r.split || []).some(s => s.user_id === split)) return false;
//         if (collaborator && r.createdBy !== collaborator) return false;
//         return true;
//       });
      
//     return HttpResponse.json(data);
//   }),

//   http.post("/ledgers/:id/records", async ({ params, request }) => {
//     const body = await request.json();
//     const currentUserId = body.user_id || demoUserId;
//     const newRec = { 
//       ...body, 
//       id: nanoid(), 
//       ledger_id: params.id,
//       createdBy: currentUserId,
//       updatedBy: currentUserId,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),

//     split: (body.split || []).map(s => ({
//         ...s,
//         amount: Number(s.amount) || 0
//       }))
//     };
//     records.unshift(newRec); 
    
    

//     const ledger = ledgers.find(l => l._id === params.id);
//     if (ledger) {
//       const monthlySpent = calculateSpent(params.id);
//       ledger.spent = monthlySpent;
//     }
    

// // notes.unshift({
// //     id: nanoid(),
// //     // user_id: demoUserId,
// //     // user_id: currentUserId,
// //     type: 'record',
// //     content: `New record "${newRec.description || 'Unnamed'}" added`,
// //     is_read: false,
// //     created_at: Date.now(),
// //     ledgerId: params.id,
// //     recordId: newRec.id,
// //     // user_id: 
// //   });
// ledger.collaborators.forEach(collaborator => {
//     notes.unshift({
//       id: nanoid(),
//       type: 'record',
//       content: `New record "${newRec.description || 'Unnamed'}" added`,
//       is_read: false,
//       created_at: Date.now(),
//       ledgerId: params.id,
//       recordId: newRec.id,
//       user_id: collaborator.userId 
//     });
//   });

  
//   return HttpResponse.json(records.filter(r => r.ledger_id === params.id), { status: 201 });
// }),

//   http.put("/records/:id", async ({ params, request }) => {
//     const body = await request.json();
//     records = records.map((r) => 
//       r.id === params.id 
//         ? { 
//             ...r, 
//             ...body, 
//             updatedBy: demoUserId,
//             updatedAt: new Date().toISOString()
//           } 
//         : r
//     );
    

//     const record = records.find(r => r.id === params.id);
//     if (record) {
//       const ledger = ledgers.find(l => l._id === record.ledger_id);
//       if (ledger) {
//         const monthlySpent = calculateSpent(record.ledger_id);
//         ledger.spent = monthlySpent;
//       }
//     }
    
//     return HttpResponse.json({ ok: true });
//   }),

//   http.delete("/records/:id", ({ params }) => {
//     const record = records.find(r => r.id === params.id);
//     records = records.filter((r) => r.id !== params.id);
    

//     if (record) {
//       const ledger = ledgers.find(l => l._id === record.ledger_id);
//       if (ledger) {
//         const monthlySpent = calculateSpent(record.ledger_id);
//         ledger.spent = monthlySpent;
//       }
//     }
    
//     return HttpResponse.json({ ok: true });
//   }),

//   http.get("/records/incomplete", () =>
//     HttpResponse.json(records.filter((r) => r.status === "incomplete"))
//   ),

//   /* ===== ledgers ===== */

//   http.get('/ledgers/:id', ({ params }) => {
//     const ledger = ledgers.find(l => l._id === params.id);
//     if (!ledger) return HttpResponse.error('Not found', { status: 404 });
    

//     const monthlySpent = calculateSpent(params.id);
//     ledger.spent = monthlySpent;
    
//     return HttpResponse.json({
//       ...ledger,
//       spent: monthlySpent
//     });
//   }),

//   http.patch('/ledgers/:id/budgets', async ({ params, request }) => {
//     const { month, category, budget, setDefault } = await request.json();
    
//     const ledger = ledgers.find(l => l._id === params.id);
//     if (!ledger) {
//       return HttpResponse.error('Ledger not found', { status: 404 });
//     }
  

//     ledger.budgets = ledger.budgets || {
//       default: 0,
//       months: {},
//       categoryDefaults: {},
//       categoryBudgets: {}
//     };
    

//     if (!category) {
//       if (setDefault) {
//         ledger.budgets.default = Number(budget);
//       } else {
//         ledger.budgets.months = ledger.budgets.months || {};
//         ledger.budgets.months[month] = Number(budget);
//       }
//     }

//     else {
//       ledger.budgets.categoryBudgets = ledger.budgets.categoryBudgets || {};
//       ledger.budgets.categoryBudgets[month] = ledger.budgets.categoryBudgets[month] || {};
      
//       if (setDefault) {
//         ledger.budgets.categoryDefaults = ledger.budgets.categoryDefaults || {};
//         ledger.budgets.categoryDefaults[category] = Number(budget);
//       } else {
//         ledger.budgets.categoryBudgets[month][category] = Number(budget);
//       }
//     }
    
//     return HttpResponse.json({ ok: true });
//   }),

// //   http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
// //     const { email } = await request.json();
// //     ledgers = ledgers.map((l) =>
// //       l._id === params.id
// //         ? { ...l, collaborators: [...l.collaborators, { email }] }
// //         : l
// //     );
// //     return HttpResponse.json({ ok: true });
// //   }),



//   /* ===== notifications ===== */

// //   http.get("/notifications", () => HttpResponse.json(notes)),

// //   http.get("/notifications/unread_count", () =>
// //     HttpResponse.json({ count: notes.filter((n) => !n.is_read).length })
// //   ),

// //   http.patch("/notifications/:id", ({ params }) => {
// //     notes = notes.map((n) =>
// //       n.id === params.id ? { ...n, is_read: true } : n
// //     );
// //     return HttpResponse.json({ ok: true });
// //   }),

// //   // 添加通知
// //   http.post('/notifications', async ({ request }) => {
// //     const body = await request.json()
// //     const newNote = {
// //       id: nanoid(),
// //       ...body,
// //       is_read: false,
// //       created_at: Date.now()
// //     }
// //     notes.unshift(newNote)
    
// //     // 使用 mockSocket 代替 worker
// //     mockSocket.emit('notification', newNote)
    
// //     return HttpResponse.json(newNote)
// //   }),
  

// //   http.patch('/notifications/:id', ({ params }) => {
// //     notes = notes.map(n => 
// //       n.id === params.id ? { ...n, is_read: true } : n
// //     )
// //     return HttpResponse.json({ ok: true })
// //   }),


// http.get("/notifications", ({ request }) => {
//     const url = new URL(request.url);
//     const token = url.searchParams.get('token') || '';
//     const myId = token.replace('stub-jwt-', '') || demoUserId;
  
//     const userNotes = notes
//       .filter(n => n.user_id === myId)   // ⭐ 确保只返回自己的notes
//       .sort((a, b) => b.created_at - a.created_at);
  
//     return new HttpResponse(
//       JSON.stringify(userNotes),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );
//   }),
  
  

//   http.get("/notifications/unread_count", ({ request }) => {
//     const url = new URL(request.url);
//     const token = url.searchParams.get('token') || '';
//     const myId = token.replace('stub-jwt-', '') || demoUserId;
  
//     const count = notes.filter(n => !n.is_read && n.user_id === myId).length;
  
//     return new HttpResponse(
//       JSON.stringify({ count }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );
//   }),  
  


//   http.post("/notifications", async ({ request }) => {
//     const url = new URL(request.url);
//     const token = url.searchParams.get('token');
//     const myId = token?.replace('stub-jwt-', '') || demoUserId; 

//     const body = await request.json();
//     const newNote = {
//       id: nanoid(),
//         user_id: myId, 
//       ...body,
//       is_read: false,
//       created_at: Date.now(),
//     };
//     notes.unshift(newNote);
//     return HttpResponse.json(newNote);
//   }),
  

//   http.patch("/notifications/:id", ({ params }) => {
//     notes = notes.map((n) =>
//       n.id === params.id ? { ...n, is_read: true } : n
//     );
//     return HttpResponse.json({ ok: true });
//   }),


//   /* ===== agent chat ===== */
//   http.post("/agent/chat", async ({ request }) => {
//     const { message } = await request.json();
//     return HttpResponse.json({ reply: `🤖 Stub: "${message}" received.` });
//   }),

//   /* ===== OCR upload stub ===== */
//   http.post("/ocr/upload", async () =>
//     HttpResponse.json({
//       amount: 20.5,
//       date: "2025-04-18",
//       category: "Food",
//       description: "Mock OCR Starbucks",
//     })
//   ),

//   /* ===== charts summary stub ===== */
//   http.get("/charts/summary", ({ request }) => {
//     const url = new URL(request.url);
//     const ledgerId = url.searchParams.get('ledgerId');
//     const mode = url.searchParams.get('mode');
//     const selectedDate = url.searchParams.get('selectedDate');
  
//     let filtered = records.filter(r => r.ledger_id === ledgerId);
  
//     if (mode !== 'all' && selectedDate) {
//       if ((mode === 'month' || mode === 'year') && selectedDate.length >= 7) {
//         // month 或 year，比如 2025-04
//         filtered = filtered.filter(r => r.date?.startsWith(selectedDate));
//       } else if (mode === 'week' && selectedDate.includes('~')) {
//         // week 是日期范围
//         const [start, end] = selectedDate.split('~').map(s => s.trim());
//         const startDate = new Date(start);
//         const endDate = new Date(end);
  
//         filtered = filtered.filter(r => {
//           const recDate = new Date(r.date);
//           return recDate >= startDate && recDate <= endDate;
//         });
//       }
//     }
  
//     const byCategory = {};
//     for (const r of filtered) {
//       if (!byCategory[r.category]) byCategory[r.category] = 0;
//       byCategory[r.category] += Number(r.amount || 0);
//     }
  
//     const dailyMap = {};
//     for (const r of filtered) {
//       if (!dailyMap[r.date]) dailyMap[r.date] = 0;
//       dailyMap[r.date] += Number(r.amount || 0);
//     }
//     const daily = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0]));
  
//     return HttpResponse.json({ byCategory, daily });
//   }),
  

//     http.get("/users", () => HttpResponse.json(users)),

//     http.get("/users/me", () => 
//       HttpResponse.json(users.find(u => u.id === demoUserId))
//     ),
  

//     http.get("/ledgers/:id/collaborators", ({ params }) => {
//       const ledger = ledgers.find(l => l._id === params.id);
//       if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      

//       const collaborators = ledger.collaborators.map(c => {
//         const user = users.find(u => u.id === c.userId);
//         return {
//           ...c,
//           name: user?.name || c.email,
//           avatar: user?.avatar || '👤'
//         };
//       });
      
//       return HttpResponse.json(collaborators);
//     }),
  

//     http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
//         const { email, permission = "EDITOR" } = await request.json();
//         const ledger = ledgers.find(l => l._id === params.id);
//         if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
//         const user = users.find(u => u.email === email);
//         if (!user) return HttpResponse.error('User not found', { status: 404 });
      
//         if (ledger.collaborators.some(c => c.userId === user.id)) {
//           return HttpResponse.error('User already collaborator', { status: 400 });
//         }
      
//         const newCollaborator = {
//           userId: user.id,
//           email: user.email,
//           permission,
//           joinedAt: new Date().toISOString()
//         };
//         ledger.collaborators.push(newCollaborator);
      

//         notes.unshift({
//           id: nanoid(),
//             user_id: user.id,
//           type: 'collaboration',
//           content: `You were added to ledger "${ledger.name}" as ${permission.toLowerCase()}`,
//           is_read: false,
//           created_at: Date.now(),
//           ledgerId: params.id
//         });
      
//         return HttpResponse.json(newCollaborator);
//       }),
  

//     http.delete("/ledgers/:id/collaborators/:userId", ({ params }) => {
//       const ledger = ledgers.find(l => l._id === params.id);
//       if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      

//       if (ledger.owner === params.userId) {
//         return HttpResponse.error('Cannot remove owner', { status: 400 });
//       }
      
//       const index = ledger.collaborators.findIndex(c => c.userId === params.userId);
//       if (index === -1) return HttpResponse.error('Collaborator not found', { status: 404 });
      
//       ledger.collaborators.splice(index, 1);

//       notes.unshift({
//         id: nanoid(),
//         user_id: params.userId, 
//         type: 'collaboration',
//         content: `You were removed from ledger "${ledger.name}"`,
//         is_read: false,
//         created_at: Date.now(),
//         ledgerId: params.id
//       });
      
//       return HttpResponse.json({ ok: true });
//     }),
  

//     http.patch("/ledgers/:id/collaborators/:userId", async ({ params, request }) => {
//       const { permission } = await request.json();
//       const ledger = ledgers.find(l => l._id === params.id);
//       if (!ledger) return HttpResponse.error('Ledger not found', { status: 404 });
      
//       const collaborator = ledger.collaborators.find(c => c.userId === params.userId);
//       if (!collaborator) return HttpResponse.error('Collaborator not found', { status: 404 });
      
//       collaborator.permission = permission;
//       return HttpResponse.json({ ok: true });
//     }),
  

// http.get('/ledgers/:id/permission', ({ params, request }) => {
//   const token = new URL(request.url).searchParams.get('token') || '';
//   const myId = token.replace('stub-jwt-', '') || demoUserId;
  
//   const ledger = ledgers.find(l => l._id === params.id);
//   if (!ledger) {
//     return HttpResponse.error('Ledger not found', { status: 404 });
//   }

//   if (ledger.owner === myId) {
//     return HttpResponse.json({ permission: 'OWNER' });
//   }
//   const collaborator = ledger.collaborators.find(c => c.userId === myId);
//     if (collaborator) {
//         return HttpResponse.json({ permission: collaborator.permission });
//     }

//   return HttpResponse.json({ permission: 'VIEWER' });
// }),



//     // handlers.js
//     http.get('/ledgers', ({ request }) => {
//         const url = new URL(request.url);
//         const token = url.searchParams.get('token') || '';
//         const myId = token.replace('stub-jwt-', '') || demoUserId;
    
//         const userLedgers = ledgers
//           .filter(l => l.owner === myId || l.collaborators.some(c => c.userId === myId))
//           .map(l => ({
//             ...l,
//             collaborators: l.collaborators.map(c => ({
//               ...c,
//               name: users.find(u => u.id === c.userId)?.name || c.email,
//               avatar: users.find(u => u.id === c.userId)?.avatar || '👤',
//             })),
//           }));
    

//         return HttpResponse.json(Array.isArray(userLedgers) ? userLedgers : []);
//       }),

//       http.post('/ledgers', async ({ request }) => {
//         const { name, budget, token } = await request.json()
//         const owner = (token || '').replace('stub-jwt-','') || demoUserId
//         const newLedger = {
//           _id: nanoid(),
//           name,
//           owner,
//           budgets:{ default:budget, months:{}, categoryDefaults:{}, categoryBudgets:{} },
//           collaborators: [{
//             userId: owner,
//             email: (users.find(u => u.id === owner)?.email) || '', // ⭐ 加上email！
//             permission: 'OWNER',
//             joinedAt: new Date().toISOString()
//           }],
//         }
//         ledgers.push(newLedger)
//         return HttpResponse.json(newLedger, { status:201 })
//       })
      
      
  
// ];

