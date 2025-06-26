require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const INTERVALO_MS = 60 * 1000; // Cada minuto
const PORT = process.env.PORT || 3000;

let datosActuales = {};

// Configura los activos que quieres seguir
const activos = ['AAPL', 'MSFT', 'SCHD', 'AVGO', 'XLE', 'IWM', 'GLD'];

async function obtenerDatos() {
    try {
        let nuevosDatos = {};

        for (const ticker of activos) {
            const urlPrecio = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
            const urlHistorico = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/30/2023-01-01/2025-12-31?adjusted=true&sort=desc&limit=30&apiKey=${POLYGON_API_KEY}`;

            const [precioResp, historicoResp] = await Promise.all([
                axios.get(urlPrecio),
                axios.get(urlHistorico)
            ]);

            const precioData = precioResp.data.results?.[0];
            const historico = historicoResp.data.results || [];

            // Calcular SMA 10 días
            let sma10 = null;
            if (historico.length >= 10) {
                const sum = historico.slice(0, 10).reduce((acc, val) => acc + val.c, 0);
                sma10 = sum / 10;
            }

            nuevosDatos[ticker] = {
                precioActual: precioData?.c || null,
                maximo: precioData?.h || null,
                minimo: precioData?.l || null,
                volumen: precioData?.v || null,
                sma10,
                historicoDisponible: historico.length
            };
        }

        datosActuales = nuevosDatos;
        console.log('✅ Datos recibidos y actualizados correctamente');
    } catch (error) {
        console.error('❌ Error al obtener datos:', error.message);
    }
}

app.get('/reporte-mercado', (req, res) => {
    res.json(datosActuales);
});

app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT}`);
});

obtenerDatos();
setInterval(obtenerDatos, INTERVALO_MS);