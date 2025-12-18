const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
// const createController = require('../controllers/genericController'); // Replacing with custom controller
const orderController = require('../controllers/orderController');

// const orderController = createController(Order, 'Order');

router.post('/', authMiddleware, orderController.create);
router.get('/', authMiddleware, orderController.findAll);
router.put('/:id', authMiddleware, orderController.update);
router.delete('/:id', authMiddleware, orderController.delete);

module.exports = router;
