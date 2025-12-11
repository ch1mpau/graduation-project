import {
  AppFobiddenException,
  ErrorCode,
  IS_PUBLIC_KEY,
  ROLES,
} from '@app/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiForbiddenResponse } from '@nestjs/swagger';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // --- Bỏ qua nếu route @Public() ---
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // --- Kiểm tra JWT trước ---
    const can = (await super.canActivate(context)) as boolean;
    if (!can) return false;

    // --- Kiểm tra ROLE ---
    const requiredRoles = this.reflector.getAllAndOverride(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Không yêu cầu role -> OK
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User has no role');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new AppFobiddenException(ErrorCode.FORBIDDEN);
    }

    return true;
  }
}
