import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { renderPage } from 'vike/server';
import { parseConfig, connect, buildModels, buildRoutes } from './util/index.js';
import SpotifyOauth from '@wearemanic/express-spotify-oauth';
import StripePayments from '@wearemanic/express-stripe-payments';
import OTP from '@wearemanic/express-twilio-verify';
import S3 from '@wearemanic/express-s3';

const PLUGINS = {
  '@wearemanic/express-spotify-oauth': SpotifyOauth,
  '@wearemanic/express-stripe-payments': StripePayments,
  '@wearemanic/express-s3': S3,
  '@wearemanic/express-twilio-verify': OTP,
};

export default async (configuration = {}) => {
  const {
    env: { DATABASE, NODE_ENV },
    apiRoot,
    staticDirectory,
    trustProxy,
    httpsRedirect,
    middleware,
    schemas,
    plugins,
  } = parseConfig(configuration || {});

  const app = express();

  await connect(DATABASE);

  schemas &&
    (() => {
      buildModels({ schemas });
      buildRoutes({ app, schemas, apiRoot });
    })();

  const IS_PRODUCTION = NODE_ENV === 'production';

  app.use(compression());
  app.use(morgan(middleware.morgan.format, middleware.morgan.options));
  app.use(express.json(middleware.json));
  app.use(cors(middleware.cors));

  Object.keys(plugins).forEach(key => {
    const config = plugins[key];
    PLUGINS[key](app, config);
  });

  if (IS_PRODUCTION) {
    app.set('trust proxy', trustProxy);
    app.use((req, res, next) => {
      httpsRedirect && req.headers.host.protocol !== 'https' && res.redirect(301, `https://${req.headers.host}${req.url}`);
      next();
    });
    app.use(express.static(staticDirectory));
  }

  app.get('*', async (req, res) => {
    const response = await renderPage({
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
    });

    response.httpResponse.headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(statusCode).send(body);
  });

  return app;
};
