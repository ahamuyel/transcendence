export type HelpSection = {
  title: string
  items: { question: string; answer: string }[]
}

export type HelpGuide = {
  title: string
  steps: string[]
}

export type RoleHelp = {
  welcome: string
  guides: HelpGuide[]
  faq: HelpSection[]
}

const schoolAdmin: RoleHelp = {
  welcome: "Bem-vindo ao painel de administração da sua escola. Aqui pode gerir todos os aspectos da instituição.",
  guides: [
    {
      title: "Configurar a escola",
      steps: [
        "Aceda a Definições → Escola para personalizar o logo e cor primária.",
        "Verifique os dados da escola no painel de administração.",
        "Configure as turmas e disciplinas antes de adicionar professores e alunos.",
      ],
    },
    {
      title: "Gerir professores",
      steps: [
        "Aceda a Professores na barra lateral.",
        "Clique em \"Criar\" para adicionar um novo professor.",
        "Preencha os dados e atribua disciplinas e turmas.",
        "O professor receberá as credenciais de acesso.",
      ],
    },
    {
      title: "Gerir alunos e encarregados",
      steps: [
        "Aceda a Alunos para ver e gerir a lista de alunos.",
        "Pode adicionar alunos manualmente ou aprovar candidaturas.",
        "Cada aluno pode ter um encarregado de educação associado.",
      ],
    },
    {
      title: "Gerir candidaturas",
      steps: [
        "Aceda a Candidaturas na barra lateral.",
        "Reveja as candidaturas pendentes.",
        "Aprove ou rejeite cada candidatura — ao aprovar, o aluno é criado automaticamente.",
      ],
    },
    {
      title: "Anúncios e comunicação",
      steps: [
        "Aceda a Anúncios para criar comunicações.",
        "Escolha a prioridade e a turma destinatária.",
        "Pode agendar anúncios para publicação futura.",
      ],
    },
  ],
  faq: [
    {
      title: "Gestão geral",
      items: [
        {
          question: "Como altero o logo da escola?",
          answer: "Aceda a Definições → Escola. Carregue uma imagem PNG, JPG ou SVG (máx. 200KB).",
        },
        {
          question: "Como adiciono uma nova turma?",
          answer: "Aceda a Turmas e clique em \"Criar\". Defina o nome, ano e capacidade.",
        },
        {
          question: "Como vejo as estatísticas da escola?",
          answer: "O painel principal mostra um resumo com número de alunos, professores, turmas e métricas de desempenho.",
        },
        {
          question: "Posso personalizar o dashboard?",
          answer: "Sim, clique no ícone de engrenagem no dashboard para mostrar/ocultar cartões e alterar o tamanho.",
        },
      ],
    },
    {
      title: "Utilizadores e acessos",
      items: [
        {
          question: "Como redefinir a palavra-passe de um utilizador?",
          answer: "Aceda ao perfil do utilizador e use a opção de redefinição de palavra-passe.",
        },
        {
          question: "Um professor não consegue aceder. O que faço?",
          answer: "Verifique se a conta está ativa em Professores. Contas inativas não conseguem iniciar sessão.",
        },
      ],
    },
  ],
}

const teacher: RoleHelp = {
  welcome: "Bem-vindo à plataforma Cur10usX. Aqui pode gerir as suas aulas, tarefas e avaliações.",
  guides: [
    {
      title: "Registar assiduidade",
      steps: [
        "Aceda a Assiduidade na barra lateral.",
        "Seleccione a aula ou turma.",
        "Marque o estado de cada aluno (presente, ausente, atrasado, justificado).",
        "Guarde o registo.",
      ],
    },
    {
      title: "Criar tarefas",
      steps: [
        "Aceda a Tarefas e clique em \"Criar\".",
        "Defina o título, descrição, turma e prazo de entrega.",
        "Os alunos serão notificados automaticamente.",
      ],
    },
    {
      title: "Lançar notas",
      steps: [
        "Aceda a Notas na barra lateral.",
        "Seleccione a avaliação ou crie uma nova.",
        "Introduza a nota de cada aluno.",
        "As notas ficam visíveis para alunos e encarregados.",
      ],
    },
    {
      title: "Publicar anúncios",
      steps: [
        "Aceda a Anúncios e clique em \"Criar\".",
        "Escreva a mensagem e escolha a turma.",
        "O anúncio será publicado imediatamente ou na data agendada.",
      ],
    },
  ],
  faq: [
    {
      title: "Aulas e turmas",
      items: [
        {
          question: "Onde vejo o meu horário?",
          answer: "O calendário na página principal mostra todas as suas aulas da semana.",
        },
        {
          question: "Posso ver apenas as minhas turmas?",
          answer: "Sim, as listagens são filtradas automaticamente para mostrar apenas as suas turmas e disciplinas.",
        },
      ],
    },
    {
      title: "Avaliações",
      items: [
        {
          question: "Como edito uma nota já lançada?",
          answer: "Aceda a Notas, encontre o registo e clique para editar. As alterações são guardadas automaticamente.",
        },
        {
          question: "Os encarregados veem as notas?",
          answer: "Sim, os encarregados têm acesso às notas dos seus educandos em tempo real.",
        },
      ],
    },
  ],
}

const student: RoleHelp = {
  welcome: "Bem-vindo ao Cur10usX! Aqui podes acompanhar as tuas aulas, tarefas e notas.",
  guides: [
    {
      title: "Ver as tuas aulas",
      steps: [
        "Acede a Aulas na barra lateral para ver o teu horário.",
        "O calendário mostra as aulas da semana.",
        "Clica numa aula para ver os detalhes.",
      ],
    },
    {
      title: "Acompanhar tarefas",
      steps: [
        "Acede a Tarefas para ver as tarefas atribuídas.",
        "Verifica o prazo de entrega de cada tarefa.",
        "Submete o teu trabalho antes do prazo.",
      ],
    },
    {
      title: "Consultar notas",
      steps: [
        "Acede a Notas na barra lateral.",
        "Vê as tuas notas por disciplina e trimestre.",
        "Acompanha a tua média geral no dashboard.",
      ],
    },
  ],
  faq: [
    {
      title: "Dúvidas frequentes",
      items: [
        {
          question: "Como vejo a minha assiduidade?",
          answer: "Acede a Assiduidade na barra lateral para ver o teu registo de presenças.",
        },
        {
          question: "Esqueci a minha palavra-passe. O que faço?",
          answer: "Na página de login, clica em \"Esqueceu a palavra-passe?\" e segue as instruções.",
        },
        {
          question: "Como contacto o meu professor?",
          answer: "Consulta os anúncios da turma ou fala com a administração da escola.",
        },
      ],
    },
  ],
}

const parent: RoleHelp = {
  welcome: "Bem-vindo ao Cur10usX. Acompanhe o percurso escolar do seu educando de forma simples e rápida.",
  guides: [
    {
      title: "Acompanhar o educando",
      steps: [
        "O dashboard mostra um resumo do desempenho do seu educando.",
        "Aceda a Notas para ver as avaliações.",
        "Aceda a Assiduidade para verificar as presenças.",
      ],
    },
    {
      title: "Comunicação com a escola",
      steps: [
        "Consulte os Anúncios para comunicações da escola.",
        "Verifique as notificações para avisos importantes.",
      ],
    },
  ],
  faq: [
    {
      title: "Dúvidas frequentes",
      items: [
        {
          question: "Como vejo as notas do meu educando?",
          answer: "Aceda a Notas na barra lateral. Verá as notas por disciplina e trimestre.",
        },
        {
          question: "O meu educando faltou e está marcado como ausente. Como justifico?",
          answer: "Contacte a administração da escola para justificar a falta.",
        },
        {
          question: "Posso ver o horário das aulas?",
          answer: "Sim, aceda a Aulas para consultar o horário semanal do seu educando.",
        },
      ],
    },
  ],
}

export const helpContent: Record<string, RoleHelp> = {
  school_admin: schoolAdmin,
  teacher,
  student,
  parent,
}

export const contactInfo = {
  email: "suporte@cur10usx.com",
  message: "Para questões técnicas ou sugestões, entre em contacto connosco.",
}
