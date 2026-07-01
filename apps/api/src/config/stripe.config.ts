import { registerAs } from "@nestjs/config";

export default registerAs("stripe", () => ({
  secretKey: process.env.STRIPE_SECRET_KEY || "placeholder",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "placeholder",
  pricePro: process.env.STRIPE_PRICE_PRO || "placeholder",
  pricePlus: process.env.STRIPE_PRICE_PLUS || "placeholder",
  priceStorageAddon: process.env.STRIPE_PRICE_STORAGE_ADDON || "placeholder",
}));
