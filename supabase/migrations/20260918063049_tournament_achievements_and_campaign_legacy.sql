-- Catalog data and earned-history preservation only. No rewards are granted here.
INSERT INTO public.titles(id,name,description,category,requirement_type,requirement_value,reward_bits,reward_digimon_ids) VALUES
(601,'Contender','Reached the semifinals of a weekly tournament.','tournament','tournament_round','1',200,ARRAY[]::integer[]),
(602,'Finalist','Reached the Grand Final of a weekly tournament.','tournament','tournament_round','2',500,ARRAY[]::integer[]),
(603,'Champion','Finished first in a weekly tournament.','tournament','tournament_round','3',1000,ARRAY[]::integer[])
ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,
 category=EXCLUDED.category,requirement_type=EXCLUDED.requirement_type,
 requirement_value=EXCLUDED.requirement_value,reward_bits=EXCLUDED.reward_bits,
 reward_digimon_ids=EXCLUDED.reward_digimon_ids;

-- Capture outstanding campaign entitlements before retiring browser checks.
-- Existing claims, earned dates and pinned flags are never reset.
INSERT INTO public.user_titles(user_id,title_id)
SELECT p.id,t.id FROM public.profiles p CROSS JOIN public.titles t
WHERE t.category='campaign' AND t.requirement_type='campaign_stage'
 AND p.highest_stage_cleared >= t.requirement_value::integer
ON CONFLICT(user_id,title_id) DO NOTHING;

-- Existing tournament results count, including historical final-placement-only entries.
INSERT INTO public.user_titles(user_id,title_id)
SELECT DISTINCT tournaments.user_id,titles.id
FROM public.user_tournaments tournaments CROSS JOIN public.titles titles
WHERE titles.id IN (601,602,603) AND (
 (tournaments.status='completed' AND CASE tournaments.final_placement
   WHEN 'champion' THEN 3 WHEN 'gf_loss' THEN 2 WHEN 'sf_loss' THEN 1 ELSE 0 END
   >= titles.requirement_value::integer)
 OR NOT EXISTS (
   SELECT 1 FROM generate_series(1,titles.requirement_value::integer) expected(round)
   WHERE NOT EXISTS (
     SELECT 1 FROM jsonb_array_elements(COALESCE(tournaments.round_results,'[]'::jsonb)) result
     WHERE result->>'round'=expected.round::text AND result->>'result'='win'
   )
 )
)
ON CONFLICT(user_id,title_id) DO NOTHING;
