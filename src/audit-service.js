const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

app.post('/audit', (req, res) => {
    const event = req.body;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(event)}\n`;

    console.log(`Log de Auditoria: ${logEntry}`);

    const logFile = 'audit.log';

    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Falha ao escrever no log de auditoria', err);
            return res.status(500).send({ status: 'error', message: 'Falha no log' });
        }
        console.log('Evento registrado em arquivo');
        res.send({ status: 'logged' });
    });
});

app.listen(PORT, () => {
    console.log(`Serviço de Auditoria rodando na porta ${PORT}`);
});
