import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Req, Res, UsePipes, Get, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, registerSchema, changePasswordSchema, profileSchema } from './dto/auth.dto';
import type { LoginDto, RegisterDto, ChangePasswordDto, ProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req: any) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        const tokens = await this.authService.validateGoogleUser(req.user);

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.get('x-forwarded-proto') === 'https';

        const cookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax' as any,
        };

        res.cookie('refresh_token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('access_token', tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        // Lógica de Redirecionamento Inteligente (Checkout vs Dashboard)
        const selectedPlan = req.cookies['selected_plan'] || 'starter';
        res.clearCookie('selected_plan');

        const subscription = await this.authService.getUserSubscription(tokens.user.id);

        // Se escolheu um plano pago e ainda não tem (ou é starter)
        if (['premium', 'lifetime'].includes(selectedPlan) && (!subscription || subscription.plan === 'starter')) {
            return res.redirect(`${process.env.FRONTEND_URL}/checkout?plan=${selectedPlan}`);
        }

        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: any) {
        return this.authService.getLatestProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    @UsePipes(new ZodValidationPipe(changePasswordSchema))
    async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    @UsePipes(new ZodValidationPipe(profileSchema))
    async updateProfile(@Req() req: any, @Body() body: ProfileDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.updateProfile(req.user.id, body);

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.get('x-forwarded-proto') === 'https';

        const cookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax' as any,
        };

        // Atualizar cookies com novos tokens (que agora contêm taxId/cellphone atualizados)
        res.cookie('refresh_token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('access_token', tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        return {
            user: tokens.user,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(loginSchema))
    async login(@Req() req: Request, @Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // Restrição: login tradicional (email/senha) apenas para administradores
        if (user.role !== 'admin') {
            throw new UnauthorizedException('Acesso restrito para administradores por este meio. Por favor, utilize o Login com Google.');
        }

        const tokens = await this.authService.login(user);

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.get('x-forwarded-proto') === 'https';

        const cookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax' as any,
        };

        // Configurar refresh token em cookie seguro (Admin)
        res.cookie('admin_refresh_token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        // Configurar access token em cookie seguro (Admin)
        res.cookie('admin_access_token', tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutos
        });

        return {
            user: tokens.user,
        };
    }

    @Post('register')
    @UsePipes(new ZodValidationPipe(registerSchema))
    async register(@Req() req: Request, @Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.register(body);

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.get('x-forwarded-proto') === 'https';

        const cookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax' as any,
        };

        res.cookie('refresh_token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('access_token', tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        return {
            user: tokens.user,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const isAdmin = !!req.cookies['admin_refresh_token'];
        const refreshTokenName = isAdmin ? 'admin_refresh_token' : 'refresh_token';
        const accessTokenName = isAdmin ? 'admin_access_token' : 'access_token';

        const token = req.cookies[refreshTokenName];
        if (!token) {
            throw new UnauthorizedException();
        }
        const tokens = await this.authService.refresh(token);

        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.get('x-forwarded-proto') === 'https';

        const cookieOptions = {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax' as any,
        };

        // Rotação: Atualizar o novo refresh token
        res.cookie(refreshTokenName, tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Renovar access token
        res.cookie(accessTokenName, tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        return { success: true };
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Res({ passthrough: true }) res: Response) {
        // Limpa todos os possíveis tokens
        res.clearCookie('refresh_token');
        res.clearCookie('access_token');
        res.clearCookie('admin_refresh_token');
        res.clearCookie('admin_access_token');
    }
}
