import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { JWT_SECRET, JWT_STRATEGY } from '@/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {
    const extractJwt = (req) => {
      let token;

      if (req && req.cookies) token = req.cookies['access_token'];

      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      jwtFromRequest: extractJwt,
      secretOrKey: configService.get(JWT_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(request, payload) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      const isBlacklisted = await this.redisService.isBlacklisted(token);

      if (isBlacklisted) throw new UnauthorizedException();

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      delete user.hash;

      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
