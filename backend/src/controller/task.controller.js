import taskService from "../service/task.service.js";
import CustomException from "../exeception/custumException.js";
const createTask = async (req, res,next) => {
    try{
        const { title, description } = req.body;
        if (!title || !description) {
            throw new CustomException("Title and description are required", 400);
        }
        const {message, status, task} = await taskService.createTask(title, description);
        res.status(status).json({ message, task });
    } catch (error) {
        next(error);
    }
};
const getTasks = async (req, res,next) => {
    try{
        const {message, status, tasks} = await taskService.getTasks();
        res.status(status).json({ message, tasks });
    } catch (error) {
        next(error);
    }
};
const getTaskById = async (req, res,next) => {
    try{
        const { id } = req.params;
        const {message, status, task} = await taskService.getTaskById(id);
        res.status(status).json({ message, task });
    } catch (error) {
        next(error);
    }
};
const updateTask = async (req, res,next) => {
    try{
        const { id } = req.params;
        const { title, description } = req.body;
        if (!id) {
            throw new CustomException("Task ID is required", 400);
        }
        if (!title || !description) {
            throw new CustomException("Title and description are required", 400);
        }
        const {message, status, task} = await taskService.updateTask(id, title, description);
        res.status(status).json({ message, task });
    } catch (error) {
        next(error);
    }
};
const deleteTask = async (req, res,next) => {
    try{
        const { id } = req.params;
        const {message, status} = await taskService.deleteTask(id);
        res.status(status).json({ message });
    } catch (error) {
        next(error);
    }
};
const completeTask = async (req, res,next) => {
    try{
        const { id } = req.params;
        const {message, status, task} = await taskService.completeTask(id);
        res.status(status).json({ message, task });
    } catch (error) {

        next(error);
    }
};
export default { createTask, getTasks, getTaskById, updateTask, deleteTask, completeTask };