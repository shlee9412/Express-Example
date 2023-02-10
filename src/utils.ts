import { v4 as uuidV4, parse as parseUUID } from 'uuid';
import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { SHA256, enc } from 'crypto-js';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import os from 'os';
import User from '@/entities/User.entity';

/** @description JWT Secret Key */
const jwtSecret = 'B0762748EEE042349C2BF74D2FFAC66C';

/**
 * @description IPV4 조회
 * @returns IPV4 리스트
 */
export const getIpv4 = () =>
  _.flatMap(os.networkInterfaces())
    .filter(d => d?.family === 'IPv4')
    .map(d => d?.address);

/**
 * @description SHA256 암호화
 * @param str 문자열 원본
 * @returns SHA256 암호화 문자열
 */
export const sha256 = (str: string) => SHA256(str).toString(enc.Hex);

/**
 * @description JWT 생성
 * @param data JWT Payload
 * @param expiresIn 유효 시간 (ex. '1h', '1d', 604800, ...)
 * @returns JWT
 */
export const createJwt = <D = any>(data: D, expiresIn: number | string) => jwt.sign(data as any, jwtSecret, { expiresIn });

/**
 * @description JWT 검증
 * @param token JWT
 * @returns JWT Payload
 */
export const verifyJwt = <D = any>(token: string) => {
  try {
    const payload = jwt.verify(token, jwtSecret) as D;
    return payload;
  } catch {
    return null;
  }
};

/**
 * @description Express Request Handler 생성 (서버 에러 처리)
 * @param cb Request Handler 콜백 함수
 */
export const requestHandler = (cb: (req: Request, res: Response) => any | Promise<any>) => async (req: Request, res: Response) => {
  try {
    await cb(req, res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

/**
 * @description JWT 검증 미들웨어 생성
 * @param dataSource SQLite DataSource
 */
export const verifyJwtMiddleware =
  (dataSource: DataSource, type: TokenType = 'accessToken') =>
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('WWW-Authenticate', 'Bearer');

    const token = req.headers['authorization']?.replace(/^Bearer/, '').trim();
    if (!token) return res.sendStatus(401);

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload || payload.type !== type) return res.sendStatus(401);

    try {
      const userInfo = await dataSource.getRepository(User).findOne({ where: { uuid: payload.userInfo.uuid } });
      if (!userInfo) return res.sendStatus(401);

      req.user = {
        uuid: userInfo.uuid as string,
        userId: userInfo.userId as string
      };

      next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

/**
 * @description Basic Auth 미들웨어 생성
 * @param BasicAuthMiddlewareParams.user 유저명
 * @param BasicAuthMiddlewareParams.password 비밀번호
 * @param BasicAuthMiddlewareParams.enable Basic Auth 사용 여부
 * @default BasicAuthMiddlewareParams.enable true
 */
export const basicAuthMiddleware =
  ({ user, password, enable }: BasicAuthMiddlewareParams) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (enable === false || !user || !password) return next();
    res.setHeader('WWW-Authenticate', 'Basic');

    const authBase64 = req.headers.authorization?.replace(/^Basic/, '').trim();
    if (!authBase64) return res.sendStatus(401);

    const auth = Buffer.from(authBase64, 'base64').toString('utf8');
    if (auth !== `${user}:${password}`) return res.sendStatus(401);

    next();
  };

/**
 * @description Express 캐시 미들웨어 생성
 * @param maxAge HTTP 캐시 Max Age (Sec)
 * @param enable 캐시 사용 여부
 */
export const cacheMiddleware =
  (maxAge: number, enable: boolean = true) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (enable) res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
