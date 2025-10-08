#!/bin/bash

echo "Setting up Inversion environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/inversion"

# NextAuth Secret - Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key-here"

# GitHub OAuth (optional)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Google OAuth (optional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# LinkedIn OAuth (optional)
AUTH_LINKEDIN_ID=""
AUTH_LINKEDIN_SECRET=""

# OpenAI API Key (for AI features)
OPENAI_API_KEY=""

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_DSN=""
EOF
    echo "✅ Created .env.local file"
else
    echo "⚠️  .env.local already exists"
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your actual values"
echo "2. Set up a PostgreSQL database"
echo "3. Update DATABASE_URL with your database connection string"
echo "4. Generate AUTH_SECRET with: openssl rand -base64 32"
echo "5. Run: npm run db:push"
echo "6. Run: npm run dev"
echo ""
echo "For a quick start with a local PostgreSQL database:"
echo "  - Install PostgreSQL"
echo "  - Create database: createdb inversion"
echo "  - Update DATABASE_URL in .env.local"
echo ""
echo "Optional: Configure AWS Lambda PDF service by setting LAMBDA_PDF_URL and LAMBDA_PDF_API_KEY in .env.local"
