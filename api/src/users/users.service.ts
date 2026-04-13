import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { hashPassword } from '../auth/password.util';

interface DefaultUser {
    email: string;
    password: string;
    name: string;
    role: string;
}

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async onModuleInit() {
        console.log('[UsersService] Vérification et synchronisation des utilisateurs par défaut...');
        try {
            const defaultUsers: DefaultUser[] = [
                {
                    email: 'superadmin@rush-school.fr',
                    password: process.env.DEFAULT_ADMIN_PASSWORD || 'superadmin',
                    name: 'Super Administrateur',
                    role: 'super_admin',
                },
                {
                    email: process.env.DEFAULT_ADMISSION_1_EMAIL || 'admission1@rush-school.fr',
                    password: process.env.DEFAULT_ADMISSION_1_PASSWORD || 'Admission123!',
                    name: process.env.DEFAULT_ADMISSION_1_NAME || 'Admission 1',
                    role: 'admission',
                },
                {
                    email: process.env.DEFAULT_ADMISSION_2_EMAIL || 'admission2@rush-school.fr',
                    password: process.env.DEFAULT_ADMISSION_2_PASSWORD || 'Admission456!',
                    name: process.env.DEFAULT_ADMISSION_2_NAME || 'Admission 2',
                    role: 'admission',
                },
                {
                    email: process.env.DEFAULT_ADMISSION_MANAGER_EMAIL || 'responsable.admission@rush-school.fr',
                    password: process.env.DEFAULT_ADMISSION_MANAGER_PASSWORD || 'RespAdmission789!',
                    name: process.env.DEFAULT_ADMISSION_MANAGER_NAME || 'Responsable Admission',
                    role: 'admission',
                },
                {
                    email: 'rh@rush-school.fr',
                    password: process.env.DEFAULT_RH_PASSWORD || 'rh123',
                    name: 'Responsable RH',
                    role: 'rh',
                },
                {
                    email: 'commercial@rush-school.fr',
                    password: process.env.DEFAULT_COMMERCIAL_PASSWORD || 'commercial123',
                    name: 'Responsable Commercial',
                    role: 'commercial',
                },
            ];

            const syncPasswords = process.env.DEFAULT_USERS_SYNC_PASSWORDS === 'true';

            for (const u of defaultUsers) {
                const existing = await this.userModel.findOne({ email: u.email });
                if (!existing) {
                    console.log(`[UsersService] Création : ${u.email} (${u.role})`);
                    await this.create(u);
                } else if (syncPasswords) {
                    const hashed = hashPassword(u.password);
                    await this.userModel.updateOne({ email: u.email }, { $set: { password: hashed } });
                    console.log(`[UsersService] Mot de passe synchronisé : ${u.email}`);
                }
            }

            console.log('[UsersService] Synchronisation terminée.');
        } catch (error) {
            console.error('[UsersService] Erreur lors du seeding :', error);
        }
    }

    async findOne(email: string): Promise<User | undefined> {
        console.log(`[UsersService] Recherche MongoDB : ${email}`);
        return this.userModel.findOne({ email }).exec();
    }

    async create(userData: any): Promise<any> {
        console.log(`[UsersService] Création MongoDB : ${userData.email}`);
        try {
            if (userData.password && !userData.password.startsWith('scrypt$')) {
                userData.password = hashPassword(userData.password);
            }
            const newUser = new this.userModel(userData);
            const saved = await newUser.save();
            return {
                userId: saved._id,
                email: saved.email,
                name: saved.name,
                role: saved.role,
            };
        } catch (error) {
            console.error('[UsersService] Erreur création utilisateur :', error);
            throw error;
        }
    }
}

