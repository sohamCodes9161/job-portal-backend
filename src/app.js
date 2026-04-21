import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests, try again later",
});

const app = express();

app.use(helmet());
app.use(limiter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://job-protal-frontend-my-jobs.vercel.app"
    ],
    credentials: true,
  })
);

app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use(errorMiddleware);
export default app;