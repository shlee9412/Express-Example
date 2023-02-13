import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs-extra';
import { resolve } from 'path';

const appRoot = process.cwd();

(async () => {
  try {
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      minify: true,
      platform: 'node',
      outfile: resolve(appRoot, 'dist', 'index.js'),
      plugins: [nodeExternalsPlugin()],
      alias: {
        '@': resolve(appRoot, 'src')
      }
    });

    const outputDirPath = resolve(appRoot, 'output');
    fs.mkdirSync(outputDirPath);
    ['package.json', 'package-lock.json', '.npmrc', 'swagger.yml', '.env', 'dist'].forEach(d => {
      fs.copySync(resolve(appRoot, d), resolve(outputDirPath, d));
    });
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
})();
