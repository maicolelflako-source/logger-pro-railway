# 🚀 Logger Pro — Versión Railway

## ✨ Lo que incluye
- ✅ Logger estructurado JSON con niveles
- ✅ OpenTelemetry tracing automático
- ✅ Dashboard web en vivo (Server-Sent Events)
- ✅ Endpoints demo: `/pay`, `/error`, `/health`
- ✅ Tráfico sintético automático cada 2s
- ✅ Filtros por nivel + botón de stress test

## 🚂 Deploy en Railway (3 pasos)

1. Sube esta carpeta a un repo de GitHub.
2. En [Railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
3. Selecciona el repo → Deploy.

Railway detecta Node automáticamente. En 2 minutos tendrás una URL pública.

## 🌐 Endpoints

| URL | Descripción |
|---|---|
| `/` | Dashboard web en vivo 🎯 |
| `/pay` | Endpoint demo (log info) |
| `/error` | Endpoint demo (log error) |
| `/health` | Healthcheck |
| `/api/logs` | Últimos 500 logs en JSON |
| `/api/logs/stream` | Stream SSE en vivo |

## 🏃 Local (opcional)

```bash
npm install
npm start
# Abre http://localhost:3000
```
