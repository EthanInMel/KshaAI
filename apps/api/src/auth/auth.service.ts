import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    // Simple hash function (use bcrypt in production)
    private hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    private verifyPassword(password: string, hash: string): boolean {
        return this.hashPassword(password) === hash;
    }

    // Generate a simple token (use JWT in production)
    private generateToken(userId: string, email: string): string {
        const payload = { userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; // 7 days
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    // Decode token
    decodeToken(token: string): { userId: string; email: string; exp: number } | null {
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            if (decoded.exp && decoded.exp < Date.now()) {
                return null; // Token expired
            }
            return decoded;
        } catch {
            return null;
        }
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password_hash) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!this.verifyPassword(password, user.password_hash)) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.generateToken(user.id, user.email);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
                settings: user.settings,
            },
        };
    }

    async register(data: { email: string; password: string; fullName?: string }) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = this.hashPassword(data.password);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password_hash: passwordHash,
                full_name: data.fullName,
                role: 'admin', // Default to admin for personal instances
                settings: {},
            },
        });

        const token = this.generateToken(user.id, user.email);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
                settings: user.settings,
            },
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
            settings: user.settings,
        };
    }

    async updateProfile(userId: string, data: { full_name?: string; settings?: any }) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updated_at: new Date(),
            },
        });

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
            settings: user.settings,
        };
    }
}
