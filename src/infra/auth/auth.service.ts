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
            const [rows]: any = await connection.query('SELECT id_usuario, email, senha FROM usuarios WHERE email = ?', [email]);
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
            delete rows[0].senha;
            delete rows[0].email;
            let usuario = rows[0];
            return { accessToken, refreshToken , usuario};
        }

    async register(nome: string, email: string, telefone: string, senha: string) {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await connection.query(
            'INSERT INTO usuarios (nome, email, telefone, senha, data_cadastro, data_insert, data_update) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())',
            [nome, email, telefone, hashedPassword]
        );

        return result;
    }

    async user(id_usuario: number) {
        const rows: any = await connection.query('SELECT id_usuario, nome, email, telefone, data_cadastro, data_insert, data_update FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        const user: User = rows[0];

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return { user };
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
