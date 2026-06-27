import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT || "5000", 10),
  apiUrl: process.env.API_URL,
  webUrl: process.env.WEB_URL,
  adminUrl: process.env.ADMIN_URL,
  frontendUrl: process.env.FRONTEND_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    : [process.env.WEB_URL, process.env.ADMIN_URL],
}));
