const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const URL_RENDER = 'https://jarvis-libre.onrender.com/reporte-mercado';
const INTERVALO_MS = 60 * 1000; // Cada minuto
const PORT = process.env.PORT || 3000;
const apiKey = process.env.POLYGON_API_KEY; // Clave segura desde el .env

let datosActuales = {}; // Aquí se guardan los datos para el endpoint público

// Función que consulta los datos de Polygon
async function obtenerDatos() {
    try {
        const respuesta = await axios.get(`${URL_RENDER}`);
        datosActuales = respuesta.data;
        console.log('✅ Datos recibidos y actualizados correctamente');
    } catch (error) {
        console.error('❌ Error al obtener datos:', error.message);
    }
}

// Endpoint público
app.get('/reporte-mercado', async (req, res) => {
    try {
        const ticker = req.query.ticker || 'MSFT';
        const respuesta = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`);
        res.json(respuesta.data);
    } catch (error) {
        console.error('❌ Error al consultar Polygon:', error.message);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

// Servidor operativo
app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT}`);
});

// Llamada inicial y luego cada minuto
obtenerDatos();
setInterval(obtenerDatos, INTERVALO_MS);