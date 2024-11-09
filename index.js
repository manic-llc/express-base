import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { renderPage } from 'vike/server';
import { parseConfig, connect, buildModels, buildRoutes } from './util/index.js';

export default async (configuration = {}) => {
  const {
    env: { DATABASE, NODE_ENV },
    apiRoot,
    staticDirectory,
    trustProxy,
    httpsRedirect,
    middleware,
    models,
  } = parseConfig(configuration || {});

  const app = express();

  await connect(DATABASE);

  buildModels({ models });
  buildRoutes({ app, models, apiRoot });

  const IS_PRODUCTION = NODE_ENV === 'production';

  app.use(compression());
  app.use(morgan(middleware.morgan.format, middleware.morgan.options));
  app.use(express.json(middleware.json));
  app.use(cors(middleware.cors));

  if (IS_PRODUCTION) {
    app.set('trust proxy', trustProxy);
    app.use((req, res, next) => {
      httpsRedirect && req.headers.host.protocol !== 'https' && res.redirect(301, `https://${host}${req.url}`);
      next();
    });
    app.use(express.static(staticDirectory));
  }

  app.get('*', async (req, res) => {
    const {
      httpResponse: { body, statusCode, headers },
    } = await renderPage({
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
    });

    headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(statusCode).send(body);
  });

  return app;
};
