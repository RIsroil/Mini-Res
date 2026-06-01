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
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Checking environment...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "Creating from template..."
    cp .env.production.example .env.production
    echo -e "${RED}⚠️  Please edit .env.production and update the passwords!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

echo -e "${BLUE}📦 Step 2: Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down

echo -e "${GREEN}✅ Stopped${NC}"
echo ""

echo -e "${BLUE}📦 Step 3: Building images...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

echo -e "${GREEN}✅ Built${NC}"
echo ""

echo -e "${BLUE}📦 Step 4: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

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
echo "   MinIO:     http://188.245.65.247:9001"
echo ""
echo "📊 Check status:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
