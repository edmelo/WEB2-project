const axios = require('axios');
const { setCache, clearCache } = require('../middleware/cacheMiddleware');

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

const createController = (Model, entityName) => {
    const routePrefix = `/${entityName.toLowerCase()}s`; // Ex: /products

    return {
        create: async (req, res) => {
            try {
                const item = await Model.create(req.body);
                await logAudit('CREATE', entityName, item);
                clearCache(routePrefix); // Invalidar cache
                res.status(201).json(item);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        },
        findAll: async (req, res) => {
            try {
                const items = await Model.findAll();
                // Salvar no cache (chave = url da requisição)
                // Como o controller não sabe a URL exata aqui facilmente sem req.originalUrl,
                // confiamos que o middleware checkCache usou req.originalUrl.
                // Aqui setamos explicitamente se quisermos, mas o ideal é o middleware interceptar.
                // Simplificação: Vamos setar usando o prefixo, assumindo listagem padrão.
                setCache(req.originalUrl || routePrefix, items);
                res.json(items);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
        update: async (req, res) => {
            try {
                const { id } = req.params;
                const [updated] = await Model.update(req.body, { where: { id } });
                if (updated) {
                    const updatedItem = await Model.findByPk(id);
                    await logAudit('UPDATE', entityName, updatedItem);
                    clearCache(routePrefix); // Invalidar cache
                    res.json(updatedItem);
                } else {
                    res.status(404).json({ error: 'Item não encontrado' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
        delete: async (req, res) => {
            try {
                const { id } = req.params;
                const deleted = await Model.destroy({ where: { id } });
                if (deleted) {
                    await logAudit('DELETE', entityName, { id });
                    clearCache(routePrefix); // Invalidar cache
                    res.status(204).send();
                } else {
                    res.status(404).json({ error: 'Item não encontrado' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    };
};

module.exports = createController;
