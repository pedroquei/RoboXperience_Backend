import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { UploadService } from './UploadService';

export class UserService {
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePictureUrl: true,
                createdAt: true,
            }
        });

        if (!user) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        return user;
    }

    async changePassword(userId: string, data: any) {
        const { currentPassword, newPassword } = data;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('SENHA_ATUAL_INCORRETA');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { message: 'Senha atualizada com sucesso' };
    }

    async updateProfile(userId: string, data: { name?: string; profilePictureUrl?: string }) {
        const { name, profilePictureUrl } = data;

        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        const dataToUpdate: any = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (profilePictureUrl !== undefined) {
            dataToUpdate.profilePictureUrl = profilePictureUrl;

            // Se a foto mudou e existia uma foto antiga, apaga a antiga
            if (profilePictureUrl !== existingUser.profilePictureUrl && existingUser.profilePictureUrl) {
                const uploadService = new UploadService();
                await uploadService.deleteFile(existingUser.profilePictureUrl);
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePictureUrl: true,
                createdAt: true,
            }
        });

        return user;
    }
}
