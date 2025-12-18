const Order = require('../models/Order');
const Product = require('../models/Product');
const axios = require('axios');

const AUDIT_SERVICE_URL = 'http://localhost:3001/audit';

const logAudit = async (action, entity, data) => {
    try {
        await axios.post(AUDIT_SERVICE_URL, {
            action,
            entity,
            data,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Falha ao registrar auditoria:', error.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Regra de Negócio: Verificar Estoque
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Estoque insuficiente' });
        }

        // Regra de Negócio: Decrementar Estoque
        product.stock -= quantity;
        await product.save();

        const order = await Order.create({ userId, productId, quantity, status: 'pending' });

        await logAudit('CREATE', 'Order', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Order.update(req.body, { where: { id } });
        if (updated) {
            const updatedItem = await Order.findByPk(id);
            await logAudit('UPDATE', 'Order', updatedItem);
            res.json(updatedItem);
        } else {
            res.status(404).json({ error: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Order.destroy({ where: { id } });
        if (deleted) {
            await logAudit('DELETE', 'Order', { id });
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
