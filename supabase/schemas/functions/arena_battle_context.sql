CREATE OR REPLACE FUNCTION public.arena_battle_context(p_user_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
SELECT jsonb_build_object(
  'party',COALESCE((SELECT jsonb_agg(to_jsonb(p)||jsonb_build_object('digimon',to_jsonb(d)))
    FROM public.user_digimon p JOIN public.digimon d ON d.id=p.digimon_id
    WHERE p.user_id=p_user_id AND p.is_in_storage IS NOT TRUE),'[]'::jsonb),
  'offers',COALESCE((SELECT jsonb_agg(to_jsonb(o) ORDER BY difficulty)
    FROM public.arena_battle_offers o WHERE o.user_id=p_user_id AND o.expires_at>now()
    AND o.created_at=(SELECT max(created_at) FROM public.arena_battle_offers WHERE user_id=p_user_id AND expires_at>now())
    AND NOT EXISTS(SELECT 1 FROM public.arena_battle_requests r WHERE r.offer_id=o.id AND r.status='settled')),'[]'::jsonb),
  'pending',(SELECT to_jsonb(r) FROM public.arena_battle_requests r WHERE r.user_id=p_user_id AND r.status='prepared'),
  'latest',(SELECT to_jsonb(r) FROM public.arena_battle_requests r WHERE r.user_id=p_user_id AND r.status='settled'
    ORDER BY r.settled_at DESC LIMIT 1)
);
$$;
ALTER FUNCTION public.arena_battle_context(uuid) OWNER TO postgres;
