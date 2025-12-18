const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Servir arquivos estáticos do frontend

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Sincronizar Banco de Dados
sequelize.sync({ force: false }).then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(PORT, () => {
        console.log(`Serviço Principal rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Não foi possível sincronizar o banco de dados:', err);
});
