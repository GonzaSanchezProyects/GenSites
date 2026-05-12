const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 1. Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://purahwnnxkxczducahiu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cmFod25ueGt4Y3pkdWNhaGl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE0OTA0MCwiZXhwIjoyMDkyNzI1MDQwfQ.nJJq8LS0ITnXLd5-Amj4hq82esGryp6WmfblhEhq4HM'; // Usá la de service_role para evitar bloqueos
const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarEmailEnWeb(browser, url) {
    const page = await browser.newPage();
    console.log(`    🌐 Navegando a: ${url}`);
    try {
        await page.goto(url, { timeout: 25000, waitUntil: 'domcontentloaded' });
        
        let content = await page.content();
        // Regex mejorada para capturar correos
        let emails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        
        if (emails) {
            await page.close();
            return [...new Set(emails)][0];
        }

        // Intento en página de contacto
        const contactLink = await page.$('a[href*="contacto" i], a[href*="contact" i], a[href*="nosotros" i]');
        if (contactLink) {
            const contactUrl = await contactLink.getAttribute('href');
            const fullContactUrl = contactUrl.startsWith('http') ? contactUrl : new URL(contactUrl, url).href;
            
            await page.goto(fullContactUrl, { timeout: 20000, waitUntil: 'domcontentloaded' });
            content = await page.content();
            emails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        }

        await page.close();
        return emails ? [...new Set(emails)][0] : null;
    } catch (e) {
        console.log(`    ⚠️ Error escaneando la web: ${url}`);
        await page.close();
        return null;
    }
}

(async () => {
    // Lanzamos con headless: true para que sea más rápido en tu PC de Mendoza
    const browser = await chromium.launch({ headless: false }); 
    const page = await browser.newPage();

    try {
        console.log("🔍 Iniciando búsqueda en Google Maps para San Martín, Mendoza...");
        
        await page.goto('https://www.google.com/maps/search/gimnasios+en+Cordoba');
        await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

        // Scroll para cargar resultados
        for (let i = 0; i < 3; i++) {
            await page.mouse.wheel(0, 5000);
            await page.waitForTimeout(2000);
        }

        const lugares = await page.$$eval('a[href*="/maps/place/"]', links => {
            return links.map(link => ({
                nombre: link.getAttribute('aria-label'),
                urlMaps: link.href
            })).filter(l => l.nombre && l.nombre !== "Resultados");
        });

        console.log(`📊 Se extrajeron ${lugares.length} gimnasios. Procesando...`);

        for (let lugar of lugares) {
            try {
                console.log(`\n🏢 Gimnasio: ${lugar.nombre}`);
                
                await page.goto(lugar.urlMaps, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(2000); 
                
                const webLink = await page.$('a[data-item-id="authority"]');
                const url = webLink ? await webLink.getAttribute('href') : null;

                const igLink = await page.$('a[href*="instagram.com"]');
                const instagram = igLink ? await igLink.getAttribute('href') : null;

                let emailFound = null;
                if (url) {
                    emailFound = await buscarEmailEnWeb(browser, url);
                }

                // LÓGICA DE ESTADO ACTUALIZADA
                // Si hay mail -> pendiente. Si no hay mail -> no tiene mail.
                const estadoFinal = emailFound ? 'pendiente' : 'no tiene mail';

                console.log(`    📩 Email: ${emailFound || 'No encontrado'}`);
                console.log(`    🏷️ Estado: ${estadoFinal}`);

                const { error } = await supabase
                    .from('leads_gyms')
                    .insert([{ 
                        nombre_gym: lugar.nombre, 
                        email: emailFound || null, // Guardamos null si no hay, es más limpio
                        sitio_web: url,
                        instagram: instagram,
                        ciudad: 'San Martín',
                        estado: estadoFinal, // Aquí aplicamos la lógica nueva
                        ultimo_contacto: null
                    }]); 

                if (error) {
                    if (error.code === '23505') {
                        console.log(`    ⏩ Ya existe en la base de datos.`);
                    } else {
                        console.error(`    ❌ Error Supabase: ${error.message}`);
                    }
                } else {
                    console.log(`    ✅ Guardado exitosamente como ${estadoFinal}`);
                }
                
            } catch (innerError) {
                console.log("    ⚠️ Error en ficha, saltando...");
            }
        }
    } catch (error) {
        console.error("🔴 Error crítico:", error);
    } finally {
        console.log("\n🏁 ¡Listo! Base de datos de GenFit actualizada.");
        await browser.close();
    }
})();