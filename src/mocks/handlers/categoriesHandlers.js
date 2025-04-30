// src/mocks/handlers/categoriesHandlers.js
import { http, HttpResponse } from "msw";

let categories = [
  { key: "food", label: "Food", icon: "🍔" },
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "groceries", label: "Groceries", icon: "🛒" },
  { key: "entertainment", label: "Entertainment", icon: "🎮" },
  { key: "travel", label: "Travel", icon: "✈️" },
  { key: "home", label: "Home", icon: "🏠" },
  { key: "other", label: "Other", icon: "✨" },
];

export const categoriesHandlers = [
  http.get("/categories", () => {
    return HttpResponse.json(categories);
  }),

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
