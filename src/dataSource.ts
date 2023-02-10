import { DataSource } from 'typeorm';
import path from 'path';
import User from '@/entities/User.entity';

const appRoot = process.cwd();

/** @description SQLite DataSource 생성 */
const createDataSource = async () => {
  const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: path.resolve(appRoot, 'sqlite.db'),
    synchronize: true,
    fileMustExist: false,
    entities: [User]
  });

  await AppDataSource.initialize();
  return AppDataSource;
};

export default createDataSource;
