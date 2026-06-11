-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Grant usage to postgres role
grant usage on schema cron to postgres;
grant all on all tables in schema cron to postgres;

-- Schedule send-habit-reminders edge function to run every hour at :00
select
  cron.schedule(
    'send-habit-reminders',
    '0 * * * *',
    $$
    select
      net.http_post(
        url        := (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_URL') || '/functions/v1/send-habit-reminders',
        headers    := jsonb_build_object(
                        'Content-Type', 'application/json',
                        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY')
                      ),
        body       := '{}'::jsonb
      );
    $$
  );
