const axios = require('axios');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

app.get('/reporte-mercado/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();

    try {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/2024-06-01/${hoyStr}?adjusted=true&sort=desc&limit=5&apiKey=${POLYGON_API_KEY}`;

        const response = await axios.get(url);
        const historial = response.data.results || [];

        if (historial.length < 5) {
            return res.status(400).json({ error: "No hay suficientes datos para calcular indicadores." });
        }

        const cierres = historial.map(d => d.c).reverse();

        res.json({
            precioActual: cierres.at(-1),
            historico: cierres
        });

    } catch (error) {
        console.error(`Error al obtener datos de ${ticker}:`, error.message);
        res.status(400).json({ error: "No se pudieron obtener datos o el símbolo es inválido." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT} listo para consultas dinámicas`);
});