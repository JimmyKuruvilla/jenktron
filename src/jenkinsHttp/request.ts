import * as fetch from 'node-fetch';
import { debugLog, loggify } from '../shared';
import { Options } from './options.interface';

function basicAuthHeader(user: string, password: string): Map<string, string> {
  const token = `${user}:${password}`;
  const base64Token: string = Buffer.alloc(token.length, token).toString(
    'base64'
  );
  return new Map().set('Authorization', `Basic ${base64Token}`);
}

export function createFatch(
  user: string,
  password: string
): (url: string, options?: Options) => Promise<unknown> {
  return function (url: string, options?: Options) {
    return _fatch(basicAuthHeader(user, password), url, options);
  };
}

async function _fatch(
  basicAuthHeader: Map<string, string>,
  url: string,
  options = {} as Options
): Promise<unknown> {
  const method = options.method || 'get';
  const body = options.body || {};
  const headers = options.headers
    ? new Map([...basicAuthHeader, ...options.headers])
    : basicAuthHeader;
  const responseType = options.responseType || 'json';
  const controller = new AbortController();
  let fetchFn;
  let timeout;

  const maxRetries = 3;
  let attempt = 0;
  let error;
  let result;
  let success = false;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      if (method === 'get') {
        fetchFn = async () =>
          fetch(url, { headers, signal: controller.signal });
      }

      timeout = setTimeout(() => {
        controller.abort();
      }, 2500);

      debugLog(`attempt ${attempt}, ${method} : ${url}`);

      const response = await fetchFn();

      if (!response.ok) {
        success = false;
        error = loggify(response);
      }

      success = true;
      result = responseType === 'json' ? response.json() : response.text();
    } catch (error) {
      success = false;
      error = loggify(error);
    } finally {
      clearTimeout(timeout);
    }

    if (success) {
      return result;
    }
  }
  if (error) {
    throw new Error(error);
  }
}
