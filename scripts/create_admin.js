const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');

const createAdmin = async () => {
    try {
        await sequelize.sync();

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const user = await User.create({
            name: 'Administrador',
            email: 'admin@meloedias.com',
            password: hashedPassword
        });

        console.log('Usuário Admin criado com sucesso!');
        console.log('Email: admin@meloedias.com');
        console.log('Senha: admin123');
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('Usuário Admin já existe.');
        } else {
            console.error('Erro ao criar admin:', error);
        }
    } finally {
        await sequelize.close();
    }
};

createAdmin();
