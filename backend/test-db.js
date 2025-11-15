require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL from .env:', process.env.DATABASE_URL);
console.log('Attempting to connect...');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log('PostgreSQL version:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

