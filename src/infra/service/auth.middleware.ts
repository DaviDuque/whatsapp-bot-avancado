import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
   
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.user = decoded; // Aqui você pode acessar os dados do usuário autenticado
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};
