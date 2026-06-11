alter table user_settings
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists reminder_time text not null default '09:00';
