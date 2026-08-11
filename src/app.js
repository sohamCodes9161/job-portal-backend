import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

// 1. CORS must be first to handle Preflight (OPTIONS) requests
app.use(
  cors({
     origin: ["http://localhost:5173", "https://job-portal-frontend-mjw9.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 2. Security and Rate Limiting
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many requests, try again later",
  skip: (req) => req.method === 'OPTIONS', // Recommended: don't limit preflights
});
app.use(limiter);

// 3. Static files and Parsers
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());

// 4. Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);

// 5. Error Handling
app.use(errorMiddleware);

export default app;