-- Create user_inventory table to store user's items
CREATE TABLE public.user_inventory
(
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    item_id text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    item_type text NOT NULL,
    created_at timestamp
    with time zone NULL DEFAULT now
    (),
  CONSTRAINT user_inventory_pkey PRIMARY KEY
    (id),
  CONSTRAINT user_inventory_user_id_fkey FOREIGN KEY
    (user_id) REFERENCES auth.users
    (id) ON
    DELETE CASCADE
);

    -- Create index for faster lookup by user_id
    CREATE INDEX
    IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory USING btree
    (user_id);

    -- Create index for faster lookup by item_id and user_id combination
    CREATE INDEX
    IF NOT EXISTS idx_user_inventory_item_user ON public.user_inventory USING btree
    (user_id, item_id); 