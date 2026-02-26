import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'CLIENT', description: 'Клиент: заказы, загрузка моделей, история заказов, профиль, программа лояльности' },
    { name: 'MANAGER', description: 'Менеджер: управление заказами, коммуникации, базовая CRM' },
    { name: 'ENGINEER', description: 'Инженер/технолог: производственная очередь, планирование, статусы, факт по печати' },
    { name: 'ADMIN', description: 'Администратор: пользователи, роли, тарифы, материалы, оборудование, аналитика, интеграции' },
    { name: 'PARTNER', description: 'Партнёр: свои модели/товары, заказы по ним, отчётность' },
  ];

  console.log('Seeding roles...');

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log('Roles seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
