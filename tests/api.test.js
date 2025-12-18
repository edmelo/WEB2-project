const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

describe('Basic API Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status');
    });
});
