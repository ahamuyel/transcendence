# Guia da Plataforma por Perfil de Utilizador

**Cur10usX** — Sistema de Gestão Escolar  
*Versão 1.0 — Maio 2026*

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Não Autenticado (Visitante)](#2-não-autenticado-visitante)
3. [Super Admin](#3-super-admin)
4. [School Admin (Administrador da Escola)](#4-school-admin)
5. [Professor](#5-professor)
6. [Aluno](#6-aluno)
7. [Encarregado (Parent)](#7-encarregado-parent)
8. [Matriz de Permissões CRUD](#8-matriz-de-permissões-crud)
9. [Fluxo de Autenticação e Navegação](#9-fluxo-de-autenticação-e-navegação)

---

## 1. Visão Geral

A plataforma Cur10usX é um sistema de gestão escolar multi-tenant com **5 perfis de utilizador**:

| Perfil | Descrição |
|--------|-----------|
| **Super Admin** | Administrador global da plataforma. Gere todas as escolas, utilizadores e configurações do sistema. |
| **School Admin** | Administrador de uma escola específica. Gere professores, alunos, turmas, disciplinas, etc. Pode ser `primary` (acesso total) ou `secondary` (acesso limitado a permissões específicas). |
| **Professor** | Docente associado a uma escola. Gere notas, tarefas, assiduidade, provas e avisos dos seus alunos. |
| **Aluno** | Estudante matriculado numa turma. Visualiza notas, tarefas, horários e assiduidade. |
| **Encarregado** | Responsável por um ou mais alunos. Acompanha o desempenho académico dos seus educandos. |

Cada escola funciona como uma **organização independente** com as suas próprias configurações, funcionalidades (feature flags) e dados isolados.

---

## 2. Não Autenticado (Visitante)

### Páginas Públicas

| Rota | Conteúdo |
|------|----------|
| `/` | Landing page institucional: hero, estatísticas, funcionalidades, planos, FAQ |
| `/aplicacao` | Página de candidatura/submissão |
| `/aplicacao/status` | Consultar estado de uma candidatura |
| `/termos` | Termos de Uso |
| `/privacidade` | Política de Privacidade |

### Páginas de Autenticação

| Rota | Função |
|------|--------|
| `/signin` | Login com email/password ou Google OAuth |
| `/signup` | Registo de nova conta |
| `/forgot-password` | Recuperação de password |
| `/reset-password` | Redefinição de password (acessível mesmo com sessão) |
| `/verify-email` | Verificação de email (acessível mesmo com sessão) |
| `/registar-escola` | Registo de nova escola na plataforma |

### Funcionalidades
- Navegar na landing page
- Registar-se como novo utilizador
- Registar uma escola
- Recuperar password
- Verificar email

### Limitações
- Sem acesso ao dashboard
- Sem acesso a listas de dados
- Sem acesso a APIs protegidas

---

## 3. Super Admin

### Acesso
- Rota base: `/admin`
- Login com credenciais de super admin (criados via seed ou por outro super admin)

### Dashboard
Visão global da plataforma com:
- Total de escolas registadas
- Total de utilizadores ativos
- Total de professores e alunos (cross-school)
- Solicitações de registo de escolas pendentes
- Gráficos de crescimento

### Navegação (Admin Sidebar)

| Item | Rota | Descrição |
|------|------|-----------|
| Dashboard | `/admin` | Visão geral da plataforma |
| Escolas | `/admin/schools` | Gerir escolas (criar, ativar, suspender, configurar) |
| Utilizadores | `/admin/users` | Gerir utilizadores (pesquisar, desativar) |
| Solicitações | `/admin/applications` | Aprovar/rejeitar pedidos de registo de escolas |
| Catálogo | `/admin/catalog` | Gerir disciplinas, cursos e turmas globais |
| Config. Avaliação | `/admin/grading-config` | Configurar regras globais de avaliação |
| Estatísticas | `/admin/stats` | Estatísticas detalhadas da plataforma |
| Super Admins | `/admin/super-admins` | Criar/gerir outros super admins |
| Suporte | `/admin/support` | Gerir tickets de suporte de todas as escolas |
| Configurações | `/admin/settings` | Configurações globais da plataforma |

### Permissões Especiais
- **Bypass total**: não precisa de verificação de email, permissões, ou feature flags
- Pode aceder a dados de qualquer escola
- Pode ativar/desativar qualquer conta
- Pode configurar o catálogo global (disciplinas, cursos, turmas partilhadas entre escolas)

### O que NÃO pode fazer
- Não tem acesso ao dashboard de escola (não vê `/dashboard/:id`)
- Não gere notas, turmas, aulas ou assiduidade (isso é gerido pelas escolas)
- Não envia mensagens internas nem participa no sistema social (amigos)

---

## 4. School Admin

### Acesso
- Rota base: `/dashboard/{id}` (redirecionado de `/minha-area`)
- Login normal com credenciais de school_admin

### Dashboard
Painel administrativo completo com:
- **8 cartões de estatísticas** personalizáveis: Alunos, Professores, Turmas, Média Geral, Tarefas Pendentes, Aulas Hoje, Solicitações, Avisos
- **Gráfico de géneros** (alunos masculino/feminino)
- **Gráfico de assiduidade** (por mês)
- **Calendário de eventos**
- **Avisos recentes**
- **Botão "Personalizar"** para mostrar/esconder e redimensionar cartões

### Navegação (Sidebar Principal)

#### MENU

| Item | Rota | Visível para |
|------|------|-------------|
| Início | `/dashboard` | Todos os perfis |
| Solicitações | `/list/applications` | School admin |
| Administradores | `/list/admins` | School admin |
| Professores | `/list/teachers` | School admin + Teacher |
| Alunos | `/list/students` | School admin + Teacher |
| Encarregados | `/list/parents` | School admin + Teacher |
| Disciplinas | `/list/subjects` | School admin |
| Cursos | `/list/courses` | School admin |
| Turmas | `/list/classes` | School admin + Teacher |
| Aulas | `/list/lessons` | School admin + Teacher |
| Provas | `/list/exams` | Todos |
| Tarefas | `/list/assignments` | Todos |
| Resultados | `/list/results` | Todos |
| Assiduidade | `/list/attendance` | Todos |
| Mensagens | `/list/messages` | Todos |
| Avisos | `/list/announcements` | Todos |
| Anos Letivos | `/list/academic-years` | School admin |
| Matrículas | `/list/enrollments` | School admin |
| Avaliações | `/list/evaluation` | School admin (com feature flag) |
| Recursos | `/list/recurso` | School admin (com feature flag) |

#### OUTROS

| Item | Rota | Visível para |
|------|------|-------------|
| Minha Área | `/minha-area` | Todos |
| Config. Avaliação | `/settings/grading` | School admin (com feature flag) |
| Importar | `/import` | School admin |
| Amigos | `/list/friends` | Todos |
| Perfil | `/profile` | Todos |
| Configurações | `/settings` | Todos |
| Suporte | `/support` | Todos |
| Ajuda | `/help` | Todos |

### Permissões (Administradores Secundários)

School admins podem ser de dois níveis:

| Nível | Acesso |
|-------|--------|
| **Primary** | Acesso total a todas as funcionalidades da escola |
| **Secondary** | Acesso limitado às permissões específicas que lhe foram atribuídas |

As 14 permissões disponíveis para secondary admins:

| Permissão | O que permite |
|-----------|--------------|
| `canManageApplications` | Gerir solicitações de registo |
| `canManageTeachers` | Gerir professores |
| `canManageStudents` | Gerir alunos e matrículas |
| `canManageParents` | Gerir encarregados |
| `canManageClasses` | Gerir turmas |
| `canManageCourses` | Gerir cursos |
| `canManageSubjects` | Gerir disciplinas |
| `canManageLessons` | Gerir aulas |
| `canManageExams` | Gerir provas |
| `canManageAssignments` | Gerir tarefas |
| `canManageResults` | Gerir resultados/notas |
| `canManageAttendance` | Gerir assiduidade |
| `canManageMessages` | Gerir mensagens |
| `canManageAnnouncements` | Gerir avisos |
| `canManageAdmins` | Gerir outros administradores |

### Funcionalidades CRUD Completas

| Entidade | Criar | Ler | Editar | Eliminar | Ações Especiais |
|----------|-------|-----|--------|----------|-----------------|
| Alunos | Sim | Sim | Sim | Sim | Transferir turma, desativar conta, certificado |
| Professores | Sim | Sim | Sim | Sim | Desativar conta, criar conta de acesso |
| Encarregados | Sim | Sim | Sim | Sim | Associar a alunos |
| Turmas | Sim | Sim | Sim | Sim | Atribuir supervisor |
| Cursos | Sim | Sim | Sim | Sim | Associar disciplinas |
| Disciplinas | Sim | Sim | Sim | Sim | — |
| Aulas | Sim | Sim | Sim | Sim | Gerir materiais, registar presenças |
| Provas | Sim | Sim | Sim | Sim | — |
| Tarefas | Sim | Sim | Sim | Sim | Avaliar submissões |
| Resultados | Sim | Sim | Sim | Sim | Registar notas individuais |
| Assiduidade | Sim | Sim | Sim | Sim | Registar presenças em massa |
| Mensagens | Sim | Sim | Sim | N/A | Marcar lida/não lida |
| Avisos | Sim | Sim | Sim | Sim | Prioridade: informativo/importante/urgente |
| Matrículas | Sim | Sim | Sim | Sim | Aprovar, transferir, concluir |
| Anos Letivos | Sim | Sim | Sim | Sim | Definir ano corrente, abrir/fechar |
| Solicitações | Aprovar/rejeitar | Sim | N/A | N/A | — |
| Administradores | Sim | Sim | Sim | Sim | Promover/demover |

### Funcionalidades Exclusivas
- **Importar dados** (CSV/XLSX): alunos, professores, encarregados em massa
- **Configurar avaliação**: definir pesos de trimestres, fórmulas de cálculo, nota de aprovação
- **Processar avaliações de fim de ano**: calcular médias, aprovações/reprovações
- **Gerir anos letivos**: abrir novo ano, encerrar ano, transição de alunos
- **Autenticação de dois fatores (2FA)**: pode ativar na sua conta
- **Exportar dados (GDPR)**: exportar ou eliminar a própria conta

---

## 5. Professor

### Acesso
- Rota base: `/dashboard/{id}` (calendário semanal)
- Login normal com credenciais de professor

### Dashboard
Agenda semanal (`BigCalendar`) com:
- Visualização de aulas da semana por dia/hora
- Disciplina e turma de cada aula
- Calendário de eventos (sidebar)
- Avisos recentes (sidebar)

### Navegação (Sidebar)
O professor vê um subconjunto do menu:

**Visível:**
- Início, Professores, Alunos, Encarregados, Turmas, Aulas
- Provas, Tarefas, Resultados, Assiduidade
- Mensagens, Avisos
- Minha Área, Amigos, Perfil, Configurações, Suporte, Ajuda

**Oculto:**
- Disciplinas, Cursos, Anos Letivos, Matrículas
- Solicitações, Administradores
- Avaliações, Recursos, Config. Avaliação
- Importar

### Funcionalidades

#### Visualização (Leitura)
- **Lista de Professores**: vê colegas (apenas listagem)
- **Alunos**: vê detalhes dos alunos (apenas das suas turmas)
- **Encarregados**: vê encarregados dos seus alunos
- **Turmas**: vê as turmas às quais está atribuído
- **Aulas**: vê o calendário de aulas
- **Provas**: vê provas da escola (com filtro por turma/disciplina)
- **Tarefas**: vê tarefas que criou e submissões dos alunos

#### Gestão (Escrita)
- **Provas**: criar e editar provas (associadas às suas disciplinas/turmas)
- **Tarefas**: criar, editar e **eliminar as suas próprias tarefas**
- **Resultados**: registar, editar e **eliminar notas** de alunos das suas turmas (com verificação de escopo)
- **Assiduidade**: registar presenças, editar estados (presente/ausente/atrasado) — acesso total
- **Avisos**: criar, editar e eliminar os seus próprios avisos
- **Mensagens**: enviar e receber mensagens internas
- **Aulas**: editar informações das suas aulas

#### Perfil e Configurações
- Editar nome, telefone, morada
- Alterar password
- Configurar tema (claro/escuro) e idioma (PT/EN/FR/ES)
- Ativar 2FA
- Gerir amigos (rede social interna)

### O que NÃO pode fazer
- ❌ Criar/editar/eliminar disciplinas ou cursos
- ❌ Gerir anos letivos
- ❌ Gerir matrículas
- ❌ Processar avaliações de fim de ano
- ❌ Aceder a funcionalidades de administrador
- ❌ Eliminar tarefas que não lhe pertencem
- ❌ Ver notas de alunos que não são das suas turmas
- ❌ Importar dados

---

## 6. Aluno

### Acesso
- Rota base: `/dashboard/{id}` (dashboard pessoal)
- Login com credenciais de aluno

### Dashboard
Dashboard pessoal do estudante com:
- Notas por disciplina
- Horário de aulas
- Tarefas pendentes
- Assiduidade recente

### Navegação (Sidebar)
Visível:
- Início, Provas, Tarefas, Resultados, Assiduidade
- Mensagens, Avisos
- Minha Área, Amigos, Perfil, Configurações, Suporte, Ajuda

Oculto:
- Professores, Alunos, Encarregados, Turmas, Aulas
- Disciplinas, Cursos, e todos os outros itens administrativos

### Funcionalidades

#### Visualização (Leitura)
- **Provas**: vê calendário de provas da sua turma
- **Tarefas**: vê tarefas da sua turma com prazos e estado
- **Resultados**: vê as suas próprias notas
- **Assiduidade**: vê o seu registo de presenças
- **Avisos**: lê avisos direcionados à sua turma ou gerais
- **Mensagens**: vê mensagens recebidas

#### Submissão de Tarefas
- Submeter tarefas com texto e/ou ficheiro
- Consultar estado da submissão (pendente/entregue/avaliada/atrasada)
- Ver nota e feedback após avaliação do professor

#### Interação Social
- Gerir amigos (adicionar, remover, aceitar/rejeitar pedidos)
- Enviar e receber mensagens internas

#### Perfil e Configurações
- Editar nome, telefone, morada, género, data de nascimento
- Alterar password
- Configurar tema e idioma
- Ativar 2FA
- Exportar dados (GDPR)

### O que NÃO pode fazer
- ❌ Criar, editar ou eliminar qualquer conteúdo académico
- ❌ Ver dados de outros alunos
- ❌ Aceder a listas de professores, turmas, etc.
- ❌ Enviar mensagens em massa
- ❌ Gerir configurações da escola

---

## 7. Encarregado (Parent)

### Acesso
- Rota base: `/dashboard/{id}` (dashboard do educando)
- Login com credenciais de encarregado

### Dashboard
- Seletor de educando (se tiver mais que um filho na escola)
- Dashboard do estudante selecionado com notas, horário, tarefas e assiduidade

### Navegação (Sidebar)
**Idêntica ao Aluno:**
- Início, Provas, Tarefas, Resultados, Assiduidade
- Mensagens, Avisos
- Minha Área, Amigos, Perfil, Configurações, Suporte, Ajuda

### Funcionalidades

#### Visualização (Apenas Leitura)
- **Provas**: vê calendário de provas dos educandos
- **Tarefas**: vê tarefas e estado das submissões dos educandos (não pode submeter)
- **Resultados**: vê as notas dos educandos
- **Assiduidade**: vê registo de presenças dos educandos
- **Avisos**: lê avisos escolares
- **Mensagens**: recebe comunicações da escola

#### Interação
- Enviar mensagens para professores/administração
- Gerir amigos
- Editar o próprio perfil (nome, telefone, morada)
- Configurar preferências (tema, idioma, notificações)
- Ativar 2FA na própria conta
- Exportar dados pessoais (GDPR)

### O que NÃO pode fazer
- ❌ Submeter tarefas pelos educandos
- ❌ Editar dados dos educandos
- ❌ Ver dados de alunos que não sejam seus educandos
- ❌ Criar/editar/eliminar qualquer conteúdo
- ❌ Aceder a funcionalidades administrativas

---

## 8. Matriz de Permissões CRUD

| Entidade | Super Admin | School Admin | Professor | Aluno | Encarregado |
|----------|:-----------:|:------------:|:---------:|:-----:|:-----------:|
| **Escolas** | CRUD | — | — | — | — |
| **Utilizadores** | R (global) | CRUD (escola) | — | — | — |
| **Alunos** | — | CRUD | R | — | R (educandos) |
| **Professores** | — | CRUD | R | — | — |
| **Encarregados** | — | CRUD | R | — | — |
| **Turmas** | — | CRUD | R | — | — |
| **Disciplinas** | CRUD (global) | CRUD (escola) | — | — | — |
| **Cursos** | CRUD (global) | CRUD (escola) | — | — | — |
| **Aulas** | — | CRUD | RU (próprias) | — | — |
| **Provas** | — | CRUD | CRU (próprias) | R | R |
| **Tarefas** | — | CRUD | CRUD (próprias) | R + submit | R |
| **Resultados** | — | CRUD | CRUD (turmas) | R | R |
| **Assiduidade** | — | CRUD | CRUD (turmas) | R | R |
| **Mensagens** | — | CRUD | CRU | CRU | CRU |
| **Avisos** | — | CRUD | CRUD (próprios) | R | R |
| **Matrículas** | — | CRUD | — | — | — |
| **Anos Letivos** | — | CRUD | — | — | — |
| **Avaliações** | — | CRUD (feature) | — | — | — |
| **Recursos** | — | CRUD (feature) | — | — | — |
| **Solicitações** | CRUD (global) | RU (escola) | — | — | — |
| **Admins** | — | CRUD | — | — | — |
| **Catálogo Global** | CRUD | — | — | — | — |
| **Config. Plataforma** | CRUD | — | — | — | — |

**Legenda:** C=Criar, R=Ler, U=Atualizar, D=Eliminar

---

## 9. Fluxo de Autenticação e Navegação

```
Utilizador não autenticado
  ├── Acede a página pública (/, /termos, /privacidade)
  └── Acede a /signin
        ├── Faz login com email/password ou Google
        └── Redirecionado para /minha-area

/minha-area
  ├── super_admin → redirecionado para /admin
  ├── school_admin (com escola ativa) → redirecionado para /dashboard/{id}
  └── teacher/student/parent → renderiza página pessoal

/dashboard/{id}
  ├── super_admin → redirecionado para /admin
  ├── school_admin → dashboard administrativo com gráficos e estatísticas
  ├── teacher → calendário semanal de aulas
  ├── student → dashboard pessoal (notas, tarefas, horário)
  └── parent → seletor de educando + dashboard do educando

Middleware (proteção de rotas)
  ├── Rotas públicas: /, /aplicacao/*, /api/auth/*
  ├── Rotas de auth: /signin, /signup, /forgot-password, /registar-escola
  │   └── Se já autenticado → redireciona para /minha-area
  ├── Rotas sempre acessíveis: /reset-password, /verify-email
  └── Rotas protegidas: todo o resto (dashboard, listas, API)
      └── Se não autenticado → redireciona para /signin?callbackUrl=...
```

### Controlo de Sessão

- **JWT** com expiração de 24 horas (configurável via `AUTH_JWT_MAXAGE`)
- **Session version**: ao alterar a password, a versão da sessão é incrementada, invalidando todos os tokens JWT anteriores
- **SessionGuard**: tracking de sessão ativa em sessionStorage (não faz logout forçado)
- **Verificação de email**: obrigatória para todas as contas exceto super_admin
- **Conta ativa**: contas desativadas não podem autenticar (verificado no authorize() e no middleware)

### Multi-Idioma

A plataforma suporta 4 idiomas:
- 🇵🇹 Português (padrão)
- 🇬🇧 Inglês
- 🇫🇷 Francês
- 🇪🇸 Espanhol

O idioma é configurável nas definições do utilizador e persiste na conta.

---

*Documento gerado automaticamente com base na análise do código-fonte.*
