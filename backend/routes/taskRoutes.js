const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { user: req.userId };
    if (status && ["Pending", "In Progress", "Completed"].includes(status)) filter.status = status;
    if (search) filter.title = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Could not load tasks" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Task title is required" });
    const task = await Task.create({
      user: req.userId, title, description, status, priority,
      dueDate: dueDate || null
    });
    res.status(201).json({ task });
  } catch (error) {
    res.status(400).json({ message: "Invalid task details" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const allowed = ["title", "description", "status", "priority", "dueDate"];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key] || (key === "dueDate" ? null : req.body[key]);
    });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
  } catch (error) {
    res.status(400).json({ message: "Could not update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid task ID" });
  }
});

module.exports = router;
