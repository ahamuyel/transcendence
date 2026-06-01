// Features enabled by default for new schools (core functionality)
export const DEFAULT_ENABLED_FEATURES = [
  "students",
  "teachers",
  "parents",
  "classes",
  "subjects",
  "courses",
  "attendance",
  "announcements",
  "basicGrades",
  "yearTransition",
  "calendar",
] as const

// All available features
export const ALL_FEATURES = [
  "students",
  "teachers",
  "parents",
  "classes",
  "subjects",
  "courses",
  "attendance",
  "announcements",
  "basicGrades",
  "finances",
  "submissions",
  "portfolio",
  "certificates",
  "advancedReports",
  "inventory",
  "calendar",
  "internalMessages",
  "evaluationEngine",
  "yearTransition",
  "globalCatalog",
  "academicHistory",
] as const

export type FeatureKey = (typeof ALL_FEATURES)[number]

export const featureLabels: Record<FeatureKey, string> = {
  students: "Alunos",
  teachers: "Professores",
  parents: "Encarregados",
  classes: "Turmas",
  subjects: "Disciplinas",
  courses: "Cursos",
  attendance: "Assiduidade",
  announcements: "Avisos",
  basicGrades: "Notas e Resultados",
  finances: "Finanças",
  submissions: "Submissões de Tarefas",
  portfolio: "Portfólio",
  certificates: "Certificados",
  advancedReports: "Relatórios Avançados",
  inventory: "Inventário",
  calendar: "Calendário e Aulas",
  internalMessages: "Mensagens Internas",
  evaluationEngine: "Motor de Avaliação",
  yearTransition: "Transição de Ano",
  globalCatalog: "Catálogo Global",
  academicHistory: "Histórico Académico",
}

// Default features for new schools
export function getDefaultFeatures(): Record<string, boolean> {
  const features: Record<string, boolean> = {}
  ALL_FEATURES.forEach((f) => {
    features[f] = (DEFAULT_ENABLED_FEATURES as readonly string[]).includes(f)
  })
  return features
}

// Check if a feature is enabled for a school
export function isFeatureEnabled(
  schoolFeatures: Record<string, boolean> | null | undefined,
  feature: FeatureKey
): boolean {
  // If no features config, use defaults
  if (!schoolFeatures) {
    return (DEFAULT_ENABLED_FEATURES as readonly string[]).includes(feature)
  }
  // If feature key is missing from stored config, fall back to default
  if (schoolFeatures[feature] === undefined) {
    return (DEFAULT_ENABLED_FEATURES as readonly string[]).includes(feature)
  }
  return schoolFeatures[feature] === true
}

// Feature descriptions for admin UI
export const featureDescriptions: Record<FeatureKey, string> = {
  students: "Gestão de alunos, matrículas e perfis",
  teachers: "Gestão de professores e atribuições",
  parents: "Gestão de encarregados de educação",
  classes: "Gestão de turmas, classes e períodos",
  subjects: "Gestão de disciplinas",
  courses: "Gestão de cursos",
  attendance: "Registo e controlo de assiduidade",
  announcements: "Avisos e comunicações à comunidade escolar",
  basicGrades: "Registo de notas, exames e resultados",
  finances: "Gestão financeira, propinas e pagamentos",
  submissions: "Submissão e avaliação de trabalhos",
  portfolio: "Portfólio académico do aluno",
  certificates: "Emissão de certificados e declarações",
  advancedReports: "Relatórios analíticos avançados",
  inventory: "Gestão de inventário e recursos",
  calendar: "Calendário escolar e horários de aulas",
  internalMessages: "Sistema de mensagens internas",
  evaluationEngine: "Motor de avaliação configurável",
  yearTransition: "Transição de ano letivo",
  globalCatalog: "Catálogo global de disciplinas/cursos",
  academicHistory: "Histórico académico e portabilidade",
}

// Reverse map: feature → affected menu items
export const featureMenuItems: Record<FeatureKey, string[]> = {
  students: ["Alunos"],
  teachers: ["Professores"],
  parents: ["Encarregados"],
  classes: ["Turmas"],
  subjects: ["Disciplinas"],
  courses: ["Cursos"],
  attendance: ["Assiduidade"],
  announcements: ["Avisos"],
  basicGrades: ["Provas", "Resultados", "Tarefas"],
  finances: [],
  submissions: ["Tarefas"],
  portfolio: [],
  certificates: [],
  advancedReports: [],
  inventory: [],
  calendar: ["Aulas"],
  internalMessages: ["Mensagens"],
  evaluationEngine: [],
  yearTransition: [],
  globalCatalog: [],
  academicHistory: [],
}

// Map menu paths to features
export const menuFeatureMap: Record<string, FeatureKey | undefined> = {
  "/list/students": "students",
  "/list/teachers": "teachers",
  "/list/parents": "parents",
  "/list/classes": "classes",
  "/list/subjects": "subjects",
  "/list/courses": "courses",
  "/list/attendance": "attendance",
  "/list/announcements": "announcements",
  "/list/results": "basicGrades",
  "/list/exams": "basicGrades",
  "/list/assignments": "submissions",
  "/list/messages": "internalMessages",
  "/list/lessons": "calendar",
  "/list/academic-years": "yearTransition",
  "/list/evaluation": "evaluationEngine",
  "/list/recurso": "evaluationEngine",
  "/settings/grading": "evaluationEngine",
}
