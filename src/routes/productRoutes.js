const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const createController = require('../controllers/genericController');

const authMiddleware = require('../middleware/authMiddleware');
const { checkCache } = require('../middleware/cacheMiddleware');

const productController = createController(Product, 'Product');

router.post('/', authMiddleware, productController.create);
router.get('/', checkCache, productController.findAll); // Cache aplicado aqui
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);

module.exports = router;
