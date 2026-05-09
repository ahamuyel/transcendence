import { z } from "zod"

// Subject — exige referência ao catálogo global
export const createSubjectSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  globalSubjectId: z.string().min(1, "Referência ao catálogo global é obrigatória"),
})
export const updateSubjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
})

// Course — exige referência ao catálogo global
export const createCourseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  globalCourseId: z.string().min(1, "Referência ao catálogo global é obrigatória"),
  subjectIds: z.array(z.string()).optional(),
})
export const updateCourseSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  subjectIds: z.array(z.string()).optional(),
})

// Class — academicYearId optional (API defaults to current year)
export const createClassSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(20, "Nome muito longo"),
  grade: z.number().int().min(1, "Classe deve ser entre 1 e 13").max(13, "Classe deve ser entre 1 e 13"),
  capacity: z.number().int().min(1, "Capacidade deve ser pelo menos 1").max(200, "Capacidade muito alta"),
  period: z.enum(["regular", "pos_laboral"]).optional(),
  courseId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
  academicYearId: z.string().optional().nullable(),
  globalClassId: z.string().optional().nullable(),
})
export const updateClassSchema = createClassSchema.partial()

// Lesson
export const createLessonSchema = z.object({
  day: z.string().min(1, "Dia é obrigatório"),
  startTime: z.string().min(1, "Hora de início é obrigatória"),
  endTime: z.string().min(1, "Hora de fim é obrigatória"),
  room: z.string().max(50, "Sala muito longa").optional().or(z.literal("")),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
  materials: z.array(z.object({
    title: z.string().min(1, "Título do material é obrigatório"),
    url: z.string().url("URL inválida"),
    type: z.string().optional(),
  })).optional().nullable(),
})
export const updateLessonSchema = createLessonSchema.partial()

// Lesson Attendance
export const createLessonAttendanceSchema = z.object({
  lessonId: z.string().min(1, "Aula é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["presente", "ausente", "atrasado"]),
  })).min(1, "É necessário pelo menos um registo"),
})

// Exam
export const createExamSchema = z.object({
  title: z.string().max(200, "Título muito longo").optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
})
export const updateExamSchema = createExamSchema.partial()

// Assignment
export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().min(1, "Data de entrega é obrigatória"),
  maxScore: z.number().min(1).max(100).optional(),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  teacherId: z.string().min(1, "Professor é obrigatório"),
})
export const updateAssignmentSchema = createAssignmentSchema.partial()

// Submission
export const createSubmissionSchema = z.object({
  content: z.string().optional().or(z.literal("")),
  attachmentUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

// Evaluate Submission
export const evaluateSubmissionSchema = z.object({
  score: z.number().min(0, "Nota deve ser >= 0").max(20, "Nota deve ser <= 20"),
  feedback: z.string().optional().or(z.literal("")),
})

// Result
export const createResultSchema = z.object({
  score: z.number().min(0, "Nota deve ser >= 0").max(20, "Nota deve ser <= 20"),
  type: z.string().min(1, "Tipo é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  studentId: z.string().min(1, "Aluno é obrigatório"),
  subjectId: z.string().min(1, "Disciplina é obrigatória"),
  examId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
  trimester: z.enum(["primeiro", "segundo", "terceiro"]).optional().nullable(),
  academicYear: z.string().optional().nullable(),
})
export const updateResultSchema = createResultSchema.partial()

// Attendance
export const createAttendanceSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  classId: z.string().min(1, "Turma é obrigatória"),
  lessonId: z.string().optional().nullable(),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["presente", "ausente", "atrasado"]),
  })).min(1, "É necessário pelo menos um registo"),
})
export const updateAttendanceStatusSchema = z.object({
  status: z.enum(["presente", "ausente", "atrasado"]),
})

// Message
export const createMessageSchema = z.object({
  subject: z.string().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  body: z.string().min(1, "Mensagem é obrigatória"),
  toId: z.string().optional().nullable(),
  toAll: z.boolean().optional(),
})
export const updateMessageSchema = z.object({
  read: z.boolean(),
})

// Announcement
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  priority: z.enum(["informativo", "importante", "urgente"]).optional(),
  classId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  targetUserId: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
})
export const updateAnnouncementSchema = createAnnouncementSchema.partial()
