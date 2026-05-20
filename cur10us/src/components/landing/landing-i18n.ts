import type { LucideIcon } from "lucide-react"

export type LandingLanguage = "pt" | "en" | "fr"

export type LandingCopy = {
  nav: {
    how: string
    features: string
    profiles: string
    language: string
    createAccount: string
    signIn: string
    theme: string
    menu: string
  }
  hero: {
    badge: string
    titlePrefix: string
    titleAccent: string
    fallbackDescription: string
    primaryCta: string
    secondaryCta: string
    dashboardTitle: string
    dashboardSubtitle: string
    students: string
    teachers: string
    classes: string
    chartLabel: string
    notificationTitle: string
    notificationSubtitle: string
    userCardTitle: string
    userCardSubtitle: string
    schoolsHeading: string
    schoolsMarquee: string[]
  }
  stats: {
    schools: string
    students: string
    teachers: string
    classes: string
  }
  how: {
    badge: string
    titlePrefix: string
    titleAccent: string
    description: string
    steps: Array<{
      title: string
      description: string
    }>
  }
  features: {
    badge: string
    titlePrefix: string
    titleAccent: string
    description: string
    items: Array<{
      title: string
      description: string
    }>
  }
  profiles: {
    badge: string
    titlePrefix: string
    titleAccent: string
    description: string
    items: Array<{
      role: string
      benefits: string[]
    }>
  }
  cta: {
    badge: string
    title: string
    description: string
    primaryCta: string
    secondaryCta: string
  }
  footer: {
    fallbackDescription: string
    platform: string
    features: string
    profiles: string
    access: string
    signIn: string
    registerSchool: string
    apply: string
    trackApplication: string
    contact: string
    location: string
    rights: string
    terms: string
    privacy: string
  }
}

export type LandingFeatureVisual = {
  icon: LucideIcon
  gradient: string
  span: string
}

export type LandingProfileVisual = {
  icon: LucideIcon
  gradient: string
  accent: string
  border: string
}

export const languageLabels: Record<LandingLanguage, string> = {
  pt: "PT",
  en: "EN",
  fr: "FR",
}

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  pt: {
    nav: {
      how: "Como funciona",
      features: "Funcionalidades",
      profiles: "Para quem",
      language: "Idioma",
      createAccount: "Criar conta",
      signIn: "Entrar",
      theme: "Alternar tema",
      menu: "Abrir menu",
    },
    hero: {
      badge: "Plataforma de Gestão Escolar para Angola",
      titlePrefix: "A sua escola,",
      titleAccent: "mais organizada",
      fallbackDescription:
        "Centralize a gestão de alunos, professores, notas e comunicação numa única plataforma moderna.",
      primaryCta: "Começar agora",
      secondaryCta: "Registar escola",
      dashboardTitle: "Dashboard Escolar",
      dashboardSubtitle: "Visão geral",
      students: "Alunos",
      teachers: "Professores",
      classes: "Turmas",
      chartLabel: "Desempenho mensal",
      notificationTitle: "Notas lançadas",
      notificationSubtitle: "Turma 10A - Matemática",
      userCardTitle: "+12 alunos",
      userCardSubtitle: "Matriculados hoje",
      schoolsHeading: "Escolas registradas",
      schoolsMarquee: [
        "42 Luanda",
        "Instituto Médio",
        "Colégio Privado",
        "Ensino Primário",
        "Ensino Secundário",
        "Centros de Formação",
      ],
    },
    stats: {
      schools: "Escolas registadas",
      students: "Alunos na plataforma",
      teachers: "Professores activos",
      classes: "Turmas criadas",
    },
    how: {
      badge: "Simples e rápido",
      titlePrefix: "Como",
      titleAccent: "funciona",
      description: "Em 4 passos simples, a sua escola está pronta para usar o Cur10usX.",
      steps: [
        {
          title: "Registe a sua escola",
          description: "Preencha o formulário com os dados da escola e submeta a candidatura.",
        },
        {
          title: "Aguarde aprovação",
          description: "A nossa equipa analisa o pedido e aprova a sua escola na plataforma.",
        },
        {
          title: "Configure o sistema",
          description: "Adicione turmas, professores e alunos. Personalize as funcionalidades.",
        },
        {
          title: "Comece a gerir",
          description: "Tudo pronto! Use os dashboards para acompanhar o dia-a-dia da escola.",
        },
      ],
    },
    features: {
      badge: "Tudo incluído",
      titlePrefix: "Tudo que a sua escola precisa,",
      titleAccent: "num só lugar",
      description: "Ferramentas pensadas para facilitar o dia-a-dia de quem faz a educação acontecer.",
      items: [
        {
          title: "Dashboards intuitivos",
          description: "Visão geral em tempo real com métricas claras para cada perfil de utilizador.",
        },
        {
          title: "Gestão de alunos",
          description: "Matrículas, perfis, turmas e acompanhamento individual completo.",
        },
        {
          title: "Controlo de assiduidade",
          description: "Registo de presenças por aula ou dia, com relatórios automáticos.",
        },
        {
          title: "Notas e avaliações",
          description: "Lançamento de notas por trimestre, exames e trabalhos com médias automáticas.",
        },
        {
          title: "Comunicação interna",
          description: "Avisos, mensagens e notificações para toda a comunidade escolar.",
        },
        {
          title: "Candidaturas online",
          description: "Formulário público de matrícula com acompanhamento de estado.",
        },
        {
          title: "Calendário e horários",
          description: "Horários de aulas, exames e eventos escolares num só lugar.",
        },
        {
          title: "Relatórios detalhados",
          description: "Análises de desempenho, frequência e evolução dos alunos.",
        },
      ],
    },
    profiles: {
      badge: "Para toda a comunidade",
      titlePrefix: "Uma experiência para",
      titleAccent: "cada perfil",
      description: "Cada utilizador acede ao que é relevante para o seu papel na comunidade escolar.",
      items: [
        {
          role: "Gestores Escolares",
          benefits: [
            "Visão geral da escola em tempo real",
            "Relatórios de desempenho e assiduidade",
            "Gestão de turmas, professores e admissões",
            "Controlo financeiro e estatísticas",
          ],
        },
        {
          role: "Professores",
          benefits: [
            "Lançamento rápido de notas e presenças",
            "Calendário de aulas e exames",
            "Acompanhamento individual do aluno",
            "Gestão de trabalhos e submissões",
          ],
        },
        {
          role: "Alunos",
          benefits: [
            "Consulta de notas e boletins",
            "Horário e calendário escolar",
            "Histórico de assiduidade",
            "Portfólio académico digital",
          ],
        },
        {
          role: "Encarregados de Educação",
          benefits: [
            "Acompanhamento do educando em tempo real",
            "Notificações de faltas e desempenho",
            "Comunicação directa com a escola",
            "Acesso a boletins e relatórios",
          ],
        },
      ],
    },
    cta: {
      badge: "Comece hoje mesmo",
      title: "Pronto para transformar\na gestão da sua escola?",
      description:
        "Registe a sua escola e comece a gerir alunos, professores e resultados de forma moderna e eficiente.",
      primaryCta: "Entrar na plataforma",
      secondaryCta: "Registar escola",
    },
    footer: {
      fallbackDescription: "Plataforma de gestão escolar moderna, pensada para o contexto angolano.",
      platform: "Plataforma",
      features: "Funcionalidades",
      profiles: "Para quem",
      access: "Acesso",
      signIn: "Entrar",
      registerSchool: "Registar escola",
      apply: "Solicitar matrícula",
      trackApplication: "Acompanhar candidatura",
      contact: "Contacto",
      location: "Luanda, Angola",
      rights: "Todos os direitos reservados.",
      terms: "Termos de uso",
      privacy: "Privacidade",
    },
  },
  en: {
    nav: {
      how: "How it works",
      features: "Features",
      profiles: "Who it helps",
      language: "Language",
      createAccount: "Create account",
      signIn: "Sign in",
      theme: "Toggle theme",
      menu: "Open menu",
    },
    hero: {
      badge: "School management platform for Angola",
      titlePrefix: "Your school,",
      titleAccent: "better organized",
      fallbackDescription:
        "Centralize students, teachers, grades, attendance and communication in one modern platform.",
      primaryCta: "Get started",
      secondaryCta: "Register school",
      dashboardTitle: "School Dashboard",
      dashboardSubtitle: "Overview",
      students: "Students",
      teachers: "Teachers",
      classes: "Classes",
      chartLabel: "Monthly performance",
      notificationTitle: "Grades posted",
      notificationSubtitle: "Class 10A - Mathematics",
      userCardTitle: "+12 students",
      userCardSubtitle: "Enrolled today",
      schoolsHeading: "Registered schools",
      schoolsMarquee: [
        "42 Luanda",
        "Technical institutes",
        "Private schools",
        "Primary education",
        "Secondary education",
        "Training centers",
      ],
    },
    stats: {
      schools: "Registered schools",
      students: "Students on platform",
      teachers: "Active teachers",
      classes: "Classes created",
    },
    how: {
      badge: "Simple and fast",
      titlePrefix: "How it",
      titleAccent: "works",
      description: "In 4 clear steps, your school is ready to run on Cur10usX.",
      steps: [
        {
          title: "Register your school",
          description: "Fill in the school details and submit the application.",
        },
        {
          title: "Wait for approval",
          description: "Our team reviews the request and activates your school on the platform.",
        },
        {
          title: "Set up the system",
          description: "Add classes, teachers and students. Configure the tools you need.",
        },
        {
          title: "Start managing",
          description: "Use the dashboards to follow daily school operations with clarity.",
        },
      ],
    },
    features: {
      badge: "Included tools",
      titlePrefix: "Everything your school needs,",
      titleAccent: "in one place",
      description: "Practical tools for the teams that keep education moving every day.",
      items: [
        {
          title: "Intuitive dashboards",
          description: "Real-time overview with clear metrics for every user profile.",
        },
        {
          title: "Student management",
          description: "Enrollments, profiles, classes and complete individual tracking.",
        },
        {
          title: "Attendance control",
          description: "Daily or per-lesson attendance records with automatic reports.",
        },
        {
          title: "Grades and assessments",
          description: "Term grades, exams and assignments with automatic averages.",
        },
        {
          title: "Internal communication",
          description: "Announcements, messages and notifications for the whole school community.",
        },
        {
          title: "Online applications",
          description: "Public enrollment forms with application status tracking.",
        },
        {
          title: "Calendar and schedules",
          description: "Lessons, exams and school events organized in one place.",
        },
        {
          title: "Detailed reports",
          description: "Insights into student performance, attendance and progress.",
        },
      ],
    },
    profiles: {
      badge: "For the whole community",
      titlePrefix: "An experience for",
      titleAccent: "every profile",
      description: "Every user gets the information and tools that match their role.",
      items: [
        {
          role: "School Managers",
          benefits: [
            "Real-time school overview",
            "Performance and attendance reports",
            "Class, teacher and admission management",
            "Financial control and statistics",
          ],
        },
        {
          role: "Teachers",
          benefits: [
            "Fast grade and attendance posting",
            "Lesson and exam calendar",
            "Individual student follow-up",
            "Assignment and submission management",
          ],
        },
        {
          role: "Students",
          benefits: [
            "Grades and report cards",
            "Timetable and school calendar",
            "Attendance history",
            "Digital academic portfolio",
          ],
        },
        {
          role: "Parents and Guardians",
          benefits: [
            "Real-time child tracking",
            "Absence and performance notifications",
            "Direct communication with school",
            "Access to reports and summaries",
          ],
        },
      ],
    },
    cta: {
      badge: "Start today",
      title: "Ready to transform\nyour school management?",
      description:
        "Register your school and manage students, teachers and results with a modern, efficient workflow.",
      primaryCta: "Enter platform",
      secondaryCta: "Register school",
    },
    footer: {
      fallbackDescription: "A modern school management platform designed for the Angolan context.",
      platform: "Platform",
      features: "Features",
      profiles: "Who it helps",
      access: "Access",
      signIn: "Sign in",
      registerSchool: "Register school",
      apply: "Apply for enrollment",
      trackApplication: "Track application",
      contact: "Contact",
      location: "Luanda, Angola",
      rights: "All rights reserved.",
      terms: "Terms of use",
      privacy: "Privacy",
    },
  },
  fr: {
    nav: {
      how: "Fonctionnement",
      features: "Fonctionnalites",
      profiles: "Pour qui",
      language: "Langue",
      createAccount: "Creer un compte",
      signIn: "Connexion",
      theme: "Changer le theme",
      menu: "Ouvrir le menu",
    },
    hero: {
      badge: "Plateforme de gestion scolaire pour l'Angola",
      titlePrefix: "Votre ecole,",
      titleAccent: "mieux organisee",
      fallbackDescription:
        "Centralisez les eleves, enseignants, notes, presences et communications dans une plateforme moderne.",
      primaryCta: "Commencer",
      secondaryCta: "Inscrire l'ecole",
      dashboardTitle: "Tableau de bord",
      dashboardSubtitle: "Vue d'ensemble",
      students: "Eleves",
      teachers: "Enseignants",
      classes: "Classes",
      chartLabel: "Performance mensuelle",
      notificationTitle: "Notes publiees",
      notificationSubtitle: "Classe 10A - Mathematiques",
      userCardTitle: "+12 eleves",
      userCardSubtitle: "Inscrits aujourd'hui",
      schoolsHeading: "Ecoles inscrites",
      schoolsMarquee: [
        "42 Luanda",
        "Instituts techniques",
        "Ecoles privees",
        "Enseignement primaire",
        "Enseignement secondaire",
        "Centres de formation",
      ],
    },
    stats: {
      schools: "Ecoles inscrites",
      students: "Eleves sur la plateforme",
      teachers: "Enseignants actifs",
      classes: "Classes creees",
    },
    how: {
      badge: "Simple et rapide",
      titlePrefix: "Comment ca",
      titleAccent: "fonctionne",
      description: "En 4 etapes simples, votre ecole est prete a utiliser Cur10usX.",
      steps: [
        {
          title: "Inscrivez votre ecole",
          description: "Remplissez les informations de l'ecole et envoyez la demande.",
        },
        {
          title: "Attendez l'approbation",
          description: "Notre equipe analyse la demande et active votre ecole sur la plateforme.",
        },
        {
          title: "Configurez le systeme",
          description: "Ajoutez classes, enseignants et eleves. Ajustez les fonctionnalites.",
        },
        {
          title: "Commencez a gerer",
          description: "Utilisez les tableaux de bord pour suivre le quotidien de l'ecole.",
        },
      ],
    },
    features: {
      badge: "Tout inclus",
      titlePrefix: "Tout ce dont votre ecole a besoin,",
      titleAccent: "au meme endroit",
      description: "Des outils pratiques pour faciliter le travail quotidien de la communaute scolaire.",
      items: [
        {
          title: "Tableaux de bord intuitifs",
          description: "Vue en temps reel avec des indicateurs clairs pour chaque profil.",
        },
        {
          title: "Gestion des eleves",
          description: "Inscriptions, profils, classes et suivi individuel complet.",
        },
        {
          title: "Controle des presences",
          description: "Presences par jour ou par cours avec rapports automatiques.",
        },
        {
          title: "Notes et evaluations",
          description: "Notes trimestrielles, examens et devoirs avec moyennes automatiques.",
        },
        {
          title: "Communication interne",
          description: "Annonces, messages et notifications pour toute la communaute scolaire.",
        },
        {
          title: "Candidatures en ligne",
          description: "Formulaire public d'inscription avec suivi du statut.",
        },
        {
          title: "Calendrier et horaires",
          description: "Cours, examens et evenements scolaires organises au meme endroit.",
        },
        {
          title: "Rapports detailles",
          description: "Analyse des performances, presences et progression des eleves.",
        },
      ],
    },
    profiles: {
      badge: "Pour toute la communaute",
      titlePrefix: "Une experience pour",
      titleAccent: "chaque profil",
      description: "Chaque utilisateur accede aux outils utiles a son role.",
      items: [
        {
          role: "Gestionnaires scolaires",
          benefits: [
            "Vue d'ensemble de l'ecole en temps reel",
            "Rapports de performance et de presence",
            "Gestion des classes, enseignants et admissions",
            "Controle financier et statistiques",
          ],
        },
        {
          role: "Enseignants",
          benefits: [
            "Saisie rapide des notes et presences",
            "Calendrier des cours et examens",
            "Suivi individuel des eleves",
            "Gestion des devoirs et soumissions",
          ],
        },
        {
          role: "Eleves",
          benefits: [
            "Consultation des notes et bulletins",
            "Emploi du temps et calendrier scolaire",
            "Historique des presences",
            "Portfolio academique numerique",
          ],
        },
        {
          role: "Parents et tuteurs",
          benefits: [
            "Suivi de l'eleve en temps reel",
            "Notifications d'absences et de performance",
            "Communication directe avec l'ecole",
            "Acces aux bulletins et rapports",
          ],
        },
      ],
    },
    cta: {
      badge: "Commencez aujourd'hui",
      title: "Pret a transformer\nla gestion de votre ecole ?",
      description:
        "Inscrivez votre ecole et gerez eleves, enseignants et resultats avec une methode moderne et efficace.",
      primaryCta: "Entrer dans la plateforme",
      secondaryCta: "Inscrire l'ecole",
    },
    footer: {
      fallbackDescription: "Plateforme moderne de gestion scolaire, adaptee au contexte angolais.",
      platform: "Plateforme",
      features: "Fonctionnalites",
      profiles: "Pour qui",
      access: "Acces",
      signIn: "Connexion",
      registerSchool: "Inscrire l'ecole",
      apply: "Demander une inscription",
      trackApplication: "Suivre la candidature",
      contact: "Contact",
      location: "Luanda, Angola",
      rights: "Tous droits reserves.",
      terms: "Conditions d'utilisation",
      privacy: "Confidentialite",
    },
  },
}
