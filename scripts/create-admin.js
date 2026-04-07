const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL atau ADMIN_PASSWORD belum di atur di .env");
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat atau Update akun admin
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Administrator",
      email: email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Sukses! Akun Admin dibuat atau diperbarui dengan email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
