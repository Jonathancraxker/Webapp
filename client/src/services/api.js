export async function sendFrontendLog({ level = 'INFO', action, page, status = 'OK', details = {} }) {
  try {
    await fetch('/api/telemetry/frontend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        action,
        page,
        status,
        details: {
          userAgent: navigator.userAgent,
          ...details
        }
      })
    });
  } catch {
    // No interrumpir flujo si falla la telemetría
  }
}

async function apiRequest(url, options = {}, page = '/') {
  const method = options.method || 'GET';
  const start = performance.now();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const durationMs = Number((performance.now() - start).toFixed(2));
  const result = await response.json();

  if (!response.ok) {
    await sendFrontendLog({
      level: 'ERROR',
      action: `API_ERROR_${method}`,
      page,
      status: String(response.status),
      details: {
        method,
        url,
        statusCode: response.status,
        duration_ms: durationMs,
        error: result?.data?.mensaje || 'Error en petición'
      }
    });
    throw new Error(result?.data?.mensaje || 'Error en la operación');
  }

  await sendFrontendLog({
    level: 'INFO',
    action: `API_SUCCESS_${method}`,
    page,
    status: String(response.status),
    details: {
      method,
      url,
      statusCode: response.status,
      duration_ms: durationMs
    }
  });

  return result;
}

export const api = {
  getHealth: () => fetch('/api/health').then((r) => r.json()),

  login: (correo, password) =>
    apiRequest(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ correo, password }) },
      '/login'
    ),

  register: (payload) =>
    apiRequest(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      '/register'
    ),

  // CRUD Noticias
  getNoticias: () => apiRequest('/api/noticias', { method: 'GET' }, '/noticias'),
  createNoticia: (payload) =>
    apiRequest('/api/noticias', { method: 'POST', body: JSON.stringify(payload) }, '/noticias'),
  updateNoticia: (id, payload) =>
    apiRequest(`/api/noticias/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, '/noticias'),
  deleteNoticia: (id) =>
    apiRequest(`/api/noticias/${id}`, { method: 'DELETE' }, '/noticias'),

  // CRUD Usuarios
  getUsuarios: () => apiRequest('/api/usuarios', { method: 'GET' }, '/usuarios'),
  createUsuario: (payload) =>
    apiRequest('/api/usuarios', { method: 'POST', body: JSON.stringify(payload) }, '/usuarios'),
  updateUsuario: (id, payload) =>
    apiRequest(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, '/usuarios'),
  deleteUsuario: (id) =>
    apiRequest(`/api/usuarios/${id}`, { method: 'DELETE' }, '/usuarios')
};