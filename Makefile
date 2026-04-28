# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ahamuyel <ahamuyel@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/28                                  #+#    #+#            #
#    Updated: 2026/04/28                                  ###   ########.fr      #
#                                                                              #
# **************************************************************************** #

# ==============================
# PROJECT
# ==============================
NAME        = transcendence

# ==============================
# COLORS
# ==============================
GREEN       = \033[0;32m
RED         = \033[0;31m
CYAN        = \033[0;36m
YELLOW      = \033[1;33m
RESET       = \033[0m

# ==============================
# COMMANDS
# ==============================
DOCKER_COMPOSE = docker compose
KUBECTL        = kubectl
MINIKUBE       = minikube

# ==============================
# DEFAULT
# ==============================
all: build up

# ==========================================================
# DOCKER COMPOSE (DEV)
# ==========================================================

build:
	@echo "$(GREEN)🔨 Building $(NAME)...$(RESET)"
	UID=$$(id -u) GID=$$(id -g) $(DOCKER_COMPOSE) build

up:
	@echo "$(GREEN)🚀 Starting containers...$(RESET)"
	UID=$$(id -u) GID=$$(id -g) $(DOCKER_COMPOSE) up -d

down:
	@echo "$(RED)🛑 Stopping containers...$(RESET)"
	$(DOCKER_COMPOSE) down

restart: down up

logs:
	@echo "$(CYAN)📜 Logs...$(RESET)"
	$(DOCKER_COMPOSE) logs -f

ps:
	$(DOCKER_COMPOSE) ps

shell-web:
	$(DOCKER_COMPOSE) exec web sh

shell-api:
	$(DOCKER_COMPOSE) exec api sh

clean:
	@echo "$(RED)🧹 Cleaning containers + volumes...$(RESET)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	sudo rm -rf web/node_modules
	sudo rm -rf web/.next
	sudo rm -rf api/node_modules

fclean: clean
	@echo "$(RED)🔥 Full cleanup Docker...$(RESET)"
	docker system prune -af --volumes

re: fclean all

# ==========================================================
# PNPM / NODE FIX
# ==========================================================

deps:
	@echo "$(YELLOW)📦 Installing frontend dependencies with pnpm...$(RESET)"
	cd web && corepack enable && pnpm install

deps-clean:
	@echo "$(YELLOW)♻️ Reset frontend dependencies...$(RESET)"
	cd web && rm -rf node_modules package-lock.json pnpm-lock.yaml && corepack enable && pnpm install

# ==========================================================
# KUBERNETES
# ==========================================================

k8s-start:
	@echo "$(CYAN)☸️ Starting Minikube...$(RESET)"
	$(MINIKUBE) start --driver=docker --memory=4096 --cpus=2

k8s-stop:
	@echo "$(RED)☸️ Stopping Minikube...$(RESET)"
	$(MINIKUBE) stop

k8s-delete-cluster:
	@echo "$(RED)☸️ Deleting Minikube cluster...$(RESET)"
	$(MINIKUBE) delete

k8s-status:
	@echo "$(CYAN)☸️ Cluster status...$(RESET)"
	$(MINIKUBE) status
	$(KUBECTL) get nodes
	$(KUBECTL) get pods -A

k8s-context:
	@echo "$(CYAN)☸️ Switching kubectl context to minikube...$(RESET)"
	$(KUBECTL) config use-context minikube

k8s-apply:
	@echo "$(GREEN)☸️ Applying manifests...$(RESET)"
	$(KUBECTL) apply -f k8s/

k8s-delete:
	@echo "$(RED)☸️ Removing manifests...$(RESET)"
	$(KUBECTL) delete -f k8s/

k8s-restart: k8s-delete k8s-apply

k8s-pods:
	$(KUBECTL) get pods -w

k8s-all:
	$(KUBECTL) get all

k8s-logs-app:
	$(KUBECTL) logs -l app=cur10usx-app -f

k8s-logs-api:
	$(KUBECTL) logs -l app=cur10usx-api -f

k8s-shell-app:
	$(KUBECTL) exec -it deployment/cur10usx-app -- sh

k8s-shell-api:
	$(KUBECTL) exec -it deployment/cur10usx-api -- sh

k8s-web:
	$(MINIKUBE) service cur10usx-app-service

k8s-api:
	$(MINIKUBE) service cur10usx-api-service

k8s-tunnel:
	$(MINIKUBE) tunnel

# ==========================================================
# HELP
# ==========================================================

help:
	@echo ""
	@echo "$(GREEN)===== Docker =====$(RESET)"
	@echo " make build"
	@echo " make up"
	@echo " make down"
	@echo " make restart"
	@echo " make logs"
	@echo " make clean"
	@echo " make fclean"
	@echo ""
	@echo "$(CYAN)===== Kubernetes =====$(RESET)"
	@echo " make k8s-start"
	@echo " make k8s-apply"
	@echo " make k8s-delete"
	@echo " make k8s-status"
	@echo " make k8s-web"
	@echo " make k8s-pods"
	@echo ""
	@echo "$(YELLOW)===== Dependencies =====$(RESET)"
	@echo " make deps"
	@echo " make deps-clean"
	@echo ""

.PHONY: all build up down restart logs ps clean fclean re \
deps deps-clean \
k8s-start k8s-stop k8s-delete-cluster k8s-status k8s-context \
k8s-apply k8s-delete k8s-restart k8s-pods k8s-all \
k8s-logs-app k8s-logs-api k8s-shell-app k8s-shell-api \
k8s-web k8s-api k8s-tunnel help