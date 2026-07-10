const { chromium } = require("playwright");

const URL =
  "https://teresuelvo.superservicios.gov.co/crons/orfeo";

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {

    const response = await page.goto(URL, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    console.log("STATUS:", response?.status());

    const html = await page.content();

    console.log(
      html.substring(0, 1000)
    );

  } catch (e) {

    console.error(e);

  } finally {

    await browser.close();

  }

})();
