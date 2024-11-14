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
exports.TranscriptionService = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
class TranscriptionService {
    constructor() {
        this.model = 'whisper-1';
        this.url = process.env.URL_OPENAI;
    }
    transcribe(audioPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const formData = new form_data_1.default();
            formData.append('file', fs_1.default.createReadStream(audioPath));
            formData.append('model', this.model);
            const response = yield axios_1.default.post(this.url, formData, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': `multipart/form-data;`,
                },
            });
            const retorno = Promise.resolve(response.data.text);
            console.log(">>>>>>>>>>>ponto 1 --> ", response.data);
            return retorno;
        });
    }
}
exports.TranscriptionService = TranscriptionService;
