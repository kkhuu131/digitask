
CREATE TABLE public.user_tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_round integer NOT NULL DEFAULT 1,
  bracket jsonb NOT NULL,
  round_results jsonb NOT NULL DEFAULT '[]',
  final_placement text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.user_tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tournaments"
  ON public.user_tournaments
  FOR ALL
  USING (auth.uid() = user_id);

