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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const auth_service_1 = require("./auth.service");
const authService = new auth_service_1.AuthService();
class Auth {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, senha } = req.body;
                const result = yield authService.login(email, senha);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ message: error });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nome, email, telefone, senha } = req.body;
                yield authService.register(nome, email, telefone, senha);
                res.status(201).json({ message: 'Usuário registrado com sucesso' });
            }
            catch (error) {
                res.status(400).json({ message: error });
            }
        });
    }
    user(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("entrou>>>>", req.params);
            try {
                const id_usuario = parseInt(req.params.id_usuario);
                const result = yield authService.user(id_usuario);
                res.status(200).json(result);
            }
            catch (error) {
                console.log("error>>>>", error);
                res.status(400).json({ message: error });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token não fornecido' });
            }
            try {
                const decoded = authService.verifyRefreshToken(refreshToken);
                const user = { id_usuario: decoded }; // Apenas o id é necessário
                const newAccessToken = authService.generateAccessToken(user); // Gera um novo access token
                const newRefreshToken = authService.generateRefreshToken(user);
                res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            }
            catch (error) {
                return res.status(403).json({ message: 'Refresh token inválido' });
            }
        });
    }
}
exports.Auth = Auth;
