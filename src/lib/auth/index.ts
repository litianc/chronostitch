import {
  requireAuth as requireEazoAuth,
  type AuthResult,
  type User,
} from "@eazo/sdk/server";

type HeaderRequest = Parameters<typeof requireEazoAuth>[0];

const LOCAL_DEV_USER: User = {
  id: "local-dev-user",
  email: "local-dev@example.com",
  name: "Local Dev",
  avatarUrl: null,
};

export function requireAuth(request: HeaderRequest): AuthResult {
  const result = requireEazoAuth(request);
  if (result.ok || process.env.NODE_ENV !== "development") {
    return result;
  }

  return {
    ok: true,
    user: LOCAL_DEV_USER,
  };
}

export type { AuthResult, User };
