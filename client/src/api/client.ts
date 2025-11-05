import { APIError, NetworkError, TimeoutError } from './errors';

interface APIOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.message || `HTTP error! status: ${response.status}`,
      response.status,
      error.code
    );
  }
  return response.json();
}

export async function fetchWithTimeout(url: string, options: APIOptions = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError();
      }
      if (!window.navigator.onLine) {
        throw new NetworkError();
      }
    }
    throw error;
  }
}

export const apiClient = {
  get: (url: string, options?: APIOptions) => 
    fetchWithTimeout(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options?: APIOptions) =>
    fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),
};