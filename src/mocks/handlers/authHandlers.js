import { http, HttpResponse } from "msw";
import { users } from "../mockData";

export const authHandlers = [
  http.post("/auth/login", async ({ request }) => {
    const { email } = await request.json();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return HttpResponse.json({ message: "User not found" }, { status: 404 });
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
