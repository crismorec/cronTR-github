# Bitácora de Implementación – Cron Automático Orfeo (Te Resuelvo)

**Fecha:** 10/07/2026

**Objetivo**

Ejecutar automáticamente el endpoint:

```text
https://teresuelvo.superservicios.gov.co/crons/orfeo
```

sin depender de:

- PC encendido
- Navegador abierto
- PM2 local
- Databricks
- Netlify abierto

y obtener una respuesta válida:

```json
{"status":"ok"}
```

---

# 1. Situación Inicial

Se disponía de un script Node.js basado en:

```text
Playwright + Chromium
```

que ejecutaba correctamente:

```text
https://teresuelvo.superservicios.gov.co/crons/orfeo
```

obteniendo:

```json
{"status":"ok"}
```

Sin embargo:

- Requería un equipo encendido.
- Dependía de una sesión persistente local.
- No era una solución cloud.

---

# 2. Alternativas Evaluadas

## 2.1 Netlify

Se desplegó una solución visual:

```text
https://crontr-plus-v2.netlify.app
```

con:

- Dashboard visual
- Monitoreo
- Reintentos
- Persistencia en LocalStorage

Problema:

```text
El JavaScript corre en el navegador del usuario.
```

Por lo tanto:

- Requiere ventana abierta.
- Requiere navegador abierto.
- No funciona como cron real.

Resultado:

```text
DESCARTADO como ejecutor.
```

---

## 2.2 Databricks Free Edition

Se evaluó utilizar:

```text
Databricks Jobs
```

Problemas encontrados:

- Restricciones de outbound internet.
- No adecuado para Playwright.
- Uso excesivo para un simple endpoint.

Resultado:

```text
DESCARTADO.
```

---

## 2.3 cron-job.org directo

Se creó un Job apuntando directamente a:

```text
https://teresuelvo.superservicios.gov.co/crons/orfeo
```

Resultado:

```text
403 Forbidden
```

Imperva bloqueó la solicitud.

Resultado:

```text
DESCARTADO.
```

---

# 3. Investigación Imperva

Se analizaron las cookies activas del navegador.

Cookies encontradas:

```text
visid_incap_*
incap_ses_*
```

Se realizaron pruebas mediante:

```powershell
curl.exe
```

incluyendo:

```http
User-Agent
Cookie
```

Resultado:

```json
{"status":"ok"}
```

Conclusión:

```text
Las cookies válidas funcionan.
```

---

# 4. Prueba con GitHub Actions

Se creó un repositorio público:

```text
cronTR-github
```

URL:

```text
https://github.com/crismorec/cronTR-github
```

---

# 5. Estructura del Proyecto

## package.json

```json
{
  "name": "crontr-github",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "playwright": "^1.55.0"
  }
}
```

---

## run.js

```javascript
const { chromium } = require("playwright");

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

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
```

---

## .github/workflows/orfeo.yml

```yaml
name: TeResuelvo Orfeo v4

on:
  workflow_dispatch:

  schedule:
    - cron: '*/15 * * * *'

jobs:
  run:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install

      - run: npx playwright install chromium

      - run: node run.js

      - run: date
```

---

# 6. Resultado GitHub Actions

Ejecución manual:

```text
STATUS: 200
BODY: {"status":"ok"}
```

Conclusión:

```text
GitHub Actions + Playwright funcionan correctamente contra Orfeo.
```

---

# 7. Problema Detectado

El trigger:

```yaml
schedule
```

no generaba ejecuciones automáticas.

Se verificó:

✅ Workflow habilitado.

✅ Repositorio público.

✅ YAML correcto.

✅ Actions habilitado.

Pero:

```text
No aparecían ejecuciones tipo schedule.
```

---

# 8. Solución Final

Se decidió utilizar:

```text
cron-job.org
```

como scheduler.

Y:

```text
GitHub Actions
```

como ejecutor real.

Arquitectura final:

```text
cron-job.org
        ↓
GitHub API
        ↓
workflow_dispatch
        ↓
GitHub Actions
        ↓
Playwright
        ↓
Orfeo
        ↓
{"status":"ok"}
```

---

# 9. Creación del Token GitHub

Ruta:

```text
GitHub
→ Settings
→ Developer settings
→ Personal access tokens
→ Fine-grained tokens
```

Configuración:

Repositorio:

```text
cronTR-github
```

Permisos:

```text
Actions  → Read and write
Contents → Read-only
Metadata → Read-only
```

---

# 10. Configuración cron-job.org

## URL

```text
https://api.github.com/repos/crismorec/cronTR-github/actions/workflows/orfeo.yml/dispatches
```

---

## Método

```text
POST
```

---

## Headers

### Authorization

```text
Bearer <TOKEN_GITHUB>
```

### Accept

```text
application/vnd.github+json
```

### Content-Type

```text
application/json
```

---

## Body

```json
{
  "ref": "main"
}
```

---

## Frecuencia

```text
Cada 3 minutos
```

---

# 11. Validación

Resultado de cron-job.org:

```http
204 No Content
```

Resultado GitHub:

```text
Workflow ejecutado correctamente
```

Resultado Orfeo:

```json
{"status":"ok"}
```

---

# 12. Arquitectura Final

```text
cron-job.org
    │
    ├── Cada 3 minutos
    │
    ▼
GitHub API
    │
    ▼
Workflow Dispatch
    │
    ▼
GitHub Actions
    │
    ▼
Playwright + Chromium
    │
    ▼
https://teresuelvo.superservicios.gov.co/crons/orfeo
    │
    ▼
{"status":"ok"}
```

---

# Estado Final

✅ Automatizado

✅ Sin PC encendido

✅ Sin VPS

✅ Sin Databricks

✅ Sin navegador abierto

✅ Con Playwright

✅ Respuesta válida:

```json
{"status":"ok"}
```

✅ Ejecución programada cada 3 minutos desde cron-job.org
