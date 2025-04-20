import { http, HttpResponse } from 'msw';
import { users, demoUserId } from '../mockData'; // 引入 users 和默认 demo 用户 ID

/**
 * 用户相关接口
 */
export const userHandlers = [
  // 获取所有用户
  http.get('/users', () => {
    return HttpResponse.json(users);
  }),

  // 获取当前登录用户信息
  http.get('/users/me', () => {
    const user = users.find(u => u.id === demoUserId);
    return HttpResponse.json(user);
  }),
];
