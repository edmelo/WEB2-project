const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // Cache por 60 segundos

// Middleware para verificar cache
exports.checkCache = (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.json(cachedResponse);
    }
    next();
};

// Interceptor para salvar no cache após a resposta
// Nota: Em Express, salvar no cache exige 'interceptar' o res.json ou salvar explicitamente no controller.
// Vamos criar um helper para salvar.

exports.setCache = (key, data) => {
    cache.set(key, data);
};

exports.clearCache = (keyStart) => {
    // Limpa chaves que começam com... (ex: /products)
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.startsWith(keyStart)) cache.del(key);
    });
};
