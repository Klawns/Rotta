import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not found in environment');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            const sessionMode = req.headers['x-session-mode'];

            if (sessionMode === 'admin') {
              // Se modo admin, usa EXCLUSIVAMENTE o token de admin
              token = req.cookies['admin_access_token'];
            } else {
              // Caso contrário, usa EXCLUSIVAMENTE o token de usuário
              token = req.cookies['access_token'];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      taxId: payload.taxId,
      cellphone: payload.cellphone,
      hasSeenTutorial: payload.hasSeenTutorial,
      subscription: payload.subscription,
    };
  }
}
