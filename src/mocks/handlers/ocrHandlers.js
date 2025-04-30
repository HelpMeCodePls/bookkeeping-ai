// src/mocks/handlers/ocrHandlers.js
import { http, HttpResponse } from "msw";

export const ocrHandlers = [
  http.post("/ocr/upload", async () => {
    return HttpResponse.json({
      amount: 20.5,
      date: "2025-04-18",
      category: "Food",
      description: "Mock OCR Starbucks",
    });
  }),
];
