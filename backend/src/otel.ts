import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ENV } from './config/env';

const traceExporter = new OTLPTraceExporter({
  url: ENV.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

void sdk.start();

process.on('SIGTERM', async () => {
  await sdk.shutdown();
});


