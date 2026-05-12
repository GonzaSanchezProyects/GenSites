const express = require('express');
const { exec } = require('child_process');
const app = express();

// Esta es la URL a la que n8n va a "tocarle el timbre"
app.get('/api/correr-bot', (req, res) => {
    console.log("🚀 n8n acaba de despertar al bot de GenFit!");
    
    // Le decimos a Node que ejecute tu scraper original
    exec('node scrapper.cjs', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error: ${error.message}`);
            return res.status(500).json({ error: 'El bot falló' });
        }
        console.log("✅ Scraper finalizado. Avisando a n8n para que siga el flujo.");
        res.json({ mensaje: 'Gimnasios scrapeados y guardados en Supabase' });
    });
});

app.listen(3001, () => {
    console.log('🤖 API de GenFit escuchando en el puerto 3001...');
});