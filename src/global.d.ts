import User from '@/entities/User.entity';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      HOST?: string;
      PORT?: string;
      SWAGGER_BASICAUTH_USER?: string;
      SWAGGER_BASICAUTH_PASSWORD?: string;
      SWAGGER_BASICAUTH_ENABLE?: 'true' | 'false';
    }
  }

  interface BasicAuthMiddlewareParams {
    user?: string;
    password?: string;
    enable?: boolean;
  }

  interface UserInfo {
    uuid: string;
    userId: string;
    userName?: string;
    profileImg?: string;
    createDate: Date;
    updateDate?: Date;
  }

  namespace Express {
    interface Request {
      user: Partial<UserInfo>;
    }
  }

  type TokenType = 'accessToken' | 'refreshToken';

  interface JwtPayload {
    type: TokenType;
    userInfo: UserInfo;
  }

  interface CreateUserBody {
    userId: string;
    password: string;
    userName?: string;
    profileImg?: Buffer;
  }

  interface LoginBody {
    userId: string;
    password: string;
  }

  interface UpdateUserBody {
    password: string;
    newPassword?: string;
    userName?: string;
    profileImg?: string;
  }
}
