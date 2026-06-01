-- ============================================================
-- Backfill: Migração de dados existentes para o novo schema
-- Executar APÓS a migração Prisma (prisma migrate dev)
-- ============================================================

-- 1. Criar AcademicYear records a partir de Result.academicYear (string) distintos
-- Isto cria anos letivos para escolas que já têm resultados registados
INSERT INTO "AcademicYear" (id, name, "startDate", "endDate", "isCurrent", status, "schoolId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  r."academicYear",
  make_date(CAST(split_part(r."academicYear", '/', 1) AS int), 9, 1),
  make_date(CAST(split_part(r."academicYear", '/', 2) AS int), 7, 31),
  false,
  'encerrado'::"AcademicYearStatus",
  r."schoolId",
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT "academicYear", "schoolId"
  FROM "Result"
  WHERE "academicYear" IS NOT NULL
    AND "academicYear" ~ '^\d{4}/\d{4}$'
    AND "academicYearId" IS NULL
) r
WHERE NOT EXISTS (
  SELECT 1 FROM "AcademicYear" ay
  WHERE ay.name = r."academicYear" AND ay."schoolId" = r."schoolId"
);

-- 2. Preencher Result.academicYearId via match do nome
UPDATE "Result" r
SET "academicYearId" = ay.id
FROM "AcademicYear" ay
WHERE r."academicYear" = ay.name
  AND r."schoolId" = ay."schoolId"
  AND r."academicYearId" IS NULL;

-- 3. Preencher Class.academicYearId com o ano mais recente da escola
UPDATE "Class" c
SET "academicYearId" = sub.year_id
FROM (
  SELECT DISTINCT ON ("schoolId") id AS year_id, "schoolId"
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
) sub
WHERE c."schoolId" = sub."schoolId"
  AND c."academicYearId" IS NULL;

-- 4. Preencher Lesson.academicYearId
UPDATE "Lesson" l
SET "academicYearId" = sub.year_id
FROM (
  SELECT DISTINCT ON ("schoolId") id AS year_id, "schoolId"
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
) sub
WHERE l."schoolId" = sub."schoolId"
  AND l."academicYearId" IS NULL;

-- 5. Preencher Exam.academicYearId
UPDATE "Exam" e
SET "academicYearId" = sub.year_id
FROM (
  SELECT DISTINCT ON ("schoolId") id AS year_id, "schoolId"
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
) sub
WHERE e."schoolId" = sub."schoolId"
  AND e."academicYearId" IS NULL;

-- 6. Preencher Assignment.academicYearId
UPDATE "Assignment" a
SET "academicYearId" = sub.year_id
FROM (
  SELECT DISTINCT ON ("schoolId") id AS year_id, "schoolId"
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
) sub
WHERE a."schoolId" = sub."schoolId"
  AND a."academicYearId" IS NULL;

-- 7. Preencher Attendance.academicYearId
UPDATE "Attendance" at
SET "academicYearId" = sub.year_id
FROM (
  SELECT DISTINCT ON ("schoolId") id AS year_id, "schoolId"
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
) sub
WHERE at."schoolId" = sub."schoolId"
  AND at."academicYearId" IS NULL;

-- 8. Marcar o ano mais recente de cada escola como isCurrent
UPDATE "AcademicYear" ay
SET "isCurrent" = true, status = 'aberto'::"AcademicYearStatus"
WHERE ay.id IN (
  SELECT DISTINCT ON ("schoolId") id
  FROM "AcademicYear"
  ORDER BY "schoolId", "endDate" DESC
);

-- 9. Verificação: contar registos ainda sem academicYearId
SELECT 'Results sem academicYearId' AS check_name, COUNT(*) AS count
FROM "Result" WHERE "academicYearId" IS NULL
UNION ALL
SELECT 'Classes sem academicYearId', COUNT(*)
FROM "Class" WHERE "academicYearId" IS NULL
UNION ALL
SELECT 'Lessons sem academicYearId', COUNT(*)
FROM "Lesson" WHERE "academicYearId" IS NULL
UNION ALL
SELECT 'Exams sem academicYearId', COUNT(*)
FROM "Exam" WHERE "academicYearId" IS NULL;
