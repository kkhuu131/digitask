import React, { useEffect, useState } from "react";
import { useCurrencyStore } from "../store/currencyStore";
import { STORE_ITEMS, ItemCategory, StoreItem, ItemApplyType, ItemEffectType } from "../constants/storeItems";
import { useDigimonStore } from "../store/petStore";
import { useNotificationStore } from "../store/notificationStore";
import { Tab } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import DigimonSprite from "@/components/DigimonSprite";
import { UserDigimon } from "../store/petStore";
import { useInventoryStore } from "../store/inventoryStore";
// import DigimonSprite from "../components/DigimonSprite";

// Neemon's dialogue lines
const NEEMON_DIALOGUE = [
  "Welcome to my store! I've got all sorts of gizmos and gadgets!",
  "Ooh, hello there! Did you come to buy some stat boosters? They're my specialty!",
  "I may not look it, but I'm quite the shopkeeper! At least that's what Bokomon tells me.",
  "I found these items while wandering the Digital World. Pretty neat, huh?",
  "Did you battle in the arena today? That's where all the cool Digimon hang out!",
  "I once tried to eat an HP Chip thinking it was candy. Don't do that!",
  "Need some help getting stronger? These items will buff you up in no time!"
];

const AVATAR_VARIANTS = ['intimidate', 'happy', 'sad1', 'sleeping1'] as const;

const generateRandomAvatarUnlock = () => {
  const randomDigimon = ANIMATED_DIGIMON[Math.floor(Math.random() * ANIMATED_DIGIMON.length)];
  const randomVariant = AVATAR_VARIANTS[Math.floor(Math.random() * AVATAR_VARIANTS.length)];
  return `avatar_${randomDigimon}_${randomVariant}`;
};

const DigimonStorePage: React.FC = () => {
  const { bits, digicoins, fetchCurrency, spendCurrency } = useCurrencyStore();
  const { userDigimon, allUserDigimon, fetchUserDigimon } = useDigimonStore();
  const { fetchInventory, items } = useInventoryStore();
  const { user } = useAuthStore();
  const [processingPurchase, setProcessingPurchase] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");
  const [userStats, setUserStats] = useState<Record<string, number>>({
    HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0
  });
  const [neeemonDialogue, setNeeemonDialogue] = useState("");
  const [showDigimonSelectionModal, setShowDigimonSelectionModal] = useState<StoreItem | null>(null);
  const [showStatResetModal, setShowStatResetModal] = useState<StoreItem | null>(null);
  const [selectedDigimonForStatReset, setSelectedDigimonForStatReset] = useState<any>(null);
  const [statBonusFields] = useState<string[]>([
    "hp_bonus", "sp_bonus", "atk_bonus", "def_bonus", "int_bonus", "spd_bonus"
  ]);
  const [showXAntibodyModal, setShowXAntibodyModal] = useState(false);
  const [digimonForXAntibody, setDigimonForXAntibody] = useState<UserDigimon[]>([]);
  // Add state to track item quantities
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  
  // Set categories for filtering
  const categories = [
    { id: "all", name: "All" },
    { id: ItemCategory.STAT_BOOSTER, name: "Stat Boosters" },
    { id: ItemCategory.UTILITY, name: "Utility" },
    { id: ItemCategory.SPECIAL, name: "Special" },
  ];

  // Map effect type to profile stat key
  const effectToStatMap: Record<string, string> = {
    "hp_bonus": "HP",
    "sp_bonus": "SP",
    "atk_bonus": "ATK",
    "def_bonus": "DEF",
    "int_bonus": "INT",
    "spd_bonus": "SPD",
  };

  useEffect(() => {
    fetchCurrency();
    fetchUserDigimon();
    fetchUserStats();
    fetchInventory();
  }, [fetchCurrency, fetchUserDigimon, fetchInventory]);

  // Add a separate useEffect to update item quantities whenever inventory changes
  useEffect(() => {
    const quantities: Record<string, number> = {};
    
    // Map inventory items to their quantities
    items.forEach(item => {
      quantities[item.item_id] = item.quantity;
    });
    
    setItemQuantities(quantities);
  }, [items]);

  // Add a SEPARATE useEffect just for the dialogue that only runs ONCE on component mount
  useEffect(() => {
    // Set random Neemon dialogue only on initial page load
    setNeeemonDialogue(NEEMON_DIALOGUE[Math.floor(Math.random() * NEEMON_DIALOGUE.length)]);
  }, []); // Empty dependency array means this runs once on mount

  // Fetch user stats from profile
  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('saved_stats')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.saved_stats) {
        setUserStats(data.saved_stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Filter items based on selected category
  const filteredItems = STORE_ITEMS.filter(
    item => filterCategory === "all" || item.category === filterCategory
  );

  // Update the discoverRandomDigimon function to ensure authentication is handled properly
  const discoverRandomDigimon = async (userId: string) => {
    try {
      // First, ensure we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Your session has expired. Please login again.");
      }
      
      // 1. Get all digimon IDs from the lookup table
      const allDigimonIds = Object.keys(DIGIMON_LOOKUP_TABLE).map(id => parseInt(id));
      
      // 2. Get user's currently discovered digimon with proper authentication
      const { data: discoveredData, error: fetchError } = await supabase
        .from('user_discovered_digimon')
        .select('digimon_id')
        .eq('user_id', userId);
      
      if (fetchError) throw fetchError;
      
      const discoveredIds = discoveredData?.map(item => item.digimon_id) || [];
      
      // 3. Find undiscovered digimon
      const undiscoveredIds = allDigimonIds.filter(id => !discoveredIds.includes(id));
      
      // If all digimon are discovered, return null
      if (undiscoveredIds.length === 0) {
        return null;
      }
      
      // 4. Pick a random undiscovered digimon
      const randomIndex = Math.floor(Math.random() * undiscoveredIds.length);
      const newDigimonId = undiscoveredIds[randomIndex];
      
      // 5. Add to user's discovered digimon with proper authentication
      const { error: insertError } = await supabase
        .from('user_discovered_digimon')
        .insert({
          user_id: userId,
          digimon_id: newDigimonId
        });
      
      if (insertError) throw insertError;
      
      return DIGIMON_LOOKUP_TABLE[newDigimonId];
    } catch (error) {
      console.error("Error discovering random digimon:", error);
      throw error;
    }
  };

  // Function to apply personality to a Digimon
  const applyPersonalityToDigimon = async (item: StoreItem, digimonId: string) => {
    if (!user || !item.effect) return;
    
    try {
      // First, check if the purchase can be completed
      const success = await spendCurrency(item.currency, item.price);
      
      if (success) {
        const { error } = await supabase
          .from('user_digimon')
          .update({ 
            personality: item.effect.value as string,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', digimonId);
          
        if (error) throw error;
        
        // Refresh Digimon data
        await fetchUserDigimon();
        
        useNotificationStore.getState().addNotification({
          type: "success",
          message: `Changed ${allUserDigimon.find(d => d.id === digimonId)?.name || 'Digimon'}'s personality to ${item.effect.value}!`,
        });
      }
    } catch (error) {
      console.error("Error applying personality:", error);
      useNotificationStore.getState().addNotification({
        type: "error",
        message: `Failed to apply personality: ${(error as Error).message}`,
      });
    }
  };

  // Handle purchase of an item
  const handlePurchase = async (item: StoreItem) => {
    if (item.id === 'x_antibody') {
      // Get eligible Digimon (those without X-Antibody capability)
      const eligibleDigimon = allUserDigimon.filter(d => !d.has_x_antibody);
      
      if (eligibleDigimon.length === 0) {
        useNotificationStore.getState().addNotification({
          message: 'All your Digimon already have X-Antibody capability!',
          type: 'info'
        });
        return;
      }
      
      setDigimonForXAntibody(eligibleDigimon);
      setShowXAntibodyModal(true);
      return;
    }
    
    if (processingPurchase || !user) return;
    
    setProcessingPurchase(item.id);
    
    try {
      // Add handling for stat reset item
      if (item.effect?.type === ItemEffectType.STAT_RESET) {
        setShowStatResetModal(item);
        setProcessingPurchase(null);
        return;
      }
      
      // Check if the item is a personality changer
      if (item.effect?.type === ItemEffectType.PERSONALITY) {
        // Show Digimon selection modal instead of immediate purchase
        setShowDigimonSelectionModal(item);
        setProcessingPurchase(null);
        return;
      }
      
      // Check if we're still authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        useNotificationStore.getState().addNotification({
          type: "error",
          message: "Your session has expired. Please login again.",
        });
        return;
      }
      
      // Process the purchase
      const success = await spendCurrency(item.currency, item.price);
      
      if (success) {

        if (item.id === "brave_point" && userDigimon) {
          try {
            // Ensure we have a valid session for this specific operation
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              throw new Error("Your session has expired");
            }
            
            // Do the update directly with Supabase to avoid potential store auth issues
            const { error } = await supabase
              .from("user_digimon")
              .update({ 
                experience_points: (userDigimon.experience_points || 0) + Number(item.effect!.value),
                last_updated_at: new Date().toISOString()
              })
              .eq("id", userDigimon.id);
              
            if (error) throw error;
            
            // Refresh the Digimon data
            await fetchUserDigimon();
            
            useNotificationStore.getState().addNotification({
              type: "success",
              message: `Applied ${item.name} to ${userDigimon.name || userDigimon.digimon?.name}!`,
            });
          } catch (error) {
            console.error("Error applying brave point:", error);
            useNotificationStore.getState().addNotification({
              type: "error",
              message: `Failed to apply brave point: ${(error as Error).message}`,
            });
          }
        }
        // Special case for ABI enhancer - apply to active Digimon
        if (item.id === "abi_enhancer" && userDigimon) {
          try {
            // Ensure we have a valid session for this specific operation
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              throw new Error("Your session has expired");
            }
            
            // Do the update directly with Supabase to avoid potential store auth issues
            const { error } = await supabase
              .from("user_digimon")
              .update({ 
                abi: (userDigimon.abi || 0) + Number(item.effect!.value),
                last_updated_at: new Date().toISOString()
              })
              .eq("id", userDigimon.id);
              
            if (error) throw error;
            
            // Refresh the Digimon data
            await fetchUserDigimon();
            
            useNotificationStore.getState().addNotification({
              type: "success",
              message: `Applied ${item.name} to ${userDigimon.name || userDigimon.digimon?.name}!`,
            });
          } catch (error) {
            console.error("Error applying ABI enhancer:", error);
            useNotificationStore.getState().addNotification({
              type: "error",
              message: `Failed to apply ABI enhancer: ${(error as Error).message}`,
            });
          }
        }
        // Handle stat boosters - update user profile stats
        else if (item.category === ItemCategory.STAT_BOOSTER && item.id !== "abi_enhancer") {
          const statKey = effectToStatMap[item.effect!.type];
          
          if (statKey) {
            const updatedStats = { ...userStats };
            updatedStats[statKey] = (updatedStats[statKey] || 0) + Number(item.effect!.value);
            
            const { error } = await supabase
              .from('profiles')
              .update({ saved_stats: updatedStats })
              .eq('id', user.id);
              
            if (error) throw error;
            
            setUserStats(updatedStats);
            
            useNotificationStore.getState().addNotification({
              type: "success",
              message: `Added ${item.effect!.value} ${statKey} points to your account!`,
            });
          }
        }
        // Handle inventory items
        else if (item.applyType === ItemApplyType.INVENTORY) {
          if (item.id === 'avatar_chip') {
            const avatarUnlock = generateRandomAvatarUnlock();
            
            try {
              // Ensure we have a valid session before checking inventory
              const { data: sessionData } = await supabase.auth.getSession();
              if (!sessionData.session) {
                throw new Error("Your session has expired");
              }
              
              // Check if user already has this specific avatar variant
              const quantity = await useInventoryStore.getState().fetchItemQuantity(avatarUnlock);
              if (quantity > 0) {
                // If they already have it, try again
                useNotificationStore.getState().addNotification({
                  type: "info",
                  message: "You already have this avatar! Trying again...",
                });
                return handlePurchase(item); // Recursive call to try again
              }
              
              // Add the new avatar variant to inventory
              const { error: insertError } = await supabase
                .from('user_inventory')
                .insert({
                  user_id: user.id,
                  item_id: avatarUnlock,
                  quantity: 1,
                  item_type: 'avatar_variant'
                });
                
              if (insertError) throw insertError;
              
              // Extract digimon name and variant for the message
              const [_, digimonName, variant] = avatarUnlock.split('_');
              useNotificationStore.getState().addNotification({
                type: "success",
                message: `Unlocked ${variant} variant for ${digimonName}!`,
              });
            } catch (error) {
              console.error("Error with avatar chip:", error);
              throw error;
            }
          } else if (item.id === 'random_data') {
            const discoveredDigimon = await discoverRandomDigimon(user.id);
            
            if (!discoveredDigimon) {
              useNotificationStore.getState().addNotification({
                type: "info",
                message: "You've already discovered all available Digimon!",
              });
              return; // Don't charge the user if they've discovered everything
            }
            
            useNotificationStore.getState().addNotification({
              type: "success",
              message: `Discovered #${discoveredDigimon.id} ${discoveredDigimon.name}!`,
            });
            
            // Directly check if the user has the item using our inventory store
            const itemQuantity = await useInventoryStore.getState().fetchItemQuantity(item.id);
            if (itemQuantity > 0) {
              // User has the item, use it from inventory
              await useInventoryStore.getState().useItem(item.id);
            } else {
              // Add the item to the user's inventory (if bought directly)
              const { error } = await supabase
                .from("user_inventory")
                .insert({
                  user_id: user.id,
                  item_id: item.id,
                  quantity: typeof item.effect?.value === 'number' ? item.effect.value : 1,
                  item_type: item.category,
                });

              if (error) throw error;
            }
            
            // Refresh discovered digimon in store
            useDigimonStore.getState().fetchDiscoveredDigimon();
          } else {
            useNotificationStore.getState().addNotification({
              type: "success",
              message: `Purchased ${item.name} and added to inventory!`,
            });

            // Directly check if the user has the item using our inventory store
            const itemQuantity = await useInventoryStore.getState().fetchItemQuantity(item.id);
            if (itemQuantity > 0) {
              // User already has this item, update quantity
              await useInventoryStore.getState().addItem(
                item.id, 
                typeof item.effect?.value === 'number' ? item.effect.value : 1,
                item.category
              );
            } else {
              // Add the item to the user's inventory
              const { error } = await supabase
                .from("user_inventory")
                .insert({
                  user_id: user.id,
                  item_id: item.id,
                  quantity: typeof item.effect?.value === 'number' ? item.effect.value : 1,
                  item_type: item.category,
                });

              if (error) throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      useNotificationStore.getState().addNotification({
        type: "error",
        message: `Failed to purchase: ${(error as Error).message}`,
      });
    } finally {
      setProcessingPurchase(null);
    }
  };

  // Add a new function to reset the selected stat
  const resetDigimonStat = async (digimonId: string, statField: string) => {
    if (!user || !selectedDigimonForStatReset) return;
    
    try {
      const statKey = statField.replace('_bonus', '').toUpperCase();
      
      // 1. Get the current stat value from the Digimon
      const { data: digimonData, error: getError } = await supabase
        .from('user_digimon')
        .select(`${statField}`)
        .eq('id', digimonId)
        .single();
        
      if (getError) throw getError;
      
      const statValue = digimonData[statField as any] || 0;
      if (Number(statValue) <= 0) {
        useNotificationStore.getState().addNotification({
          type: "info",
          message: `This Digimon has no ${statKey} bonus points to reset.`,
        });
        return;
      }
      
      // 2. Process the purchase for the stat reset item
      const success = await spendCurrency(showStatResetModal!.currency, showStatResetModal!.price);
      
      if (success) {
        // 3. Reset the stat on the Digimon
        const updateObj: any = { last_updated_at: new Date().toISOString() };
        updateObj[statField] = 0;
        
        const { error: updateError } = await supabase
          .from('user_digimon')
          .update(updateObj)
          .eq('id', digimonId);
          
        if (updateError) throw updateError;
        
        // 4. Add the points back to the user's profile
        const updatedStats = { ...userStats };
        updatedStats[statKey] = (updatedStats[statKey] || 0) + Number(statValue);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ saved_stats: updatedStats })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // 5. Update local state
        setUserStats(updatedStats);
        
        // 6. Close the modal and show success notification
        setShowStatResetModal(null);
        setSelectedDigimonForStatReset(null);
        
        // 7. Refresh Digimon data
        await fetchUserDigimon();
        
        useNotificationStore.getState().addNotification({
          type: "success",
          message: `Reset ${statValue} ${statKey} bonus points from ${selectedDigimonForStatReset.name || selectedDigimonForStatReset.digimon?.name}!`,
        });
      }
    } catch (error) {
      console.error("Error resetting stat:", error);
      useNotificationStore.getState().addNotification({
        type: "error",
        message: `Failed to reset stat: ${(error as Error).message}`,
      });
    }
  };

  // Add the formatted display names for the stats
  const statDisplayNames: Record<string, string> = {
    hp_bonus: "HP",
    sp_bonus: "SP",
    atk_bonus: "Attack",
    def_bonus: "Defense",
    int_bonus: "Intelligence",
    spd_bonus: "Speed"
  };

  // Add a function to apply X-Antibody to a selected Digimon
  const applyXAntibodyToDigimon = async (digimonId: string) => {
    const item = STORE_ITEMS.find(i => i.id === 'x_antibody');
    if (!item) return;
    
    try {
      // Instead of using handlePurchase, call spendCurrency directly
      const purchaseSuccess = await spendCurrency(item.currency, item.price);
      
      if (purchaseSuccess) {
        // Update the Digimon in the database
        const { error } = await supabase
          .from('user_digimon')
          .update({ has_x_antibody: true })
          .eq('id', digimonId);
          
        if (error) throw error;
        
        // Refresh Digimon data
        await fetchUserDigimon();
        
        useNotificationStore.getState().addNotification({
          message: 'X-Antibody capability granted successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error applying X-Antibody:', error);
      useNotificationStore.getState().addNotification({
        message: 'Failed to apply X-Antibody capability',
        type: 'error'
      });
    }
    
    setShowXAntibodyModal(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Neemon's Store</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{neeemonDialogue}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 px-5 py-2.5 rounded-lg shadow-sm">
              <span className="font-semibold text-white">{bits.toLocaleString()} bits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Items */}
      <div className="bg-white dark:bg-dark-300 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tab.Group>
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200/50">
            <Tab.List className="flex space-x-1 p-2 overflow-x-auto scrollbar-hide">
              {categories.map(category => (
                <Tab
                  key={category.id}
                  className={({ selected }) =>
                    `px-5 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      selected
                        ? "bg-white dark:bg-dark-300 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-dark-300/50"
                    }`
                  }
                  onClick={() => setFilterCategory(category.id as ItemCategory | "all")}
                >
                  {category.name}
                </Tab>
              ))}
            </Tab.List>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="group bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500/60 hover:shadow-md transition-all duration-200"
                >
                  {/* Item Image */}
                  <div className="flex items-center justify-center mb-4 bg-gray-50 dark:bg-dark-100 rounded-lg p-3 h-20">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-contain"
                      onError={e => {
                        (e.target as HTMLImageElement).src = "/assets/items/default.png";
                      }}
                    />
                  </div>
                  
                  {/* Item Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">{item.name}</h3>
                      {item.applyType === ItemApplyType.INVENTORY && itemQuantities[item.id] > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {itemQuantities[item.id]}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.category}</p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                    
                    {/* Price and Buy Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.price}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{item.currency}</span>
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={
                          processingPurchase === item.id ||
                          (item.currency === "bits" ? bits < item.price : digicoins < item.price) ||
                          (item.id === "abi_enhancer" && !userDigimon)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          processingPurchase === item.id
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-wait"
                            : item.currency === "bits"
                            ? bits < item.price
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-sm hover:shadow"
                            : digicoins < item.price
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm hover:shadow"
                        }`}
                      >
                        {processingPurchase === item.id ? "Processing..." : "Buy"}
                      </button>
                    </div>
                    
                    {item.id === "abi_enhancer" && !userDigimon && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">Requires active Digimon</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tab.Group>
      </div>
      
      {/* Modals */}
      {showDigimonSelectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">Select Digimon</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Change personality to {showDigimonSelectionModal.effect?.value}
                </p>
              </div>
              <button 
                onClick={() => setShowDigimonSelectionModal(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allUserDigimon.map(digimon => (
                  <button
                    key={digimon.id}
                    onClick={() => {
                      applyPersonalityToDigimon(showDigimonSelectionModal, digimon.id);
                      setShowDigimonSelectionModal(null);
                    }}
                    className="cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all bg-white dark:bg-dark-200"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        <DigimonSprite
                          digimonName={digimon.digimon?.name || ""}
                          fallbackSpriteUrl={digimon.digimon?.sprite_url || ""}
                          size="sm"
                          showHappinessAnimations={false}
                        />
                      </div>
                      <div className="text-xs font-semibold text-center truncate w-full dark:text-gray-200 mb-1">
                        {digimon.name || digimon.digimon?.name}
                      </div>
                      {digimon.personality && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {digimon.personality}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Reset Digimon Selection Modal */}
      {showStatResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">Select Digimon</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Reset one of its bonus stats
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowStatResetModal(null);
                  setSelectedDigimonForStatReset(null);
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allUserDigimon.map(digimon => (
                  <button
                    key={digimon.id}
                    onClick={() => setSelectedDigimonForStatReset(digimon)}
                    className="cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all bg-white dark:bg-dark-200"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        <img
                          src={digimon.digimon?.sprite_url || ""}
                          alt={digimon.name || digimon.digimon?.name}
                          className="w-16 h-16 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-center truncate w-full dark:text-gray-200 mb-1">
                        {digimon.name || digimon.digimon?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lv. {digimon.current_level}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Selection Modal - shows after selecting a Digimon */}
      {selectedDigimonForStatReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold dark:text-gray-100">Select Stat to Reset</h2>
              <button 
                onClick={() => setSelectedDigimonForStatReset(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                <img
                  src={selectedDigimonForStatReset.digimon?.sprite_url || ""}
                  alt={selectedDigimonForStatReset.name || selectedDigimonForStatReset.digimon?.name}
                  className="w-16 h-16 object-contain flex-shrink-0"
                  style={{ imageRendering: "pixelated" }}
                />
                <div>
                  <h3 className="font-bold text-lg dark:text-gray-100">
                    {selectedDigimonForStatReset.name || selectedDigimonForStatReset.digimon?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Level {selectedDigimonForStatReset.current_level}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select a stat to reset. Bonus points will be returned to your account.
              </p>
              
              <div className="space-y-2">
                {statBonusFields.map(statField => (
                  <button
                    key={statField}
                    onClick={() => resetDigimonStat(selectedDigimonForStatReset.id, statField)}
                    className="w-full flex justify-between items-center p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all bg-white dark:bg-dark-200"
                  >
                    <span className="font-semibold dark:text-gray-200">{statDisplayNames[statField]}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-lg">
                      {selectedDigimonForStatReset[statField] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* X-Antibody Selection Modal */}
      {showXAntibodyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold dark:text-gray-100">Select a Digimon</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Grant X-Antibody capability
                </p>
              </div>
              <button
                onClick={() => setShowXAntibodyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose a Digimon to grant the X-Antibody. This will allow it to transform 
                into its X-Antibody form at will (if available).
              </p>
              
              <div className="space-y-2">
                {digimonForXAntibody.map(digimon => (
                  <button
                    key={digimon.id}
                    onClick={() => applyXAntibodyToDigimon(digimon.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all bg-white dark:bg-dark-200"
                  >
                    <div className="flex-shrink-0">
                      <DigimonSprite
                        digimonName={digimon.digimon?.name || ''}
                        fallbackSpriteUrl={digimon.digimon?.sprite_url || ''}
                        size="sm"
                        showHappinessAnimations={false}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold dark:text-gray-200">{digimon.name || digimon.digimon?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Level {digimon.current_level}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigimonStorePage; 