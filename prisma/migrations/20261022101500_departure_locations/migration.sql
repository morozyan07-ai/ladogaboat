-- Редактируемый из админ-панели список причалов отправления.
-- Раньше список был зашит в коде форм добавления/редактирования катера —
-- теперь живёт в таблице, админ может добавлять/удалять причалы без деплоя.

CREATE TABLE "DepartureLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DepartureLocation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DepartureLocation_name_key" ON "DepartureLocation"("name");

-- Переносим текущий зашитый в коде список, чтобы ничего не потерялось.
INSERT INTO "DepartureLocation" ("id", "name") VALUES
  (gen_random_uuid()::text, 'Набережная Ладожской Флотилии, 5А'),
  (gen_random_uuid()::text, 'Причал Маяк/Сердоболь, Ленина, 1'),
  (gen_random_uuid()::text, 'Валаамский причал, Валаамская, 1'),
  (gen_random_uuid()::text, 'Причал Фанерный тупик'),
  (gen_random_uuid()::text, 'Центральный пирс Лахденпохья')
ON CONFLICT ("name") DO NOTHING;
