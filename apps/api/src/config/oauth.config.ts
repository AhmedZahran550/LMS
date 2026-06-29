import { registerAs } from "@nestjs/config";

export default registerAs("oauth", () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback",
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || "placeholder",
    appSecret: process.env.FACEBOOK_APP_SECRET || "placeholder",
    callbackUrl:
      process.env.FACEBOOK_CALLBACK_URL ||
      "http://localhost:5000/api/auth/facebook/callback",
  },
}));
