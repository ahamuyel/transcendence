NAME = cur10usx

GREEN  = \033[0;32m
CYAN   = \033[0;36m
YELLOW = \033[1;33m
RED    = \033[0;31m
BOLD   = \033[1m
RESET  = \033[0m

DC   = docker compose
DCP  = docker compose -f docker-compose.yml -f docker-compose.prod.yml

# ─── Development ───────────────────────────────────────────────────

all: build up

build:
	@echo "$(GREEN)Building development images...$(RESET)"
	$(DC) build

up:
	@echo "$(GREEN)Starting development environment...$(RESET)"
	$(DC) up -d
	@echo "$(CYAN)App:  http://localhost$(RESET)"
	@echo "$(CYAN)Logs: make logs$(RESET)"

down:
	@echo "$(RED)Stopping containers...$(RESET)"
	$(DC) down

logs:
	$(DC) logs -f

restart:
	$(DC) restart

ps:
	$(DC) ps

clean:
	@echo "$(RED)Removing containers and volumes...$(RESET)"
	$(DC) down -v

fclean: clean
	@echo "$(RED)Cleaning Docker system...$(RESET)"
	docker system prune -af --volumes

re: fclean all

# ─── Production ────────────────────────────────────────────────────

prod-build:
	@echo "$(GREEN)Building production images...$(RESET)"
	$(DCP) build

prod-up:
	@echo "$(GREEN)Starting production environment...$(RESET)"
	$(DCP) up -d

prod-down:
	@echo "$(RED)Stopping production environment...$(RESET)"
	$(DCP) down

prod-logs:
	$(DCP) logs -f

prod-restart:
	$(DCP) restart

# ─── Database ───────────────────────────────────────────────────────

db-migrate:
	$(DC) exec nextjs npx prisma migrate deploy

db-studio:
	$(DC) exec nextjs npx prisma studio

db-seed:
	$(DC) exec nextjs npx prisma db seed

# ─── Utilities ─────────────────────────────────────────────────────

shell-nextjs:
	$(DC) exec nextjs sh

shell-ws:
	$(DC) exec ws-server sh

shell-redis:
	$(DC) exec redis redis-cli

setup-secrets:
	@echo "$(YELLOW)Creating secret files (fill them in)...$(RESET)"
	@mkdir -p secrets
	for secret in auth_secret google_client_id google_client_secret resend_api_key; do \
		[ ! -f "./secrets/$${secret}.txt" ] && touch "./secrets/$${secret}.txt" && echo "  created: secrets/$${secret}.txt" || echo "  exists: secrets/$${secret}.txt"; \
	done
	@echo "$(GREEN)Done. Fill each file with the corresponding secret value.$(RESET)"

env:
	@[ ! -f .env ] && cp .env.example .env && echo "$(GREEN)Created .env from .env.example$(RESET)" || echo "$(YELLOW}.env already exists$(RESET)"

# ─── Health ─────────────────────────────────────────────────────────

health:
	@echo "$(CYAN)Checking containers health...$(RESET)"
	@$(DC) ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# ─── Kubernetes ────────────────────────────────────────────────────

k8s-start:
	minikube start --driver=docker --memory=4096 --cpus=2

k8s-apply:
	kubectl apply -f k8s/

k8s-delete:
	kubectl delete -f k8s/

k8s-status:
	kubectl get all

.PHONY: all build up down logs restart ps clean fclean re \
        prod-build prod-up prod-down prod-logs prod-restart \
        db-migrate db-studio db-seed \
        shell-nextjs shell-ws shell-redis \
        setup-secrets env health \
        k8s-start k8s-apply k8s-delete k8s-status
