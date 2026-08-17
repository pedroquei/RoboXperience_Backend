import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export class AuthService {
    async register(data: any) {
        const { name, email, password } = data;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new Error('EMAIL_JA_EM_USO');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, passwordHash },
        });

        // Retorna o usuário sem a senha para segurança
        return { id: newUser.id, name: newUser.name, email: newUser.email };
    }

    async login(data: any) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: { id: user.id, name: user.name, role: user.role, profilePictureUrl: user.profilePictureUrl }
        };
    }
}