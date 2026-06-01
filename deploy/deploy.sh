#!/bin/bash

# QR Menu Platform - Production Deployment Script
# Server: 188.245.65.247
# Usage: bash deploy.sh

set -e

echo "🚀 QR Menu Platform - Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to generate JWT secret (64 characters)
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
DOCKER_COMPOSE=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${GREEN}✅ Using: docker-compose (V1)${NC}"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${GREEN}✅ Using: docker compose (V2)${NC}"
else
    echo -e "${RED}❌ Docker Compose not found.${NC}"
    echo ""
    echo "Docker is installed, but Docker Compose is missing."
    echo "Please install Docker Compose:"
    echo ""
    echo "  sudo apt update"
    echo "  sudo apt install docker-compose-plugin"
    echo ""
    echo "Or check: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Checking environment...${NC}"

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}📝 Creating .env.production with secure random passwords...${NC}"

    # Generate secure passwords
    DB_PASSWORD=$(generate_password 24)
    JWT_SECRET=$(generate_jwt_secret)
    MINIO_SECRET_KEY=$(generate_password 24)

    cat > .env.production << EOF
# QR Menu Production Environment Variables
# Auto-generated on $(date)
# Server: 188.245.65.247

# Database
DB_NAME=mini-res
DB_USER=mini-res-user
DB_PASSWORD=${DB_PASSWORD}

# JWT - 64 character secure secret
JWT_SECRET=${JWT_SECRET}

# MinIO
MINIO_ACCESS_KEY=qrmenu_minio_admin
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Frontend
VITE_API_BASE_URL=http://188.245.65.247:8080/api/v1
EOF

    echo -e "${GREEN}✅ .env.production created with secure passwords${NC}"
    echo -e "${YELLOW}📋 IMPORTANT: Save these credentials!${NC}"
    echo ""
    echo -e "${BLUE}Database Password:${NC} ${DB_PASSWORD}"
    echo -e "${BLUE}JWT Secret:${NC} ${JWT_SECRET:0:20}...${JWT_SECRET: -10}"
    echo -e "${BLUE}MinIO Secret:${NC} ${MINIO_SECRET_KEY}"
    echo ""
    echo -e "${YELLOW}⚠️  These are auto-generated. Save them now!${NC}"
    echo ""
    read -p "Press ENTER to continue deployment..."
else
    echo -e "${GREEN}✅ Environment file found${NC}"
fi

echo ""

echo -e "${BLUE}📦 Step 2: Stopping existing containers...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml --env-file .env.production down

echo -e "${GREEN}✅ Stopped${NC}"
echo ""

echo -e "${BLUE}📦 Step 3: Building images...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml --env-file .env.production build --no-cache

echo -e "${GREEN}✅ Built${NC}"
echo ""

echo -e "${BLUE}📦 Step 4: Starting services...${NC}"
$DOCKER_COMPOSE -f docker-compose.prod.yml --env-file .env.production up -d

echo -e "${GREEN}✅ Services started${NC}"
echo ""

echo -e "${BLUE}📦 Step 5: Waiting for services to be healthy...${NC}"
sleep 10

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📍 Access URLs:"
echo "   Frontend:  http://188.245.65.247:3000"
echo "   Backend:   http://188.245.65.247:8080"
echo "   API Docs:  http://188.245.65.247:8080/swagger-ui.html"
echo "   MinIO:     http://188.245.65.247:9002"
echo ""
echo "📊 Check status:"
echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml ps"
echo ""
echo "📝 View logs:"
echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   $DOCKER_COMPOSE -f docker-compose.prod.yml down"
echo ""
