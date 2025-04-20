// src/mocks/handlers/ocrHandlers.js
import { http, HttpResponse } from "msw";

// 📚 导出 OCR 上传相关 handlers
export const ocrHandlers = [
  // 模拟 OCR 识别上传
  http.post("/ocr/upload", async () => {
    return HttpResponse.json({
      amount: 20.5,
      date: "2025-04-18",
      category: "Food",
      description: "Mock OCR Starbucks",
    });
  }),
];
