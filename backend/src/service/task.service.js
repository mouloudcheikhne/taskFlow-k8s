import taskModel from "../model/task.js";
import CustomException from "../exeception/custumException.js";
import mongoose from "mongoose";
const createTask = async (title, description) => {
  const task = { title, description };
  if (!title || !description) {
    throw new CustomException("Title and description are required", 400);
  }
  const newTask = new taskModel(task);
  await newTask.save();
  return { message: "Task created successfully", status: 201, task: newTask };
};

const getTasks = async () => {
  const tasks = await taskModel.find();
  return { message: "Tasks fetched successfully", status: 200, tasks: tasks };
};

const getTaskById = async (id) => {
  const task = await taskModel.findById(id);
  if (!task) {
    throw new CustomException("Task not found", 404);
  }
  return { message: "Task fetched successfully", status: 200, task };
};

const updateTask = async (id, title, description) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomException("Invalid task ID", 400);
    }
    const task = await taskModel.findById(id);
    if (!task) {
      throw new CustomException("Task not found", 404);
    }
    task.title = title || task.title;
    task.description = description || task.description;
    await task.save();
    return { message: "Task updated successfully", status: 200, task };
  } catch (error) {
    throw new CustomException(error.message, 500);
  }
};

const deleteTask = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomException("Invalid task ID", 400);
  }
  const task = await taskModel.findById(id);
  if (!task) {
    throw new CustomException("Task not found", 404);
  }
  await task.deleteOne();
  return { message: "Task deleted successfully", status: 200 };
};
const completeTask = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomException("Invalid task ID", 400);
  }
  const task = await taskModel.findById(id);
  if (!task) {
    throw new CustomException("Task not found", 404);
  }
  task.completed = true;
  await task.save();
  return { message: "Task completed successfully", status: 200, task };
};
export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
};
