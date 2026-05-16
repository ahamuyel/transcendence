import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Presentation,
  Calendar,
  FileText,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  UserPlus,
  CalendarRange,
  Calculator,
  Scale,
  UserRound,
  UserCheck,
  Inbox,
  ShieldCheck,
  CircleUser,
  Settings,
  LifeBuoy,
  HelpCircle,
  Upload,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react"
import type { FeatureKey } from "./features"

export type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent"

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  roles: UserRole[]
  permission?: string
  feature?: FeatureKey
  badge?: () => number
  children?: Omit<NavItem, "children">[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        icon: LayoutDashboard,
        label: "Início",
        href: "/dashboard",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "Gestão Académica",
    items: [
      {
        icon: Users,
        label: "Alunos",
        href: "/list/students",
        roles: ["school_admin", "teacher"],
        permission: "canManageStudents",
      },
      {
        icon: UserRound,
        label: "Professores",
        href: "/list/teachers",
        roles: ["school_admin", "teacher"],
        permission: "canManageTeachers",
      },
      {
        icon: UserCheck,
        label: "Encarregados",
        href: "/list/parents",
        roles: ["school_admin", "teacher"],
        permission: "canManageParents",
      },
      {
        icon: Presentation,
        label: "Turmas",
        href: "/list/classes",
        roles: ["school_admin", "teacher"],
        permission: "canManageClasses",
      },
      {
        icon: BookOpen,
        label: "Disciplinas",
        href: "/list/subjects",
        roles: ["school_admin"],
        permission: "canManageSubjects",
      },
      {
        icon: GraduationCap,
        label: "Cursos",
        href: "/list/courses",
        roles: ["school_admin"],
        permission: "canManageCourses",
      },
      {
        icon: Calendar,
        label: "Aulas",
        href: "/list/lessons",
        roles: ["school_admin", "teacher"],
        permission: "canManageLessons",
        feature: "calendar",
      },
      {
        icon: CalendarRange,
        label: "Anos Letivos",
        href: "/list/academic-years",
        roles: ["school_admin"],
        feature: "yearTransition",
      },
      {
        icon: UserPlus,
        label: "Matrículas",
        href: "/list/enrollments",
        roles: ["school_admin"],
        permission: "canManageStudents",
      },
    ],
  },
  {
    title: "Avaliações",
    items: [
      {
        icon: FileText,
        label: "Provas",
        href: "/list/exams",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageExams",
      },
      {
        icon: ClipboardList,
        label: "Tarefas",
        href: "/list/assignments",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageAssignments",
        feature: "submissions",
      },
      {
        icon: GraduationCap,
        label: "Resultados",
        href: "/list/results",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageResults",
      },
      {
        icon: CalendarCheck,
        label: "Assiduidade",
        href: "/list/attendance",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageAttendance",
      },
      {
        icon: Calculator,
        label: "Avaliações",
        href: "/list/evaluation",
        roles: ["school_admin"],
        permission: "canManageResults",
        feature: "evaluationEngine",
      },
      {
        icon: Scale,
        label: "Recursos",
        href: "/list/recurso",
        roles: ["school_admin"],
        permission: "canManageResults",
        feature: "evaluationEngine",
      },
    ],
  },
  {
    title: "Comunicação",
    items: [
      {
        icon: MessageSquare,
        label: "Mensagens",
        href: "/list/messages",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageMessages",
        feature: "internalMessages",
      },
      {
        icon: Megaphone,
        label: "Avisos",
        href: "/list/announcements",
        roles: ["school_admin", "teacher", "student", "parent"],
        permission: "canManageAnnouncements",
      },
      {
        icon: Users,
        label: "Amigos",
        href: "/list/friends",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        icon: Inbox,
        label: "Solicitações",
        href: "/list/applications",
        roles: ["school_admin"],
        permission: "canManageApplications",
      },
      {
        icon: ShieldCheck,
        label: "Administradores",
        href: "/list/admins",
        roles: ["school_admin"],
        permission: "canManageAdmins",
      },
    ],
  },
  {
    title: "Outros",
    items: [
      {
        icon: SlidersHorizontal,
        label: "Config. Avaliação",
        href: "/settings/grading",
        roles: ["school_admin"],
        feature: "evaluationEngine",
      },
      {
        icon: Upload,
        label: "Importar",
        href: "/import",
        roles: ["school_admin"],
      },
      {
        icon: CircleUser,
        label: "Perfil",
        href: "/profile",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
      {
        icon: Settings,
        label: "Configurações",
        href: "/settings",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
      {
        icon: LifeBuoy,
        label: "Suporte",
        href: "/support",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
      {
        icon: HelpCircle,
        label: "Ajuda",
        href: "/help",
        roles: ["school_admin", "teacher", "student", "parent"],
      },
    ],
  },
]
