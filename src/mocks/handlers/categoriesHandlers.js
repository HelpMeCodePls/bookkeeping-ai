// src/mocks/handlers/categoriesHandlers.js
import { http, HttpResponse } from "msw";

// 🌟模拟的分类列表
let categories = [
  { key: "food", label: "Food", icon: "🍔" },
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "groceries", label: "Groceries", icon: "🛒" },
  { key: "entertainment", label: "Entertainment", icon: "🎮" },
  { key: "travel", label: "Travel", icon: "✈️" },
  { key: "home", label: "Home", icon: "🏠" },
  { key: "other", label: "Other", icon: "✨" },
];

// 📚 导出分类相关 handlers
export const categoriesHandlers = [
  // 获取所有分类
  http.get("/categories", () => {
    return HttpResponse.json(categories);
  }),

  // 添加新分类
  http.post("/categories", async ({ request }) => {
    const body = await request.json();
    categories.push({
      key: body.label.toLowerCase(),
      label: body.label,
      icon: body.icon || "🗂️",
    });
    return HttpResponse.json({ ok: true });
  }),
];
