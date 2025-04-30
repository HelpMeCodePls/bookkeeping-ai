import { http, HttpResponse } from "msw";
import { nanoid } from "nanoid";
import { users, ledgers, notes } from "../mockData";

export const collaboratorsHandlers = [
  http.get("/ledgers/:id/collaborators", ({ params }) => {
    const ledger = ledgers.find((l) => l._id === params.id);
    if (!ledger) return HttpResponse.error("Ledger not found", { status: 404 });

    const collaborators = ledger.collaborators.map((c) => {
      const user = users.find((u) => u.id === c.userId);
      return {
        ...c,
        name: user?.name || c.email,
        avatar: user?.avatar || "👤",
      };
    });

    return HttpResponse.json(collaborators);
  }),

  http.post("/ledgers/:id/collaborators", async ({ params, request }) => {
    const { email, permission = "EDITOR" } = await request.json();
    const ledger = ledgers.find((l) => l._id === params.id);
    if (!ledger) return HttpResponse.error("Ledger not found", { status: 404 });

    const user = users.find((u) => u.email === email);
    if (!user) return HttpResponse.error("User not found", { status: 404 });

    if (ledger.collaborators.some((c) => c.userId === user.id)) {
      return HttpResponse.error("User already collaborator", { status: 400 });
    }

    const newCollaborator = {
      userId: user.id,
      email: user.email,
      permission,
      joinedAt: new Date().toISOString(),
    };

    ledger.collaborators.push(newCollaborator);

    notes.unshift({
      id: nanoid(),
      user_id: user.id,
      type: "collaboration",
      content: `You were added to ledger "${
        ledger.name
      }" as ${permission.toLowerCase()}`,
      is_read: false,
      created_at: Date.now(),
      ledgerId: ledger._id,
    });

    return HttpResponse.json(newCollaborator, { status: 201 });
  }),

  http.delete("/ledgers/:id/collaborators/:userId", ({ params }) => {
    const { id, userId } = params;
    const ledger = ledgers.find((l) => l._id === id);
    if (!ledger) return HttpResponse.error("Ledger not found", { status: 404 });

    if (ledger.owner === userId) {
      return HttpResponse.error("Cannot remove owner", { status: 400 });
    }

    const index = ledger.collaborators.findIndex((c) => c.userId === userId);
    if (index === -1)
      return HttpResponse.error("Collaborator not found", { status: 404 });

    ledger.collaborators.splice(index, 1);

    notes.unshift({
      id: nanoid(),
      user_id: userId,
      type: "collaboration",
      content: `You were removed from ledger "${ledger.name}"`,
      is_read: false,
      created_at: Date.now(),
      ledgerId: ledger._id,
    });

    return HttpResponse.json({ ok: true });
  }),

  http.patch(
    "/ledgers/:id/collaborators/:userId",
    async ({ params, request }) => {
      const { permission } = await request.json();
      const { id, userId } = params;
      const ledger = ledgers.find((l) => l._id === id);
      if (!ledger)
        return HttpResponse.error("Ledger not found", { status: 404 });

      const collaborator = ledger.collaborators.find(
        (c) => c.userId === userId
      );
      if (!collaborator)
        return HttpResponse.error("Collaborator not found", { status: 404 });

      collaborator.permission = permission;

      return HttpResponse.json({ ok: true });
    }
  ),
];
