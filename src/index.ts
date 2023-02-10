import 'reflect-metadata';
import 'dotenv/config';
import http from 'http';
import createDataSource from '@/dataSource';
import createExpressApp from '@/app';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 8080;

(async () => {
  try {
    const AppDataSource = await createDataSource();
    const app = await createExpressApp(AppDataSource);
    const server = http.createServer(app);
    server.listen(PORT, HOST, () =>
      console.log(`> [${process.env.NODE_ENV}]\n> Running on port ${PORT}\n> Swagger: http://localhost:${PORT}/api/docs`)
    );
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
})();
