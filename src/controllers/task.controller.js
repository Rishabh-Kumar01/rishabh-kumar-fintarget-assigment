import { addTask } from "../services/queue.service.js";

export const createTask = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await addTask(user_id);

    res.status(200).json({
      success: true,
      message: "Task accepted",
      data: result,
    });
  } catch (error) {
    console.error("Error in task controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  createTask,
};
