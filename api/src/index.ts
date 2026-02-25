import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import { readFileSync } from "fs";
import path from "path";

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
      Query: {
        health: () => "ok",
      },
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: false,
  });

  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}${server.graphqlPath}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API", err);
  process.exit(1);
});

