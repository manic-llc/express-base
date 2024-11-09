import { resolve } from './directories.js';

export function parseConfig(configuration = {}) {
  const { env, staticDirectory, apiRoot, trustProxy, httpsRedirect, middleware, models } = {
    apiRoot: configuration.apiRoot || '/api',
    staticDirectory: configuration?.staticDirectory || resolve(import.meta.url, '../dist/client'),
    trustProxy: typeof configuration?.trustProxy === 'boolean' ? configuration.trustProxy : true,
    httpsRedirect: typeof configuration?.httpsRedirect === 'boolean' ? configuration.httpsRedirect : true,
    middleware: {
      cors: {
        origin: '*',
        ...(configuration?.middleware?.cors || {}),
      },
      morgan: {
        format: 'combined',
        options: {},
        ...(configuration?.middleware?.morgan || {}),
      },
      json: {
        limit: '50mb',
        ...(configuration?.middleware?.json || {}),
      },
    },
    env: configuration.env || {},
    models: configuration.models || {},
  };

  return {
    env,
    apiRoot,
    staticDirectory,
    trustProxy,
    httpsRedirect,
    middleware,
    models,
  };
}