const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const isJsonResponse = (response) => {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json');
};

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('shopora_token') || '';
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization') && options.auth !== false) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const payload = isJsonResponse(response)
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error?.message ||
      (typeof payload === 'string' ? payload : 'Request failed');
    throw new Error(message);
  }

  return payload;
}

export { API_BASE };
