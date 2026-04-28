#!/bin/bash

# Para o script se qualquer comando falhar
set -e

USERNAME="albertoih"
PROJECT="cur10usx"
SERVICES=("web" "api")
MAIN_BRANCH="main"

echo "🌿 Iniciando Git Merge..."

# 1. Garante que estamos na main e atualizados
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" == "$MAIN_BRANCH" ]; then
    echo "⚠️ Já estás na $MAIN_BRANCH. Apenas garantindo o pull..."
    git pull origin $MAIN_BRANCH
else
    echo "🔀 Fazendo merge da branch '$CURRENT_BRANCH' para '$MAIN_BRANCH'..."
    git checkout $MAIN_BRANCH
    git pull origin $MAIN_BRANCH
    git merge "$CURRENT_BRANCH" --no-edit
    git push origin $MAIN_BRANCH
    
    # Volta para a branch original após o merge (opcional)
    # git checkout "$CURRENT_BRANCH"
fi

echo "🚀 Iniciando processo de Deploy para os dois serviços..."

for SERVICE in "${SERVICES[@]}"; do
    IMAGE_NAME="$USERNAME/$PROJECT-$SERVICE:latest"
    
    echo "-------------------------------------------"
    echo "📦 Processando: $SERVICE"
    echo "-------------------------------------------"

    # 2. Build da imagem
    echo "🔨 Building Docker image [$IMAGE_NAME]..."
    docker build -t $IMAGE_NAME ./$SERVICE

    # 3. Push para o Docker Hub
    echo "📤 Pushing image to Docker Hub..."
    docker push $IMAGE_NAME
done

echo "-------------------------------------------"
echo "☸️  Atualizando Kubernetes..."
echo "-------------------------------------------"

# 4. Aplicar os manifestos
echo "📄 Applying Kubernetes manifests..."
kubectl apply -f k8s/

# 5. Forçar o reinício para atualizar a imagem 'latest'
echo "🔄 Restarting deployments..."
kubectl rollout restart deployment/$PROJECT-web
kubectl rollout restart deployment/$PROJECT-api

echo "✅ Deploy concluído com sucesso na branch $MAIN_BRANCH!"
kubectl get pods