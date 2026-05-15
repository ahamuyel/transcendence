# Backlog de Tarefas — Cur10usX

> Organizado por categorias | Prioridade: 🔴 Alta / 🟡 Média / 🟢 Baixa

---

## 1. Backlog Crítico — 🔴 Imediato

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| C1 | Rotacionar secrets expostos no git | Remover .env do tracking, gerar novos AUTH_SECRET, atualizar credenciais Neon/Google/Resend/Vercel Blob | Eliminar risco de segurança crítico | 🔴 Alta | 🟢 Fácil | 🔴 Alto | Nenhuma | 1h | Tech Lead |
| C2 | Corrigir K8s deployment | apiVersion: apps/v1, corrigir label match (deployment + service) | Kubernetes funcional | 🔴 Alta | 🟢 Fácil | 🟡 Médio | Nenhuma | 30min | DevOps |
| C3 | Adicionar testes unitários core | Testar auth (bcrypt, session), validation (Zod), evaluation-engine | Prevenir regressões | 🔴 Alta | 🟡 Média | 🔴 Alto | Nenhuma | 16h | Backend |
| C4 | Reforçar WebSocket auth | Validar sessão do utilizador na conexão WS antes de registar | Impedir escuta não autorizada | 🔴 Alta | 🟡 Média | 🟡 Médio | Nenhuma | 4h | Backend |
| C5 | Adicionar CI build step | Compilar projeto no CI para detetar erros de build | Qualidade do código | 🔴 Alta | 🟢 Fácil | 🟡 Médio | Nenhuma | 1h | DevOps |

---

## 2. Backlog Técnico — 🟡 Curto Prazo

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| T1 | Adicionar testes de integração API | Testar endpoints principais com supertest + mocked DB | Validar contratos de API | 🟡 Alta | 🔴 Difícil | 🔴 Alto | C3 | 24h | Backend |
| T2 | Adicionar Redis ao docker-compose | Serviço Redis + configurar rate-limit distribuído | Rate limiting escalável | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 4h | DevOps |
| T3 | Separar ws-server em serviço independente | Extrair WS para container separado com Redis pub/sub | Escalabilidade WS | 🟡 Média | 🔴 Difícil | 🟡 Médio | T2 | 8h | Backend |
| T4 | Implementar lazy loading | React.lazy() para charts, calendário, componentes pesados | Performance bundle | 🟡 Média | 🟢 Fácil | 🟢 Baixo | Nenhuma | 4h | Frontend |
| T5 | Implementar ISR na landing page | revalidate no getData() da página inicial | Performance TTFB | 🟡 Média | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | Frontend |
| T6 | Criar helper genérico CRUD | Reduzir boilerplate repetitivo nas API routes | Manutenibilidade | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 8h | Backend |
| T7 | Adicionar paginação server-side consistente | Standardizar offset/limit em todas as listas | Performance listagens | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 12h | Fullstack |
| T8 | Implementar audit log cleanup | Job de arquivamento/limpeza de logs antigos | Prevenir crescimento infinito | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | Backend |

---

## 3. Backlog UI/UX — 🟡 Prioridade Média

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| U1 | Landing page — animações de scroll | Adicionar reveal on scroll com fade-in/up nas secções | Melhorar perceção de qualidade | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 8h | Frontend |
| U2 | Landing page — hero CTA secundário | Adicionar "Ver demonstração" ou "Saber mais" | Melhor conversão | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | Frontend |
| U3 | Loading states — skeletons | Substituir spinners genéricos por skeleton components | Melhor perceção de performance | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 12h | Frontend |
| U4 | Empty states — mensagens + CTA | Mostrar "Nenhum registo" + botão "Criar primeiro" | UX mais clara | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 6h | Frontend |
| U5 | Error states — retry actions | Adicionar "Tentar novamente" em erros de fetch | Recuperação de erros | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 6h | Frontend |
| U6 | Toast/notificação global | Sistema de feedback para CRUD (criado, editado, erro) | Feedback consistente | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 6h | Frontend |
| U7 | Confirmação de ações destrutivas | Modal de confirmação para delete com mensagem contextual | Prevenir erros do utilizador | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 4h | Frontend |
| U8 | Dark mode — contraste | Auditar e corrigir contraste em dark mode | Legibilidade | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 4h | Frontend |
| U9 | Responsividade mobile — tabelas | Tabelas com scroll horizontal em mobile | Acessibilidade mobile | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 12h | Frontend |
| U10 | Responsividade mobile — formulários | Formulários adaptados para ecrãs pequenos | Acessibilidade mobile | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 8h | Frontend |
| U11 | Acessibilidade — aria labels | Adicionar aria-labels, role, focus management | Inclusão | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 16h | Frontend |
| U12 | Acessibilidade — keyboard nav | Navegação por teclado em modais, dropdowns, tabelas | Inclusão | 🟢 Baixa | 🔴 Difícil | 🟢 Baixo | U11 | 12h | Frontend |
| U13 | Animações de transição entre páginas | Framer Motion ou CSS transitions no layout | Perceção de fluidez | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 8h | Frontend |
| U14 | Validação client-side consistente | Sincronizar validação Zod client com server | UX de formulários | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 8h | Frontend |

---

## 4. Backlog de Refatoração — 🟡 Prioridade Média

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| R1 | Separar components/ui em ui/ + domain/ | Mover StudentDashboard, etc. para domain/ | Organização do código | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 4h | Frontend |
| R2 | Criar template genérico de lista | Componente ListPage que aceita config (columns, filters, form) | Reduzir duplicação | 🟡 Média | 🔴 Difícil | 🔴 Alto | Nenhuma | 16h | Frontend |
| R3 | Extrair lógica de negócio das API routes | Separar services/ da camada de transporte (route handlers) | Testabilidade | 🟡 Média | 🔴 Difícil | 🔴 Alto | Nenhuma | 24h | Backend |
| R4 | Standardizar respostas de API | Formato consistente: { data, totalPages, error } | Consistência API | 🟡 Média | 🟡 Média | 🟡 Médio | Nenhuma | 6h | Backend |
| R5 | Remover código morto | Identificar e remover dependências não usadas, componentes órfãos | Limpeza | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 4h | Fullstack |

---

## 5. Backlog de Bugs — 🔴 Alta Prioridade

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| B1 | K8s deployment não funciona | apiVersion inválido e label mismatch | Deploy K8s funcional | 🔴 Alta | 🟢 Fácil | 🔴 Alto | Nenhuma | 30min | DevOps |
| B2 | WebSocket sem auth real | Qualquer userId pode registar-se | Segurança WS | 🔴 Alta | 🟡 Média | 🟡 Médio | Nenhuma | 4h | Backend |
| B3 | Result sem unique constraint | Possibilidade de notas duplicadas para mesmo aluno/disciplina | Integridade de dados | 🔴 Alta | 🟢 Fácil | 🟡 Médio | Nenhuma | 1h | Backend |
| B4 | Docker secrets podem falhar se ficheiros não existirem | entrypoint.sh não valida existência de secrets | Resiliência | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 1h | DevOps |

---

## 6. Backlog de Documentação — 🟢 Prioridade Baixa

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| D1 | Documentar API endpoints | Listar todos os endpoints com exemplos request/response | Integração | 🟢 Baixa | 🔴 Difícil | 🟡 Médio | Nenhuma | 16h | Tech Lead |
| D2 | Comentários de código em módulos críticos | Adicionar JSDoc nos módulos core (auth, evaluation, audit) | Manutenibilidade | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 8h | Fullstack |
| D3 | Guia de contribuição (CONTRIBUTING.md) | Processo de PR, code review, branches | Integração equipa | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 4h | Tech Lead |
| D4 | Documentar schemas Zod | Listar schemas e regras de validação | Referência rápida | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 4h | Backend |

---

## 7. Backlog DevOps/Deploy — 🟡 Prioridade Média

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| V1 | CI build step | Adicionar `next build` ao pipeline | Deteção precoce de erros | 🔴 Alta | 🟢 Fácil | 🟡 Médio | Nenhuma | 1h | DevOps |
| V2 | CI deploy automático | Deploy para Vercel ou Docker Hub + K8s | Entrega contínua | 🟡 Média | 🔴 Difícil | 🔴 Alto | V1 | 8h | DevOps |
| V3 | Redis docker-compose | Adicionar serviço Redis com volume persistente | Infra completa | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 2h | DevOps |
| V4 | Variáveis de ambiente (.env.example) root | Criar .env.example na raiz com todas as vars documentadas | Onboarding | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 1h | DevOps |
| V5 | Healthcheck melhorado | Verificar WS + API + DB no healthcheck | Monitorização | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | DevOps |
| V6 | Limites de recursos K8s | Adicionar resource limits (CPU/memória) | Estabilidade | 🟡 Média | 🟢 Fácil | 🟡 Médio | Nenhuma | 1h | DevOps |

---

## 8. Backlog de Testes — 🔴 Alta Prioridade

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| X1 | Testes unitários — auth (bcrypt, session) | Testar comparePassword, sessionVersion, token refresh | Cobertura core | 🔴 Alta | 🟡 Média | 🔴 Alto | Nenhuma | 8h | Backend |
| X2 | Testes unitários — evaluation engine | Testar cálculo de médias, pesos, arredondamentos | Prevenir erros de notas | 🔴 Alta | 🟡 Média | 🔴 Alto | Nenhuma | 8h | Backend |
| X3 | Testes unitários — Zod schemas | Testar validação de input para cada schema | Validação correta | 🔴 Alta | 🟢 Fácil | 🟡 Médio | Nenhuma | 4h | Backend |
| X4 | Testes de integração — API CRUD | Testar endpoints principais com DB de teste | Contratos de API | 🟡 Média | 🔴 Difícil | 🔴 Alto | T6 | 24h | Backend |
| X5 | Testes de integração — auth flow | Login, register, 2FA, OAuth, password reset | Fluxo crítico | 🔴 Alta | 🔴 Difícil | 🔴 Alto | Nenhuma | 16h | Backend |
| X6 | Configurar framework de testes | Jest + Testing Library + supertest + mongodb-memory-server (ou similar) | Infra de testes | 🔴 Alta | 🟡 Média | 🔴 Alto | Nenhuma | 4h | Tech Lead |
| X7 | E2E — login + dashboard | Playwright/Cypress para fluxo completo | Regressão visual | 🟢 Baixa | 🔴 Difícil | 🟡 Médio | X6 | 20h | QA |

---

## 9. Backlog de Otimizações — 🟢 Prioridade Baixa

| # | Título | Descrição | Objetivo | Prioridade | Dificuldade | Impacto | Deps | Estimativa | Perfil |
|---|--------|-----------|----------|-----------|-------------|---------|------|------------|--------|
| O1 | Redis cache para queries de dashboard | Cache de counts e stats com TTL | Performance dashboard | 🟡 Média | 🟡 Média | 🟡 Médio | T2 | 8h | Backend |
| O2 | ISR para landing page | revalidate a cada 60s | TTFB | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 1h | Frontend |
| O3 | Otimizar bundle | Analisar bundle, code-splitting, dynamic imports | Primeira carga | 🟢 Baixa | 🟡 Média | 🟢 Baixo | Nenhuma | 8h | Frontend |
| O4 | Lazy loading de imagens | next/image para todas as imagens | Performance | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | Frontend |
| O5 | Compressão de assets | WebP para imagens, brotli/gzip | Transferência | 🟢 Baixa | 🟢 Fácil | 🟢 Baixo | Nenhuma | 2h | DevOps |

---

## 10. Tarefas por Perfil para Integração de Equipa

### Iniciantes (onboarding — 1ª semana)
| # | Tarefa | Perfil | Estimativa | Área |
|---|--------|--------|------------|------|
| I1 | Ler ARCHITECTURE.md e configurar ambiente local | Todos | 2h | Onboarding |
| I2 | Executar seed DB e explorar Prisma Studio | Todos | 1h | Onboarding |
| I3 | Navegar pelo projeto e identificar estrutura de pastas | Todos | 2h | Onboarding |
| I4 | Corrigir variáveis de ambiente (.env.example) | DevOps | 1h | DevOps |
| I5 | Adicionar empty states nas listas | Frontend | 4h | UI/UX |
| I6 | Adicionar loading states (skeletons) | Frontend | 6h | UI/UX |
| I7 | Criar testes unitários Zod schemas | Backend | 4h | Testes |
| I8 | Remover código morto (dependências não usadas) | Fullstack | 2h | Limpeza |

### Intermediários (2ª-3ª semana)
| # | Tarefa | Perfil | Estimativa | Área |
|---|--------|--------|------------|------|
| M1 | Landing page animações (scroll reveal) | Frontend | 8h | UI/UX |
| M2 | Sistema de toast global | Frontend | 6h | UI/UX |
| M3 | Responsividade mobile (tabelas) | Frontend | 12h | UI/UX |
| M4 | Testes unitários auth | Backend | 8h | Testes |
| M5 | Testes evaluation engine | Backend | 8h | Testes |
| M6 | Rate limiting Redis | DevOps/Backend | 4h | Infra |
| M7 | CI build step + deploy | DevOps | 8h | DevOps |
| M8 | Separar components/ui de domain/ | Frontend | 4h | Refactor |

### Avançados (4ª semana+)
| # | Tarefa | Perfil | Estimativa | Área |
|---|--------|--------|------------|------|
| A1 | WebSocket auth reforçada + extração serviço | Backend | 12h | Segurança |
| A2 | Helper genérico CRUD API | Backend | 8h | Refactor |
| A3 | Testes de integração API | Backend | 24h | Testes |
| A4 | Template genérico de listas | Fullstack | 16h | Refactor |
| A5 | Extrair services das API routes | Backend | 24h | Refactor |
| A6 | E2E testing setup | QA | 20h | Testes |
| A7 | Redis cache dashboard | Backend | 8h | Performance |

---

## 11. Resumo de Estimativas

| Categoria | Tarefas | Estimativa Total |
|-----------|---------|-----------------|
| 🔴 Crítico | 5 | 22h 30min |
| 🟡 Técnico | 8 | 64h |
| 🟡 UI/UX | 14 | 106h |
| 🟡 Refatoração | 5 | 54h |
| 🔴 Bugs | 4 | 6h 30min |
| 🟢 Documentação | 4 | 32h |
| 🟡 DevOps | 6 | 15h |
| 🔴 Testes | 7 | 84h |
| 🟢 Otimizações | 5 | 21h |
| **Total** | **58** | **~405h** |

---

## 12. Roadmap Sugerido

```
Semana 1-2: 🔴 Crítico + Testes Core + Onboarding Equipa
  C1, C2, C3, C4, C5, X1, X2, X3, X6
  + I1, I2, I3, I4, I5, I6, I7, I8

Semana 3-4: 🟡 Técnico + UI/UX + DevOps
  T1, T4, T5, T7, U1, U3, U4, U5, U6
  V1, V2, V3, V6
  + M1, M2, M3, M4, M5, M6, M7, M8

Semana 5-6: Refatoração + Testes Avançados
  R1, R2, R4, T6
  X4, X5
  + A1, A2, A3, A4

Semana 7-8: Performance + Documentação + Polimento
  O1, O2, O3, O4, O5
  D1, D2, D3, D4
  U7, U8, U9, U10, U11, U12, U13, U14
  + A5, A6, A7
```

---
