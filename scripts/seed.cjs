// Тестовые данные, чтобы сразу увидеть карточки на главной странице.
// Запуск: node --env-file=.env.local scripts/seed.cjs
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const projects = [
  {
    title: "Офисные площади, 200 кв.м.",
    description:
      "Современный офисный блок в бизнес-центре класса А, район Подол. Долгосрочный арендатор уже найден.",
    location: "Киев, Подол",
    photoUrl: null,
    totalAmount: "50000.00",
    minInvestment: "100.00",
    roiPercent: "18.00",
    durationMonths: 12,
    status: "ACTIVE",
  },
  {
    title: "Складской комплекс, 1000 кв.м.",
    description:
      "Логистический склад рядом с объездной дорогой. Высокий спрос со стороны e-commerce компаний.",
    location: "Киевская область, Бровары",
    photoUrl: null,
    totalAmount: "120000.00",
    minInvestment: "200.00",
    roiPercent: "22.00",
    durationMonths: 18,
    status: "ACTIVE",
  },
  {
    title: "Жильё под аренду, 3 квартиры",
    description:
      "Три однокомнатные квартиры в новостройке для долгосрочной аренды студентам и молодым специалистам.",
    location: "Львов, центр",
    photoUrl: null,
    totalAmount: "75000.00",
    minInvestment: "100.00",
    roiPercent: "15.00",
    durationMonths: 9,
    status: "FUNDED",
  },
];

async function main() {
  for (const data of projects) {
    const existing = await prisma.project.findFirst({
      where: { title: data.title },
    });
    if (existing) {
      console.log(`Уже есть: ${data.title}`);
      continue;
    }
    const created = await prisma.project.create({ data });
    console.log(`Создан: ${created.title} (${created.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
