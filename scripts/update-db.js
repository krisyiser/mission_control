const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = `
-- 🛡️ MISSION CONTROL: SUPABASE SCHEMA UPGRADE
ALTER TABLE machines ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS os text;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS cpu text;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS ram text;

-- Add Project Sync Columns if missing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url text UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS netlify_url text;
`;

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
    console.log('Connecting to database...');
    await client.connect();
    console.log('Running SQL Upgrade...');
    await client.query(sql);
    console.log('✅ Database schema upgraded successfully!');
  } catch (err) {
    console.error('❌ Error upgrading database:', err);
  } finally {
    await client.end();
  }
}

run();
