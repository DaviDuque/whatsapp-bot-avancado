import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connection } from "../database/mysql-connection";

interface User {
    id_usuario: number;
    nome: string;
    email?: string;
    telefone?: string;
    senha: string;
    data_cadastro?: Date;
    data_insert?: Date;
    data_update?: Date;
}


export class AuthService {
   
        async login(email: string, senha: string) {
            const [rows]: any = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
            const user: User = rows[0];
    
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
    
            const isMatch = await bcrypt.compare(senha, user.senha);
    
            if (!isMatch) {
                throw new Error('Senha incorreta');
            }
    
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
    
            return { accessToken, refreshToken };
        }

    async register(nome: string, email: string, telefone: string, senha: string) {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await connection.query(
            'INSERT INTO usuarios (nome, email, telefone, senha, data_cadastro, data_insert, data_update) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())',
            [nome, email, telefone, hashedPassword]
        );

        return result;
    }

    generateAccessToken(user: User) {
        return jwt.sign({ id: user.id_usuario, nome: user.nome, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });
    }

    generateRefreshToken(user: User) {
        return jwt.sign({ id: user.id_usuario }, process.env.JWT_REFRESH_SECRET!, {
            expiresIn: '2d',
        });
    }

    verifyToken(token: string) {
        return jwt.verify(token, process.env.JWT_SECRET!);
    }

    verifyRefreshToken(token: string) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    }
}
