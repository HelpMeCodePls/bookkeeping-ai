import { http, HttpResponse } from 'msw'

export const handlers = [
  // Stub: /auth/google ➜ 返回固定 JWT
  http.post('/auth/google', async ({ request }) => {
    const { id_token } = await request.json()
    // id_token 可以简单校验 / 直接忽略
    return HttpResponse.json({
      access_token: 'stub-jwt',
      user: { _id: '1', username: 'Demo User' },
    })
  }),
]
