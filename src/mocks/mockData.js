// src/mocks/mockData.js

import { nanoid } from "nanoid";
import { calculateSpent } from './utils';

/* ===== DEMO IDs ===== */
export const demoLedgerId = "demoLedger";
export const demoUserId = "user3";

/* ===== USERS ===== */
export let users = [
  { id: "user1", name: "Demo User", email: "ozijunw@gmail.com", avatar: "👤" },
  { id: "user2", name: "Alice Smith", email: "olivia.zijun.wei@gmail.com", avatar: "👩" },
  { id: "user3", name: "Olivia", email: "olivia@outlook.com", avatar: "🐢" },
  { id: "user4", name: "Antonio", email: "antonio@outlook.com", avatar: "🐟" },
  { id: "user5", name: "David", email: "david@outlook.com", avatar: "🐻" },
  { id: "user6", name: "Chenchen", email: "chenchen@outlook.com", avatar: "🦝" },
];

/* ===== RECORDS ===== */
export let records = [
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 50, amount: 6.15 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 10.25 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 7.88 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 25 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 50 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 100 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 37.75 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 22.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 15 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 50 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 100 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 30 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 75 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 40 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 20 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 12.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 150 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 250 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 10 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 45 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 17.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 60 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 125 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 7.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 35 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 22.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 55 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 110 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 17.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 27.5 }]
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
        updatedAt: new Date().toISOString(),
        split: [{ user_id: "user4", ratio: 0.5, amount: 37.5 }]
    }
];

/* ===== LEDGERS ===== */
export let ledgers = [
  {
    _id: demoLedgerId,
    name: "Default Ledger",
    owner: demoUserId,
    budgets: {
      default: 1000,
      months: { "2025-04": 2000 },
      categoryDefaults: {},
      categoryBudgets: { "2025-04": { Food: 500, Transport: 300 } },
    },
    spent: {}, //  用 calculateSpent() 动态生成
    collaborators: [
      {
        userId: "user3",
        email: "olivia@outlook.com",
        permission: "OWNER",
        joinedAt: new Date().toISOString(),
      },
      {
        userId: "user4",
        email: "charlie@example.com",
        permission: "EDITOR",
        joinedAt: new Date().toISOString(),
      },
    ],
  },
];

// 后期接入数据库时，就不需要在这里动态计算了
ledgers.forEach(ledger => {
    ledger.spent = calculateSpent(records, ledger._id);
  });
  

/* ===== NOTES ===== */
export let notes = [
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
      user_id: 'user3'
    },
    {
      id: nanoid(),
      type: 'record',
      content: "Alice modified record 'Grocery shopping' in 'Family Budget'",
      is_read: false,
      created_at: Date.now() - 3600000,
      ledgerId: 'demoLedger',
      recordId: records[0].id,
      user_id: 'user3'
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
      user_id: 'user6'
    }
];

