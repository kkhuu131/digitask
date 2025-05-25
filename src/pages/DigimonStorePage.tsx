import React, { useEffect, useState } from "react";
import { useCurrencyStore } from "../store/currencyStore";
import { STORE_ITEMS, ItemCategory, StoreItem, ItemApplyType } from "../constants/storeItems";
import { useDigimonStore } from "../store/petStore";
import { useNotificationStore } from "../store/notificationStore";
import { Tab } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
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
  const { user } = useAuthStore();
  const [processingPurchase, setProcessingPurchase] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");
  const [userStats, setUserStats] = useState<Record<string, number>>({
    HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0
  });
  const [neeemonDialogue, setNeeemonDialogue] = useState("");
  
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
  }, [fetchCurrency, fetchUserDigimon, userDigimon, allUserDigimon]);

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

  // Handle purchase of an item
  const handlePurchase = async (item: StoreItem) => {
    if (processingPurchase || !user) return;
    
    setProcessingPurchase(item.id);
    
    try {
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
                abi: (userDigimon.abi || 0) + item.effect!.value,
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
            updatedStats[statKey] = (updatedStats[statKey] || 0) + item.effect!.value;
            
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
              const { data: existingItem, error: checkError } = await supabase
                .from('user_inventory')
                .select('id')
                .eq('user_id', user.id)
                .eq('item_id', avatarUnlock);
                
              if (checkError) throw checkError;
              
              if (existingItem && existingItem.length > 0) {
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
            
            // Consume the inventory item if it's already in inventory
            const { data: existingItem } = await supabase
              .from('user_inventory')
              .select('id, quantity')
              .eq('user_id', user.id)
              .eq('item_id', item.id)
              .single();

            if (existingItem) {
              if (existingItem.quantity > 1) {
                // Reduce quantity by 1
                await supabase
                  .from('user_inventory')
                  .update({ quantity: existingItem.quantity - 1 })
                  .eq('id', existingItem.id);
              } else {
                // Remove if last one
                await supabase
                  .from('user_inventory')
                  .delete()
                  .eq('id', existingItem.id);
              }
            } else {
              // Add the item to the user's inventory (if bought directly)
              const { error } = await supabase
                .from('user_inventory')
                .insert({
                  user_id: user.id,
                  item_id: item.id,
                  quantity: item.effect!.value,
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

            // if user already has the item, update the quantity
            const { data: existingItem } = await supabase
              .from('user_inventory')
              .select('id, quantity')
              .eq('user_id', user.id)
              .eq('item_id', item.id)
              .single();

            if (existingItem) {
              // update the quantity
              await supabase
                .from('user_inventory')
                .update({ quantity: existingItem.quantity + item.effect!.value })
                .eq('id', existingItem.id);
            } else {
              // Add the item to the user's inventory
              const { error } = await supabase
                .from('user_inventory')
                .insert({
                  user_id: user.id,
                  item_id: item.id,
                  quantity: item.effect!.value,
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
        message: `Failed to purchase item: ${(error as Error).message}`,
      });
    } finally {
      setProcessingPurchase(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Neemon Shopkeeper Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <img 
              src="/assets/digimon/neemon.png" 
              alt="Neemon" 
              className="w-24 h-24 object-contain"
              style={{
                imageRendering: "pixelated",
              }}
            />
          </div>
          <div className="flex-1 md:mr-6">
            <div className="bg-white border border-amber-100 rounded-lg p-3 relative shadow-sm">
              <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-r-8 border-b-0 border-l-0 border-white"></div>
              <h2 className="text-amber-800 font-bold mb-1">Neemon</h2>
              <p className="text-gray-700">{neeemonDialogue}</p>
            </div>
          </div>
          <div className="ml-auto mt-4 md:mt-0 flex space-x-3">
            <div className="bg-amber-100 px-4 py-2 rounded-lg flex items-center">
              <span className="font-semibold">{bits.toLocaleString()} bits</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Neemon's Store</h1>
      </div>

      {/* User Stats Display */}
      <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Your Bonus Stats</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(userStats).map(([stat, value]) => (
            <div key={stat} className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">{stat}</div>
              <div className="font-bold text-lg">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          These are bonus stats you can allocate to your Digimon from their profile page.
        </p>
      </div>

      {/* Digimon Selection (for applying items) */}
      {/* <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Select Digimon</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {allUserDigimon.map(digimon => (
            <div
              key={digimon.id}
              onClick={() => setSelectedDigimon(digimon.id)}
              className={`cursor-pointer p-3 rounded-lg border transition-all ${
                selectedDigimon === digimon.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={digimon.digimon?.name || ""}
                    fallbackSpriteUrl={digimon.digimon?.sprite_url || ""}
                    size="sm"
                  />
                </div>
                <div className="text-xs font-medium mt-1 text-center truncate w-full">
                  {digimon.name || digimon.digimon?.name}
                </div>
                <div className="text-xs text-gray-500">Lv. {digimon.current_level}</div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Store Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Tab.Group>
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="min-w-max"> {/* Ensures tabs don't wrap */}
              <Tab.List className="flex space-x-2 p-4">
                {categories.map(category => (
                  <Tab
                    key={category.id}
                    className={({ selected }) =>
                      `px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        selected
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`
                    }
                    onClick={() => setFilterCategory(category.id as ItemCategory | "all")}
                  >
                    {category.name}
                  </Tab>
                ))}
              </Tab.List>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-amber-300 transition-colors">
                  <div className="flex items-start">
                    <div className="bg-white p-3 rounded-md border border-gray-200 mr-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/assets/items/default.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <div className="text-xs text-gray-500 mb-1">{item.category}</div>
                      <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-sm">{item.price} {item.currency}</span>
                        </div>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={
                            processingPurchase === item.id ||
                            (item.currency === "bits" ? bits < item.price : digicoins < item.price) ||
                            (item.id === "abi_enhancer" && !userDigimon)
                          }
                          className={`px-3 py-1.5 rounded text-xs font-medium ${
                            processingPurchase === item.id
                              ? "bg-gray-300 text-gray-500 cursor-wait"
                              : item.currency === "bits"
                              ? bits < item.price
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : digicoins < item.price
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {processingPurchase === item.id
                            ? "Processing..."
                            : "Buy"}
                        </button>
                      </div>
                      {item.id === "abi_enhancer" && !userDigimon && (
                        <p className="mt-1 text-xs text-red-500">You need an active Digimon to use this item</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
};

export default DigimonStorePage; 