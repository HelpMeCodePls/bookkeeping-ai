import { http, HttpResponse } from "msw";

export const chatbotHandlers = [
  http.post("/agent/chat", async ({ request }) => {
    const { message } = await request.json();
    return HttpResponse.json({
      reply: `🤖 Stub: "${message}" received.`,
    });
  }),
];
