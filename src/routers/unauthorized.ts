import { Router } from 'express';
import { DataSource, TypeORMError } from 'typeorm';
import { stringify as stringifyUUID } from 'uuid';
import User from '@/entities/User.entity';
import { createJwt, requestHandler, sha256, uploadMiddleware } from '@/utils';

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
    uploadMiddleware.single('profileImg'),
    requestHandler(async (req, res) => {
      const { userId, password, userName } = req.body as CreateUserBody;
      const profileImg = req.file?.buffer;

      const newUserData = userRepository.create({
        userId,
        password: sha256(password),
        userName: userName || null,
        profileImg: profileImg || null
      });

      try {
        const newUser = await userRepository.save(newUserData, { reload: false });
        delete newUser.password;

        res.status(200).json(newUser.getUserInfo());
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

      const userData = await userRepository.findOne({
        select: { uuid: true, userId: true, userName: true, profileImg: true, createDate: true, updateDate: true },
        where: { uuid: userUUID }
      });
      if (!userData) return res.sendStatus(404);

      res.status(200).json(userData.getUserInfo());
    })
  );

  /** 프로필 이미지 조회 */
  router.get(
    '/users/profileimg/:userUUID',
    requestHandler(async (req, res) => {
      const userUUID = stringifyUUID(Buffer.from(req.params.userUUID.replace(/-/g, ''), 'hex'));

      const profileImg = (await userRepository.findOne({ select: { profileImg: true }, where: { uuid: userUUID } }))?.profileImg;
      if (!profileImg) return res.sendStatus(404);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', profileImg.byteLength);
      res.status(200).send(profileImg);
    })
  );

  /** 로그인 */
  router.post(
    '/login',
    requestHandler(async (req, res) => {
      const { userId, password } = req.body as LoginBody;

      const userData = await userRepository.findOne({
        select: { uuid: true, userId: true, userName: true, profileImg: true, createDate: true },
        where: { userId, password: sha256(password) }
      });
      if (!userData) return res.sendStatus(401);

      const userInfo: UserInfo = userData.getUserInfo();

      res.status(200).json({
        userInfo,
        tokens: {
          accessToken: createJwt<JwtPayload>({ type: 'accessToken', userInfo }, '1h'),
          refreshToken: createJwt<JwtPayload>({ type: 'refreshToken', userInfo }, '3d')
        }
      });
    })
  );

  return router;
};

export default unauthorizedRouter;
