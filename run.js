const { chromium } = require("playwright");

// Función auxiliar para pausar la ejecución
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  // Genera un retraso aleatorio entre 0 y 45 segundos (en milisegundos)
  const jitter = Math.floor(Math.random() * 45000);
  console.log(`[${new Date().toISOString()}] Aplicando jitter: esperando ${jitter / 1000}s antes de lanzar Chromium...`);
  
  // Esperar el tiempo aleatorio antes de tocar el servidor
  await sleep(jitter);

  console.log(`[${new Date().toISOString()}] Iniciando scraping/cron en Orfeo...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const response = await page.goto(
      "https://teresuelvo.superservicios.gov.co/crons/orfeo",
      {
        waitUntil: "networkidle",
        timeout: 60000 // 1 minuto de tolerancia
      }
    );

    const body = await page.textContent("body");

    console.log(new Date().toISOString());
    console.log("STATUS:", response.status());
    console.log("BODY:", body);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error durante la ejecución:`, error.message);
  } finally {
    await browser.close();
  }
})();
