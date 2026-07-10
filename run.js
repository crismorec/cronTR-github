const { chromium } = require("playwright");

(async () => {

  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  const response = await page.goto(
    "https://teresuelvo.superservicios.gov.co/crons/orfeo",
    {
      waitUntil: "networkidle",
      timeout: 60000
    }
  );

  const body = await page.textContent("body");

  console.log(new Date().toISOString());
  console.log("STATUS:", response.status());
  console.log("BODY:", body);

  await browser.close();

})();
