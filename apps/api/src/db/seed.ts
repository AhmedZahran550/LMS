import { AppDataSource } from './datasource';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@lms/shared-types';

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Using raw query since entity might not be fully available during initial seed
    // Or we could import User entity if we create it first
    await AppDataSource.query(
      `INSERT INTO "user" (email, password, "firstName", "lastName", role, "isActive") VALUES ($1, $2, $3, $4, $5, $6)`,
      [email, hashedPassword, firstName, lastName, UserRole.ADMIN, true],
    );

    console.log('Admin user created successfully.');
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
