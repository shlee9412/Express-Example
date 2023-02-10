import { Router } from 'express';
import { DataSource } from 'typeorm';
import User from '@/entities/User.entity';
import { cacheMiddleware, createJwt, requestHandler, sha256, verifyJwtMiddleware } from '@/utils';

/**
 * @description 로그인 후
 * @param dataSource SQLite DataSource
 */
const authorizedRouter = (dataSource: DataSource) => {
  const router = Router();
  const userRepository = dataSource.getRepository(User);

  /** JWT 토큰 갱신 */
  router.get(
    '/token',
    cacheMiddleware(1800),
    verifyJwtMiddleware(dataSource, 'refreshToken'),
    requestHandler(async (req, res) => {
      const userInfo = req.user;

      res.status(200).json({
        userInfo: await userRepository.findOne({
          select: { uuid: true, userId: true, userName: true, registerDate: true },
          where: { uuid: userInfo.uuid }
        }),
        tokens: {
          accessToken: createJwt<JwtPayload>({ type: 'accessToken', userInfo }, '1h'),
          refreshToken: createJwt<JwtPayload>({ type: 'refreshToken', userInfo }, '3d')
        }
      });
    })
  );

  router.use(verifyJwtMiddleware(dataSource));

  /** 본인 사용자 정보 수정 */
  router.put(
    '/users',
    requestHandler(async (req, res) => {
      const { uuid: userUUID, userId } = req.user;
      const { password, newPassword, userName } = req.body as UpdateUserBody;

      const updateResult = await userRepository.update(
        { userId, password: sha256(password) },
        { password: newPassword ? sha256(newPassword) : undefined, userName }
      );
      if (!updateResult.affected) return res.sendStatus(403);
      const userInfo = await userRepository.findOne({
        select: { uuid: true, userId: true, userName: true, registerDate: true },
        where: { uuid: userUUID }
      });
      res.status(200).json(userInfo);
    })
  );

  /** 사용자 정보 삭제 */
  router.delete(
    '/users',
    requestHandler(async (req, res) => {
      const { uuid: userUUID } = req.user;

      const userInfo = await dataSource.transaction(async manager => {
        const userRepository = manager.getRepository(User);
        const result = await userRepository.findOne({
          select: { uuid: true, userId: true, userName: true, registerDate: true },
          where: { uuid: userUUID }
        });
        if (!result) return null;
        await userRepository.remove(result);
        return result;
      });

      if (!userInfo) return res.sendStatus(400);
      res.status(200).json(userInfo);
    })
  );

  return router;
};

export default authorizedRouter;
