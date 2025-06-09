-- Add item_requirement column to evolution_paths table
ALTER TABLE public.evolution_paths
ADD COLUMN item_requirement text NULL;

-- Comment on the column to explain its purpose
COMMENT ON COLUMN public.evolution_paths.item_requirement IS 'Optional item ID required for this evolution, references item_id in user_inventory'; 