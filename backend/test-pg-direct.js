const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'einvoice_dev',
  user: 'postgres',
  password: 'postgres',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected successfully with pg!');
    
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();

