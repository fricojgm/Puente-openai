require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { RSI, SMA } = require('technicalindicators');

const app = express();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const INTERVALO_MS = 60 * 1000; // Cada minuto
const PORT = process.env.PORT || 3000;

let datosActuales = {};

// Configura tus activos
const activos = ['AAPL', 'MSFT', 'SCHD', 'AVGO', 'XLE', 'IWM', 'GLD'];

async function obtenerDatos() {
    try {
        let nuevosDatos = {};

        for (const ticker of activos) {

            const urlPrecio = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
            const urlHistorico = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/2024-05-01/2024-06-26?adjusted=true&sort=asc&limit=30&apiKey=${POLYGON_API_KEY}`;

            const [precioResp, historicoResp] = await Promise.all([
                axios.get(urlPrecio),
                axios.get(urlHistorico)
            ]);

            const precioData = precioResp.data.results?.[0];
            const historico = historicoResp.data.results || [];

            const cierres = historico.map(d => d.c);

            const sma10 = cierres.length >= 10 ? SMA.calculate({ period: 10, values: cierres }).at(-1) : null;
            const rsi14 = cierres.length >= 14 ? RSI.calculate({ period: 14, values: cierres }).at(-1) : null;

            nuevosDatos[ticker] = {
                precioActual: precioData?.c || null,
                maximo: precioData?.h || null,
                minimo: precioData?.l || null,
                volumen: precioData?.v || null,
                sma10,
                rsi14,
                historicoDisponible: historico.length
            };
        }

        datosActuales = nuevosDatos;
        console.log('✅ Datos actualizados con indicadores PRO');
    } catch (error) {
        console.error('❌ Error al obtener datos:', error.message);
    }
}

app.get('/reporte-mercado', (req, res) => {
    res.json(datosActuales);
});

app.listen(PORT, () => {
    console.log(`🚀 Puente operativo con indicadores PRO en puerto ${PORT}`);
});

obtenerDatos();
setInterval(obtenerDatos, INTERVALO_MS);