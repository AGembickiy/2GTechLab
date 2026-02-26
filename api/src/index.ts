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
import { isAuthenticated, hasRole } from "./modules/auth/permissions";

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
            throw new Error("User already exists");
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
            user: {
              ...user,
              roles,
            },
          };
        },
        login: async (_parent, { input }) => {
          const { email, password } = input;
          const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } },
          });

          if (!user || !(await comparePassword(password, user.passwordHash))) {
            throw new Error("Invalid email or password");
          }

          const roles = user.roles.map((ur: any) => ur.role.name);
          const accessToken = generateToken({ userId: user.id, roles });

          return {
            accessToken,
            refreshToken: "mock-refresh-token",
            user: {
              ...user,
              roles,
            },
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
