# Nome do projeto
NAME = transcendence

# Cores para o terminal (opcional, mas ajuda muito no log)
GREEN = \033[0;32m
RED = \033[0;31m
RESET = \033[0m

# Comandos principais
DOCKER_COMPOSE = docker compose
FILES = docker-compose.yaml

all: build up

# Constrói as imagens (equivalente ao make)
build:
	@echo "$(GREEN)Construindo as imagens do $(NAME)...$(RESET)"
	$(DOCKER_COMPOSE) build

# Sobe os containers
up:
	@echo "$(GREEN)Subindo os containers...$(RESET)"
	$(DOCKER_COMPOSE) up

# Para os containers sem apagar nada
stop:
	@echo "$(RED)Parando os containers...$(RESET)"
	$(DOCKER_COMPOSE) stop

# Para os containers e remove os mesmos
down:
	@echo "$(RED)Removendo os containers...$(RESET)"
	$(DOCKER_COMPOSE) down

# Limpeza total: remove containers, redes e o volume do node_modules (muito útil para o erro EACCES)
clean:
	@echo "$(RED)Limpando containers e volumes...$(RESET)"
	$(DOCKER_COMPOSE) down -v
	sudo rm -rf .next

# Remove TUDO (imagens, containers, volumes e cache do docker)
fclean: clean
	@echo "$(RED)Removendo imagens e cache do Docker...$(RESET)"
	docker system prune -a -f

# Reinicia do zero (o famoso make re)
re: fclean all

# Ver os logs em tempo real
logs:
	$(DOCKER_COMPOSE) logs -f

# Atalho para entrar no shell do container frontend (para debugar)
shell:
	docker exec -it transcendence-web-1 sh

.PHONY: all build up stop down clean fclean re logs shell