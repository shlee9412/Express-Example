import { Router } from 'express';
import { DataSource, TypeORMError } from 'typeorm';
import { stringify as stringifyUUID } from 'uuid';
import User from '@/entities/User.entity';
import { createJwt, requestHandler, sha256 } from '@/utils';

/**
 * @description 로그인 전
 * @param dataSource SQLite DataSource
 */
const unauthorizedRouter = (dataSource: DataSource) => {
  const router = Router();
  const userRepository = dataSource.getRepository(User);

  /** 사용자 생성 */
  router.post(
    '/users',
    requestHandler(async (req, res) => {
      const { userId, password, userName } = req.body as CreateUserBody;

      const userInfo = userRepository.create({
        userId,
        password: sha256(password),
        userName
      });

      try {
        const newUser = await userRepository.save(userInfo);
        res.status(200).json(newUser);
      } catch (err) {
        if (err instanceof TypeORMError && (err as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.error(err);
          return res.sendStatus(409);
        }
        throw err;
      }
    })
  );

  /** 사용자 조회 */
  router.get(
    '/users/:userUUID',
    requestHandler(async (req, res) => {
      const userUUID = stringifyUUID(Buffer.from(req.params.userUUID.replace(/-/g, ''), 'hex'));

      const userInfo = await userRepository.findOne({
        select: { uuid: true, userId: true, userName: true, registerDate: true },
        where: { uuid: userUUID }
      });
      if (!userInfo) return res.sendStatus(400);

      res.status(200).json(userInfo);
    })
  );

  /** 로그인 */
  router.post(
    '/login',
    requestHandler(async (req, res) => {
      const { userId, password } = req.body as LoginBody;

      const userInfo = await userRepository.findOne({
        select: { uuid: true, userId: true, userName: true, registerDate: true },
        where: { userId, password: sha256(password) }
      });
      if (!userInfo) return res.sendStatus(401);

      const jwtUserInfo: UserInfo = { uuid: userInfo.uuid as string, userId: userInfo.userId as string };

      res.status(200).json({
        userInfo,
        tokens: {
          accessToken: createJwt<JwtPayload>({ type: 'accessToken', userInfo: jwtUserInfo }, '1h'),
          refreshToken: createJwt<JwtPayload>({ type: 'refreshToken', userInfo: jwtUserInfo }, '3d')
        }
      });
    })
  );

  return router;
};

export default unauthorizedRouter;
