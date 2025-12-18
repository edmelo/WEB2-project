const express = require('express');
const router = express.Router();
const User = require('../models/User');
const createController = require('../controllers/genericController');

const authMiddleware = require('../middleware/authMiddleware');

const userController = createController(User, 'User');

router.post('/', authMiddleware, userController.create);
router.get('/', authMiddleware, userController.findAll);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

module.exports = router;
