import { AppDataSource } from './datasource';
import * as argon2 from 'argon2';
import { UserRole } from '@lms/shared-types';
import { EGYPTIAN_UNIVERSITIES_SEED } from './seeds/universities.seed';
import { CATEGORIES_SEED } from './seeds/categories.seed';

const STORAGE_PLANS_SEED = [
  {
    name: '10 GB Expansion',
    nameAr: 'باقة توسعة 10 جيجابايت',
    gigabytes: 10,
    price: 150,
    currency: 'egp',
    durationDays: 90, // 3 months
    isActive: true,
  },
  {
    name: '25 GB Expansion',
    nameAr: 'باقة توسعة 25 جيجابايت',
    gigabytes: 25,
    price: 320,
    currency: 'egp',
    durationDays: 90, // 3 months
    isActive: true,
  },
  {
    name: '50 GB Expansion',
    nameAr: 'باقة توسعة 50 جيجابايت',
    gigabytes: 50,
    price: 550,
    currency: 'egp',
    durationDays: 90, // 3 months
    isActive: true,
  },
  {
    name: '100 GB Expansion',
    nameAr: 'باقة توسعة 100 جيجابايت',
    gigabytes: 100,
    price: 950,
    currency: 'egp',
    durationDays: 90, // 3 months
    isActive: true,
  },
];

async function seed() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();

  // 1. Seed Admin User
  const email = process.env.ADMIN_EMAIL || 'admin@lms.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const firstName = process.env.ADMIN_FIRST_NAME || 'System';
  const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

  console.log(`Checking admin user: ${email}`);
  const existingAdmin = await AppDataSource.query(
    `SELECT id FROM "user" WHERE email = $1`,
    [email],
  );

  if (existingAdmin.length > 0) {
    console.log('Admin user already exists.');
  } else {
    const hashedPassword = await argon2.hash(password);
    await AppDataSource.query(
      `INSERT INTO "user" (id, email, password, "firstName", "lastName", role, "isActive", "isEmailVerified", "storageQuotaBytes")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
      [email, hashedPassword, firstName, lastName, UserRole.ADMIN, true, true, '5368709120'],
    );
    console.log('Admin user created successfully.');
  }

  // 2. Seed Egyptian Universities
  console.log('Seeding Egyptian universities...');
  for (const uni of EGYPTIAN_UNIVERSITIES_SEED) {
    const existing = await AppDataSource.query(
      `SELECT id FROM universities WHERE name = $1`,
      [uni.name],
    );

    if (existing.length > 0) {
      console.log(`University "${uni.name}" already exists.`);
    } else {
      await AppDataSource.query(
        `INSERT INTO universities (id, name, "nameAr", faculties, "isActive")
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [uni.name, uni.nameAr, JSON.stringify(uni.faculties), true],
      );
      console.log(`University "${uni.name}" created.`);
    }
  }

  // 3. Seed Course Categories
  console.log('Seeding course categories...');
  for (const cat of CATEGORIES_SEED) {
    const existing = await AppDataSource.query(
      `SELECT id FROM categories WHERE slug = $1`,
      [cat.slug],
    );

    if (existing.length > 0) {
      console.log(`Category "${cat.name}" already exists.`);
    } else {
      await AppDataSource.query(
        `INSERT INTO categories (id, name, "nameAr", slug, "isActive")
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [cat.name, cat.nameAr, cat.slug, true],
      );
      console.log(`Category "${cat.name}" created.`);
    }
  }

  // 4. Seed Storage Expansion Plans (3-month validity)
  console.log('Seeding 3-month storage expansion plans...');
  for (const plan of STORAGE_PLANS_SEED) {
    const existing = await AppDataSource.query(
      `SELECT id FROM storage_plans WHERE name = $1`,
      [plan.name],
    );

    if (existing.length > 0) {
      console.log(`Storage plan "${plan.name}" already exists.`);
    } else {
      await AppDataSource.query(
        `INSERT INTO storage_plans (id, name, "nameAr", gigabytes, price, currency, "durationDays", "isActive")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
        [
          plan.name,
          plan.nameAr,
          plan.gigabytes,
          plan.price,
          plan.currency,
          plan.durationDays,
          plan.isActive,
        ],
      );
      console.log(`Storage plan "${plan.name}" created.`);
    }
  }

  // 5. Seed System Configuration (Fixed platform commission)
  console.log('Seeding platform commission settings...');
  const existingConfig = await AppDataSource.query(
    `SELECT id FROM system_config WHERE key = $1`,
    ['platform_commission_fixed_amount'],
  );

  if (existingConfig.length > 0) {
    console.log('Platform fixed commission config already exists.');
  } else {
    await AppDataSource.query(
      `INSERT INTO system_config (id, key, value, description)
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      [
        'platform_commission_fixed_amount',
        '20',
        'Fixed platform commission fee in EGP charged per student course purchase',
      ],
    );
    console.log('Platform fixed commission config set to 20 EGP.');
  }

  await AppDataSource.destroy();
  console.log('✅ Database seeding finished successfully.');
}

seed().catch((error) => {
  console.error('Failed to run seed:', error);
  process.exit(1);
});
