#!/usr/bin/env node

// Build script that handles missing environment variables gracefully
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'dummy-key-for-build';
process.env.GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'dummy-key-for-build';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dummy-secret-for-build';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

// Import and run the build
const { execSync } = require('child_process');

try {
  console.log('🔨 Building with dummy environment variables...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

