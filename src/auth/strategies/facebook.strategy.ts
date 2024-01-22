import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-facebook';
import {
  FACEBOOK_STRATEGY,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL,
} from '@/utils';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  FACEBOOK_STRATEGY,
) {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get(FACEBOOK_CLIENT_ID),
      clientSecret: configService.get(FACEBOOK_CLIENT_SECRET),
      callbackURL: configService.get(FACEBOOK_CALLBACK_URL),
      scope: 'email',
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
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
