const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET all tasks
router.get('/', taskController.getAllTasks);

// GET single task
router.get('/:id', taskController.getTaskById);

// POST create task
router.post('/', taskController.createTask);

// PUT update task
router.put('/:id', taskController.updateTask);

// DELETE task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
