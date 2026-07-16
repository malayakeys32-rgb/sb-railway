import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userAuth from "./routes/userAuth";
import incidents from "./routes/incidents";
import evidence from "./routes/evidence";
import patterns from "./routes/patterns";
import timeline from "./routes/timeline";
import sharing from "./routes/sharing";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", userAuth);
app.use("/incidents", incidents);
app.use("/evidence", evidence);
app.use("/patterns", patterns);
app.use("/timeline", timeline);
app.use("/sharing", sharing);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "SB Railway Backend Running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
