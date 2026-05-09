#!/bin/bash

set -e

# ─── Colors ───────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()    { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()     { echo -e "${GREEN}[ok]${NC} $1"; }
warn()   { echo -e "${YELLOW}[warn]${NC} $1"; }
error()  { echo -e "${RED}[error]${NC} $1"; exit 1; }
step()   { echo -e "\n${BOLD}${BLUE}▶ $1${NC}"; }

# ─── Config ───────────────────────────────────────────────────────
MAIN_BRANCH="main"
REMOTE="origin"

# ─── 1. Verificar branch atual ────────────────────────────────────
step "Verificar estado do repositório"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Branch atual: ${BOLD}$CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" = "$MAIN_BRANCH" ]; then
  error "Já estás na branch '$MAIN_BRANCH'. Muda para uma feature branch primeiro."
fi

# ─── 2. Verificar working tree limpa ─────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "Tens alterações não commitadas:"
  git status --short
  echo ""
  read -p "$(echo -e ${YELLOW}Continuar mesmo assim? [y/N]:${NC} )" confirm
  [ "$confirm" != "y" ] && [ "$confirm" != "Y" ] && error "Abortado. Faz commit ou stash antes de continuar."
fi

ok "Working tree verificada"

# ─── 3. Push da branch atual ─────────────────────────────────────
step "Push da branch '$CURRENT_BRANCH'"

git push "$REMOTE" "$CURRENT_BRANCH"
ok "Branch '$CURRENT_BRANCH' enviada para $REMOTE"

# ─── 4. Fazer merge para main ────────────────────────────────────
step "Merge de '$CURRENT_BRANCH' → '$MAIN_BRANCH'"

git checkout "$MAIN_BRANCH"
git pull "$REMOTE" "$MAIN_BRANCH"

# Tentar merge — abortar em conflito
if ! git merge --no-ff "$CURRENT_BRANCH" -m "merge: $CURRENT_BRANCH → $MAIN_BRANCH"; then
  warn "Conflito detectado durante o merge!"
  git merge --abort
  git checkout "$CURRENT_BRANCH"
  error "Merge abortado. Resolve os conflitos manualmente na branch '$CURRENT_BRANCH' e tenta novamente."
fi

ok "Merge concluído"

# ─── 5. Push da main ─────────────────────────────────────────────
step "Push da branch '$MAIN_BRANCH'"

git push "$REMOTE" "$MAIN_BRANCH"
ok "Main actualizada em $REMOTE"

# ─── 6. Tag de versão ────────────────────────────────────────────
step "Criar tag de versão"

# Obter última tag (ou 0.0.0 se não houver)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
log "Última tag: $LAST_TAG"

# Extrair componentes
VERSION="${LAST_TAG#v}"
MAJOR=$(echo "$VERSION" | cut -d. -f1)
MINOR=$(echo "$VERSION" | cut -d. -f2)
PATCH=$(echo "$VERSION" | cut -d. -f3)

echo ""
echo -e "  ${BOLD}Que tipo de versão é esta?${NC}"
echo -e "  ${CYAN}1)${NC} patch  → v$MAJOR.$MINOR.$((PATCH+1))  (bug fix)"
echo -e "  ${CYAN}2)${NC} minor  → v$MAJOR.$((MINOR+1)).0  (nova feature)"
echo -e "  ${CYAN}3)${NC} major  → v$((MAJOR+1)).0.0  (breaking change)"
echo -e "  ${CYAN}4)${NC} custom  (introduzir manualmente)"
echo -e "  ${CYAN}s)${NC} skip   (não criar tag)"
echo ""
read -p "$(echo -e ${YELLOW}Escolha [1/2/3/4/s]:${NC} )" choice

case $choice in
  1) NEW_TAG="v$MAJOR.$MINOR.$((PATCH+1))" ;;
  2) NEW_TAG="v$MAJOR.$((MINOR+1)).0" ;;
  3) NEW_TAG="v$((MAJOR+1)).0.0" ;;
  4)
    read -p "$(echo -e ${YELLOW}Nova tag:${NC} )" NEW_TAG
    [[ "$NEW_TAG" != v* ]] && NEW_TAG="v$NEW_TAG"
    ;;
  s|S)
    warn "Tag ignorada."
    NEW_TAG=""
    ;;
  *) warn "Opção inválida. Tag ignorada."; NEW_TAG="" ;;
esac

if [ -n "$NEW_TAG" ]; then
  read -p "$(echo -e ${YELLOW}Mensagem da tag ${BOLD}[$NEW_TAG]${NC}${YELLOW}:${NC} )" TAG_MSG
  [ -z "$TAG_MSG" ] && TAG_MSG="release $NEW_TAG"

  git tag -a "$NEW_TAG" -m "$TAG_MSG"
  git push "$REMOTE" "$NEW_TAG"
  ok "Tag $NEW_TAG criada e enviada"
fi

# ─── 7. Criar PR no GitHub ────────────────────────────────────────
step "Criar PR no GitHub"

if command -v gh &>/dev/null; then
  read -p "$(echo -e ${YELLOW}Criar PR no GitHub? [y/N]:${NC} )" create_pr
  if [ "$create_pr" = "y" ] || [ "$create_pr" = "Y" ]; then
    read -p "$(echo -e ${YELLOW}Título do PR:${NC} )" PR_TITLE
    [ -z "$PR_TITLE" ] && PR_TITLE="$CURRENT_BRANCH → $MAIN_BRANCH"
    gh pr create --base "$MAIN_BRANCH" --head "$CURRENT_BRANCH" --title "$PR_TITLE" --fill
    ok "PR criado"
  fi
else
  warn "GitHub CLI (gh) não encontrado. Instala com: sudo apt install gh"
  warn "PR manual: https://github.com/$(git remote get-url $REMOTE | sed 's/.*github.com[:/]//' | sed 's/.git$//')/compare/$CURRENT_BRANCH"
fi

# ─── Voltar à branch original ────────────────────────────────────
git checkout "$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}${BOLD}✓ Deploy concluído com sucesso!${NC}"
[ -n "$NEW_TAG" ] && echo -e "  Tag: ${BOLD}$NEW_TAG${NC}"
echo -e "  Branch: ${BOLD}$CURRENT_BRANCH${NC} → ${BOLD}$MAIN_BRANCH${NC}"
echo ""
