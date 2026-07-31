import express from "express";
import cors from "cors";
import { config } from "./config";
import { runMigrations } from "./db";
import ussdRouter from "./routes/ussd";
import adminRouter from "./routes/admin";

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Nexus", version: "0.1.0" });
});

// Routes
app.use("/api", ussdRouter);
app.use("/api", adminRouter);

async function main() {
  await runMigrations();
  app.listen(config.port, () => {
    console.log(`Nexus backend listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
