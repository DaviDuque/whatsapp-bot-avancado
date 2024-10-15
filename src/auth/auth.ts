import { AuthService } from '../infra/service/auth.service';
import { Request, Response } from 'express';

const authService = new AuthService();

export class Auth {
    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            const result = await authService.login(email, senha);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { nome, email, telefone, senha } = req.body;
            await authService.register(nome, email, telefone, senha);
            res.status(201).json({ message: 'Usuário registrado com sucesso' });
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token não fornecido' });
        }

        try {
            const decoded = authService.verifyRefreshToken(refreshToken);
            const user = { id_usuario: decoded }; // Apenas o id é necessário
            const newAccessToken = authService.generateAccessToken(user as any); // Gera um novo access token
            const newRefreshToken =  authService.generateRefreshToken(user as any); 

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        } catch (error) {
            return res.status(403).json({ message: 'Refresh token inválido' });
        }
    }
}


