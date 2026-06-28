import { AppDataSource } from './datasource';
import * as argon2 from 'argon2';
import { UserRole, SubscriptionPlanType } from '@lms/shared-types';

const SUBSCRIPTION_PLANS = [
  {
    name: SubscriptionPlanType.FREE,
    description: 'Free plan with 90-day trial. Includes 3 courses, 30 students per course, and 500MB storage.',
    price: 0,
    currency: 'usd',
    maxCourses: 3,
    maxStudentsPerCourse: 30,
    maxStorageBytes: 524288000, // 500 MB
    trialDays: 90,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: SubscriptionPlanType.PRO,
    description: 'Pro plan for serious educators. Includes 10 courses, 100 students per course, and 5GB storage.',
    price: 2900,
    currency: 'usd',
    maxCourses: 10,
    maxStudentsPerCourse: 100,
    maxStorageBytes: 5368709120, // 5 GB
    trialDays: 0,
    stripePriceId: process.env.STRIPE_PRICE_PRO || null,
    isActive: true,
  },
  {
    name: SubscriptionPlanType.PLUS,
    description: 'Plus plan for institutions. Unlimited courses, unlimited students, and 50GB storage.',
    price: 9900,
    currency: 'usd',
    maxCourses: 0,
    maxStudentsPerCourse: 0,
    maxStorageBytes: 53687091200, // 50 GB
    trialDays: 0,
    stripePriceId: process.env.STRIPE_PRICE_PLUS || null,
    isActive: true,
  },
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
        `INSERT INTO subscription_plan (name, description, price, currency, "maxCourses", "maxStudentsPerCourse", "maxStorageBytes", "trialDays", "stripePriceId", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.currency,
          plan.maxCourses,
          plan.maxStudentsPerCourse,
          String(plan.maxStorageBytes),
          plan.trialDays,
          plan.stripePriceId,
          plan.isActive,
        ],
      );
      console.log(`Plan "${plan.name}" created.`);
    }
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
