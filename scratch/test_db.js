
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding geog columns...");
    await prisma.$executeRaw`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326)`;
    await prisma.$executeRaw`ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326)`;
    await prisma.$executeRaw`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326)`;
    console.log("Columns added successfully!");
  } catch (err) {
    console.error("FAILED to add columns:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
