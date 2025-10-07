-- Note: Supabase Auth creates the auth.users table automatically

-- Create todos table
create table if not exists todos (
  id bigserial primary key,
  text text not null,
  description text,
  completed boolean default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists todos_user_id_idx on todos(user_id);
create index if not exists todos_createdAt_idx on todos("createdAt" desc);

-- Enable Row Level Security (RLS)
alter table todos enable row level security;

-- RLS Policies for todos table
-- Users can only see their own todos
create policy "Users can view own todos" on todos
  for select using (auth.uid() = user_id);

-- Users can insert their own todos
create policy "Users can insert own todos" on todos
  for insert with check (auth.uid() = user_id);

-- Users can update their own todos
create policy "Users can update own todos" on todos
  for update using (auth.uid() = user_id);

-- Users can delete their own todos
create policy "Users can delete own todos" on todos
  for delete using (auth.uid() = user_id);
