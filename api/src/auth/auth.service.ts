import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from './password.util';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const userDoc = await this.usersService.findOne(email);
        if (userDoc && verifyPassword(pass, userDoc.password)) {
            const user = (userDoc as any).toObject ? (userDoc as any).toObject() : userDoc;
            const { password, ...result } = user;
            result.userId = result._id;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.email, sub: user.userId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            email: user.email,
            name: user.name
        };
    }

    async register(userData: any) {
        const user = await this.usersService.create(userData);
        return this.login(user);
    }

    async updateProfile(email: string, updateData: any) {
        const user = await this.usersService.update(email, updateData);
        return {
            email: user.email,
            name: user.name,
            role: user.role
        };
    }

    async changePassword(email: string, oldPass: string, newPass: string) {
        const user = await this.usersService.findOne(email);
        if (user && verifyPassword(oldPass, user.password)) {
            await this.usersService.update(email, { password: newPass });
            return { success: true };
        }
        throw new Error('Ancien mot de passe incorrect');
    }
}
