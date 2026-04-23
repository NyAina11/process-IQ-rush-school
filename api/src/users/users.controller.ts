import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req) {
        if (req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Accès réservé au Super Admin');
        }
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':email')
    async update(@Request() req, @Param('email') email: string, @Body() updateData: any) {
        if (req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Accès réservé au Super Admin');
        }
        return this.usersService.update(email, updateData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':email')
    async remove(@Request() req, @Param('email') email: string) {
        if (req.user.role !== 'super_admin') {
            throw new UnauthorizedException('Accès réservé au Super Admin');
        }
        return this.usersService.delete(email);
    }
}
