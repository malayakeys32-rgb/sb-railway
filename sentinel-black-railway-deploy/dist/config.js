"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT ?? "4000", 10),
    jwtSecret: process.env.JWT_SECRET ?? "fallback_dev_secret",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? "100", 10),
};
