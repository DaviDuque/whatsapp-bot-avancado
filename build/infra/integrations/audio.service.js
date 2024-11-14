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
exports.AudioService = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const axios_1 = __importDefault(require("axios"));
const util_1 = require("util");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const accountSid = process.env.TWILIO_ACCOUNT_SID || ' ';
const apiKeySecret = process.env.TWILIO_AUTH_TOKEN || ' ';
class AudioService {
    constructor() {
        this.audioLoaded = false;
        const name = (0, uuid_1.v4)();
        this.oggFileName = `${name}.ogg`;
        this.mp3FileName = `${name}.mp3`;
        this.oggFilePath = path_1.default.join(os_1.default.tmpdir(), this.oggFileName);
        this.mp3FilePath = path_1.default.join(os_1.default.tmpdir(), this.mp3FileName);
    }
    download(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(">>>>>>>>>>>>>>>>>>URL", url);
            const response = yield axios_1.default.get(url, { responseType: 'arraybuffer', auth: {
                    username: accountSid,
                    password: apiKeySecret,
                } });
            const audioBuffer = Buffer.from(response.data);
            yield writeFileAsync(this.oggFilePath, audioBuffer);
            this.audioLoaded = true;
            console.log("errrrr -->", response.data);
            if (!this.audioLoaded) {
                throw new Error('>>>>>>>>>>>>>Audio not loaded');
            }
            console.log(">>>>>>>>>>>>>>>>ponto 2", this.oggFilePath);
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(this.oggFilePath)
                    .output(this.mp3FilePath)
                    .on('end', () => {
                    resolve(this.mp3FilePath);
                })
                    .on('error', (err) => {
                    reject(err);
                })
                    .run();
            });
        });
    }
}
exports.AudioService = AudioService;
