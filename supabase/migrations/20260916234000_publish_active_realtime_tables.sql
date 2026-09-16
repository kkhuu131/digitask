-- Match the two existing app subscriptions; keep existing RLS/read permissions.
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_digimon, public.daily_quotas;
