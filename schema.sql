-- 🛡️ MISSION CONTROL: SUPABASE SCHEMA

-- 1. Create Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  github_url text unique,
  netlify_url text,
  status text default 'online',
  created_at timestamp with time zone default now()
);

-- 2. Create Machines (Laptops) table
create table if not exists machines (
  id text primary key, -- machine-id (e.g. yersi-macbook-1)
  name text,
  status text default 'offline',
  last_seen timestamp with time zone default now()
);

-- 3. Create Tasks table
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  description text,
  status text default 'todo', -- todo, in-progress, review, done
  priority text default 'medium', -- low, medium, high
  assigned_to text references machines(id),
  created_at timestamp with time zone default now()
);

-- 4. Enable Realtime
alter publication supabase_realtime add table machines, projects, tasks;
