import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  item_type: string;
  created_at: string;
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  addItem: (
    itemId: string,
    quantity: number,
    itemType: string
  ) => Promise<boolean>;
  removeItem: (itemId: string, quantity: number) => Promise<boolean>;
  hasItem: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  useItem: (itemId: string) => Promise<boolean>;
  fetchItemQuantity: (itemId: string) => Promise<number>;
  checkEvolutionItem: (itemId: string) => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchInventory: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ items: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("user_inventory")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) throw error;

      set({ items: data || [], loading: false });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  addItem: async (itemId: string, quantity: number, itemType: string) => {
    try {
      set({ loading: true, error: null });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ loading: false });
        return false;
      }

      // Check if user already has this item
      const existingItem = get().items.find((item) => item.item_id === itemId);

      if (existingItem) {
        // Update existing item quantity
        const { error } = await supabase
          .from("user_inventory")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          items: state.items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          loading: false,
        }));
      } else {
        // Add new item to inventory
        const { data, error } = await supabase
          .from("user_inventory")
          .insert({
            user_id: userData.user.id,
            item_id: itemId,
            quantity,
            item_type: itemType,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        set((state) => ({
          items: [...state.items, data],
          loading: false,
        }));
      }

      return true;
    } catch (error) {
      console.error("Error adding item to inventory:", error);
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  removeItem: async (itemId: string, quantity: number = 1) => {
    try {
      set({ loading: true, error: null });

      // Find the item in the local state
      const existingItem = get().items.find((item) => item.item_id === itemId);
      if (!existingItem) {
        set({ loading: false });
        return false;
      }

      if (existingItem.quantity <= quantity) {
        // Remove the item completely
        const { error } = await supabase
          .from("user_inventory")
          .delete()
          .eq("id", existingItem.id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          items: state.items.filter((item) => item.id !== existingItem.id),
          loading: false,
        }));
      } else {
        // Reduce the quantity
        const { error } = await supabase
          .from("user_inventory")
          .update({ quantity: existingItem.quantity - quantity })
          .eq("id", existingItem.id);

        if (error) throw error;

        // Update local state
        set((state) => ({
          items: state.items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity - quantity }
              : item
          ),
          loading: false,
        }));
      }

      return true;
    } catch (error) {
      console.error("Error removing item from inventory:", error);
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  // Check if item exists in inventory
  hasItem: (itemId: string) => {
    const item = get().items.find((item) => item.item_id === itemId);
    return !!item && item.quantity > 0;
  },

  // Get quantity of an item in inventory
  getItemQuantity: (itemId: string) => {
    const item = get().items.find((item) => item.item_id === itemId);
    return item ? item.quantity : 0;
  },

  // Fetch the quantity of an item directly from the database
  fetchItemQuantity: async (itemId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return 0;
      }

      const { data, error } = await supabase
        .from("user_inventory")
        .select("quantity")
        .match({ user_id: userData.user.id, item_id: itemId })
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Item not found
          return 0;
        }
        console.error("Error fetching item quantity:", error);
        return 0;
      }

      return data?.quantity || 0;
    } catch (error) {
      console.error("Error in fetchItemQuantity:", error);
      return 0;
    }
  },

  // Check specifically for evolution items which have caused query issues
  checkEvolutionItem: async (itemId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return false;
      }

      // Use a different query approach to avoid the 406 error
      const { data, error } = await supabase
        .from("user_inventory")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("item_id", itemId);

      if (error) {
        console.error("Error checking evolution item:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error in checkEvolutionItem:", error);
      return false;
    }
  },

  // Use an item from inventory
  useItem: async (itemId: string) => {
    // This is a convenience method that removes 1 quantity of an item
    return await get().removeItem(itemId, 1);
  },
}));
