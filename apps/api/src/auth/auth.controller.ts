import { Controller, Post, Get, Put, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        return this.authService.login(body.email, body.password);
    }

    @Post('register')
    async register(@Body() body: { email: string; password: string; fullName?: string }) {
        return this.authService.register(body);
    }

    @Get('profile')
    async getProfile(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = this.authService.decodeToken(token);

        if (!decoded) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return this.authService.getProfile(decoded.userId);
    }

    @Put('profile')
    async updateProfile(@Headers('authorization') authHeader: string, @Body() body: { full_name?: string; settings?: any }) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = this.authService.decodeToken(token);

        if (!decoded) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return this.authService.updateProfile(decoded.userId, body);
    }
}
