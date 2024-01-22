import { AuthGuard } from '@nestjs/passport';
import { FACEBOOK_STRATEGY } from '@/utils';

export class FacebookGuard extends AuthGuard(FACEBOOK_STRATEGY) {}
