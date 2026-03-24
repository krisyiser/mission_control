import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

const sql = `
-- 🛡️ MISSION CONTROL: SUPABASE SCHEMA UPDATE
-- 1. Create Projects table (if not exists)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  github_url text unique,
  netlify_url text,
  status text default 'online'
);

-- 2. Create Machines table (if not exists)
create table if not exists machines (
  id text primary key,
  name text,
  status text default 'offline',
  last_seen timestamp with time zone default now(),
  model text,
  os text,
  cpu text,
  ram text
);

-- 3. Create Tasks table (if not exists)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assigned_to text references machines(id),
  created_at timestamp with time zone default now()
);

-- 4. Enable Realtime if publication exists (via separate transaction or handled via Supabase dashboard but we can try)
-- alter publication supabase_realtime add table machines, projects, tasks;
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Running SQL...');
    await client.query(sql);
    console.log('✅ Database schema updated successfully!');
  } catch (err) {
    console.error('❌ Error updating database:', err);
  } finally {
    await client.end();
  }
}

run();
