import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import { readFileSync } from "fs";
import path from "path";
import { GraphQLScalarType, Kind } from "graphql";
import prisma from "./prisma";
import { verifyToken, hashPassword, comparePassword, generateToken } from "./modules/auth/utils";
import { validateTelegramAuth, isTelegramAuthDateValid } from "./modules/auth/telegram";
import { isAuthenticated, hasRole } from "./modules/auth/permissions";

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }
  return digits;
}

const mockProducts = [
  {
    id: "1",
    slug: "sample-product",
    name: "Пример изделия",
    description: "Демонстрационный товар для проверки API каталога.",
    basePrice: "1000.00",
    isActive: true,
    images: [],
    category: null,
    rating: null,
  },
];

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("combined"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const typeDefs = readFileSync(
    path.join(__dirname, "graphql", "schema.graphql"),
    "utf8",
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      Decimal: new GraphQLScalarType({
        name: "Decimal",
        description: "Decimal scalar serialized as string",
        serialize(value) {
          if (typeof value === "string") return value;
          if (typeof value === "number") return value.toFixed(2);
          return String(value);
        },
        parseValue(value) {
          if (typeof value === "string") return value;
          if (typeof value === "number") return value.toString();
          throw new TypeError("Decimal must be a string or number");
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.STRING) return ast.value;
          if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) return ast.value;
          return null;
        },
      }),
      DateTime: new GraphQLScalarType({
        name: "DateTime",
        description: "DateTime scalar serialized as ISO string",
        serialize(value) {
          if (value instanceof Date) return value.toISOString();
          if (typeof value === "string") return value;
          return new Date(String(value)).toISOString();
        },
        parseValue(value) {
          if (typeof value !== "string") throw new TypeError("DateTime must be an ISO string");
          return value;
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.STRING) return ast.value;
          return null;
        },
      }),
      Query: {
        health: () => "ok",
        products: () => mockProducts,
        me: async (_parent, _args, context) => {
          if (!context.user) return null;
          const user = await prisma.user.findUnique({
            where: { id: context.user.userId },
            include: { roles: { include: { role: true } } },
          });
          if (!user) return null;
          return {
            ...user,
            roles: user.roles.map((ur: any) => ur.role.name),
          };
        },
        users: hasRole(["ADMIN"], async () => {
          const users = await prisma.user.findMany({
            include: { roles: { include: { role: true } } },
          });
          return users.map((user: any) => ({
            ...user,
            roles: user.roles.map((ur: any) => ur.role.name),
          }));
        }),
        myOrders: isAuthenticated(async (_parent, _args, context) => {
          return prisma.order.findMany({
            where: { userId: context.user.userId },
            include: { items: { include: { product: true } } },
          });
        }),
      },
      Mutation: {
        register: async (_parent, { input }) => {
          const { email, password, firstName, lastName } = input;
          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser) {
            throw new Error("Пользователь с таким email уже зарегистрирован");
          }

          const passwordHash = await hashPassword(password);
          const user = await prisma.user.create({
            data: {
              email,
              passwordHash,
              firstName,
              lastName,
              roles: {
                create: {
                  role: {
                    connectOrCreate: {
                      where: { name: "CLIENT" },
                      create: { name: "CLIENT", description: "Обычный клиент" },
                    },
                  },
                },
              },
            },
            include: { roles: { include: { role: true } } },
          });

          const roles = user.roles.map((ur: any) => ur.role.name);
          const accessToken = generateToken({ userId: user.id, roles });

          return {
            accessToken,
            refreshToken: "mock-refresh-token",
            user: { ...user, roles },
          };
        },
        registerByPhone: async (_parent, { input }) => {
          const { phone, password, firstName, lastName } = input;
          const normalized = normalizePhone(phone);
          if (normalized.length < 10) {
            throw new Error("Введите корректный номер телефона");
          }
          const existingUser = await prisma.user.findUnique({
            where: { phone: normalized },
          });
          if (existingUser) {
            throw new Error("Пользователь с таким номером уже зарегистрирован");
          }

          const passwordHash = await hashPassword(password);
          const user = await prisma.user.create({
            data: {
              phone: normalized,
              passwordHash,
              firstName,
              lastName,
              roles: {
                create: {
                  role: {
                    connectOrCreate: {
                      where: { name: "CLIENT" },
                      create: { name: "CLIENT", description: "Обычный клиент" },
                    },
                  },
                },
              },
            },
            include: { roles: { include: { role: true } } },
          });

          const roles = user.roles.map((ur: any) => ur.role.name);
          const accessToken = generateToken({ userId: user.id, roles });

          return {
            accessToken,
            refreshToken: "mock-refresh-token",
            user: { ...user, roles },
          };
        },
        login: async (_parent, { input }) => {
          const { email, phone, password } = input;
          if (!email && !phone) {
            throw new Error("Укажите email или номер телефона");
          }
          if (!password) {
            throw new Error("Укажите пароль");
          }

          const where = email
            ? { email }
            : { phone: normalizePhone(phone!) };
          const user = await prisma.user.findFirst({
            where,
            include: { roles: { include: { role: true } } },
          });

          if (!user || !user.passwordHash || !(await comparePassword(password, user.passwordHash))) {
            throw new Error("Неверный email/телефон или пароль");
          }

          const roles = user.roles.map((ur: any) => ur.role.name);
          const accessToken = generateToken({ userId: user.id, roles });

          return {
            accessToken,
            refreshToken: "mock-refresh-token",
            user: { ...user, roles },
          };
        },
        loginByTelegram: async (_parent, { input }) => {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (!botToken) {
            throw new Error("Вход через Telegram временно недоступен");
          }

          const payload = {
            id: input.id,
            first_name: input.first_name ?? undefined,
            last_name: input.last_name ?? undefined,
            username: input.username ?? undefined,
            photo_url: input.photo_url ?? undefined,
            auth_date: input.auth_date,
            hash: input.hash,
          };

          if (!validateTelegramAuth(payload, botToken)) {
            throw new Error("Неверные данные авторизации Telegram");
          }
          if (!isTelegramAuthDateValid(payload.auth_date)) {
            throw new Error("Срок действия данных истёк, войдите снова");
          }

          const telegramId = String(payload.id);
          let user = await prisma.user.findUnique({
            where: { telegramId },
            include: { roles: { include: { role: true } } },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                telegramId,
                telegramUsername: payload.username ?? null,
                firstName: payload.first_name ?? null,
                lastName: payload.last_name ?? null,
                roles: {
                  create: {
                    role: {
                      connectOrCreate: {
                        where: { name: "CLIENT" },
                        create: { name: "CLIENT", description: "Обычный клиент" },
                      },
                    },
                  },
                },
              },
              include: { roles: { include: { role: true } } },
            });
          }

          const roles = user.roles.map((ur: any) => ur.role.name);
          const accessToken = generateToken({ userId: user.id, roles });

          return {
            accessToken,
            refreshToken: "mock-refresh-token",
            user: { ...user, roles },
          };
        },
      },
    },
    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");
      const user = token ? verifyToken(token) : null;
      return { user, prisma };
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: false,
  });

  const port = Number(process.env.PORT) || 4000;
  const httpServer = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}${server.graphqlPath}`);
  });

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`Shutting down (${signal})...`);
    httpServer.close(() => process.exit(0));
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API", err);
  process.exit(1);
});
