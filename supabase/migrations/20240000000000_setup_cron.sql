-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run every hour
SELECT cron.schedule(
  'process-scheduled-scans',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://irdlyshhtwzqjvymilww.supabase.co/functions/v1/process-scheduled-scans',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.anon_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);