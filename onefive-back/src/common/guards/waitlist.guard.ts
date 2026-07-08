import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class WaitlistGuard implements CanActivate {

  // Waitlist removed: this guard is neutralized and never blocks a request.
  // Kept in the DI graph (and referenced by decorators) to avoid a wider
  // refactor; can be deleted in a follow-up cleanup.
  async canActivate(_context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
