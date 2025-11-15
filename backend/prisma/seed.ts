import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Seed default country configurations
  const countries = [
    {
      countryCode: 'MY',
      countryName: 'Malaysia',
      apiProvider: 'myinvois',
      apiBaseUrl: 'https://api.myinvois.hasil.gov.my',
      xmlFormat: 'UBL-MY',
      currency: 'MYR',
      standardTaxRate: 10,
      reducedTaxRate: 6,
      requiresTaxId: true,
      requiresRegNumber: false,
    },
    {
      countryCode: 'SA',
      countryName: 'Saudi Arabia',
      apiProvider: 'zatca',
      apiBaseUrl: 'https://gw-fatoora.zatca.gov.sa/e-invoicing',
      xmlFormat: 'UBL-SA',
      currency: 'SAR',
      standardTaxRate: 15,
      requiresTaxId: true,
      requiresRegNumber: true,
    },
    {
      countryCode: 'US',
      countryName: 'United States',
      apiProvider: 'mock',
      xmlFormat: 'UBL-US',
      currency: 'USD',
      standardTaxRate: 8.5,
      reducedTaxRate: 5,
      requiresTaxId: true,
      requiresRegNumber: false,
    },
    {
      countryCode: 'PL',
      countryName: 'Poland',
      apiProvider: 'ksef',
      apiBaseUrl: 'https://ksef.mf.gov.pl',
      xmlFormat: 'FA_VAT',
      currency: 'PLN',
      standardTaxRate: 23,
      reducedTaxRate: 8,
      requiresTaxId: true,
      requiresRegNumber: true,
    },
    {
      countryCode: 'RO',
      countryName: 'Romania',
      apiProvider: 'efactura',
      apiBaseUrl: 'https://e-factura.anaf.ro',
      xmlFormat: 'UBL-RO',
      currency: 'RON',
      standardTaxRate: 19,
      reducedTaxRate: 9,
      requiresTaxId: true,
      requiresRegNumber: true,
    },
  ];

  for (const country of countries) {
    await prisma.countryConfig.upsert({
      where: { countryCode: country.countryCode },
      update: {},
      create: country,
    });
    console.log(`✅ Country added: ${country.countryName}`);
  }

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📝 Super Admin Credentials:');
  console.log('   Email: admin@admin.com');
  console.log('   Password: Admin123!');
  console.log('   Role: SUPER_ADMIN');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

