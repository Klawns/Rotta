import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Captura o plano da query string e salva no cookie ANTES de ir para o Google
    const plan = request.query.plan || 'starter';

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('selected_plan', plan, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return super.canActivate(context) as boolean;
  }
}
