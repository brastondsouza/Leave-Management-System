import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Leave Management System API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);

export default app;