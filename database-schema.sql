-- Propello Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. PROPOSALS
create table if not exists public.proposals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  client_name text,
  job_description text not null,
  framework text not null check (framework in (
    'problem-solution', 'storytelling', 'before-after',
    'sandler', 'consultative'
  )),
  ai_generated_proposal text,
  edited_proposal text,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.proposals enable row level security;

create policy "Users can CRUD own proposals"
  on public.proposals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute function public.update_updated_at();

-- Index for fast user lookups
create index if not exists proposals_user_id_idx on public.proposals(user_id);
create index if not exists proposals_created_at_idx on public.proposals(created_at desc);