-- ============================================================
-- Personal Growth & Finance Dashboard - Supabase Schema
-- ============================================================

-- USER SETTINGS
create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  base_currency text not null default 'USD',
  current_salary numeric,
  target_salary numeric,
  salary_currency text not null default 'USD',
  created_at timestamptz not null default now()
);

-- MONTHLY INCOME
create table monthly_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  currency text not null default 'USD',
  month date not null, -- store as first day of month: 2024-01-01
  created_at timestamptz not null default now(),
  unique(user_id, month)
);

-- EXPENSES
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('housing','food','transport','trips','savings','subscriptions','games','other')),
  amount numeric not null,
  currency text not null default 'USD',
  amount_usd numeric not null,
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- SAVINGS GOALS
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  currency text not null default 'USD',
  deadline date,
  created_at timestamptz not null default now()
);

-- GROWTH STREAKS
create table growth_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  area text not null check (area in ('english','technical','interview','jobs')),
  streak_count integer not null default 0,
  last_activity_date date,
  unique(user_id, area)
);

-- DAILY TASKS
create table daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  area text not null check (area in ('english','technical','interview','jobs')),
  completed boolean not null default false,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- JOB APPLICATIONS
create table job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  position text not null,
  salary_min numeric,
  salary_max numeric,
  salary_currency text not null default 'USD',
  status text not null default 'applied' check (status in ('applied','response','interview','offer','rejected')),
  applied_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table user_settings enable row level security;
alter table monthly_income enable row level security;
alter table expenses enable row level security;
alter table savings_goals enable row level security;
alter table growth_streaks enable row level security;
alter table daily_tasks enable row level security;
alter table job_applications enable row level security;

-- user_settings policies
create policy "users can manage own settings"
  on user_settings for all using (auth.uid() = user_id);

-- monthly_income policies
create policy "users can manage own income"
  on monthly_income for all using (auth.uid() = user_id);

-- expenses policies
create policy "users can manage own expenses"
  on expenses for all using (auth.uid() = user_id);

-- savings_goals policies
create policy "users can manage own savings goals"
  on savings_goals for all using (auth.uid() = user_id);

-- growth_streaks policies
create policy "users can manage own streaks"
  on growth_streaks for all using (auth.uid() = user_id);

-- daily_tasks policies
create policy "users can manage own tasks"
  on daily_tasks for all using (auth.uid() = user_id);

-- job_applications policies
create policy "users can manage own job applications"
  on job_applications for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DEFAULT STREAKS (via trigger on user creation)
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_settings (user_id) values (new.id);
  insert into growth_streaks (user_id, area) values
    (new.id, 'english'),
    (new.id, 'technical'),
    (new.id, 'interview'),
    (new.id, 'jobs');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
