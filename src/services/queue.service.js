import { Queue, Worker } from "bullmq";
import redisClient from "../config/redis.js";
import { logTask } from "./logger.service.js";
import { checkRateLimit } from "./rateLimiter.service.js";

// Create a queue for tasks
const taskQueue = new Queue("taskQueue", {
  connection: redisClient,
});

// Process function for the task
const processTask = async (userId) => {
  await logTask(userId, `Task completed at ${Date.now()}`);
  return { success: true };
};

// Create a worker to process tasks
const worker = new Worker(
  "taskQueue",
  async (job) => {
    const { userId } = job.data;

    try {
      // Check rate limits before processing
      const rateLimitCheck = await checkRateLimit(userId);

      if (!rateLimitCheck.success) {
        // If rate limit is exceeded, delay the job
        await job.moveToDelayed(Date.now() + rateLimitCheck.msBeforeNext);
        return { success: false, message: "Rate limit exceeded, job delayed" };
      }

      // Process the task
      return await processTask(userId);
    } catch (error) {
      console.error("Error processing task:", error);
      throw error;
    }
  },
  {
    connection: redisClient,
  }
);

// Handle worker events
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed for user ${job.data.userId}`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed for user ${job.data.userId}:`, error);
});

// Function to add tasks to the queue
export const addTask = async (userId) => {
  try {
    const job = await taskQueue.add(
      "task",
      { userId },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    return {
      success: true,
      jobId: job.id,
      message: "Task queued successfully",
    };
  } catch (error) {
    console.error("Error adding task to queue:", error);
    throw error;
  }
};

export default {
  addTask,
};
