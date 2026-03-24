const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const client = new Client({
    user: 'postgres',
    host: 'db.duocjcqwjrnkoqrnqukw.supabase.co',
    database: 'postgres',
    password: 'Q,9cX,9Smy6DK/,',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'machines';");
    console.log('Columns in machines table:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
