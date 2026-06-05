# Cur10usX

> Plataforma de Gestão Escolar Multi-Tenant · ft_transcendence (42 School) · v1.1.0

Cur10usX é uma plataforma SaaS de gestão escolar desenhada para o contexto educacional angolano.
Substitui processos manuais (papel, Excel) por uma única solução unificada que cobre
administração escolar, gestão académica, comunicação institucional e avaliação de desempenho,
com **multi-tenancy**, **2FA**, **tempo real via WebSocket** e **suporte multi-idioma**.

---

## 📑 Índice

1. [Descrição do Projeto](#1-descrição-do-projeto)
2. [Equipa e Roles](#2-equipa-e-roles)
3. [Gestão de Projeto](#3-gestão-de-projeto)
4. [Tech Stack](#4-tech-stack)
5. [Schema da Base de Dados](#5-schema-da-base-de-dados)
6. [Lista de Funcionalidades](#6-lista-de-funcionalidades)
7. [Lista de Módulos e Pontuação](#7-lista-de-módulos-e-pontuação)
8. [Justificação de Escolhas Técnicas](#8-justificação-de-escolhas-técnicas)
9. [Contribuições Individuais](#9-contribuições-individuais)
10. [Como Executar (Instruções)](#10-como-executar-instruções)
11. [Como Fazer Deploy](#11-como-fazer-deploy)
12. [Recursos e Referências](#12-recursos-e-referências)
13. [Declaração de Uso de IA](#13-declaração-de-uso-de-ia)
14. [Licença](#14-licença)

---

## 1. Descrição do Projeto

### Problema
- Escolas angolanas utilizam processos manuais (papel, Excel) para gerir alunos, professores, notas, presenças e horários.
- Inexistência de uma plataforma centralizada que respeite o currículo e os ciclos de ensino angolanos.
- Comunicação fragmentada entre direção, professores, alunos e encarregados de educação.
- Falta de portabilidade do histórico académico entre escolas.

### Solução
Plataforma **multi-tenant** com:
- **Branding próprio por escola** (logo, cores, slogan, fontes).
- **Ciclos de ensino angolanos** (Primário, 1º Ciclo, 2º Ciclo) com trimestres, pesos e regras de aprovação.
- **5 perfis de utilizador** (super_admin, school_admin, teacher, student, parent) com permissões granulares.
- **Tempo real** (chat, notificações, presença online) via WebSocket + Redis pub/sub.
- **Multi-idioma** (PT, EN, ES).
- **Containerizado** (Docker Compose) e **cloud-native** (Kubernetes manifests incluídos).

### Métricas-alvo
- Suporte a **múltiplos utilizadores simultâneos** (testado com Redis pub/sub para multi-instância).
- **HTTPS** obrigatório via Nginx (auto-certificado em dev, real em prod).
- **Responsive** em todos os breakpoints (mobile → 4K).
- **Sem erros** no console do Chrome (build limpo).

---

## 2. Equipa e Roles

| Membro | Login 42 | Role Primária | Role Secundária | Foco |
|---|---|---|---|---|
| **Alberto Hamuyela** | `ahamuyel` | Tech Lead | DevOps / Architect | Arquitetura, infra, code review crítico, módulos core |
| **Edgar Gomes** | `edgomes` | Frontend Lead | UI/UX Designer | Landing, sistema de design, temas, animações |
| **Edson Cangulo** *(em rotação)* | `King-Kelcio` | Backend Lead | QA / Testes | API routes, validações, motor de avaliação, segurança |

> A equipa opera num modelo de **code review obrigatório**: zero merges diretos para `main`. Cada PR é revisado por, no mínimo, 1 outro membro.

---

## 3. Gestão de Projeto

### Metodologia
**Scrum adaptado de 2 semanas** com:
- **Daily standups** assíncronos via canal de equipa.
- **Sprint planning** no início de cada iteração.
- **Sprint review + retro** no final.
- **Definition of Done:** código revisto, testado, documentado, deploy em ambiente de staging.

### Ferramentas
- **Versionamento:** Git (estratégia GitFlow simplificado: `main` + `feature/*` + `hotfix/*`).
- **Project board:** Issues + Milestones neste repositório.
- **Documentação:** Pasta `docs/` (ARCHITECTURE, AUDITORIA, BACKLOG, TEAM, ENGINEERING_PLAN).
- **CI/CD:** GitHub Actions (a configurar — opcional, fora do scope do subject).

### Estratégia de Branches
```
main          ← produção, sempre deployable
└── feature/* ← novas features
└── hotfix/*  ← correções urgentes
```

---

## 4. Tech Stack

| Camada | Tecnologia | Versão | Justificação curta |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.1.6 | SSR + API routes num único codebase |
| UI | **React** | 19.2.3 | Server Components + Suspense |
| Styling | **Tailwind CSS** | 4.x | Utility-first, design system consistente |
| Components | **Radix UI** + **lucide-react** | latest | Acessibilidade WAI-ARIA nativa |
| State | **Redux Toolkit** + **React-Redux** | 2.11 / 9.2 | Estado partilhado cliente |
| Forms | **Zod** + **react-hook-form** (implícito) | 4.3 | Validação partilhada client/server |
| ORM | **Prisma** | 6.19 | Type-safety + migrations |
| Database | **PostgreSQL** | 16-alpine | Relacional, ACID, multi-tenant |
| Cache / Pub-Sub | **Redis** (ioredis) | 7-alpine | WS broadcast + rate limit |
| WebSocket | **`ws`** (Node) | 8.20 | Leve, sem dependências |
| Auth | **NextAuth (Auth.js v5)** | 5.0 beta | Providers, JWT, OAuth, 2FA |
| Crypto | **bcryptjs** (12 rounds) | 3.0 | Hash + salt nativo |
| 2FA | **speakeasy** (TOTP) | 2.0 | Padrão RFC 6238 |
| Email | **Resend** | 6.9 | API simples, dev-friendly |
| Uploads | **Vercel Blob** | 2.3 | Storage serverless |
| Charts | **Recharts** | 3.7 | Composável, responsivo |
| Calendar | **react-big-calendar** | 1.19 | Vista semanal/mensal |
| Export | **jsPDF**, **xlsx** | 4.2 / 0.18 | Relatórios PDF + Excel |
| QR Codes | **qrcode** | 1.5 | Cartões de aluno/professor |
| Validation | **Zod** | 4.3 | Schemas reutilizáveis |
| Containerização | **Docker Compose** | v2 | 5 serviços orquestrados |
| Reverse proxy | **Nginx** | alpine | TLS, rate limit, headers |
| Orquestração | **Kubernetes** (manifests) | 1.28+ | Opcional para produção |
| Testes | **Vitest** + **Jest** | 4.1 / 30 | Unit + integration |
| Linting | **ESLint** + **TypeScript** | 9 / 5.9 | Strict mode |

---

## 5. Schema da Base de Dados

Visão geral dos modelos Prisma (resumo — schema completo em `prisma/schema.prisma`):

```
School (tenant root)
├── User (super_admin, school_admin, teacher, student, parent)
│   ├── AdminPermission (granular permissions for school_admin)
│   ├── PasswordResetToken
│   ├── EmailVerificationToken
│   ├── Friend ↔ User
│   ├── Message (sent / received)
│   ├── Notification
│   ├── Conversation + ChatMessage
│   ├── TwoFactorSecret (in User)
│   └── Student | Teacher | Parent (1:1 extensions)
├── AcademicYear
├── Class
│   ├── Student
│   ├── Teacher (via TeacherClass)
│   └── Lesson / Exam / Assignment / Attendance
├── Subject
├── Course
├── Enrollment
├── Result + GradingConfig
├── Assignment + AssignmentSubmission
├── Announcement + AnnouncementRead
├── Application (candidaturas)
├── CycleCertificate
├── ImportJob
├── SupportTicket + SupportTicketMessage
├── AuditLog
└── SchoolClass / SchoolSubject / SchoolCourse (catalog)
```

**Multi-tenancy:** Todas as entidades com `schoolId` filtram por escola. Cascateiam em delete (`onDelete: Cascade`).

**Índices:** FKs e campos consultados frequentemente têm `@@index` para performance.

---

## 6. Lista de Funcionalidades

### Autenticação & Segurança
- ✅ Registo com email + password (validação Zod: ≥8 chars, maiúscula, minúscula, número)
- ✅ Login com Credentials (bcrypt 12 rounds + salt)
- ✅ Login social com **Google OAuth** (opt-in via `GOOGLE_AUTH_ENABLED`)
- ✅ **Verificação de email** obrigatória (token 24h, via Resend)
- ✅ **Reset de password** (token com expiração)
- ✅ **2FA TOTP** (RFC 6238, re-prompt por sessão)
- ✅ **CSRF** double-submit cookie em rotas mutadoras
- ✅ **Rate limiting** (login: 10/5min, signup: 5/10min, forgot: 3/h, etc.)
- ✅ **Session version invalidation** (kick-all após password change)
- ✅ **HTTPS** forçado (Nginx 301)
- ✅ Headers de segurança (HSTS, X-Frame-Options, X-Content-Type-Options, CSP)

### Gestão Académica
- ✅ Alunos, Professores, Encarregados (CRUD + importação CSV/XLSX)
- ✅ Turmas, Disciplinas, Cursos
- ✅ Matrículas (Enrollment) com estados
- ✅ Horários (Lesson + Calendar)
- ✅ Avaliação: **motor de avaliação configurável** (trimestres, pesos, arredondamento, recurso)
- ✅ Presenças (Attendance) por aula
- ✅ Trabalhos (Assignment) + submissões
- ✅ Exames (Exam)
- ✅ Resultados (Result) com cache e relatórios
- ✅ **Histórico académico** portátil
- ✅ **Certificados de ciclo** (CycleCertificate)
- ✅ **Relatórios** (PDF via jsPDF, Excel via xlsx)
- ✅ **Importação em massa** de dados (CSV/XLSX com validação)

### Comunicação em Tempo Real
- ✅ **WebSocket** server dedicado (`ws-server.js`) com auth via HMAC
- ✅ **Chat** 1-1 (Conversation + ChatMessage)
- ✅ **Mensagens internas** (Message — escola-wide)
- ✅ **Avisos** (Announcement + prioridade + read tracking)
- ✅ **Notificações** em tempo real (presence online)
- ✅ **Amigos** (Friend) com pedidos de amizade

### Multi-Tenancy & Configuração
- ✅ Cada escola tem **branding próprio** (logo, cores, slogan, fontes, tema)
- ✅ **Tema light/dark** por escola + presets (moderno, clássico, etc.)
- ✅ **Features toggle** por escola (paga por módulo)
- ✅ **Permissões granulares** para admin secundário

### Multi-Idioma
- ✅ **Português** (default)
- ✅ **Inglês**
- ✅ **Espanhol**
- ✅ Switcher no navbar (cookie `cur10usx_locale`)

### Outras
- ✅ **Audit logs** (AuditLog — ações sensíveis)
- ✅ **GDPR**: export e delete de conta (`/api/gdpr/*`)
- ✅ **Suporte tickets** (SupportTicket + mensagens)
- ✅ **QR Code** para perfil (aluno/professor)
- ✅ **Dashboards** específicos por role
- ✅ **Landing page** pública com seções de marketing
- ✅ **Páginas legais**: `/termos` e `/privacidade` (acessíveis sem login)

---

## 7. Lista de Módulos e Pontuação

> Subject ft_transcendence v21.1 — 1 Major module + ≥2 Minor modules.
> Módulos selecionados pela equipa:

| Módulo | Tipo | Pontos | Implementação |
|---|---|---|---|
| **Web (framework: Next.js)** | Mandatory | — | ✅ Next.js 16 App Router |
| **User Management + Auth** | Mandatory | — | ✅ NextAuth, OAuth, 2FA, validações |
| **Database + Multi-tenancy** | Mandatory | — | ✅ Prisma + PostgreSQL, schoolId em todas as FKs |
| **Real-time (WebSocket)** | Major module | 7 pts | ✅ `ws-server.js` + Redis pub/sub, chat, presença, notificações |
| **2FA / TOTP** | Minor module | 3 pts | ✅ speakeasy, re-prompt por sessão |
| **GDPR compliance** | Minor module | 2 pts | ✅ `/api/gdpr/account` (delete) + `/api/gdpr/export` |
| **Multi-language (3+ idiomas)** | Minor module | 2 pts | ✅ PT / EN / ES |
| **OAuth (Google)** | Minor module | 2 pts | ✅ NextAuth Google provider, opt-in |
| **Advanced security** | Minor module | 3 pts | ✅ CSRF, rate limit, bcrypt, session invalidation, HSTS, CSP |
| **Dashboard com analytics** | Minor module | 2 pts | ✅ Recharts, stats por escola |

**Total Major + Minor: 7 + 14 = 21 pontos** (sobre 21 disponíveis no subject).

---

## 8. Justificação de Escolhas Técnicas

### Porquê Next.js em vez de outro framework?
- **Unificação de frontend + backend** num único codebase (App Router + API routes).
- **SSR/SSG nativos** para SEO da landing page.
- **Standalone output** simplifica deploy Docker.
- **Ecossistema maduro** (NextAuth, Prisma adapter, etc.).

### Porquê Prisma em vez de SQL puro ou Drizzle?
- **Schema declarativa** que serve de single-source-of-truth.
- **Migrations automáticas** com `prisma migrate`.
- **Type-safety** end-to-end (gerado a partir do schema).
- **Suporte nativo multi-provider** (PostgreSQL, MySQL, SQLite).

### Porquê NextAuth em vez de JWT manual?
- **Providers prontos** (Credentials, Google, GitHub, etc.).
- **Callbacks type-safe** para injetar permissões no JWT.
- **Session management** com revogação.
- **Cookies HttpOnly + Secure** por default.

### Porquê WebSocket server separado em vez de usar Next.js API routes?
- **Long-lived connections** não combinam com serverless/lambda.
- **WS server dedicado** é trivial de escalar horizontalmente com Redis pub/sub.
- **Reduz acoplamento** — pode-se trocar a implementação sem tocar no app.

### Porquê Redis para pub/sub?
- **Baixa latência** (< 1ms) para mensagens WS.
- **Persistência opcional** (AOF/RDB) para cache.
- **Suporte nativo** a TTLs (rate limit).

### Porquê bcryptjs em vez de bcrypt nativo?
- **Sem necessidade de compilar** (importante para build Docker rápido).
- **Suficiente** para o subject (12 rounds = 2^12 iterações).

---

## 9. Contribuições Individuais

| Membro | Áreas de Contribuição | Ficheiros / Módulos principais |
|---|---|---|
| **Alberto Hamuyela** (ahamuyel) | Tech Lead, Backend core, Auth, WebSocket, DevOps, security | `src/lib/auth.ts`, `src/lib/api-auth.ts`, `src/lib/csrf.ts`, `src/lib/rate-limit.ts`, `src/lib/password.ts`, `ws-server.js`, `docker-compose.yml`, `containers/`, `Makefile`, `prisma/schema.prisma`, `src/middleware.ts` |
| **Edgar Gomes** (edgomes) | Frontend Lead, Landing, Design system, Temas, componentes UI | `src/components/landing/*`, `src/components/ui/*`, `src/provider/theme.tsx`, `src/components/auth/*`, `src/styles/`, configurações de cores/tipografia |
| **Edson Cangulo** (King-Kelcio) | Backend Lead, Validações, motor de avaliação, testes, CRUD | `src/lib/validations/*`, `src/lib/evaluation-engine.ts`, `src/app/api/*` (rotas de domínio), `src/lib/query-helpers.ts`, `tests/*` |

> Esta secção reflete a divisão de trabalho **efetiva** segundo `git log --author` e ownership de módulos.

---

## 10. Como Executar (Instruções)

### Pré-requisitos
- **Docker** 24+ e **Docker Compose** v2+
- **Make** (opcional, mas recomendado)
- 4 GB de RAM disponível

### Opção A: via Make (recomendado)
```bash
git clone <repo>
cd trans
cp .env.example .env
# Edita .env e preenche os segredos (mínimo: AUTH_SECRET)
make all         # build + up -d
```

A app fica disponível em **https://localhost** (cert auto-assinado — o browser vai pedir confirmação).

### Opção B: via docker compose direto
```bash
docker compose build
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed   # opcional (dados demo)
```

### Comandos úteis
```bash
make logs              # tail -f todos os containers
make shell             # shell dentro do app
make db-studio         # Prisma Studio (UI para a DB)
make test              # corre testes (Vitest)
make down              # para os containers
make clean             # para + remove volumes
make re                # fclean + all (rebuild do zero)
```

### Aceder aos serviços
- **App:** https://localhost
- **Prisma Studio:** http://localhost:5555 (após `make db-studio`)
- **Postgres:** localhost:5432 (apenas dev)
- **Redis:** localhost:6379 (apenas dev)

---

## 11. Como Fazer Deploy

### Produção (VPS / cloud)
1. **Substitui** o cert auto-assinado no `containers/nginx/entrypoint.sh` por um real (Let's Encrypt + certbot).
2. **Define** `DOMAIN=teu-dominio.com` no `.env` de produção.
3. **Gera** `AUTH_SECRET` novo: `openssl rand -base64 32`.
4. **Configura** `RESEND_API_KEY` e `RESEND_FROM_EMAIL` com domínio verificado.
5. (Opcional) **Habilita** `GOOGLE_AUTH_ENABLED=true` com credenciais OAuth reais.
6. `make all` — done.

### Kubernetes (manifests prontos)
```bash
make k8s-start
make k8s-apply
make k8s-status
```

> Manifests em `k8s/` (Deployment, Service, Ingress, ConfigMap, Secret).

---

## 12. Recursos e Referências

### Documentação interna
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitetura detalhada
- [`docs/AUDITORIA.md`](docs/AUDITORIA.md) — Auditoria técnica
- [`docs/BACKLOG.md`](docs/BACKLOG.md) — Backlog do produto
- [`docs/TEAM.md`](docs/TEAM.md) — Plano de integração de equipa
- [`docs/ENGINEERING_PLAN.md`](docs/ENGINEERING_PLAN.md) — Plano de engenharia
- [`SCHOOL_DATA_SYNC.md`](SCHOOL_DATA_SYNC.md) — Sincronização de dados escolares

### Documentação externa
- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth (Auth.js v5)](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Resend](https://resend.com/docs)
- [Docker Compose](https://docs.docker.com/compose/)

### Subject oficial
- [ft_transcendence v21.1](https://github.com/42School/ft_transcendence) — repo do subject (privado)

---

## 13. Declaração de Uso de IA

Esta secção é **obrigatória** e declara como ferramentas de IA foram usadas durante o desenvolvimento.

### Ferramentas utilizadas
- **Claude (Anthropic)** — usada como pair-programmer para:
  - Refatoração de código (rate limiter, validações).
  - Geração de testes (Vitest).
  - Revisão de segurança e auditoria do código.
  - Composição de documentação técnica (README, ARCHITECTURE, AUDITORIA).
  - **Geração da landing page** (cópia inicial, refactor manual posterior).

### Política de uso
- Todo o código gerado por IA foi **revisto e testado** por um membro humano da equipa.
- A IA foi usada como **assistente**, não como autor único — cada decisão arquitetural foi tomada em equipa.
- Nenhuma **decisão de segurança crítica** (auth, CSRF, rate limit) foi delegada à IA sem validação humana.
- **Documentação final** foi editada e aprovada por membros humanos antes de merged.

### Transparência
O avaliador pode confirmar este uso através:
- dos **prompts originais** (não commitados, disponíveis a pedido).
- do **histórico de conversas** (sob NDA da equipa).
- da **revisão por pares** (cada PR revisto por ≥1 humano).

---

## 14. Licença

Projeto interno da 42 School. Não publicar fora do contexto da avaliação.
Código de exemplo, documentação e assets são propriedade da equipa Cur10usX.

---

**Contacto:** `suporte@cur10usx.com`
**Última atualização:** Junho 2026
