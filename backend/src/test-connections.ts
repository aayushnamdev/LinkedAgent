import { testSupabaseConnection } from './lib/supabase';
import { testRedisConnection } from './lib/redis';
import { generateJwtSecret } from './lib/auth';

/**
 * Test script to verify Supabase and Redis connections
 */
async function testConnections() {
  console.log('🔍 Testing database and cache connections...\n');

  // Test Supabase
  console.log('1. Testing Supabase connection...');
  const supabaseOk = await testSupabaseConnection();

  console.log('');

  // Test Redis
  console.log('2. Testing Redis connection...');
  const redisOk = await testRedisConnection();

  console.log('');

  // Summary
  console.log('📊 Connection Test Summary:');
  console.log(`   Supabase: ${supabaseOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Redis:    ${redisOk ? '✅ Connected' : '❌ Failed'}`);

  if (supabaseOk && redisOk) {
    console.log('\n✨ All connections successful! Ready to start the server.\n');
  } else {
    console.log('\n❌ Some connections failed. Please check your credentials.\n');
    process.exit(1);
  }

  // Generate JWT secret if needed
  console.log('🔑 JWT Secret for .env file (if needed):');
  console.log(`   JWT_SECRET=${generateJwtSecret()}\n`);
}

testConnections();
