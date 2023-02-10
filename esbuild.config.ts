import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs-extra';
import path from 'path';

const appRoot = process.cwd();

(async () => {
  try {
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      minify: true,
      platform: 'node',
      outfile: path.resolve(appRoot, 'dist', 'index.js'),
      plugins: [nodeExternalsPlugin()],
      alias: {
        '@': path.resolve(appRoot, 'src')
      }
    });

    const outputDirPath = path.resolve(appRoot, 'output');
    fs.mkdirSync(outputDirPath);
    ['package.json', 'package-lock.json', '.npmrc', 'swagger.yml', '.env', 'dist'].forEach(d => {
      fs.copySync(path.resolve(appRoot, d), path.resolve(outputDirPath, d));
    });
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
})();
