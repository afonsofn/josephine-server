import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (data) return request.user[data];

    return request.user;
  },
);

export const GetToken = createParamDecorator((_, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();

  return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
});
