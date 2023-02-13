import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import path from 'path';
import fs from 'fs-extra';
import { getIpv4 } from '@/utils';

const appRoot = process.cwd();

const swaggerDocument = YAML.parse(fs.readFileSync(path.resolve(appRoot, 'swagger.yml')).toString('utf8'));
swaggerDocument.servers[0].url = swaggerDocument.servers[0].url.replace('${PORT}', process.env.PORT);
swaggerDocument.servers = [...swaggerDocument.servers, ...getIpv4().map(d => ({ url: `http://${d}:${process.env.PORT}` }))];

const router = Router();

/** @description Swagger 라우터 생성 */
const swaggerUiRouter = () => router.use(swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: false }));

export default swaggerUiRouter;
