import express, { RequestHandler } from "express";
import cors from "cors";
import { handleBokomonMessage } from "./src/api/bokomonHandler";
import { rateLimiter } from "./src/utils/rateLimiter";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Token usage tracking
const tokenUsage = new Map<string, number>();

// Bokomon endpoint
const bokomonHandler: RequestHandler = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Get client IP or use a session ID
    const clientId =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

    // Check rate limit
    const rateLimit = rateLimiter.canMakeRequest(clientId.toString());
    if (!rateLimit.allowed) {
      res.status(429).json({
        error: "Rate limit exceeded",
        message: `Please wait ${Math.ceil(
          rateLimit.resetIn / 1000
        )} seconds before trying again.`,
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
      return;
    }

    // Process message
    const response = await handleBokomonMessage(message);

    // Track basic usage (simplified since we don't have token count)
    const currentUsage = tokenUsage.get(clientId.toString()) || 0;
    tokenUsage.set(clientId.toString(), currentUsage + 1);

    // Check if user has exceeded request limit (e.g., 100 requests per hour)
    if (currentUsage > 100) {
      res.status(429).json({
        error: "Request limit exceeded",
        message:
          "You have reached your request limit for this period. Please try again later.",
        resetIn: 3600000, // 1 hour
      });
      return;
    }

    res.json({
      response: response.response,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    });
  } catch (error) {
    console.error("Error handling Bokomon message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

app.post("/bokomon", bokomonHandler);

// Start server
app.listen(port, () => {
  console.log(`Bokomon server running at http://localhost:${port}`);
});
