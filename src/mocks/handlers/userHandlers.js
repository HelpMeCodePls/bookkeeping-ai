import { http, HttpResponse } from "msw";
import { users, demoUserId } from "../mockData";

export const userHandlers = [
  http.get("/users", () => {
    return HttpResponse.json(users);
  }),

  http.get("/users/me", () => {
    const user = users.find((u) => u.id === demoUserId);
    return HttpResponse.json(user);
  }),
];
