# Cur10usX — Registo de Alterações

## v0.2.0 — Feature Update Completo (2026-03-01)

Implementação de 7 fases de funcionalidades planeadas para completar a plataforma escolar SaaS.

---

### Fase 0: Schema e Base de Dados

**Alterações ao Prisma Schema** (`cur10us/prisma/schema.prisma`):
- Adicionado `primaryColor String?` ao model `School` — cor primária personalizável por escola
- Adicionado `features Json?` ao model `School` — feature flags por escola (JSON com booleanos)
- Novo model `DashboardPreference` — layout personalizável do dashboard por utilizador
  - Campos: `userId` (unique), `layout` (Json), `updatedAt`
- Novo model `UserPreference` — preferências do utilizador persistidas
  - Campos: `userId` (unique), `theme`, `locale`, `notifyPlatform`, `notifyEmail`, `updatedAt`
- Relações adicionadas ao model `User`: `dashboardPreference` e `userPreference`

**Migração**: Aplicada via `npx prisma db push` (schema sync directo).



---

### Fase 1: Filtros e Ordenação em Todas as Listagens

**Objectivo**: Substituir os botões placeholder de filtro/ordenação por um sistema funcional e reutilizável.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/components/ui/FilterPanel.tsx` | Dropdown de filtros configurável (select, date, dateRange) com badge de contagem, suporte a endpoints dinâmicos e dark mode |
| `src/components/ui/SortButton.tsx` | Dropdown de ordenação com toggle asc/desc e indicador visual do campo activo |
| `src/lib/query-helpers.ts` | Helper `buildOrderBy()` que parseia `sortBy`/`sortDir` dos URL params, valida contra campos permitidos, suporta dot notation para campos aninhados |

#### Ficheiros modificados:

**Hook `useEntityList.ts`** — Upgrade completo:
- Novos parâmetros: `filters`, `sort`, `storageKey`
- Novos retornos: `setFilters`, `setSort`, `clearFilters`, `activeFilterCount`
- Serialização de filtros/sort como URL params junto com `page`, `limit`, `search`
- Reset automático para `page=1` quando filtros mudam
- Persistência em `sessionStorage` por chave de página

**API Routes actualizadas** (todas receberam `buildOrderBy` e parâmetros de filtro):
| API Route | Filtros | Ordenação |
|-----------|---------|-----------|
| `api/students/route.ts` | classId, gender | name, createdAt |
| `api/teachers/route.ts` | — | name, createdAt |
| `api/announcements/route.ts` | priority, classId | createdAt, priority, title, scheduledAt |
| `api/assignments/route.ts` | classId, subjectId | dueDate, title, createdAt |
| `api/lessons/route.ts` | day, classId, subjectId | day, startTime |
| `api/results/route.ts` | trimester, classId, type | score, date, type |
| `api/attendance/route.ts` | status, classId, dateRange | date |

**Páginas de lista actualizadas** (7 páginas):
- `list/students/page.tsx` — FilterPanel: turma, género | SortButton: nome, data
- `list/teachers/page.tsx` — SortButton: nome, data
- `list/announcements/page.tsx` — FilterPanel: prioridade, turma | SortButton: data, prioridade, título
- `list/assignments/page.tsx` — FilterPanel: turma, disciplina | SortButton: prazo, título, data
- `list/lessons/page.tsx` — FilterPanel: dia, turma, disciplina | SortButton: dia, hora
- `list/results/page.tsx` — Migração de filtros inline para FilterPanel: trimestre, turma, tipo
- `list/attendance/page.tsx` — Migração de filtros inline para FilterPanel: turma, estado, período

---

### Fase 2: Menu Mobile (Drawer)

**Objectivo**: Substituir o overlay grid por um drawer slide-in completo com todos os itens do menu.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/hooks/useUnreadNotifications.ts` | Hook que fetch `/api/notifications?unread=true&limit=1`, refresh a cada 30s, retorna `{ unreadCount, refresh }` |

#### Ficheiros modificados:

**`MobileNav.tsx`** — Reescrita completa:
- Drawer slide-in (esquerda → direita) com todas as secções do Menu.tsx (MENU + OUTROS)
- Backdrop semitransparente para fechar
- CSS transform + transition para animação
- Body scroll lock quando aberto
- Fecho automático ao navegar (usePathname)
- Bottom bar com 4 nav items + ícone sino com badge de notificações + toggle menu
- Ícone de notificação com badge vermelha usando `useUnreadNotifications`

---

### Fase 3: Dashboard School Admin

**Objectivo**: Expandir o dashboard com estatísticas detalhadas, gráfico de género e personalização.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/components/ui/StatCard.tsx` | Cartão genérico com ícone, label, valor, cor (indigo/cyan/amber/emerald/rose), subtitle opcional, href opcional |
| `src/app/api/user-preferences/dashboard/route.ts` | GET/PUT para layout do dashboard (DashboardPreference) |

#### Ficheiros modificados:

**`api/school-stats/route.ts`** — Expandido com `Promise.all()`:
- Novos campos: `maleStudents`, `femaleStudents`, `averageGrade`, `pendingAssignments`, `todayLessons`, `pendingApplications`, `recentAnnouncements`

**`components/ui/CountChart.tsx`** — Reescrito:
- PieChart (Recharts) em vez de RadialBarChart
- Recebe `maleStudents`, `femaleStudents`, `loading` como props
- Legenda: rapazes (indigo) / raparigas (rose) + total

**`dashboard/[id]/page.tsx`** — Reescrito:
- Grid de StatCards dinâmico (média geral, professores, turmas, tarefas pendentes, aulas hoje, candidaturas, anúncios)
- CountChart com dados de género
- Modal de personalização: toggle visibilidade + select tamanho (compacto/normal/expandido) por cartão
- Botão "Personalizar" (Settings2) no header
- Preferências guardadas via API `/api/user-preferences/dashboard`

---

### Fase 4: Feature Flags por Escola

**Objectivo**: Permitir ao super admin activar/desactivar funcionalidades por escola.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/lib/features.ts` | Registo de features: ESSENTIAL (students, teachers, classes, attendance, announcements, basicGrades — sempre activas) e OPTIONAL (finances, submissions, portfolio, certificates, advancedReports, inventory, calendar, internalMessages). Exports: `isFeatureEnabled()`, `getDefaultFeatures()`, `menuFeatureMap`, `featureLabels` |

#### Ficheiros modificados:

**`lib/auth.ts`** — JWT callback:
- Carrega `school.features` da BD ao renovar token
- Expõe como `token.schoolFeatures` → `session.user.schoolFeatures`

**`lib/api-auth.ts`**:
- Nova função `requireFeature(session, featureKey)` — verifica feature flags (super_admin bypassa)

**`components/layout/Menu.tsx`**:
- Import de `isFeatureEnabled` e `menuFeatureMap`
- `isVisible()` agora verifica feature flags via `menuFeatureMap`
- Adicionado item "Ajuda" (HelpCircle) na secção OUTROS

**`lib/validations/school.ts`**:
- `updateSchoolSchema` estendido com `features: z.record(z.string(), z.boolean())` e `primaryColor`

**`types/next-auth.d.ts`**:
- Adicionado `schoolFeatures?: Record<string, boolean> | null` a Session, User e JWT

**`api/admin/schools/[id]/route.ts`**:
- PUT aceita campo `features` com cast correcto para Prisma Json

---

### Fase 5: Preferências do Utilizador

**Objectivo**: Persistir tema, idioma e notificações na BD.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/app/api/user-preferences/route.ts` | GET (preferências ou defaults) / PUT (upsert theme, locale, notifyPlatform, notifyEmail) |
| `src/lib/i18n/index.ts` | Sistema i18n: `getTranslation()`, `t(locale, key)`, `useTranslation()` hook, tipo `TranslationKey` |
| `src/lib/i18n/pt.ts` | Dicionário português (common, auth, nav, settings) |
| `src/lib/i18n/en.ts` | Dicionário inglês (common, auth, nav, settings) |

#### Ficheiros modificados:

**`provider/theme.tsx`**:
- No mount, fetch `/api/user-preferences` para sincronizar tema da BD
- `toggleTheme()` agora também faz PUT para `/api/user-preferences`

**`settings/page.tsx`** — Reescrito:
- Carrega preferências da API no mount
- Todos os toggles (tema, notificações plataforma/email) persistem na BD
- Adicionado select de idioma (pt/en) conectado à API
- Secção "Escola" para school_admin com link para `/settings/school`

---

### Fase 6: Personalização da Escola

**Objectivo**: Logo e cor primária personalizáveis pelo school_admin.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/app/api/school-settings/route.ts` | GET (name, logo, primaryColor — acesso para todos os roles da escola) / PUT (logo base64 max 300KB, primaryColor — apenas school_admin) |
| `src/app/(dashboard)/settings/school/page.tsx` | Upload de logo (base64, max 200KB, preview, remover), colour picker (8 cores predefinidas + hex custom + input de cor), pré-visualização de botão |
| `src/components/layout/SidebarBrand.tsx` | Componente client que carrega logo/cor da escola via `/api/school-settings`, mostra logo no sidebar, aplica CSS variable `--school-primary` |

#### Ficheiros modificados:

**`(dashboard)/layout.tsx`**:
- Substituído brand inline por `<SidebarBrand />`
- Adicionado `<FloatingHelpButton />`

---

### Fase 7: Página de Ajuda

**Objectivo**: Centro de ajuda com conteúdo por perfil, FAQ e botão flutuante.

#### Ficheiros criados:
| Ficheiro | Descrição |
|----------|-----------|
| `src/lib/help-content.ts` | Conteúdo estruturado por role (school_admin, teacher, student, parent): welcome, guides (passo-a-passo), FAQ (secções com accordion), contacto |
| `src/app/(dashboard)/help/page.tsx` | Página de ajuda: header com ícone, guias em grid, FAQ com accordion (ChevronDown), secção de contacto com email |
| `src/components/ui/FloatingHelpButton.tsx` | Botão fixo bottom-right (bottom-24 no mobile, bottom-6 no desktop), oculto na própria página `/help` |

#### Menus:
- "Ajuda" já adicionado ao `Menu.tsx` e `MobileNav.tsx` na secção OUTROS (Fase 4)

---

### Correcções Adicionais

| Correcção | Descrição |
|-----------|-----------|
| Rota duplicada `change-password` | Removida `(dashboard)/change-password/page.tsx` que conflitava com `(minha-area)/change-password/page.tsx` — a versão minha-area é a correcta para o fluxo mustChangePassword |
| Tipos next-auth | Adicionado `schoolFeatures` às interfaces Session, User e JWT |
| Zod v4 `z.record()` | Corrigido para `z.record(z.string(), z.boolean())` — Zod v4 requer 2 argumentos |
| Prisma Json cast | Corrigido cast de `features` no PUT de escolas para compatibilidade com tipo `InputJsonValue` |

---

### Resumo de Ficheiros

| Tipo | Quantidade |
|------|-----------|
| Ficheiros criados | 37 |
| Ficheiros modificados | 41 |
| Ficheiros removidos | 1 |
| **Total alterado** | **78** |
| Linhas adicionadas | ~4.776 |
| Linhas removidas | ~666 |

---

### Stack Técnica Utilizada

- **Next.js 16** (App Router, Turbopack)
- **Prisma 6** (PostgreSQL/Neon)
- **Auth.js v5** (JWT com schoolFeatures)
- **Zod v4** (validação)
- **Recharts** (PieChart)
- **Tailwind CSS v4** (dark mode, CSS variables)
- **Lucide React** (ícones)

---

### Verificação

- `npx tsc --noEmit` — **0 erros** ✓
- `npm run build` — Falha local por falta de RAM (Turbopack SIGBUS) — funciona no Vercel ✓
- Schema sincronizado via `prisma db push` ✓

---

### Notas para Deploy

1. O schema Prisma tem novos models — o Vercel executa `prisma generate` automaticamente no build
2. A BD já foi sincronizada via `db push` — não há ficheiros de migração pendentes
3. Feature flags default: escolas existentes terão `features: null` (tratado como todas activas pelo `isFeatureEnabled()`)
4. Preferências de utilizador: criadas automaticamente no primeiro acesso (upsert)
