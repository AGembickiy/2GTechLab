const ENV_API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!ENV_API_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL is required in production");
}

if (!ENV_API_URL && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_API_URL is not set, falling back to http://localhost:4000/graphql. " +
      "Set NEXT_PUBLIC_API_URL in .env.local for consistent behavior.",
  );
}

const API_URL = ENV_API_URL ?? "http://localhost:4000/graphql";

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) {
    throw new Error("Нет ответа от сервера");
  }
  return json.data;
}

function buildUserDisplay(user: {
  email?: string | null;
  phone?: string | null;
  telegramUsername?: string | null;
  firstName?: string | null;
  id: string;
}): string {
  return (
    user.email ||
    user.phone ||
    (user.telegramUsername ? `@${user.telegramUsername}` : null) ||
    user.firstName ||
    `ID ${user.id}`
  );
}

export const authMutations = {
  login: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user { id email phone telegramUsername firstName }
      }
    }
  `,
  register: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        accessToken
        user { id email phone telegramUsername firstName }
      }
    }
  `,
  registerByPhone: `
    mutation RegisterByPhone($input: RegisterByPhoneInput!) {
      registerByPhone(input: $input) {
        accessToken
        user { id email phone telegramUsername firstName }
      }
    }
  `,
  loginByTelegram: `
    mutation LoginByTelegram($input: TelegramAuthInput!) {
      loginByTelegram(input: $input) {
        accessToken
        user { id email phone telegramUsername firstName }
      }
    }
  `,
};

export type AuthResponse = {
  accessToken: string;
  user: { id: string; email?: string | null; phone?: string | null; telegramUsername?: string | null; firstName?: string | null };
};

export function getUserDisplayFromAuth(res: AuthResponse): string {
  return buildUserDisplay(res.user);
}
