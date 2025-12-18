#!/bin/bash
# MinIO Commands Cheat Sheet
# Comandos úteis para trabalhar com MinIO

echo "═══════════════════════════════════════════════════════════════"
echo "  MinIO Useful Commands"
echo "═══════════════════════════════════════════════════════════════"

# ─────────────────────────────────────────────────────────────────
# DOCKER
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📦 DOCKER COMMANDS"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# Start containers (Development)"
echo "docker-compose -f docker-compose.dev.yaml up -d"
echo ""
echo "# Start containers (Production)"
echo "docker-compose up -d"
echo ""
echo "# Stop containers"
echo "docker-compose down"
echo ""
echo "# View containers status"
echo "docker ps"
echo ""
echo "# View MinIO logs"
echo "docker logs 5kplatform_minio -f"
echo ""
echo "# Connect to API container"
echo "docker exec -it 5kplatform_api_dev bash"
echo ""

# ─────────────────────────────────────────────────────────────────
# BACKEND TESTS
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🧪 BACKEND TEST COMMANDS"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# Test MinIO connection"
echo "npm run test:minio"
echo ""
echo "# Run migrations"
echo "npm run db:migrate"
echo ""
echo "# Run seeds"
echo "npm run db:seed"
echo ""
echo "# Build TypeScript"
echo "npm run build"
echo ""
echo "# Start development"
echo "npm run dev"
echo ""

# ─────────────────────────────────────────────────────────────────
# CURL EXAMPLES
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🔗 CURL EXAMPLES"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# Upload profile photo"
echo "curl -X POST http://localhost:4000/api/upload/profile-photo \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -F \"file=@/path/to/photo.jpg\""
echo ""
echo "# Upload energy bill"
echo "curl -X POST http://localhost:4000/api/upload/energy-bill \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -F \"file=@/path/to/bill.pdf\""
echo ""
echo "# Upload roof photo"
echo "curl -X POST http://localhost:4000/api/upload/roof-photo \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -F \"file=@/path/to/roof.jpg\""
echo ""
echo "# Health check"
echo "curl http://localhost:4000/health"
echo ""

# ─────────────────────────────────────────────────────────────────
# MINIO CONSOLE
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🖥️  MINIO CONSOLE"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "URL: http://localhost:9001"
echo "Username: minioadmin"
echo "Password: minioadmin123"
echo ""

# ─────────────────────────────────────────────────────────────────
# ENVIRONMENT SETUP
# ─────────────────────────────────────────────────────────────────

echo ""
echo "⚙️  ENVIRONMENT SETUP"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# Copy example env"
echo "cp backend/.env.example backend/.env"
echo ""
echo "# Required MinIO variables:"
echo "MINIO_ENDPOINT=minio"
echo "MINIO_PORT=9000"
echo "MINIO_ACCESS_KEY=minioadmin"
echo "MINIO_SECRET_KEY=minioadmin123"
echo "MINIO_USE_SSL=false"
echo "MINIO_BUCKET=images"
echo "MINIO_URL=http://localhost:9000"
echo ""

# ─────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🗄️  DATABASE COMMANDS"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# Access PostgreSQL"
echo "docker exec -it 5kplatform_postgres psql -U postgres -d 5kplatform"
echo ""
echo "# Access PgAdmin"
echo "http://localhost:5050"
echo "Username: admin@5kplatform.com"
echo "Password: admin123"
echo ""

# ─────────────────────────────────────────────────────────────────
# TROUBLESHOOTING
# ─────────────────────────────────────────────────────────────────

echo ""
echo "🔧 TROUBLESHOOTING"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "# MinIO connection error"
echo "docker logs 5kplatform_minio"
echo "docker ps | grep minio"
echo ""
echo "# Test MinIO"
echo "npm run test:minio"
echo ""
echo "# Clear Docker"
echo "docker-compose down -v"
echo ""
echo "# Rebuild containers"
echo "docker-compose -f docker-compose.dev.yaml build --no-cache"
echo ""
echo "# Database migration error"
echo "npm run db:migrate:undo"
echo "npm run db:migrate"
echo ""

# ─────────────────────────────────────────────────────────────────
# USEFUL LINKS
# ─────────────────────────────────────────────────────────────────

echo ""
echo "📚 USEFUL LINKS"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "API:              http://localhost:4000"
echo "API Health:       http://localhost:4000/health"
echo "MinIO Console:    http://localhost:9001"
echo "PgAdmin:          http://localhost:5050"
echo "PostgreSQL:       localhost:5432"
echo ""
echo "MinIO Docs:       https://min.io/docs/minio/linux/index.html"
echo "S3 API:           https://docs.aws.amazon.com/s3/"
echo ""

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✨ MinIO Setup Ready! Happy coding!                          "
echo "═══════════════════════════════════════════════════════════════"
