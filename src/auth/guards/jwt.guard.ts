import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY } from '@/utils';

export class JwtGuard extends AuthGuard(JWT_STRATEGY) {}
