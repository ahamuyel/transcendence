# Cur10usX — Engineering Plan

> **Versão:** 1.0  
> **Data:** Maio 2026  
> **Equipa:** 5 Developers  
> **Stack:** Next.js 16 · React 19 · TypeScript 5.9 · Prisma 6 · PostgreSQL · Tailwind CSS 4 · WebSocket · Docker

---

## Índice

1. [Arquitetura Técnica](#1-arquitetura-técnica)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Roadmap por Fases](#3-roadmap-por-fases)
4. [Divisão de Equipa](#4-divisão-de-equipa)
5. [Módulos e Domínios](#5-módulos-e-domínios)
6. [Sistema de Gestão de Trabalho](#6-sistema-de-gestão-de-trabalho)
7. [Estratégia de Escalabilidade](#7-estratégia-de-escalabilidade)
8. [Estratégia de Qualidade](#8-estratégia-de-qualidade)
9. [Onboarding](#9-onboarding)
10. [Apêndices](#10-apêndices)

---

## 1. Arquitetura Técnica

### 1.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Next.js  │  │  React   │  │ Tailwind │  │  WebSocket (ws)   │  │
│  │ App Router│  │ Server/  │  │   CSS 4  │  │  (useWebSocket)   │  │
│  │          │  │  Client  │  │          │  │                   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js 20)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Next.js (Port 3000)                              │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │  Edge   │  │  API     │  │  Server  │  │  NextAuth   │  │  │
│  │  │Middleware│  │  Routes  │  │ Components│  │  v5 (JWT)   │  │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              WebSocket Server (Port 3001)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │   Auth   │  │  Events  │  │Broadcast │  │  Online     │  │  │
│  │  │   verify │  │  Router  │  │  Logic   │  │  Status     │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │PostgreSQL│  │  Redis   │  │ Vercel  │                         │
│  │ (Neon)   │  │ (Cache)  │  │  Blob   │                         │
│  └──────────┘  └──────────┘  └──────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Frontend Architecture

**Pattern:** Next.js 16 App Router com React 19 Server Components + Client Components

```
src/
├── app/                          # Next.js App Router (rotas + páginas)
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── page.tsx                  # Landing page (pública)
│   ├── (public)/                 # Páginas públicas
│   ├── (auth)/                   # Autenticação (signin, signup, 2FA, etc.)
│   ├── (dashboard)/              # Dashboard principal (requer auth + 2FA)
│   ├── (minha-area)/             # Área pessoal (contas pendentes)
│   ├── (admin)/                  # Super Admin
│   └── api/                      # API Routes (Backend)
├── components/
│   ├── ui/                       # Componentes reutilizáveis (Table, FormModal, Charts)
│   ├── forms/                    # Formulários por entidade (20 forms)
│   ├── layout/                   # Layout components (Navbar, Sidebar, Gates)
│   ├── landing/                  # Landing page sections
│   └── admin/                    # Componentes administrativos
├── hooks/                        # Custom hooks (useWebSocket, useEntityList, etc.)
├── lib/                          # Utilitários server-side
│   ├── auth.ts                   # NextAuth config
│   ├── validations/              # Zod schemas
│   ├── i18n/                     # Traduções (pt, en, fr, es)
│   └── ...                       # CSRF, audit, email, rate-limit, etc.
├── provider/                     # React context providers
├── styles/                       # CSS global
└── types/                        # TypeScript type declarations
```

**Decisões Técnicas:**

| Decisão | Motivo |
|---------|--------|
| App Router | Server Components reduzem JS do cliente, SEO nativo, layouts aninhados |
| Client Components só quando necessário | Interatividade, hooks, estado local |
| Route Groups `(group)` | Isolam layouts por contexto (auth vs dashboard vs admin) |
| Server Actions evitadas | API Routes dão mais controlo e são testáveis |
| `useEntityList` hook genérico | Evita repetição de paginação/filtro/ordenação em todas as listas |

### 1.3 Backend Architecture

**Pattern:** API Routes do Next.js (ficheiro por recurso)

```
src/app/api/
├── auth/                         # Autenticação (NextAuth + 2FA + signup)
├── admin/                        # Super Admin (escolas, catálogo, config)
├── [recurso]/                    # CRUD por entidade (students, teachers, classes, etc.)
│   ├── route.ts                  # GET (list) + POST (create)
│   └── [id]/
│       ├── route.ts              # GET (detail) + PUT/PATCH + DELETE
│       └── [sub-recurso]/        # Ações aninhadas
└── health/route.ts               # Health check
```

**Camadas:**

```
API Route (req/res)
  → withCsrf / requireRole / requirePermission (middleware)
    → handler function
      → validação com Zod
        → lógica de negócio (prisma queries)
          → resposta JSON
```

**Segurança por camada:**

1. **Middleware Edge** — verifica session cookie (gate inicial)
2. **CSRF** — endpoints de mutação (POST/PUT/DELETE) usam `withCsrf()`
3. **Autorização** — `requireRole()`, `requirePermission()`, `requireFeature()`
4. **Validação** — Zod schemas em `lib/validations/`
5. **Audit** — `audit.ts` regista todas as operações CRUD

### 1.4 WebSocket Architecture

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  Client  │◄──►│  ws-server   │◄──►│  Server-side │
│ (Browser)│ WS │   (porta     │ WS │  (broadcast  │
│          │    │    3001)     │    │   via lib/   │
└──────────┘    └──────┬───────┘    │ws-broadcast) │
                       │            └──────────────┘
                       ▼
                  ┌──────────┐
                  │  Redis   │
                  │  (futuro)│
                  └──────────┘
```

**Flow de conexão:**
1. Client conecta ao WS (porta 3001)
2. Client envia `{ type: "auth", token }`
3. Server verifica token via API `/api/auth/verify-ws`
4. Se válido: `{ event: "auth_ok", payload: { userId } }`
5. Se inválido: `{ event: "auth_error" }` + disconnect após 10s

**Eventos suportados:**
- `notification` — notificações push
- `message` — mensagens internas
- `friend_request` / `friend_accepted` — pedidos de amizade
- `online_status` — online/offline tracking
- `session-update` — refresh de sessão (conta aprovada)
- `chat_message` — mensagens de chat em tempo real
- `auth_ok` / `auth_error` — resultado da autenticação WS

### 1.5 Database Architecture

**ORM:** Prisma 6 com PostgreSQL (Neon Serverless)

**Estratégia de Migrações:**
- Migrations versionadas por timestamp (`YYYYMMDDHHmmss`)
- Aplicadas via `prisma migrate deploy` em produção
- `prisma migrate dev` para desenvolvimento

**Modelos Core:**

```
School ──┬── User ──┬── Teacher
          │          ├── Student
          │          ├── Parent
          │          ├── AdminPermission
          │          ├── Conversation ── ChatMessage
          │          ├── Friend
          │          └── Message
          │
          ├── AcademicYear ── Enrollment ── Student
          ├── Class ──┬── Lesson
          │            ├── Exam
          │            ├── Assignment ── AssignmentSubmission
          │            └── Attendance
          ├── Subject ──┬── CourseSubject
          │              ├── TeacherSubject
          │              └── Result
          ├── GlobalSubject / GlobalCourse / GlobalClass
          ├── GradingConfig / GlobalGradingConfig
          ├── SupportTicket ── SupportTicketMessage
          ├── Notification
          ├── Announcement ── AnnouncementRead
          └── ImportJob
```

**Índices críticos:**
- `User.email` (unique)
- `Result(studentId, subjectId, trimester, academicYearId)` (unique)
- `Attendance(studentId, date, classId, lessonId)` (unique)
- `Friend(userId, friendId)` (unique)
- `Conversation(participant1Id, participant2Id)` (unique)

### 1.6 Autenticação

**NextAuth v5 com estratégia JWT:**

```
Credentials Login:
  1. POST /api/auth/callback/credentials
  2. authorize() → verifica email + password (bcrypt)
  3. Retorna user object com twoFactorEnabled
  4. JWT callback: token.twoFactorVerifiedAt = null (força 2FA)
  5. Session callback: mapeia token → session.user
  6. Cliente verifica twoFactorEnabled && !twoFactorVerifiedAt
  7. Redireciona para /signin/verify-2fa

2FA Verification:
  1. POST /api/auth/2fa/verify-signin
  2. Speakeasy.totp.verify(secret, token, window: 1)
  3. Se válido: twoFactorVerifiedAt = now()
  4. session.update() → JWT refresh → lê twoFactorVerifiedAt da DB
  5. TwoFactorGate permite acesso ao dashboard

Token Refresh:
  1. JWT callback corre em cada request
  2. Lê dados frescos da DB (role, permissions, 2FA status)
  3. Se sessionVersion mudou → token invalidado (força relogin)
```

### 1.7 Organização de Pastas (Convenções)

```
src/
├── app/
│   ├── (grupo)/
│   │   └── pagina/
│   │       ├── page.tsx            # Server component (wrapper)
│   │       ├── ClientComponent.tsx  # Client component (interatividade)
│   │       └── components/         # Componentes específicos da página
│   └── api/
│       └── recurso/
│           ├── route.ts            # GET/POST
│           └── [id]/
│               ├── route.ts        # GET/PUT/DELETE
│               └── acao/route.ts   # Ações específicas
├── components/
│   ├── ui/                         # Design system (reutilizável)
│   ├── forms/                      # Formulários por entidade
│   ├── layout/                     # Layout components
│   └── [dominio]/                  # Componentes específicos de domínio
├── hooks/                          # Custom hooks
├── lib/
│   ├── validations/                # Zod schemas (1 ficheiro por domínio)
│   └── i18n/                       # Traduções (1 ficheiro por idioma)
├── provider/                       # React context providers
├── styles/                         # CSS global
└── types/                          # TypeScript type declarations
```

---

## 2. Stack Tecnológica

### 2.1 Tabela Completa

| Categoria | Tecnologia | Versão | Justificação |
|-----------|-----------|--------|-------------|
| **Framework** | Next.js | 16.1.6 | SSR, SSG, App Router, API Routes integradas |
| **UI Library** | React | 19.2.3 | Server Components, maior ecossistema |
| **Linguagem** | TypeScript | 5.9.3 | Type safety, melhor DX |
| **Estilização** | Tailwind CSS | 4 | Utility-first, sem runtime, CSS nativo |
| **ORM** | Prisma | 6.19.2 | Type-safe queries, migrations, schema-first |
| **DB** | PostgreSQL (Neon) | 16 | Serverless, branching, escalável |
| **Auth** | NextAuth v5 | beta | OAuth, JWT, callbacks, adaptável |
| **Validação** | Zod | 4.3.6 | TypeScript-first, schemas compostos |
| **WebSocket** | ws (server) + nativo (client) | — | Leve, sem dependências pesadas |
| **Email** | Resend | — | API simples, HTML templates |
| **Cache** | Redis | 7 (Docker) | Sessões, rate-limit, WebSocket scaling |
| **Storage** | Vercel Blob | — | Upload de ficheiros, CDN integrada |
| **Charts** | Recharts | — | React-native, responsivo |
| **PDF** | jsPDF + jspdf-autotable | — | Certificados, relatórios |
| **XLSX** | xlsx (SheetJS) | — | Import/export de dados |
| **Icons** | lucide-react | — | Leve, tree-shakeable, consistente |
| **2FA** | speakeasy | 2.0 | TOTP standard, Google Authenticator |
| **QR Code** | qrcode | 1.5.4 | Geração de QR codes |
| **i18n** | Custom (JSON/TS) | — | Leve, sem framework pesado |
| **Testes** | Vitest + Jest | 4.1.6 / 30 | Unit + integration |
| **Linter** | ESLint 9 + typescript-eslint | — | Code quality |
| **Docker** | Node 20 Alpine + Docker Compose | — | Containerização |
| **CI/CD** | GitHub Actions | — | Quality checks + Docker build |
| **Orquestração** | Kubernetes (K8s) | — | Escalabilidade horizontal |
| **Gestão de Estado** | Redux Toolkit | 2.11.2 | Estado global complexo (parcial) |

### 2.2 Dependências Críticas e Seu Propósito

| Dependência | Uso | Alternativa Considerada |
|------------|-----|----------------------|
| `next-auth` | Autenticação completa (credentials + OAuth) | Lucia Auth (menos maturidade) |
| `@prisma/client` | ORM type-safe | TypeORM (menos DX), Drizzle (mais novo) |
| `speakeasy` | TOTP para 2FA | otplib (idêntico) |
| `ws` | WebSocket server | Socket.IO (mais pesado, mais features) |
| `bcryptjs` | Password hashing | bcrypt (nativo, compilação) |
| `resend` | Email transacional | Nodemailer (mais config), SendGrid |
| `@reduxjs/toolkit` | Estado global | Zustand (mais leve), Context API |
| `zod` | Validação de schemas | Yup (menos TS integration), Joi |

---

## 3. Roadmap por Fases

### Fase 1 — Foundation (Sprint 1-2)

**Duração:** 2 semanas  
**Equipa:** 5/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬜ (baixa)

#### 3.1.1 Setup do Projeto

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Inicializar Next.js + TypeScript | TL | — | 2h |
| Configurar Tailwind CSS 4 + globals.css | TL | Next.js | 1h |
| Configurar ESLint + Prettier | TL | Next.js | 1h |
| Configurar Prisma + PostgreSQL (Neon) | TL | — | 2h |
| Configurar Docker + docker-compose | DevOps | — | 4h |
| Configurar estrutura de pastas | TL | — | 1h |
| Configurar CI/CD (GitHub Actions) | DevOps | Docker | 4h |
| Configurar Vercel.json + deploy config | DevOps | Next.js | 1h |

**Entregáveis:**
- Repositório com estrutura definida
- Ambiente de desenvolvimento em Docker
- CI/CD pipeline funcional
- Prisma schema inicial com User model

**Riscos:** Configuração de Neon + Prisma com pooler (advisory locks)

#### 3.1.2 Design System Base

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Configurar tema (light/dark) | FE-1 | Tailwind | 4h |
| Criar ThemeToggle + ThemeProvider | FE-1 | Tema | 2h |
| Componentes base: Button, Input, Card | FE-1 | — | 8h |
| Componentes base: Modal, Dropdown | FE-1 | — | 4h |
| Layouts base: Navbar, Sidebar | FE-1 | Tema | 8h |
| Responsividade base | FE-1 | Layouts | 4h |

**Entregáveis:**
- Design system com componentes base
- Provider de tema (light/dark)
- Layouts responsivos

**Complexidade:** ⬜⬜⬜⬜⬛ (média-baixa)

#### 3.1.3 Database Foundation

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Modelar School + User | TL/BE | Prisma | 4h |
| Modelar Teacher, Student, Parent | TL/BE | User | 4h |
| Migration inicial | TL/BE | Models | 2h |
| Seed data | TL/BE | Migration | 4h |

**Entregáveis:**
- Modelos core no Prisma
- Migration inicial aplicada
- Script de seed com dados de teste

**Complexidade:** ⬜⬜⬜⬛⬛ (média)

---

### Fase 2 — Authentication & Security (Sprint 3-4)

**Duração:** 2 semanas  
**Equipa:** 4/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬛ (média-alta)

#### 3.2.1 NextAuth Setup

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Configurar NextAuth v5 com credentials | TL | User model | 8h |
| Configurar JWT callbacks + session | TL | NextAuth | 4h |
| Configurar Google OAuth (opcional) | TL | NextAuth | 2h |
| Middleware de proteção de rotas | TL | NextAuth | 4h |
| Página de login (SignInClient) | FE-1 | NextAuth + UI | 8h |
| Página de registo (SignUp) | BE + FE-1 | NextAuth + validations | 8h |
| Password hashing + validação | BE | User model | 2h |
| CSRF protection | BE | — | 4h |

#### 3.2.2 2FA (Two-Factor Authentication)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Adicionar campos 2FA ao User | BE | Migration | 1h |
| API: setup (gerar secret) | BE | User + speakeasy | 2h |
| API: verify (ativar 2FA) | BE | speakeasy | 2h |
| API: verify-signin (login) | BE | speakeasy | 2h |
| API: status + disable | BE | — | 1h |
| Frontend: configuração 2FA (QR code) | FE-2 | APIs | 4h |
| Frontend: verify-2fa page | FE-2 | APIs + UI | 4h |
| TwoFactorGate component | TL | Session | 2h |
| JWT: twoFactorVerifiedAt flow | TL | NextAuth | 4h |

#### 3.2.3 Email + Password Recovery

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Resend integration | BE | — | 2h |
| Email templates (HTML) | BE | Resend | 4h |
| API: forgot-password | BE | Email + User | 4h |
| API: reset-password | BE | — | 2h |
| API: verify-email | BE | Email + User | 4h |
| Frontend: forgot/reset password | FE-1 | APIs | 4h |
| Frontend: verify email | FE-1 | API | 2h |

**Entregáveis da Fase 2:**
- Sistema de autenticação completo (credentials + Google)
- 2FA funcional (setup + verify + gate)
- Password recovery flow
- Email verification flow
- CSRF protection em todos os endpoints de mutação
- Middleware de proteção de rotas

**Riscos:**
- Google OAuth + 2FA: redirecionamento e callback URL handling
- JWT token refresh vs 2FA verifiedAt state
- CSRF token expiração

---

### Fase 3 — Core Backend (Sprint 5-8)

**Duração:** 4 semanas  
**Equipa:** 3 BE + 1 FE + 1 TL  
**Complexidade:** ⬜⬜⬜⬛⬛ (alta)

#### 3.3.1 RBAC + Permissions

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Modelo AdminPermission | BE | Migration | 2h |
| requireRole() middleware | BE | NextAuth | 2h |
| requirePermission() middleware | BE | AdminPermission | 4h |
| requireFeature() middleware | BE | School.features | 2h |
| Admin CRUD + permissions API | BE | AdminPermission | 8h |
| School admin management UI | FE-2 | APIs | 8h |

#### 3.3.2 School Management

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| School CRUD API | BE | School model | 8h |
| School registration flow | BE + FE-1 | Email + School | 8h |
| School approval workflow | BE | School CRUD | 4h |
| School settings API | BE | School model | 4h |
| Admin: schools list + detail | FE-2 | APIs | 8h |
| School branding provider | FE-1 | School API | 4h |

#### 3.3.3 Academic Structure

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Global catalog CRUD (curso, classe, disciplina) | BE | Migration | 8h |
| School catalog CRUD | BE | Global + School | 8h |
| Course + Subject models | BE | Migration | 4h |
| Class model + CRUD | BE | Course | 4h |
| Admin catalog management UI | FE-2 | APIs | 8h |
| School catalog management UI | FE-2 | APIs | 8h |

#### 3.3.4 Teacher/Student/Parent CRUD

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Teacher CRUD API | BE | User + School | 8h |
| Student CRUD API | BE | User + School | 8h |
| Parent CRUD API | BE | User + School | 8h |
| Teacher-Subject-Class assignments | BE | Teacher + Subject + Class | 4h |
| CRUD UIs (list + form + detail) | FE-2 | APIs | 16h |
| Import (XLSX/CSV) for teachers/students | BE + FE-2 | APIs | 16h |

#### 3.3.5 Academic Year + Enrollment

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| AcademicYear CRUD API | BE | School | 4h |
| Enrollment CRUD API | BE | Student + Class + Year | 8h |
| Year transition (promote/retain) | BE | Enrollment + Results | 8h |
| Frontend: academic years + enrollments | FE-2 | APIs | 8h |

**Entregáveis da Fase 3:**
- RBAC completo (roles + permissions + features)
- Gestão de escolas (registo, aprovação, configuração)
- Catálogo global e por escola
- CRUD de professores, alunos, encarregados
- Import bulk via XLSX/CSV
- Anos letivos + matrículas

**Riscos:**
- Permissions granularidade vs performance
- Validação de dados no import bulk
- Transição de ano letivo (dados legacy)

---

### Fase 4 — Academic Features (Sprint 9-12)

**Duração:** 4 semanas  
**Equipa:** 5/5 developers  
**Complexidade:** ⬜⬜⬜⬛⬛ (alta)

#### 3.4.1 Classes + Lessons (Timetable)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Lesson CRUD API | BE | Class + Subject + Teacher | 8h |
| Timetable display (BigCalendar) | FE-2 | APIs | 8h |
| Lesson attendance API | BE | Lesson + Student | 4h |
| Frontend: lesson management | FE-1 | APIs | 8h |

#### 3.4.2 Exams + Assignments

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Exam CRUD API | BE | Class + Subject | 4h |
| Assignment CRUD API | BE | Class + Subject | 4h |
| Assignment submission API | BE | Assignment + Student | 4h |
| Frontend: exam management | FE-1 | APIs | 8h |
| Frontend: assignment management | FE-1 | APIs | 8h |

#### 3.4.3 Results + Grading

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Result CRUD API | BE | Student + Subject | 8h |
| GradingConfig + GlobalGradingConfig | BE | School + AcademicYear | 8h |
| Evaluation engine (trimestre weights, formulas) | BE | Results + GradingConfig | 16h |
| Recurso (retake) logic | BE | Evaluation engine | 4h |
| Averages + class summary API | BE | Results | 4h |
| Frontend: results management | FE-1 | APIs | 8h |
| Frontend: evaluation interface | FE-1 | APIs | 8h |
| Frontend: grading config | FE-2 | APIs | 8h |

#### 3.4.4 Attendance

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Attendance CRUD API | BE | Student + Class + Lesson | 8h |
| Attendance alerts API | BE | Attendance | 4h |
| Attendance stats API | BE | Attendance | 4h |
| Frontend: attendance management | FE-1 | APIs | 8h |

#### 3.4.5 Reports + Analytics

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Grade reports API | BE | Results | 4h |
| Attendance reports API | BE | Attendance | 4h |
| Student portfolio API | BE | Results + Attendance | 4h |
| Cycle certificate generation (PDF) | BE | AcademicHistory | 8h |
| Frontend: reports | FE-2 | APIs + Recharts | 8h |
| Frontend: certificates | FE-2 | APIs + jsPDF | 4h |

**Entregáveis da Fase 4:**
- Sistema de horários (timetable) completo
- Gestão de exames e trabalhos
- Motor de avaliação (notas, trimestres, fórmulas)
- Gestão de presenças com alertas
- Relatórios e estatísticas
- Certificados de ciclo (PDF)

**Riscos:**
- Motor de avaliação: regras de negócio complexas (Approva/Reprova/Recurso)
- Cálculo de médias ponderadas com configurações por escola
- Performance em reports com muitos dados

---

### Fase 5 — Social & Communication (Sprint 13-14)

**Duração:** 2 semanas  
**Equipa:** 4/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬛ (média)

#### 3.5.1 WebSocket Server

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| ws-server.js (Node.js, port 3001) | TL/BE | — | 8h |
| Auth verification (token → userId) | TL/BE | NextAuth | 4h |
| Event router engine | TL/BE | — | 4h |
| broadcastToUser() + broadcastToAll() | TL/BE | — | 2h |
| Online status tracking | TL/BE | — | 2h |
| Client hook (useWebSocket) | FE-1 | — | 4h |
| Fallback + reconnect logic | FE-1 | — | 4h |

#### 3.5.2 Internal Messaging

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Message CRUD API | BE | User + School | 4h |
| Message list + compose UI | FE-2 | APIs | 8h |
| WS broadcast on new message | BE | ws-broadcast | 2h |
| Read/unread tracking | BE | Message | 2h |

#### 3.5.3 Real-time Chat

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Conversation model + API | BE | Migration | 4h |
| ChatMessage model + API | BE | Migration | 4h |
| Chat UI (ConversationList + MessageList) | FE-2 | APIs | 12h |
| Real-time message delivery via WS | BE + FE-1 | ws-broadcast | 8h |
| Unread count + notifications | BE + FE-2 | Chat + WS | 4h |

#### 3.5.4 Friends System

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Friend model + API | BE | Migration | 4h |
| Friend request/accept/reject flow | BE | Friend + WS | 4h |
| Friend list UI | FE-2 | APIs | 8h |
| Online status indicator | BE + FE-1 | WS | 4h |
| Friend search + suggestions | BE + FE-2 | User search | 4h |

#### 3.5.5 Notifications

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Notification model + API | BE | Migration | 4h |
| Notification creation + WS broadcast | BE | ws-broadcast | 4h |
| Broadcast to school/class/course | BE | — | 4h |
| Notification dropdown UI | FE-2 | APIs + WS | 8h |
| Mark as read + mark-all-read | BE + FE-2 | Notification API | 2h |

**Entregáveis da Fase 5:**
- WebSocket server funcional (autenticação, eventos, broadcast)
- Sistema de mensagens internas
- Chat em tempo real
- Sistema de amigos (pedidos, lista, online status)
- Sistema de notificações (push + dropdown)

**Riscos:**
- WebSocket scaling (single server → Redis pub/sub)
- Mensagens offline (fila de eventos)
- Race conditions em friend requests

---

### Fase 6 — Dashboard & UX (Sprint 15-16)

**Duração:** 2 semanas  
**Equipa:** 5/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬛ (média)

#### 3.6.1 Dashboard por Role

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Student dashboard (grades, attendance, upcoming) | FE-1 | APIs | 12h |
| Teacher dashboard (classes, schedule) | FE-1 | APIs | 8h |
| Parent dashboard (children overview) | FE-1 | APIs | 4h |
| School admin dashboard | FE-1 | APIs | 8h |
| Super admin dashboard | FE-2 | APIs | 8h |
| Dashboard layout persistence | FE-1 | DashboardPreference | 4h |
| Charts (Recharts): attendance, grades, stats | FE-2 | APIs | 12h |

#### 3.6.2 Profile + Settings

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Profile page (edit name, email, photo) | FE-2 | User API | 4h |
| Photo upload (Vercel Blob) | BE + FE-2 | Profile | 4h |
| Settings page (theme, locale, notifications) | FE-2 | UserPreference | 4h |
| School settings page | FE-2 | School API | 4h |
| GDPR export + account deletion | BE + FE-2 | User data | 8h |
| Help/FAQ page | FE-1 | help-content.ts | 4h |

#### 3.6.3 Navigation + Layout Polish

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Sidebar com menu dinâmico por role | FE-1 | features.ts | 8h |
| Navbar com search + notifications | FE-1 | APIs | 8h |
| Mobile navigation | FE-1 | Sidebar | 4h |
| Breadcrumbs | FE-1 | — | 2h |
| Empty states + skeletons | FE-1 | — | 8h |
| Error boundaries | FE-1 | — | 4h |

**Entregáveis da Fase 6:**
- Dashboards específicos por role (student, teacher, admin, super admin)
- Gráficos e estatísticas
- Perfil e configurações de utilizador
- Gestão de escola
- GDPR compliance
- Navegação responsiva e polida

---

### Fase 7 — Admin Panel (Sprint 17-18)

**Duração:** 2 semanas  
**Equipa:** 4/5 developers  
**Complexidade:** ⬜⬜⬜⬛⬛ (média-alta)

#### 3.7.1 Super Admin Panel

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Schools management (list, detail, approve/reject) | FE-2 | APIs | 12h |
| Users management | FE-2 | APIs | 8h |
| Applications management | FE-2 | APIs | 8h |
| Global catalog management | FE-2 | APIs | 8h |
| Global grading config | FE-2 | APIs | 8h |
| Platform settings | FE-2 | APIs | 4h |
| Platform statistics | BE + FE-2 | APIs | 8h |
| Super admin management | FE-2 | APIs | 4h |
| Support tickets management | FE-2 | APIs | 8h |

#### 3.7.2 Support System

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| SupportTicket model + API | BE | Migration | 4h |
| SupportTicketMessage API | BE | SupportTicket | 4h |
| Frontend: ticket list + create | FE-2 | APIs | 8h |
| Frontend: ticket detail + messages | FE-2 | APIs | 8h |

#### 3.7.3 Audit Log

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| AuditLog model + API | BE | Migration | 4h |
| Audit logging middleware | BE | — | 4h |
| Audit log viewer UI | FE-2 | APIs | 4h |

**Entregáveis da Fase 7:**
- Painel de Super Admin completo
- Gestão de tickets de suporte
- Sistema de auditoria (log de operações CRUD)
- Configuração global da plataforma

---

### Fase 8 — Announcements & Communication (Sprint 18-19)

**Duração:** 1 semana  
**Equipa:** 3/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬛ (média)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Announcement model + API | BE | Migration | 4h |
| Announcement targeting (class, course, user) | BE | Announcement | 4h |
| Read tracking API | BE | Announcement | 2h |
| Frontend: announcement management | FE-2 | APIs | 8h |
| Frontend: announcement display | FE-1 | APIs | 4h |
| Priority system (informativo, importante, urgente) | BE | — | 2h |

**Entregáveis:**
- Sistema de comunicados com targeting
- Tracking de leitura
- Prioridades visuais

---

### Fase 9 — Academic Cycles & History (Sprint 19-20)

**Duração:** 1 semana  
**Equipa:** 3/5 developers  
**Complexidade:** ⬜⬜⬜⬛⬛ (média-alta)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| EducationCycle model | BE | Migration | 2h |
| AcademicHistory model + API | BE | Migration | 4h |
| CycleCertificate model + API | BE | Migration | 4h |
| Year transition engine (preview + execute) | BE | AcademicYear + Enrollments | 8h |
| Cycle completion with certificate generation | BE | AcademicHistory | 8h |
| Frontend: academic history | FE-2 | APIs | 4h |
| Frontend: certificates | FE-2 | APIs + jsPDF | 4h |

**Entregáveis:**
- Ciclos de educação (Angolan system: primário, 1º ciclo, 2º ciclo)
- Histórico académico do aluno
- Certificados de conclusão de ciclo (PDF)
- Transição de ano letivo (approva/reprova/transferência)

**Riscos:**
- Regras de transição: aprovado/reprovado/recurso
- Geração de certificados com dados históricos

---

### Fase 10 — Landing Page & Public Site (Sprint 20)

**Duração:** 1 semana  
**Equipa:** 2 FE + 1 TL  
**Complexidade:** ⬜⬜⬜⬜⬛ (média)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Hero section + animations | FE-1 | Landing components | 4h |
| Features section | FE-1 | — | 4h |
| Pricing section | FE-1 | — | 2h |
| How it works + FAQ | FE-1 | — | 4h |
| Application status tracking | BE + FE-2 | Public API | 4h |
| Responsive landing | FE-1 | — | 4h |
| SEO + meta tags | TL | — | 2h |

**Entregáveis:**
- Landing page profissional
- Tracking de candidatura
- Páginas informativas (termos, privacidade)

---

### Fase 11 — Testing & QA (Sprint 21-22)

**Duração:** 2 semanas  
**Equipa:** 5/5 developers  
**Complexidade:** ⬜⬜⬜⬜⬛ (média)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Unit tests: password hashing | QA/BE | — | 2h |
| Unit tests: evaluation engine | QA/BE | Evaluation engine | 8h |
| Unit tests: middleware | QA/BE | Middleware | 4h |
| Unit tests: validations (Zod) | QA/BE | Validations | 4h |
| Integration tests: auth flow | QA/BE | Auth APIs | 8h |
| Integration tests: CRUD APIs | QA/BE | All models | 16h |
| E2E tests: login + 2FA | QA/FE | Auth | 8h |
| E2E tests: student flow | QA/FE | Academic APIs | 8h |
| E2E tests: admin flow | QA/FE | Admin APIs | 8h |
| Security audit | TL | All | 8h |
| Performance testing | DevOps | All | 4h |

**Entregáveis:**
- Suite de testes unitários (Vitest)
- Testes de integração para APIs core
- Testes E2E para fluxos críticos (Cypress/Playwright)
- Relatório de segurança
- Relatório de performance

---

### Fase 12 — Production & Deploy (Sprint 23-24)

**Duração:** 2 semanas  
**Equipa:** 5/5 developers  
**Complexidade:** ⬜⬜⬜⬛⬛ (alta)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| Docker image optimization | DevOps | All | 8h |
| Kubernetes manifests | DevOps | Docker | 8h |
| CI/CD pipeline final | DevOps | Docker + K8s | 8h |
| SSL/TLS + domain config | DevOps | — | 4h |
| Database migration strategy | TL/BE | Prisma | 4h |
| Environment secrets management | DevOps | — | 4h |
| Monitoring setup (logs, metrics) | DevOps | Deploy | 8h |
| Rate limiting (Redis) | BE | Redis | 4h |
| Cache strategy (Redis) | BE | Redis | 8h |
| CDN for static assets | DevOps | Deploy | 2h |
| Load testing | DevOps | Deploy | 4h |
| Rollback strategy | DevOps | K8s | 2h |
| Backup strategy | DevOps | DB | 4h |

**Entregáveis:**
- Deploy em produção (Vercel + K8s)
- CI/CD completo (GitHub Actions + Docker Hub)
- Monitoramento (logs, métricas, alertas)
- Rate limiting + cache (Redis)
- Backup automático do banco
- Documentação de operações

**Riscos:**
- Neon serverless: cold starts, conexões concorrentes
- WebSocket scaling com múltiplas réplicas
- Prisma migrations em produção (zero downtime)

---

### Fase 13 — Documentation & Handover (Sprint 24-25)

**Duração:** 1 semana  
**Equipa:** ALL  
**Complexidade:** ⬜⬜⬜⬜⬛ (baixa)

| Tarefa | Owner | Dependências | Tempo |
|--------|-------|-------------|-------|
| ARCHITECTURE.md (documentação técnica) | TL | All | 8h |
| README.md (setup, run, deploy) | TL | — | 4h |
| TEAM.md (responsabilidades, contactos) | TL | — | 2h |
| AUDITORIA.md (security + code review) | TL | All | 8h |
| BACKLOG.md (issues + melhorias) | ALL | — | 4h |
| Onboarding guide | TL | — | 4h |
| API documentation | BE | All APIs | 8h |
| Component library documentation | FE | All components | 8h |

**Entregáveis:**
- Documentação técnica completa (arquitetura, API, componentes)
- Guia de onboarding
- Backlog de melhorias futuras
- Relatório de auditoria

---

## 4. Divisão de Equipa

### 4.1 Estrutura

```
┌─────────────────────────────────────────────────────────┐
│                 Tech Lead (TL)                           │
│              Alberto (Alberto IH)                        │
│  ┌──────────┐  ┌────────┐  ┌────────┐  ┌────────────┐  │
│  │  BE-1    │  │  BE-2  │  │  FE-1  │  │   FE-2     │  │
│  │Backend   │  │Backend │  │Frontend│  │  Frontend  │  │
│  │  Lead    │  │  Dev   │  │  Lead  │  │    Dev     │  │
│  └──────────┘  └────────┘  └────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Responsabilidades

#### Tech Lead (TL)

**Responsabilidades:**
- Arquitetura geral do sistema
- Setup inicial do projeto (Next.js, Prisma, Docker, CI/CD)
- NextAuth + JWT + 2FA
- Middleware de segurança (CSRF, RBAC)
- WebSocket server architecture
- Code review de todos os PRs
- Decisões técnicas e trade-offs
- Documentação técnica
- Onboarding de novos developers

**Ownership Áreas:**
- `src/lib/auth.ts`
- `src/lib/csrf.ts`
- `src/lib/api-auth.ts`
- `src/middleware.ts`
- `src/provider/auth.tsx`
- `ws-server.js`
- `prisma/schema.prisma` (core models)
- `docs/`

#### Backend Lead (BE-1)

**Responsabilidades:**
- API architecture e padrões
- Prisma models e migrations
- Sistema de avaliação (evaluation engine)
- Transição de ano letivo
- Relatórios e estatísticas
- Import bulk (XLSX/CSV)
- Auditoria (audit.ts)
- Otimização de queries

**Ownership Áreas:**
- `src/app/api/evaluation/`
- `src/app/api/reports/`
- `src/app/api/import/`
- `src/app/api/academic-years/`
- `src/app/api/audit-logs/`
- `src/lib/evaluation-engine.ts`
- `src/lib/year-transition.ts`
- `src/lib/import-utils.ts`
- `src/lib/audit.ts`

#### Backend Developer (BE-2)

**Responsabilidades:**
- CRUD APIs (School, Teacher, Student, Parent, Class, etc.)
- Sistema de mensagens e chat
- Sistema de amigos
- Notificações
- Support tickets
- Upload de ficheiros (Vercel Blob)
- Email (Resend)
- Rate limiting

**Ownership Áreas:**
- `src/app/api/students/`
- `src/app/api/teachers/`
- `src/app/api/parents/`
- `src/app/api/chat/`
- `src/app/api/friends/`
- `src/app/api/notifications/`
- `src/app/api/support/`
- `src/app/api/messages/`
- `src/lib/email.ts`
- `src/lib/notifications.ts`
- `src/lib/ws-broadcast.ts`
- `src/lib/rate-limit.ts`

#### Frontend Lead (FE-1)

**Responsabilidades:**
- Design system e componentes base
- Layout system (Navbar, Sidebar, Gates)
- Landing page
- Auth pages (login, signup, 2FA, password recovery)
- Dashboard por role
- Charts e gráficos (Recharts)
- Responsividade e mobile
- Animações e UX
- WebSocket client hook

**Ownership Áreas:**
- `src/components/ui/` (design system)
- `src/components/layout/`
- `src/components/landing/`
- `src/app/(auth)/`
- `src/app/(public)/`
- `src/app/(dashboard)/dashboard/`
- `src/app/(minha-area)/`
- `src/hooks/useWebSocket.ts`
- `src/hooks/useOnlineStatus.ts`
- `src/provider/theme.tsx`

#### Frontend Developer (FE-2)

**Responsabilidades:**
- List pages (CRUD UIs)  
- Formulários (20 forms)
- Admin panel (super admin)
- Chat UI
- Friends UI
- Notification dropdown
- Settings pages (profile, 2FA, GDPR, school)
- Certificates (PDF)
- Support tickets UI

**Ownership Áreas:**
- `src/app/(dashboard)/list/`
- `src/app/(admin)/`
- `src/app/(dashboard)/settings/`
- `src/app/(dashboard)/support/`
- `src/app/(dashboard)/profile/`
- `src/components/forms/`
- `src/components/admin/`
- `src/components/ui/NotificationDropdown.tsx`
- `src/hooks/useUnreadNotifications.ts`

### 4.3 Matriz de Responsabilidades (RACI)

| Módulo | TL | BE-1 | BE-2 | FE-1 | FE-2 |
|--------|:--:|:----:|:----:|:----:|:----:|
| Auth + 2FA | **R** | C | I | C | I |
| RBAC / Permissions | **R** | C | I | I | **R** |
| School Management | C | I | **R** | I | C |
| Global Catalog | I | **R** | C | I | C |
| Teacher CRUD | I | C | **R** | I | C |
| Student CRUD | I | C | **R** | I | C |
| Parent CRUD | I | C | **R** | I | C |
| Class + Lessons | I | **R** | C | C | C |
| Exams + Assignments | I | **R** | C | I | C |
| Evaluation Engine | C | **R** | I | I | I |
| Results + Grading | I | **R** | C | I | C |
| Attendance | I | **R** | C | I | C |
| Academic Year | C | **R** | C | I | I |
| Enrollments | I | **R** | C | I | C |
| Reports + Analytics | I | **R** | C | C | C |
| Import Bulk | I | **R** | C | I | C |
| WebSocket | **R** | I | C | C | I |
| Chat | I | I | **R** | I | C |
| Friends | I | I | **R** | I | C |
| Notifications | I | C | **R** | C | C |
| Messages | I | I | **R** | I | C |
| Support Tickets | I | I | **R** | I | C |
| Announcements | I | **R** | C | I | C |
| Certificates | C | **R** | I | I | C |
| Dashboard UI | I | I | I | **R** | C |
| Design System | C | I | I | **R** | C |
| Landing Page | I | I | I | **R** | C |
| Admin Panel | I | I | I | C | **R** |
| Settings | I | I | I | C | **R** |
| Profile | I | I | I | C | **R** |
| GDPR | I | C | **R** | I | C |
| Documentation | **R** | C | C | C | C |
| Tests | C | **R** | C | C | C |
| CI/CD | **R** | C | C | C | I |
| Deploy | **R** | C | C | I | I |

**Legenda:** R = Responsible, A = Accountable, C = Consulted, I = Informed

### 4.4 Comunicação e Fluxo de Trabalho

```
Daily (15 min):
  - O que fizeste ontem?
  - O que vais fazer hoje?
  - Bloqueios?

Sprint Planning (1h cada 2 semanas):
  - Refinamento do backlog
  - Estimativa (story points)
  - Atribuição de tarefas

Code Review:
  - Mínimo 1 approval para merge
  - TL faz review de todos os PRs
  - BE-1 review de BE-2, FE-1 review de FE-2

PR Conventions:
  - Título: [tipo] descrição curta (ex: [feat] add 2FA verification)
  - Descrição: o quê, porquê, como testar
  - Branch: feat/, fix/, refactor/, docs/
  - Squash merge
```

---

## 5. Módulos e Domínios

### 5.1 Matriz de Módulos

| Módulo | Responsabilidade | Tabelas | APIs | Componentes | Owner |
|--------|-----------------|---------|------|-------------|-------|
| **Auth** | Login, registo, 2FA, sessões | User, PasswordResetToken, EmailVerificationToken | `/api/auth/*` | SignInClient, Verify2FAClient | TL |
| **School** | Gestão de escolas, registo, aprovação | School, Application | `/api/schools/*`, `/api/admin/schools/*` | SchoolForm, SchoolFeaturesManager | BE-2 |
| **Users** | CRUD de utilizadores, roles, permissões | User, AdminPermission | `/api/user/*`, `/api/admins/*`, `/api/admin/users` | AdminForm | BE-2 |
| **Teachers** | CRUD, horários, disciplinas | Teacher, TeacherSubject, TeacherClass | `/api/teachers/*` | TeacherForm | BE-2 |
| **Students** | CRUD, matrículas, histórico, certificados | Student, AcademicHistory, CycleCertificate | `/api/students/*` | StudentForm | BE-2 |
| **Parents** | CRUD, associação a alunos | Parent, _ParentStudents | `/api/parents/*` | ParentForm | BE-2 |
| **Catalog** | Disciplinas, cursos, turmas globais + escolares | GlobalSubject, GlobalCourse, GlobalClass, SchoolSubject, SchoolCourse, SchoolClass | `/api/admin/catalog/*`, `/api/school-catalog/*` | — | BE-1 |
| **Classes** | Turmas, horários | Class, Lesson | `/api/classes/*`, `/api/lessons/*` | ClassForm, LessonForm, BigCalendar | BE-1 |
| **Academic** | Anos letivos, matrículas, transição | AcademicYear, Enrollment | `/api/academic-years/*`, `/api/enrollments/*` | — | BE-1 |
| **Evaluation** | Avaliações, notas, médias, fórmulas | Result, GradingConfig, GlobalGradingConfig, Exam, Assignment, AssignmentSubmission | `/api/evaluation/*`, `/api/results/*`, `/api/exams/*`, `/api/assignments/*` | ResultForm, ExamForm, AssignmentForm, Evaluation interface | BE-1 |
| **Attendance** | Presenças, alertas, estatísticas | Attendance | `/api/attendance/*` | AttendanceForm, LessonAttendanceForm | BE-1 |
| **Messaging** | Mensagens internas | Message | `/api/messages/*` | MessageForm | BE-2 |
| **Chat** | Chat em tempo real | Conversation, ChatMessage | `/api/chat/*` | Chat UI | BE-2 / FE-2 |
| **Friends** | Amizades, pedidos, online status | Friend | `/api/friends/*` | Friends UI | BE-2 / FE-2 |
| **Notifications** | Notificações push | Notification | `/api/notifications/*` | NotificationDropdown | BE-2 / FE-2 |
| **Announcements** | Comunicados, targeting, leitura | Announcement, AnnouncementRead | `/api/announcements/*` | Announcements, AnnouncementForm | BE-1 |
| **Support** | Tickets de suporte | SupportTicket, SupportTicketMessage | `/api/support/*` | SupportTicketForm | BE-2 |
| **Import** | Import bulk XLSX/CSV | ImportJob | `/api/import/*` | Import UI | BE-1 |
| **Reports** | Relatórios, estatísticas | — | `/api/reports/*` | Reports UI | BE-1 |
| **WebSocket** | Eventos em tempo real | — | `/api/auth/verify-ws`, `/api/auth/ws-token` | useWebSocket hook | TL |
| **Audit** | Log de operações CRUD | AuditLog | `/api/audit-logs/*` | Audit viewer | BE-1 |
| **Settings** | Preferências, 2FA, GDPR, escola | UserPreference, DashboardPreference | `/api/user-preferences/*`, `/api/gdpr/*`, `/api/auth/2fa/*` | Settings pages | FE-2 |
| **Dashboard** | Visão geral por role | — | Múltiplas APIs | StudentDashboard, Charts, StatCard | FE-1 |

### 5.2 Ordem de Implementação por Módulo

```
Fase 1: Auth (base) → School → Users
Fase 2: Catalog → Teachers → Students → Parents
Fase 3: Classes → Lessons → Academic Year → Enrollments
Fase 4: Exams → Assignments → Evaluation → Results → Attendance
Fase 5: WebSocket → Messaging → Chat → Friends → Notifications
Fase 6: Dashboard → Settings → Profile → Announcements
Fase 7: Admin Panel → Support → Audit
Fase 8: Reports → Certificates → Import
Fase 9: Landing Page → Public Pages
Fase 10: Tests → Documentation → Deploy
```

### 5.3 Dependências Entre Módulos

```
Auth → (todos os módulos protegidos)
School → (Teachers, Students, Parents, Classes, etc.)
Catalog → (Classes, Subjects, Courses)
Teachers → (Lessons, Exams, Assignments)
Students → (Enrollments, Results, Attendance, Certificates)
Classes → (Lessons, Enrollments, Attendance)
Academic Year → (Enrollments, Results, Transitions)
WebSocket → (Chat, Friends, Notifications, Online Status)
```

---

## 6. Sistema de Gestão de Trabalho

### 6.1 Metodologia

**Scrum adaptado** com sprints de 2 semanas.

### 6.2 Cerimónias

| Cerimónia | Frequência | Duração | Participantes |
|-----------|-----------|---------|---------------|
| Daily Standup | Diária | 15 min | Toda a equipa |
| Sprint Planning | 1x/sprint | 1h | Toda a equipa |
| Sprint Review | 1x/sprint | 30 min | Toda a equipa |
| Sprint Retro | 1x/sprint | 30 min | Toda a equipa |
| Refinement | 1x/sprint | 1h | TL + relevante |

### 6.3 Git Flow

```
main (produção)
  └── dev (desenvolvimento)
       ├── feat/auth
       ├── feat/2fa
       ├── feat/chat
       ├── fix/refresh-loop
       └── refactor/evaluation
```

**Regras:**
- `main` = produção (protegida, sem push direto)
- `dev` = integração (branch base para features)
- `feat/*` = novas funcionalidades
- `fix/*` = correções de bugs
- `refactor/*` = refatoração
- `docs/*` = documentação

**PR Template:**
```md
## Descrição
[O que foi feito e porquê]

## Tipo de Mudança
- [ ] feat (nova funcionalidade)
- [ ] fix (correção de bug)
- [ ] refactor (refatoração)
- [ ] docs (documentação)
- [ ] test (testes)

## Como Testar
[Passos para reproduzir/testar]

## Checklist
- [ ] Código segue as convenções
- [ ] Testes passam (npm test)
- [ ] Lint passou (npm run lint)
- [ ] Prisma generate correu
- [ ] Documentação atualizada

## Screenshots (se aplicável)
```

### 6.4 Definition of Done

- [ ] Código escrito e funcional
- [ ] Testes unitários (quando aplicável)
- [ ] Lint passou sem erros
- [ ] Code review aprovado (mínimo 1)
- [ ] Build bem-sucedido (`npm run build`)
- [ ] Prisma migrations atualizadas (se aplicável)
- [ ] Documentação atualizada (se aplicável)

### 6.5 Naming Conventions

| Entidade | Convenção | Exemplo |
|----------|-----------|---------|
| **Ficheiros React** | PascalCase | `SignInClient.tsx` |
| **Ficheiros util** | camelCase | `api-auth.ts` |
| **API routes** | camelCase (directoria) | `verify-signin/route.ts` |
| **Funções** | camelCase | `handleSubmit()` |
| **Componentes** | PascalCase | `TwoFactorGate` |
| **Tipos/Interfaces** | PascalCase | `WSEvent` |
| **BD Models** | PascalCase | `User`, `Friend` |
| **BD Colunas** | camelCase | `twoFactorEnabled` |
| **Env vars** | UPPER_SNAKE_CASE | `DATABASE_URL` |
| **Git branches** | `tipo/descricao` | `feat/2fa-setup` |

---

## 7. Estratégia de Escalabilidade

### 7.1 Estado Atual

- Monólito Next.js + WebSocket server
- PostgreSQL (Neon serverless)
- Redis para cache e rate-limit
- Docker + Kubernetes (2 réplicas)

### 7.2 Evolução para Produção Real

#### Fase 1 — Otimização do Monólito (curto prazo)
```
- Cache de queries frequentes (Redis)
- Rate limiting por IP/user
- Paginação otimizada (cursor-based)
- Índices de BD para queries lentas
- Lazy loading de componentes
- Image optimization (Vercel Blob CDN)
```

#### Fase 2 — Separação de Responsabilidades (médio prazo)
```
Monólito inicial:
┌─────────────────────────────┐
│      Next.js + API Routes   │
│  ┌──────────┐ ┌──────────┐  │
│  │  Frontend│ │  Backend │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────────────────┐   │
│  │   WebSocket Server   │   │
│  └──────────────────────┘   │
└─────────────────────────────┘

Separação futura:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Frontend │  │  API     │  │  WS      │
│ (Next.js)│  │ (Fastify)│  │  Server  │
│  Vercel  │  │  K8s     │  │  K8s     │
└──────────┘  └──────────┘  └──────────┘
     │              │            │
     └──────────────┴────────────┘
                    │
              ┌─────┴─────┐
              │  Redis    │
              │ (Pub/Sub) │
              └───────────┘
                    │
              ┌─────┴─────┐
              │PostgreSQL │
              │  (Neon)   │
              └───────────┘
```

#### Fase 3 — Microserviços (longo prazo)
```
API Gateway
  ├── Auth Service
  ├── School Service
  ├── Academic Service
  ├── Evaluation Service
  ├── Social Service (Chat + Friends)
  ├── Notification Service
  └── Report Service
```

### 7.3 Estratégias Específicas

#### WebSocket Scaling
```
Estado atual:
  broadcastToUser(userId, event) → procura em conexões locais

Com Redis Pub/Sub:
  broadcastToUser(userId, event) → Redis → todas as instâncias WS
```

#### Database
```
- Neon: auto-scaling, branching para dev
- Read replicas para relatórios pesados
- Connection pooling (PgBouncer via Neon)
- Query optimization (explain analyze, índices)
- Materialized views para dashboards
```

#### Cache
```
Redis:
  - Sessões (se migrar de JWT para session store)
  - Rate limit counters
  - WebSocket pub/sub
  - Cache de queries frequentes (features, permissions)
  - Online status (em vez de memória)
```

#### CDN
```
Vercel Edge Network:
  - Static assets (CSS, JS, images)
  - Vercel Blob para uploads (professores, alunos)
  - Next.js ISR para páginas públicas
```

---

## 8. Estratégia de Qualidade

### 8.1 Pirâmide de Testes

```
        ╱╲
       ╱ E2E ╲
      ╱────────╲
     ╱Integration╲
    ╱──────────────╲
   ╱   Unit Tests   ╲
  ╱────────────────────╲
 ╱   Static Analysis   ╲
╱ (TypeScript + ESLint)  ╲
```

### 8.2 Plano de Testes

| Tipo | Ferramenta | O que testar | Cobertura Alvo |
|------|-----------|-------------|----------------|
| **Unitários** | Vitest | Password, evaluation engine, validation schemas, rate-limit, middleware | 80%+ |
| **Integração** | Vitest + supertest | API endpoints (CRUD), auth flow, 2FA, permissions, import | 60%+ |
| **E2E** | Playwright | Login, 2FA, student flow, admin flow, chat | Fluxos críticos |
| **Componentes** | Vitest + React Testing Library | UI components, forms, dashboard widgets | 50%+ |

### 8.3 Security Checklist

- [x] Password hashing (bcrypt, 12 rounds)
- [x] CSRF protection (todos os endpoints de mutação)
- [x] Rate limiting (100 req/min por IP)
- [x] Session rotation (2FA verifiedAt reset em novo login)
- [x] Input validation (Zod em todas as APIs)
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] XSS protection (React default, Content-Type headers)
- [ ] HTTPS (SSL/TLS)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Audit logging (CRUD operations)
- [ ] GDPR compliance (export + account deletion)
- [ ] Secrets management (Docker secrets, .env in gitignore)

### 8.4 Code Review Checklist

```
- [ ] Segue as convenções do projeto?
- [ ] Typescript types estão corretos?
- [ ] Zod validation nos inputs?
- [ ] CSRF protection em mutações?
- [ ] Error handling adequado?
- [ ] Logging para debugging?
- [ ] Prisma queries otimizadas (N+1?)
- [ ] Responsividade (se frontend)?
- [ ] Acessibilidade básica (aria, roles)?
- [ ] Testes escritos/atualizados?
```

### 8.5 Error Handling Strategy

```
Camadas:
1. API Route → try/catch → { error: mensagem, status: code }
2. Client → try/catch → feedback visual (toast, inline error)
3. UI → ErrorBoundary → fallback component
4. Global → logger (console.error + audit log)

Códigos de erro padrão:
  400: Bad Request (validação)
  401: Unauthorized (não autenticado)
  403: Forbidden (sem permissão)
  404: Not Found
  409: Conflict (duplicado)
  429: Too Many Requests (rate limit)
  500: Internal Server Error
```

### 8.6 Logging Strategy

```
API Routes:
  - console.error() com detalhes do erro
  - AuditLog para operações CRUD
  - Prisma events (query logging em dev)

WebSocket:
  - console.log() para conexões/desconexões
  - Event logging para debug

Produção:
  - Logs do Docker/Pod (stdout/stderr)
  - Monitoramento com ferramenta externa
```

---

## 9. Onboarding

### 9.1 Setup Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/your-org/cur10usx
cd cur10usx

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as credenciais

# 3. Instalar dependências
cd cur10us
npm install

# 4. Setup da base de dados
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Iniciar em desenvolvimento
npm run dev
# Next.js em http://localhost:3000
# WebSocket em http://localhost:3001

# Com Docker:
cd ..
make build
make up
```

### 9.2 Ordem Recomendada de Estudo

```
1. README.md — visão geral do projeto
2. ARCHITECTURE.md — arquitetura técnica
3. Prisma schema — modelos de dados
4. src/lib/auth.ts — sistema de autenticação
5. src/middleware.ts — proteção de rotas
6. src/app/(auth)/ — fluxo de autenticação
7. src/app/api/student/route.ts — exemplo de CRUD API
8. src/app/(dashboard)/list/students/page.tsx — exemplo de list page
9. src/hooks/useEntityList.ts — padrão de listagem
10. src/lib/evaluation-engine.ts — lógica de negócio core
11. ws-server.js — WebSocket server
12. src/hooks/useWebSocket.ts — WebSocket client
```

### 9.3 Stack que Precisas Conhecer

| Tecnologia | Nível Necessário |
|-----------|-----------------|
| TypeScript | Avançado |
| React 19 (Server Components) | Avançado |
| Next.js 16 (App Router) | Avançado |
| Tailwind CSS 4 | Intermédio |
| Prisma 6 | Intermédio |
| PostgreSQL | Intermédio |
| NextAuth v5 | Específico (lê docs) |
| Zod | Intermédio |
| WebSocket (ws) | Básico |
| Docker | Básico |
| Git + GitHub | Avançado |

### 9.4 Convenções Obrigatórias

```
1. Todo o código é TypeScript (strict mode)
2. Componentes são Server Components por omissão
3. "use client" só quando necessário
4. Imports ordenados: react → next → lib → components
5. Zod para validação de inputs
6. CSRF protection em todos os POST/PUT/DELETE
7. Audit.log() em operações CRUD
8. Nenhum console.log() em produção
9. Branches: feat/fix/refactor/docs/
10. PRs com squash merge
```

### 9.5 Fluxo de Contribuição

```bash
# 1. Atualizar dev
git checkout dev
git pull origin dev

# 2. Criar branch
git checkout -b feat/minha-feature

# 3. Desenvolver
# ... código ...

# 4. Verificar qualidade
npm run lint
npm run typecheck  # ou tsc --noEmit
npm run test

# 5. Commit (se aplicável)
git add .
git commit -m "[feat] descrição clara do que foi feito"

# 6. Push e PR
git push origin feat/minha-feature
# Abrir PR no GitHub para dev
```

---

## 10. Apêndices

### 10.1 Glossário

| Termo | Definição |
|-------|-----------|
| **2FA** | Autenticação de dois fatores (TOTP) |
| **RBAC** | Role-Based Access Control |
| **CSRF** | Cross-Site Request Forgery |
| **TOTP** | Time-based One-Time Password |
| **SSR** | Server-Side Rendering |
| **JWT** | JSON Web Token |
| **REST** | Representational State Transfer |
| **CRUD** | Create, Read, Update, Delete |
| **E2E** | End-to-End (testes) |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **K8s** | Kubernetes |
| **Neon** | PostgreSQL serverless provider |
| **Speakeasy** | Biblioteca TOTP para Node.js |
| **Resend** | Serviço de email transacional |

### 10.2 Links Úteis

| Recurso | URL |
|---------|-----|
| Next.js Docs | https://nextjs.org/docs |
| NextAuth v5 | https://authjs.dev |
| Prisma Docs | https://www.prisma.io/docs |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| Neon Docs | https://neon.tech/docs |
| Zod Docs | https://zod.dev |
| Speakeasy | https://github.com/speakeasyjs/speakeasy |
| Resend | https://resend.com/docs |
| Vercel Blob | https://vercel.com/docs/storage/vercel-blob |

### 10.3 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Iniciar dev server
npm run lint          # Verificar código
npm run test          # Correr testes
npx prisma studio    # UI da base de dados
npx prisma migrate dev  # Criar migration
npx prisma db seed   # Popular dados de teste

# Docker
make build            # Construir imagens
make up               # Iniciar containers
make down             # Parar containers
make clean            # Limpar tudo

# Produção
make k8s-apply        # Aplicar K8s manifests
make k8s-logs         # Ver logs do pod
make k8s-web          # Abrir browser

# Git
npm run deploy        # Script de deploy (deploy.sh)
```

---

*Documento gerado em Maio 2026.  
Cur10usX — Plataforma de Gestão Escolar.*
