import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_STRATEGY,
} from '@/utils';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  GOOGLE_STRATEGY,
) {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get(GOOGLE_CLIENT_ID),
      clientSecret: configService.get(GOOGLE_CLIENT_SECRET),
      callbackURL: configService.get(GOOGLE_CALLBACK_URL),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const {
      provider,
      id: providerId,
      emails: [{ value: email }],
      name: { givenName: firstName, familyName: lastName },
    } = profile;

    const user = {
      provider,
      providerId,
      email,
      firstName,
      lastName,
      nickname: firstName + lastName,
    };

    done(null, user);
  }
}
