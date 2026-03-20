import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async onModuleInit() {
        console.log('[UsersService] Checking for users in MongoDB...');
        try {
            const superAdmin = await this.userModel.findOne({ role: 'super_admin' });
            if (!superAdmin) {
                console.log('[UsersService] No super_admin found. Seeding super_admin...');
                await this.create({
                    email: 'superadmin@rush-school.fr',
                    password: 'superadmin',
                    name: 'Super Administrateur',
                    role: 'super_admin'
                });
            }

            const admission = await this.userModel.findOne({ role: 'admission' });
            if (!admission) {
                console.log('[UsersService] No admission admin found. Seeding admission admin...');
                await this.create({
                    email: 'admin@rush-school.fr',
                    password: 'admin',
                    name: 'Administrateur Admission',
                    role: 'admission'
                });
            }
        } catch (error) {
            console.error('[UsersService] Error during database seeding:', error);
        }
    }

    async findOne(email: string): Promise<User | undefined> {
        console.log(`[UsersService] Searching MongoDB for user: ${email}`);
        return this.userModel.findOne({ email }).exec();
    }

    async create(userData: any): Promise<any> {
        console.log(`[UsersService] Creating new MongoDB user: ${userData.email}`);
        try {
            const newUser = new this.userModel(userData);
            const savedUser = await newUser.save();
            return {
                userId: savedUser._id,
                email: savedUser.email,
                name: savedUser.name,
                role: savedUser.role
            };
        } catch (error) {
            console.error('[UsersService] Error creating user in MongoDB:', error);
            throw error;
        }
    }
}
