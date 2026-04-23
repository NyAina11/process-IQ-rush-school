import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() userData: any) {
        return this.authService.register(userData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('profile')
    async updateProfile(@Request() req, @Body() updateData: any) {
        return this.authService.updateProfile(req.user.username, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    async changePassword(@Request() req, @Body() body: any) {
        return this.authService.changePassword(req.user.username, body.oldPassword, body.newPassword);
    }
}
