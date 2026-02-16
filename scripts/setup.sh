#!/bin/bash
set -e

echo "🚀 Setting up Titanbay Private Markets API..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js >= 24"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ Node.js >= 24 is required. Current version: $(node -v)"
    echo "   Run 'nvm use' to switch to the correct version."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required. Please install Docker"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment
if [ ! -f .env ]; then
    echo "⚙️  Creating .env from .env.example..."
    cp .env.example .env
fi

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec titanbay-db pg_isready -U titanbay > /dev/null 2>&1; do
    sleep 1
done

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed the database
echo "🌱 Seeding the database..."
npm run db:seed

echo ""
echo "✅ Setup complete! Run 'npm run dev' to start the server."
echo "   API will be available at http://localhost:3000"