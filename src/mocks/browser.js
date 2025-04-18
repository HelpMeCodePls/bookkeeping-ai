import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// DEV 环境启动，并让未匹配的请求直接透传
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}
