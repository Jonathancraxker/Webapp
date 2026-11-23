const { trace, metrics } = require('@opentelemetry/api');
const { logs, SeverityNumber } = require('@opentelemetry/api-logs');
const { OPENOBSERVE_URL, OPENOBSERVE_ORG, OPENOBSERVE_TOKEN, APP_VERSION } = require('./otel');

const meter = metrics.getMeter('webapp-noticias-meter');
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total de peticiones HTTP recibidas por endpoint y método'
});
const errorCounter = meter.createCounter('http_errors_total', {
  description: 'Total de respuestas HTTP con error (4xx/5xx)'
});
const latencyHistogram = meter.createHistogram('http_request_duration_ms', {
  description: 'Latencia de respuesta por endpoint en milisegundos'
});

function getTimestamps() {
  const now = new Date();
  const mexicoTime = now.toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(' ', 'T') ;
  return {
    timestamp_mx: mexicoTime,
    timestamp_utc: now.toISOString()
  };
}

async function pushToOpenObserveStream(streamName, payload) {
  if (process.env.NODE_ENV === 'test') return;
  try {
    await fetch(`${OPENOBSERVE_URL}/api/${OPENOBSERVE_ORG}/${streamName}/_json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${OPENOBSERVE_TOKEN}`
      },
      body: JSON.stringify([payload])
    });
  } catch (err) {
    // Evita interrumpir la app si OpenObserve está reiniciando
  }
}

function logBackendEvent({ level = 'INFO', message, method, url, statusCode, durationMs, extra = {} }) {
  const { timestamp_mx, timestamp_utc } = getTimestamps();
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan ? activeSpan.spanContext().traceId : 'no-trace';

  const logEntry = {
    source: 'backend',
    level,
    message,
    method: method || 'SYSTEM',
    url: url || 'N/A',
    statusCode: statusCode || 200,
    duration_ms: durationMs || 0,
    app_version: APP_VERSION,
    trace_id: traceId,
    timestamp_mx,
    timestamp_utc,
    ...extra
  };

  // 1. Emitir por OpenTelemetry Logs API
  const otelLogger = logs.getLogger('webapp-backend-logger');
  otelLogger.emit({
    severityNumber: level === 'ERROR' ? SeverityNumber.ERROR : SeverityNumber.INFO,
    severityText: level,
    body: message,
    attributes: logEntry
  });

  // 2. Enviar en tiempo real al stream "backend_logs" de OpenObserve
  pushToOpenObserveStream('backend_logs', logEntry);
}

function logFrontendEvent(eventData) {
  const { timestamp_mx, timestamp_utc } = getTimestamps();
  const logEntry = {
    source: 'frontend',
    app_version: APP_VERSION,
    timestamp_mx,
    timestamp_utc,
    ...eventData
  };

  pushToOpenObserveStream('frontend_logs', logEntry);
}

// Middleware Express para medir cada endpoint automáticamente
function observabilityMiddleware(req, res, next) {
  // Evitar bucle infinito en el endpoint de telemetría
  if (req.originalUrl.startsWith('/api/telemetry')) {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;

    const labels = {
      http_method: method,
      http_url: url,
      http_status_code: String(statusCode)
    };

    requestCounter.add(1, labels);
    latencyHistogram.record(Number(durationMs.toFixed(2)), labels);

    if (statusCode >= 400) {
      errorCounter.add(1, labels);
    }

    logBackendEvent({
      level: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO',
      message: `${method} ${url} -> ${statusCode} (${durationMs.toFixed(2)} ms)`,
      method,
      url,
      statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });
  });

  next();
}

module.exports = {
  getTimestamps,
  logBackendEvent,
  logFrontendEvent,
  observabilityMiddleware
};