const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending' // pending, completed, cancelled
    }
});

module.exports = Order;
