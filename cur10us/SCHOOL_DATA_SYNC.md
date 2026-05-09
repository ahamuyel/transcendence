# School Data Synchronization Guide

## Problema Resolvido

Antes desta implementação, quando o **super admin** fazia alterações aos dados de uma escola (nome, contactos, cores, features, etc.), essas alterações **não se refletiam automaticamente** nas páginas da escola. Os utilizadores da escola viam dados desatualizados até fazerem refresh manual da página ou até ao polling de 2 minutos do SchoolBrandingProvider.

---

## ✅ Solução Implementada

### 1. **Cache Invalidation Automático (Server-Side)**

Foi criado um sistema de revalidação automática que invalida o cache sempre que os dados de uma escola são alterados.

**File:** `src/lib/revalidate.ts`

Funções disponíveis:
- `revalidateSchoolData(schoolId)` - Revalida todos os dados de uma escola específica
- `revalidatePlatformData()` - Revalida dados globais da plataforma
- `revalidateUserData(userId)` - Revalida dados de um utilizador

### 2. **API Routes com Revalidation**

Todas as rotas de administração de escolas agora incluem revalidation automática:

#### Rotas Atualizadas:
- ✅ `/api/admin/schools/[id]` (PUT, DELETE) - Atualizar/eliminar escola
- ✅ `/api/admin/schools/[id]/approve` - Aprovar escola
- ✅ `/api/admin/schools/[id]/activate` - Ativar escola
- ✅ `/api/admin/schools/[id]/reject` - Rejeitar escola
- ✅ `/api/admin/schools/[id]/suspend` - Suspender escola
- ✅ `/api/admin/schools/[id]/revert` - Reverter estado
- ✅ `/api/school-settings` (PUT) - School admin atualiza configurações

### 3. **Client-Side Refresh Support**

#### SchoolBrandingProvider Melhorado
O provider de branding agora expõe uma função `refresh()` que permite refresh manual:

```typescript
import { useSchoolBranding } from "@/provider/school-branding"

function MyComponent() {
  const { name, logo, primaryColor, refresh } = useSchoolBranding()
  
  // Chamar refresh quando necessário
  const handleUpdate = async () => {
    await updateSchoolData()
    await refresh() // Refresh instantâneo
  }
}
```

#### Novos Hooks Criados
**File:** `src/hooks/useSchoolData.ts`

Dois hooks para gerir dados de escola no client-side:

1. **`useSchoolData(schoolId)`** - Para admin/super admin
   ```typescript
   import { useSchoolData } from "@/hooks/useSchoolData"
   
   function SchoolDetailPage({ id }) {
     const { data, loading, error, refresh } = useSchoolData(id)
     
     // refresh() pode ser chamado após atualizações
   }
   ```

2. **`useSchoolSettings()`** - Para school-side pages
   ```typescript
   import { useSchoolSettings } from "@/hooks/useSchoolData"
   
   function SettingsPage() {
     const { settings, loading, error, refresh } = useSchoolSettings()
   }
   ```

---

## 🔄 Como Funciona o Fluxo de Atualização

### Cenário 1: Super Admin Atualiza Dados da Escola

```
Super Admin → PUT /api/admin/schools/[id]
                ↓
        Atualiza BD (Prisma)
                ↓
        revalidateSchoolData(id)
                ↓
        Invalida cache de:
        - /api/school-settings
        - /api/school-stats
        - /admin/schools
        - /dashboard
        - /settings
        - /minha-area
        - etc.
                ↓
        Próximo request → Dados frescos da BD ✅
```

### Cenário 2: School Admin Atualiza Branding

```
School Admin → PUT /api/school-settings
                ↓
        Atualiza BD (Prisma)
                ↓
        revalidateSchoolData(schoolId)
                ↓
        Invalida cache + SchoolBrandingProvider
        faz polling em 120s ou refresh manual
```

### Cenário 3: Refresh Manual no Client

```typescript
// Em qualquer componente:
const { refresh } = useSchoolBranding()
// ou
const { refresh } = useSchoolSettings()

// Após mutation:
await updateMutation()
await refresh() // Dados atualizados instantaneamente ✅
```

---

## 📋 Paths Revalidados

Quando `revalidateSchoolData(schoolId)` é chamado, os seguintes paths são invalidados:

### API Routes:
- `/api/school-settings`
- `/api/school-stats`
- `/api/school-catalog/subjects`
- `/api/school-catalog/courses`
- `/api/school-catalog/classes`

### Admin Pages:
- `/admin/schools`
- `/admin/schools/${schoolId}`

### Dashboard Pages:
- `/dashboard`
- `/settings`
- `/settings/school`
- `/minha-area`

### Public Pages:
- `/aplicacao`

---

## 🎯 Dados que Afetam Todas as Páginas

### Dados de Contacto:
- ✅ `email` - Email da escola
- ✅ `phone` - Telefone
- ✅ `contactEmail` - Email de contacto
- ✅ `address` - Endereço
- ✅ `city` - Cidade
- ✅ `provincia` - Província
- ✅ `socialFacebook`, `socialInstagram`, `socialWhatsapp` - Redes sociais

### Branding/Personalização:
- ✅ `name` - Nome da escola
- ✅ `logo` - Logo
- ✅ `primaryColor`, `secondaryColor` - Cores
- ✅ `slogan` - Slogan
- ✅ `loginMessage` - Mensagem de login
- ✅ `footerText` - Texto do footer

### Configurações:
- ✅ `features` - Features ativadas/desativadas
- ✅ `status` - Estado da escola

---

## 🚀 Como Usar

### Para Super Admin:

Quando atualizares uma escola em `/admin/schools/[id]`, os dados são automaticamente revalidados. Não precisas fazer nada!

### Para Componentes que Mostram Dados da Escola:

Se quiseres refresh manual após uma mutation:

```typescript
import { useSchoolBranding } from "@/provider/school-branding"

function SchoolSidebar() {
  const { name, logo, refresh } = useSchoolBranding()
  
  const handleLogoUpdate = async (newLogo) => {
    await uploadLogo(newLogo)
    await refresh() // Sidebar atualizada instantaneamente
  }
}
```

Ou usar o hook dedicado:

```typescript
import { useSchoolSettings } from "@/hooks/useSchoolData"

function SchoolSettingsPage() {
  const { settings, loading, error, refresh } = useSchoolSettings()
  
  const handleSave = async (data) => {
    await saveSettings(data)
    await refresh() // Confirma que os dados foram atualizados
  }
}
```

---

## ⚡ Performance

- **Server-side**: Revalidation é assíncrona e não bloqueia a response
- **Client-side**: SchoolBrandingProvider continua a fazer polling a cada 120s como fallback
- **Manual refresh**: Disponível para casos onde precisas de atualização instantânea

---

## 🐛 Troubleshooting

### Problema: Dados não atualizam após mudança do admin

**Solução:**
1. Verifica os logs do servidor - deves ver `[Revalidation] School data revalidated for: {id}`
2. Faz refresh manual da página (Ctrl+Shift+R para bypass do cache)
3. Verifica se a rota PUT está a ser chamada corretamente

### Problema: Branding não atualiza na sidebar

**Solução:**
1. O SchoolBrandingProvider está montado no dashboard layout
2. Podes chamar `refresh()` manualmente: `const { refresh } = useSchoolBranding()`
3. Verifica se o browser não está a bloquear cookies (necessário para sessão)

---

## 📝 Resumo das Alterações

### Files Criados:
1. `src/lib/revalidate.ts` - Funções de revalidação
2. `src/hooks/useSchoolData.ts` - Hooks para refresh manual

### Files Modificados:
1. `src/app/api/admin/schools/[id]/route.ts` - PUT, DELETE com revalidation
2. `src/app/api/admin/schools/[id]/approve/route.ts` - POST com revalidation
3. `src/app/api/admin/schools/[id]/activate/route.ts` - POST com revalidation
4. `src/app/api/admin/schools/[id]/reject/route.ts` - POST com revalidation
5. `src/app/api/admin/schools/[id]/suspend/route.ts` - POST com revalidation
6. `src/app/api/admin/schools/[id]/revert/route.ts` - POST com revalidation
7. `src/app/api/school-settings/route.ts` - PUT com revalidation
8. `src/provider/school-branding.tsx` - Adicionado `refresh()` ao context

---

## ✨ Benefícios

1. ✅ **Dados sempre atualizados** - Sem stale data após mutations
2. ✅ **Automático** - Não precisas fazer nada special
3. ✅ **Performance** - Cache invalidation é eficiente
4. ✅ **Flexível** - Refresh manual quando necessário
5. ✅ **Consistente** - Todas as páginas refletem mudanças

Agora, quando o super admin alterar contactos, cores, features ou qualquer outro dado da escola, **todas as páginas que usam esses dados vão mostrar a versão atualizada** automaticamente! 🎉
