import { AppDataSource } from './datasource';
import * as argon2 from 'argon2';
import { UserRole, SubscriptionPlanType } from '@lms/shared-types';

const SUBSCRIPTION_PLANS = [
  {
    name: SubscriptionPlanType.FREE,
    description: 'Free plan with 2GB storage and up to 5 students.',
    price: 0,
    currency: 'egp',
    maxTotalStudents: 5,
    pricePerStudent: 0,
    baseStorageBytes: 2147483648, // 2 GB
    durationDays: 30,
    durationMonths: 1,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: SubscriptionPlanType.PRO,
    description: 'Pro plan with 10GB storage and up to 100 students.',
    price: 12000,
    currency: 'egp',
    maxTotalStudents: 100,
    pricePerStudent: 120,
    baseStorageBytes: 10737418240, // 10 GB
    durationDays: 180,
    durationMonths: 6,
    stripePriceId: process.env.STRIPE_PRICE_PRO || null,
    isActive: true,
  },
  {
    name: SubscriptionPlanType.PLUS,
    description: 'Plus plan with 10GB storage and up to 200 students.',
    price: 20000,
    currency: 'egp',
    maxTotalStudents: 200,
    pricePerStudent: 100,
    baseStorageBytes: 10737418240, // 10 GB
    durationDays: 180,
    durationMonths: 6,
    stripePriceId: process.env.STRIPE_PRICE_PLUS || null,
    isActive: true,
  },
  {
    name: SubscriptionPlanType.ENTERPRISE,
    description: 'Enterprise plan with 10GB storage and up to 500 students.',
    price: 35000,
    currency: 'egp',
    maxTotalStudents: 500,
    pricePerStudent: 70,
    baseStorageBytes: 10737418240, // 10 GB
    durationDays: 180,
    durationMonths: 6,
    stripePriceId: null,
    isActive: true,
  },
];

const STORAGE_PLANS = [
  { gigabytes: 10, pricePerGb: 15, totalPrice: 150, isActive: true },
  { gigabytes: 50, pricePerGb: 12, totalPrice: 600, isActive: true },
  { gigabytes: 100, pricePerGb: 10, totalPrice: 1000, isActive: true },
];

async function seed() {
  await AppDataSource.initialize();

  const email = process.env.ADMIN_EMAIL || 'admin@lms.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const firstName = process.env.ADMIN_FIRST_NAME || 'System';
  const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

  console.log(`Seeding admin user: ${email}`);

  const existingAdmin = await AppDataSource.query(
    `SELECT id FROM "user" WHERE email = $1`,
    [email],
  );

  if (existingAdmin.length > 0) {
    console.log('Admin user already exists.');
  } else {
    const hashedPassword = await argon2.hash(password);

    await AppDataSource.query(
      `INSERT INTO "user" (email, password, "firstName", "lastName", role, "isActive") VALUES ($1, $2, $3, $4, $5, $6)`,
      [email, hashedPassword, firstName, lastName, UserRole.ADMIN, true],
    );

    console.log('Admin user created successfully.');
  }

  // Seed subscription plans
  console.log('Seeding subscription plans...');

  for (const plan of SUBSCRIPTION_PLANS) {
    const existing = await AppDataSource.query(
      `SELECT id FROM subscription_plan WHERE name = $1`,
      [plan.name],
    );

    if (existing.length > 0) {
      console.log(`Plan "${plan.name}" already exists.`);
    } else {
      await AppDataSource.query(
        `INSERT INTO subscription_plan (name, description, price, currency, "maxTotalStudents", "pricePerStudent", "baseStorageBytes", "durationDays", "durationMonths", "stripePriceId", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.currency,
          plan.maxTotalStudents,
          plan.pricePerStudent,
          String(plan.baseStorageBytes),
          plan.durationDays,
          plan.durationMonths,
          plan.stripePriceId,
          plan.isActive,
        ],
      );
      console.log(`Plan "${plan.name}" created.`);
    }
  }

  // Seed storage plans
  console.log('Seeding storage plans...');

  for (const plan of STORAGE_PLANS) {
    const existing = await AppDataSource.query(
      `SELECT id FROM storage_plan WHERE gigabytes = $1`,
      [plan.gigabytes],
    );

    if (existing.length > 0) {
      console.log(`Storage Plan "${plan.gigabytes}GB" already exists.`);
    } else {
      await AppDataSource.query(
        `INSERT INTO storage_plan (gigabytes, "pricePerGb", "totalPrice", "isActive")
         VALUES ($1, $2, $3, $4)`,
        [
          plan.gigabytes,
          plan.pricePerGb,
          plan.totalPrice,
          plan.isActive,
        ],
      );
      console.log(`Storage Plan "${plan.gigabytes}GB" created.`);
    }
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
