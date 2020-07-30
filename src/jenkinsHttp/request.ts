import * as fetch from 'node-fetch';
import { loggify } from '../shared';
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

  try {
    if (method === 'get') {
      fetchFn = async () => fetch(url, { headers, signal: controller.signal });
    }

    timeout = setTimeout(() => {
      controller.abort();
    }, 2000);

    const response = await fetchFn();

    if (!response.ok) {
      throw new Error(loggify(response));
    }

    return responseType === 'json' ? response.json() : response.text();
  } catch (error) {
    throw new Error(loggify(error));
  } finally {
    clearTimeout(timeout);
  }
}
