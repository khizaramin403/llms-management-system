import { Router } from "express";
import mongoose from "mongoose";
import { authRouter } from "../modules/auth/auth.routes.js";
import { sendOk } from "../utils/apiResponse.js";

export const apiRouter = Router();

// Mount authentication module routes at /api/v1/auth
apiRouter.use("/auth", authRouter);

const DB_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/**
 * Public health check endpoint for monitoring, Docker, and load balancers.
 * Returns server uptime and MongoDB connection state.
 */
apiRouter.get("/health", (_req, res) => {
  const dbStatus = DB_STATES[mongoose.connection.readyState] ?? "unknown";
  sendOk(res, {
    status: "ok",
    uptime: Math.floor(process.uptime()),
    db: dbStatus,
  });
});
