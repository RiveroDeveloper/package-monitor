// External imports
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Internal imports
import type { JWTPayloadInterface } from '../interfaces/auth/JWTPayloadInterface';

const AUTH_DISABLED = (process.env.AUTH_DISABLED ?? 'false') === 'true';

// Demo user injected when auth is disabled so protected routes (including
// admin-only ones) remain accessible for portfolio visitors.
const DEMO_USER: JWTPayloadInterface = {
  sub: 'demo-user',
  email: 'demo@packtrack.local',
  role: 'Admin',
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Auth disabled for demo purposes — bypass and inject a demo admin user.
    if (AUTH_DISABLED) {
      (request as unknown as Record<string, unknown>)['user'] = DEMO_USER;
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload =
        await this.jwtService.verifyAsync<JWTPayloadInterface>(token);
      (request as unknown as Record<string, unknown>)['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
