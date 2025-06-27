const axios = require('axios');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const INTERVALO_MS = 60 * 1000; // Actualización cada minuto

let datosActuales = {};

// Función para obtener históricos y calcular indicadores
async function obtenerDatos(ticker) {
    try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/5/2024-06-01/2025-06-26?adjusted=true&sort=desc&limit=5&apiKey=${POLYGON_API_KEY}`;
        const response = await axios.get(url);
        const historial = response.data.results || [];

        if (historial.length < 5) {
            console.warn(`⚠️ No hay suficientes datos para ${ticker}`);
            return null;
        }

        const cierres = historial.map(d => d.c).reverse();

        return {
            precioActual: cierres.at(-1),
            historico: cierres
        };

    } catch (error) {
        console.error(`❌ Error al obtener datos de ${ticker}:`, error.message);
        return null;
    }
}

// Endpoint dinámico
app.get('/reporte-mercado/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();

    const datos = await obtenerDatos(ticker);
    if (datos) {
        res.json(datos);
    } else {
        res.status(400).json({ error: "No se pudieron obtener datos o el símbolo es inválido." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT} con consultas dinámicas habilitadas`);
});