'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const log = require('./logger');

let trace = null;
try { trace = require('@opentelemetry/api').trace; } catch {}

const PORT = process.env.PORT || 3000;

function withSpan(name, fn) {
  if (!trace) return fn();
  const tracer = trace.getTracer('demo');
  return tracer.startActiveSpan(name, async (span) => {
    try { return await fn(); }
    finally { span.end(); }
  });
}

// Tráfico sintético cada 2s
setInterval(() => {
  withSpan('background_job', async () => {
    const l = log.child({ job_id: Math.random().toString(36).slice(2, 8) });
    l.info('job_started');
    await new Promise(r => setTimeout(r, 30 + Math.random() * 70));
    if (Math.random() < 0.15) l.error('job_failed', { reason: 'timeout' });
    else if (Math.random() < 0.3) l.warn('job_slow', { ms: 250 });
    else l.info('job_done', { ms: 80 });
  });
}, 2000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // SSE: stream de logs en vivo
  if (url.pathname === '/api/logs/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({ kind: 'snapshot', logs: log._ring() })}\n\n`);
    const onLog = (entry) => res.write(`data: ${JSON.stringify({ kind: 'log', log: entry })}\n\n`);
    log._bus.on('log', onLog);
    req.on('close', () => log._bus.off('log', onLog));
    return;
  }

  // API JSON: snapshot
  if (url.pathname === '/api/logs') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(log._ring()));
  }

  // Endpoints demo
  if (url.pathname === '/pay') {
    return withSpan('POST /pay', async () => {
      const l = log.child({ req_id: Math.random().toString(36).slice(2, 10), path: '/pay' });
      l.info('payment_received', { amount: 99.9 });
      await new Promise(r => setTimeout(r, 30));
      l.info('payment_completed');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  }
  if (url.pathname === '/error') {
    log.error('forced_error', { code: 'E_DEMO', path: '/error' });
    res.writeHead(500); return res.end('boom');
  }
  if (url.pathname === '/health') {
    res.writeHead(200); return res.end('ok');
  }

  // Dashboard HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  res.writeHead(404); res.end('not found');
});

server.listen(PORT, () => {
  log.info('server_started', { port: PORT, env: process.env.NODE_ENV });
  console.log(`\n🚀 Logger Pro Dashboard:  http://localhost:${PORT}\n`);
});

process.on('SIGTERM', () => { log.info('shutting_down'); server.close(); });
