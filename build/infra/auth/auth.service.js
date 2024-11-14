"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_connection_1 = require("../database/mysql-connection");
class AuthService {
    login(email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield mysql_connection_1.connection.query('SELECT id_usuario, email, senha FROM usuarios WHERE email = ?', [email]);
            const user = rows[0];
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            const isMatch = yield bcryptjs_1.default.compare(senha, user.senha);
            if (!isMatch) {
                throw new Error('Senha incorreta');
            }
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            delete rows[0].senha;
            delete rows[0].email;
            let usuario = rows[0];
            return { accessToken, refreshToken, usuario };
        });
    }
    register(nome, email, telefone, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(senha, 10);
            const result = yield mysql_connection_1.connection.query('INSERT INTO usuarios (nome, email, telefone, senha, data_cadastro, data_insert, data_update) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [nome, email, telefone, hashedPassword]);
            return result;
        });
    }
    user(id_usuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield mysql_connection_1.connection.query('SELECT id_usuario, nome, email, telefone, data_cadastro, data_insert, data_update FROM usuarios WHERE id_usuario = ?', [id_usuario]);
            const user = rows[0];
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            return { user };
        });
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id_usuario, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id_usuario }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '2d',
        });
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    }
}
exports.AuthService = AuthService;
