import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { DataSource } from 'typeorm';
import moment from 'moment';
import swaggerUiRouter from '@/routers/swagger';
import authorizedRouter from '@/routers/authorized';
import unauthorizedRouter from '@/routers/unauthorized';
import { basicAuthMiddleware } from '@/utils';

const isDevEnv = process.env.NODE_ENV !== 'production';
const { SWAGGER_BASICAUTH_USER, SWAGGER_BASICAUTH_PASSWORD, SWAGGER_BASICAUTH_ENABLE } = process.env;

/**
 * @description Express App 생성
 * @param dataSource SQLite DataSource
 */
const createExpressApp = async (dataSource: DataSource) => {
  const app = express();
  const mainRouterV1 = express.Router();

  morgan.token('date', () => moment().format('YYYY-MM-DD HH:mm:ss.SSS'));

  if (isDevEnv) {
    app.use(cors());
    app.use(
      helmet({
        hidePoweredBy: false,
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false
      })
    );
  } else {
    app.use(helmet());
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan('combined'));
  app.use('/api/v1', mainRouterV1);

  app.use(
    '/api/docs',
    basicAuthMiddleware({
      user: SWAGGER_BASICAUTH_USER,
      password: SWAGGER_BASICAUTH_PASSWORD,
      enable: (() => {
        switch (SWAGGER_BASICAUTH_ENABLE) {
          case 'true':
          case 'false':
            return JSON.parse(SWAGGER_BASICAUTH_ENABLE);
          default:
            return !isDevEnv;
        }
      })()
    }),
    swaggerUiRouter()
  );

  mainRouterV1.use('/auth', authorizedRouter(dataSource));
  mainRouterV1.use(unauthorizedRouter(dataSource));

  return app;
};

export default createExpressApp;
