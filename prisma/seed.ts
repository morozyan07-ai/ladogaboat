import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ladoga.ru" },
    update: {},
    create: {
      email: "admin@ladoga.ru",
      passwordHash,
      name: "Администратор",
      role: "ADMIN",
      phone: "+7 (800) 555-35-35",
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@ladoga.ru" },
    update: {},
    create: {
      email: "owner1@ladoga.ru",
      passwordHash,
      name: "Андрей Волков",
      role: "OWNER",
      phone: "+7 (921) 123-45-67",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@ladoga.ru" },
    update: {},
    create: {
      email: "owner2@ladoga.ru",
      passwordHash,
      name: "Наталья Морозова",
      role: "OWNER",
      phone: "+7 (911) 987-65-43",
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@ladoga.ru" },
    update: {},
    create: {
      email: "guest@ladoga.ru",
      passwordHash,
      name: "Иван Петров",
      role: "GUEST",
      phone: "+7 (950) 321-00-11",
    },
  });

  const boat1 = await prisma.boat.create({
    data: {
      ownerId: owner1.id,
      title: "Катер «Северный ветер»",
      description:
        "Комфортабельный моторный катер для прогулок по Ладожскому озеру. Оборудован навигацией, спасательными жилетами и мангалом на борту. Подходит для рыбалки и отдыха на островах.",
      capacity: 8,
      pricePerDay: 12000,
      location: "Приозерск",
      routes: [
        "Приозерск — острова Ладожских шхер",
        "Приозерск — Сортавала",
        "Рыбалка на Ладоге",
      ],
      images: ["/boats/boat1-1.jpg", "/boats/boat1-2.jpg"],
      status: "ACTIVE",
    },
  });

  const boat2 = await prisma.boat.create({
    data: {
      ownerId: owner1.id,
      title: "Яхта «Ладожская звезда»",
      description:
        "Парусная яхта класса «крейсер» для многодневных путешествий. Есть каюты для ночёвки, кухня, санузел. Идеально для длительных экспедиций вдоль берегов Ладоги.",
      capacity: 6,
      pricePerDay: 18000,
      location: "Сортавала",
      routes: [
        "Сортавала — Валаам",
        "Сортавала — Питкяранта",
        "Кругосветка Ладожских шхер",
      ],
      images: ["/boats/boat2-1.jpg", "/boats/boat2-2.jpg"],
      status: "ACTIVE",
    },
  });

  const boat3 = await prisma.boat.create({
    data: {
      ownerId: owner2.id,
      title: "Моторная лодка «Тихая гавань»",
      description:
        "Небольшая манёвренная лодка для рыбалки и прогулок в прибрежной зоне. Отличный вариант для небольшой компании или семьи с детьми.",
      capacity: 4,
      pricePerDay: 5500,
      location: "Шлиссельбург",
      routes: [
        "Шлиссельбург — крепость Орешек",
        "Рыбалка у истока Невы",
        "Прогулка по Неве",
      ],
      images: ["/boats/boat3-1.jpg"],
      status: "ACTIVE",
    },
  });

  // Доступность на июль 2026
  const availabilityData = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(2026, 6, d); // July 2026
    if (date.getMonth() !== 6) break;
    availabilityData.push({ boatId: boat1.id, date, available: d !== 10 && d !== 11 });
    availabilityData.push({ boatId: boat2.id, date, available: d < 5 || d > 12 });
    availabilityData.push({ boatId: boat3.id, date, available: true });
  }
  await prisma.availability.createMany({ data: availabilityData });

  // Бронирование
  const booking = await prisma.booking.create({
    data: {
      boatId: boat1.id,
      guestId: guest.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-03"),
      totalPrice: 24000,
      commission: 2400,
      status: "COMPLETED",
    },
  });

  // Отзыв
  await prisma.review.create({
    data: {
      bookingId: booking.id,
      boatId: boat1.id,
      guestId: guest.id,
      rating: 5,
      comment:
        "Отличная поездка! Катер в идеальном состоянии, Андрей очень приветливый хозяин. Побывали на Ладожских шхерах — виды невероятные. Обязательно вернёмся!",
    },
  });

  console.log("✓ Пользователи:", admin.email, owner1.email, owner2.email, guest.email);
  console.log("✓ Лодки:", boat1.title, boat2.title, boat3.title);
  console.log("✓ Доступность:", availabilityData.length, "записей");
  console.log("✓ Бронирование и отзыв созданы");
  console.log("\nТестовые аккаунты (пароль для всех: password123):");
  console.log("  admin@ladoga.ru — Администратор");
  console.log("  owner1@ladoga.ru — Владелец лодок");
  console.log("  owner2@ladoga.ru — Владелец лодки");
  console.log("  guest@ladoga.ru — Гость");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
