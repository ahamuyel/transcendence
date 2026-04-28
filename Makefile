# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ahamuyel <ahamuyel@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/27 18:26:56 by ahamuyel          #+#    #+#              #
#    Updated: 2026/04/28 10:58:29 by ahamuyel         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Nome do projeto
NAME = transcendence

# Cores
GREEN = \033[0;32m
CYAN  = \033[0;36m
RED   = \033[0;31m
RESET = \033[0m

# Comandos
DOCKER_COMPOSE = docker compose
KUBECTL = kubectl

# --- DOCKER COMPOSE (Development) ---
 
all: build up

build:
	@echo "$(GREEN)Construindo as imagens do $(NAME)...$(RESET)"
	UID=$$(id -u) GID=$$(id -g) $(DOCKER_COMPOSE) build

up:
	@echo "$(GREEN)Subindo os containers...$(RESET)"
	UID=$$(id -u) GID=$$(id -g) $(DOCKER_COMPOSE) up

down:
	@echo "$(RED)Removendo containers...$(RESET)"
	$(DOCKER_COMPOSE) down

clean:
	@echo "$(RED)Limpando containers e volumes...$(RESET)"
	$(DOCKER_COMPOSE) down -v
	sudo rm -rf web/.next web/node_modules api/node_modules

# --- KUBERNETES (Orchestration) ---

# Inicia o minikube com as configurações que funcionaram
k8s-start:
	@echo "$(CYAN)Iniciando Minikube...$(RESET)"
	minikube start --driver=docker --memory=4096 --cpus=2

# Aplica todos os manifestos .yaml (Deployment e Services)
k8s-apply:
	@echo "$(GREEN)Aplicando manifestos Kubernetes...$(RESET)"
	$(KUBECTL) apply -f k8s/

# Remove tudo do cluster
k8s-delete:
	@echo "$(RED)Removendo recursos do Kubernetes...$(RESET)"
	$(KUBECTL) delete -f k8s/

# Atalho para ver os pods em tempo real
k8s-status:
	$(KUBECTL) get all
	$(KUBECTL) get pods -w

# Expõe o serviço web automaticamente
k8s-web:
	@echo "$(CYAN)Abrindo serviço web no browser...$(RESET)"
	minikube service cur10usx-web-service

# Cria o túnel necessário para LoadBalancer no Linux
k8s-tunnel:
	@echo "$(CYAN)Iniciando Minikube Tunnel (mantenha este terminal aberto)...$(RESET)"
	minikube tunnel

# --- GLOBAL ---

fclean: clean
	@echo "$(RED)Removendo tudo (Docker & K8s)...$(RESET)"
	docker system prune -a -f
	# Opcional: minikube delete --all --purge (cuidado, demora a reconstruir)

re: fclean all

.PHONY: all build up down clean fclean re logs shell k8s-start k8s-apply k8s-delete k8s-status k8s-web k8s-tunnel