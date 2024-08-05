import "reflect-metadata";
import { config } from "dotenv";
config();
import "./dal/db/db-source";
import { initializeSocket } from "./socket/socket-io";
import { fastify } from "fastify";
import { fastifyRegisters } from "./utility";
import { ExtendedRequest } from "./models/inerfaces/extended-Request";
import { log, error } from "console";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8060;

console.log("hello world");

const app = fastify({ logger: true });
initializeSocket(app.server);
fastifyRegisters(app);

// Create a standard HTTP server
// const httpServer = createServer(app.server);

app.get;

app.get("/throw", (req, res) => {
  let request = req as ExtendedRequest;
  log(request.user);
  throw new Error("test error");
});

app.get("/", (req, res) => {
  res.send({ message: "Hello, Fastify!" });
});

app.listen({ port: PORT }, (err, add) => {

  if (err) {
    console.error(err);
    return;
  }

  console.log(`Fastify server running at http://localhost:${PORT}`);
});
