import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    // Se não for admin, verifica se a assinatura está explicitamente expirada
    if (user?.subscription?.status === 'expired') {
      throw new ForbiddenException(
        'Sua assinatura expirou. Por favor, renove o seu plano para continuar utilizando estes recursos.',
      );
    }

    return true;
  }
}
