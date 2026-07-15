import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: process.env.JWT_SECRET ?? "fallback_dev_secret",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? "100", 10),
};
