import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import siteRoutes from "./routes/site.routes";
import installationRoutes from "./routes/installation.routes";
import summaryRoutes from "./routes/summary.routes";
import { requestLogger } from "./middleware/logger.middleware";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use(requestLogger);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "Site Operations API is running",
  });
});

app.use("/api/sites", siteRoutes);
app.use("/api/installations", installationRoutes);
app.use("/api/summary", summaryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});