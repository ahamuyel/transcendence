# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ahamuyel <ahamuyel@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/27 18:26:56 by ahamuyel          #+#    #+#              #
#    Updated: 2026/06/01 12:00:00 by ahamuyel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = cur10usx

GREEN = \033[0;32m
CYAN  = \033[0;36m
RED   = \033[0;31m
RESET = \033[0m

DC = docker compose

# ─── Docker Compose ──────────────────────────────────────────

all: build up

build:
	@echo "$(GREEN)Building images for $(NAME)...$(RESET)"
	$(DC) build

up:
	@echo "$(GREEN)Starting containers...$(RESET)"
	$(DC) up -d
	@echo "$(GREEN)App available at https://localhost$(RESET)"

down:
	@echo "$(RED)Stopping and removing containers...$(RESET)"
	$(DC) down

restart:
	@echo "$(CYAN)Restarting services...$(RESET)"
	$(DC) restart

logs:
	@echo "$(CYAN)Tailing logs...$(RESET)"
	$(DC) logs -f

shell:
	@echo "$(CYAN)Opening shell in app container...$(RESET)"
	$(DC) exec app sh

nginx-reload:
	@echo "$(CYAN)Reloading nginx configuration...$(RESET)"
	$(DC) exec nginx nginx -s reload

test:
	@echo "$(CYAN)Running tests in app container...$(RESET)"
	$(DC) exec app npm test

up-logs:
	@echo "$(GREEN)Starting containers with logs...$(RESET)"
	$(DC) up

clean:
	@echo "$(RED)Removing containers and volumes...$(RESET)"
	$(DC) down -v

clean-local:
	@echo "$(RED)Cleaning local artifacts...$(RESET)"
	rm -rf .next node_modules

# ─── Database Commands ───────────────────────────────────────

db-migrate:
	$(DC) exec app npx prisma migrate deploy

db-seed:
	$(DC) exec app npx prisma db seed

db-studio:
	$(DC) exec app npx prisma studio

db-reset:
	$(DC) exec app npx prisma migrate reset --force

# ─── Kubernetes ──────────────────────────────────────────────

KUBECTL = kubectl

k8s-start:
	@echo "$(CYAN)Starting Minikube...$(RESET)"
	minikube start --driver=docker --memory=4096 --cpus=2

k8s-apply:
	@echo "$(GREEN)Applying Kubernetes manifests...$(RESET)"
	$(KUBECTL) apply -f k8s/

k8s-delete:
	@echo "$(RED)Removing Kubernetes resources...$(RESET)"
	$(KUBECTL) delete -f k8s/

k8s-status:
	$(KUBECTL) get all
	$(KUBECTL) get pods -w

k8s-web:
	@echo "$(CYAN)Opening web service in browser...$(RESET)"
	minikube service cur10usx-app-service

k8s-logs:
	@echo "$(CYAN)Pod logs...$(RESET)"
	$(KUBECTL) logs -l app=cur10usx --tail=100

k8s-tunnel:
	@echo "$(CYAN)Starting Minikube Tunnel (keep this terminal open)...$(RESET)"
	minikube tunnel

# ─── Cleanup ─────────────────────────────────────────────────

fclean: clean
	@echo "$(RED)Pruning Docker system...$(RESET)"
	docker system prune -a -f
	docker builder prune -a -f

re: fclean all

.PHONY: all build up down restart logs shell test nginx-reload clean clean-local \
	db-migrate db-seed db-studio db-reset \
	k8s-start k8s-apply k8s-delete k8s-status k8s-web k8s-logs k8s-tunnel \
	fclean re
