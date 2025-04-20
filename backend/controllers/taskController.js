import Task from "../models/Task.js";
import { validationResult } from "express-validator";

// GreenCart-style CRUD with WebSocket support
export const createTask = async (req, res) => {
  try {
    // Validate request (like GreenCart's product validation)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, status, comments } = req.body;
    
    // Create task with user reference (like GreenCart's product ownership)
    const task = await Task.create({
      title,
      status: status || "pending", // Default column
      comments: comments || [],
      userId: req.user.id // From JWT middleware
    });

    // Emit WebSocket event (like GreenCart's real-time cart updates)
    req.io.emit("taskUpdate", { 
      action: "create", 
      task 
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus } = req.body;

    // Verify task ownership (like GreenCart's product auth)
    const task = await Task.findOne({
      _id: taskId,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.status = newStatus;
    await task.save();

    // Real-time sync (like GreenCart's cart updates)
    req.io.emit("taskUpdate", {
      action: "move",
      taskId,
      newStatus
    });

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add more controllers as needed...