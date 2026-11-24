const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

const OPENOBSERVE_URL = process.env.OPENOBSERVE_URL || 'http://18.191.218.236:5080';
const OPENOBSERVE_ORG = process.env.OPENOBSERVE_ORG || 'default';
const OPENOBSERVE_TOKEN = process.env.OPENOBSERVE_TOKEN || 'YWRtaW5AdXRlcS5lZHUubXg6bzJvaV9mRFBrc1IyTzY3UFp4Z0NOMEsyT2V3MXNPSWY2TTlmRA==';
const APP_VERSION = process.env.APP_VERSION || '1.1.1';

const otlpHeaders = {
  Authorization: `Basic ${OPENOBSERVE_TOKEN}`,
  'stream-name': 'default'
};

let sdk = null;

if (process.env.NODE_ENV !== 'test') {
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'webapp-noticias-backend',
      [ATTR_SERVICE_VERSION]: APP_VERSION,
      'deployment.environment': process.env.NODE_ENV || 'production'
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${OPENOBSERVE_URL}/api/${OPENOBSERVE_ORG}/v1/traces`,
      headers: otlpHeaders
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${OPENOBSERVE_URL}/api/${OPENOBSERVE_ORG}/v1/metrics`,
        headers: otlpHeaders
      }),
      exportIntervalMillis: 10000
    }),
    logRecordProcessors: [
      new SimpleLogRecordProcessor(
        new OTLPLogExporter({
          url: `${OPENOBSERVE_URL}/api/${OPENOBSERVE_ORG}/v1/logs`,
          headers: otlpHeaders
        })
      )
    ],
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false }
      })
    ]
  });

  sdk.start();
}

module.exports = { sdk, OPENOBSERVE_URL, OPENOBSERVE_ORG, OPENOBSERVE_TOKEN, APP_VERSION };