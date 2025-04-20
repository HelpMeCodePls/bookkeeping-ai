import { http, HttpResponse } from 'msw';
import { users } from '../mockData'; // 引入用户数据（注意稍后我们整理 mockData.js）

/**
 * 身份验证相关接口
 */
export const authHandlers = [
  // 模拟登录
  http.post('/auth/login', async ({ request }) => {
    const { email } = await request.json();
    const user = users.find(u => u.email === email);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      access_token: `stub-jwt-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }),
];
