const { Client } = require('pg');

// Try connecting to 127.0.0.1 without password (trust authentication)
const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'einvoice_dev',
  user: 'postgres',
  // No password - using trust authentication
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected successfully without password (trust auth)!');
    
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
    
    console.log('\n🎯 Update your .env file with:');
    console.log('DATABASE_URL="postgresql://postgres@127.0.0.1:5432/einvoice_dev"');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTrying with password...');
    await testWithPassword();
  }
}

async function testWithPassword() {
  const clientWithPwd = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'einvoice_dev',
    user: 'postgres',
    password: 'postgres',
  });
  
  try {
    await clientWithPwd.connect();
    console.log('✅ Connected with password!');
    await clientWithPwd.end();
    
    console.log('\n🎯 Update your .env file with:');
    console.log('DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/einvoice_dev"');
  } catch (error) {
    console.error('❌ Also failed with password:', error.message);
  }
}

testConnection();

