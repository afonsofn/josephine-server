import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_STRATEGY } from 'src/utils';

export class GoogleGuard extends AuthGuard(GOOGLE_STRATEGY) {}
