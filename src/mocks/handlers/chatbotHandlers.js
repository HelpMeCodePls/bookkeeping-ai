import { http, HttpResponse } from 'msw';

/** AI 聊天 & OCR 模块 handlers */
export const chatbotHandlers = [

  // AI 助手聊天接口（Stub）
  http.post("/agent/chat", async ({ request }) => {
    const { message } = await request.json();
    return HttpResponse.json({
      reply: `🤖 Stub: "${message}" received.`,
    });
  }),



];
