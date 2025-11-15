const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'einvoice_dev',
  user: 'postgres',
  password: 'M@donna1facebaie2',
});

async function testConnection() {
  try {
    console.log('Testing connection to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
    console.log('\n✅ DATABASE CONNECTION SUCCESSFUL!\n');
    console.log('📝 Your DATABASE_URL should be:');
    console.log('DATABASE_URL="postgresql://postgres:M%40donna1facebaie2@127.0.0.1:5432/einvoice_dev"\n');
    console.log('Note: @ symbol is URL-encoded as %40');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Docker containers are running: docker ps');
    console.log('2. Wait a few more seconds for PostgreSQL to fully start');
  }
}

testConnection();

