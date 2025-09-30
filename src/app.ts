import "reflect-metadata";
import { config } from "dotenv";
config();
import "./dal/db/db-source";
import { initializeSocket } from "./socket/socket-io";
import { fastify } from "fastify";
import { fastifyRegisters } from "./utility";
import { ExtendedRequest } from "./models/inerfaces/extended-Request";
import { log, error } from "console";
import fastifymultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8060;

const app = fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: all your static files will be served on the root path
});

app.register(fastifymultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB (set the file size limit here)
  },
});
app.setNotFoundHandler((req, res) => {
  if (req.url.startsWith("/api/")) {
    res.code(404).send({ error: "API endpoint not found" });
    return;
  }
  res.sendFile("index.html");
});
initializeSocket(app.server);
fastifyRegisters(app);

// Create a standard HTTP server
// const httpServer = createServer(app.server);

app.post("/throw", async (req, res) => {
  let request = req as ExtendedRequest;
  let data = await req.file();
  let file = data ? data.file : undefined;
  log(request.user);
  throw new Error("test error");
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.listen({ port: PORT }, (err, add) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Fastify server running at http://localhost:${PORT}`);
});
