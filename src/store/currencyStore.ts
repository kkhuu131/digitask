import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./authStore";
import { useNotificationStore } from "./notificationStore";

interface CurrencyState {
  bits: number;
  digicoins: number;
  loading: boolean;
  error: string | null;
  fetchCurrency: () => Promise<void>;
  addCurrency: (
    currency: "bits" | "digicoins",
    amount: number
  ) => Promise<boolean>;
  spendCurrency: (
    currency: "bits" | "digicoins",
    amount: number
  ) => Promise<boolean>;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  bits: 0,
  digicoins: 0,
  loading: false,
  error: null,

  fetchCurrency: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      // Check if user has a currency record
      const { data, error } = await supabase
        .from("user_currency")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // If no record exists, create one
      if (!data) {
        const { error: insertError } = await supabase
          .from("user_currency")
          .insert({
            user_id: user.id,
            bits: 2000, // Starting currency
            digicoins: 0,
          });

        if (insertError) throw insertError;

        set({ bits: 2000, digicoins: 0, loading: false });
      } else {
        set({
          bits: data.bits,
          digicoins: data.digicoins,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  addCurrency: async (currency, amount) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_currency")
        .update({
          [currency]: get()[currency] + amount,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      set({ [currency]: get()[currency] + amount });
      return true;
    } catch (error) {
      console.error(`Error adding ${currency}:`, error);
      return false;
    }
  },

  spendCurrency: async (currency, amount) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    // Check if user has enough currency
    if (get()[currency] < amount) {
      useNotificationStore.getState().addNotification({
        type: "error",
        message: `Not enough ${currency} to make this purchase`,
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("user_currency")
        .update({
          [currency]: get()[currency] - amount,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      set({ [currency]: get()[currency] - amount });
      return true;
    } catch (error) {
      console.error(`Error spending ${currency}:`, error);
      return false;
    }
  },
}));
