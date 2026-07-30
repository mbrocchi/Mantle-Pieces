import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import authRouter from "./routes/auth";
import sitesRouter from "./routes/sites";
import notesRouter from "./routes/notes";
import audioRouter from "./routes/audio";
import { attachWebSocketServer } from "./ws/server";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use("/api/auth", authRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/relics", notesRouter);
app.use("/api/audio", audioRouter);

const httpServer = createServer(app);
attachWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
