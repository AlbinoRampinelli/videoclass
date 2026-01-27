const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { cpf: '479.605.907-53' },
    update: {},
    create: {
      cpf: '479.605.907-53',
      name: 'Albino Rampinelli',
      email: "albino@dds.com.br",
      passwordHash: "$2b$10$CA0eWc4RRQ9hMOX78zwn6.iUgzHuwQ1pcMVvjmW50Q.L9eSDCMTpG",

    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());