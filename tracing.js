'use strict';
try {
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: process.env.SERVICE_NAME || 'logger-pro-demo',
  });
  sdk.start();
  console.log('[otel] tracing initialized');
} catch (err) {
  console.log('[otel] disabled:', err.message);
}
