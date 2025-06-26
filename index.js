const axios = require('axios');
const express = require('express');
const app = express();

const URL_RENDER = 'https://jarvis-libre.onrender.com/reporte-mercado';
const INTERVALO_MS = 60 * 1000; // Cada minuto
const PORT = 3000;

let datosActuales = {}; // Aquí se guardan los datos para el endpoint público

// Función que consulta los datos
async function obtenerDatos() {
    try {
        const respuesta = await axios.get(URL_RENDER);
        datosActuales = respuesta.data;
        console.log("✅ Datos recibidos y actualizados correctamente");
    } catch (error) {
        console.error("❌ Error al obtener datos:", error.message);
    }
}

// Endpoint público
app.get('/reporte-mercado', (req, res) => {
    res.json(datosActuales);
});

// Servidor operativo
app.listen(PORT, () => {
    console.log(`🚀 Puente operativo en puerto ${PORT}`);
});

// Llamada inicial y luego cada minuto
obtenerDatos();
setInterval(obtenerDatos, INTERVALO_MS);

