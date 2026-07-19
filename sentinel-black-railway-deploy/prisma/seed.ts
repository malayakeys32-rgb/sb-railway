import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });

  if (existingUser) {
    console.log("Test user already exists");
    return;
  }

  // Create test user with password "password123"
  const hashedPassword = await bcrypt.hash("password123", 10);

  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "ADMIN",
    },
  });

  console.log("Test user created:", testUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

