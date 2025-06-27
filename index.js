const axios = require('axios');
const express = require('express');
const technicalIndicators = require('technicalindicators');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

app.get('/reporte-mercado/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();

    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/5/2023-06-01/2025-06-26?adjusted=true&sort=desc&limit=5&apiKey=${POLYGON_API_KEY}`;
        const response = await axios.get(url);
        const historial = response.data.results || [];

        if (historial.length < 5) {
            return res.status(400).json({ error: "No se pudieron obtener suficientes datos." });
        }

        const cierres = historial.map(d => d.c).reverse();

        const rsi = technicalIndicators.RSI.calculate({ values: cierres, period: 3 }).slice(-1)[0];
        const ema = technicalIndicators.EMA.calculate({ values: cierres, period: 3 }).slice(-1)[0];
        const sma = technicalIndicators.SMA.calculate({ values: cierres, period: 3 }).slice(-1)[0];
        const macd = technicalIndicators.MACD.calculate({
            values: cierres,
            fastPeriod: 3,
            slowPeriod: 6,
            signalPeriod: 2,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        }).slice(-1)[0];

        res.json({
            ticker,
            precioActual: cierres.at(-1),
            rsi: rsi?.toFixed(2),
            ema: ema?.toFixed(2),
            sma: sma?.toFixed(2),
            macd: macd ? macd.MACD.toFixed(2) : "N/A",
            signal: macd ? macd.signal.toFixed(2) : "N/A",
            histogram: macd ? macd.histogram.toFixed(2) : "N/A",
            historico: cierres
        });
    } catch (error) {
        console.error(`❌ Error al obtener datos de ${ticker}:`, error.message);
        res.status(404).json({ error: "No se pudieron obtener datos o el símbolo es inválido." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT} con consultas dinámicas habilitadas`);
});