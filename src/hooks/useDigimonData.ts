import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Digimon } from "../store/petStore";

export interface EvolutionPath {
  id: number;
  from_digimon_id: number;
  to_digimon_id: number;
  level_required: number;
}

// Create a module-level cache
let cachedDigimon: Digimon[] | null = null;
let cachedEvolutionPaths: EvolutionPath[] | null = null;

export const useDigimonData = () => {
  const [digimon, setDigimon] = useState<Digimon[]>(cachedDigimon || []);
  const [evolutionPaths, setEvolutionPaths] = useState<EvolutionPath[]>(
    cachedEvolutionPaths || []
  );
  const [loading, setLoading] = useState(!cachedDigimon);

  useEffect(() => {
    const fetchData = async () => {
      // If we already have cached data, don't fetch again
      if (cachedDigimon && cachedEvolutionPaths) {
        return;
      }

      setLoading(true);

      // Fetch all digimon with all stats
      const { data: digimonData } = await supabase.from("digimon").select(`
          id, name, stage, type, attribute, sprite_url, 
          hp, sp, atk, def, int, spd,
          hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1,
          hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99
        `);

      // Fetch all evolution paths
      const { data: pathsData } = await supabase
        .from("evolution_paths")
        .select("id, from_digimon_id, to_digimon_id, level_required");

      // Map the data to match the Digimon interface
      const mappedDigimon: Digimon[] = (digimonData || []).map((d) => ({
        id: d.id,
        digimon_id: d.id, // Use id as digimon_id since that's what the interface expects
        name: d.name,
        stage: d.stage,
        sprite_url: d.sprite_url,
        type: d.type,
        attribute: d.attribute,
        hp: d.hp,
        sp: d.sp,
        atk: d.atk,
        def: d.def,
        int: d.int,
        spd: d.spd,
        hp_level1: d.hp_level1,
        sp_level1: d.sp_level1,
        atk_level1: d.atk_level1,
        def_level1: d.def_level1,
        int_level1: d.int_level1,
        spd_level1: d.spd_level1,
        hp_level99: d.hp_level99,
        sp_level99: d.sp_level99,
        atk_level99: d.atk_level99,
        def_level99: d.def_level99,
        int_level99: d.int_level99,
        spd_level99: d.spd_level99,
      }));

      // Update the cache
      cachedDigimon = mappedDigimon;
      cachedEvolutionPaths = pathsData || [];

      // Update state
      setDigimon(mappedDigimon);
      setEvolutionPaths(pathsData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Add a function to force refresh the data if needed
  const refreshData = async () => {
    cachedDigimon = null;
    cachedEvolutionPaths = null;
    setLoading(true);

    // Re-fetch data
    const { data: digimonData } = await supabase.from("digimon").select(`
        id, name, stage, type, attribute, sprite_url, 
        hp, sp, atk, def, int, spd,
        hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1,
        hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99
      `);

    const { data: pathsData } = await supabase
      .from("evolution_paths")
      .select("id, from_digimon_id, to_digimon_id, level_required");

    // Map the data
    const mappedDigimon: Digimon[] = (digimonData || []).map((d) => ({
      id: d.id,
      digimon_id: d.id,
      name: d.name,
      stage: d.stage,
      sprite_url: d.sprite_url,
      type: d.type,
      attribute: d.attribute,
      hp: d.hp,
      sp: d.sp,
      atk: d.atk,
      def: d.def,
      int: d.int,
      spd: d.spd,
      hp_level1: d.hp_level1,
      sp_level1: d.sp_level1,
      atk_level1: d.atk_level1,
      def_level1: d.def_level1,
      int_level1: d.int_level1,
      spd_level1: d.spd_level1,
      hp_level99: d.hp_level99,
      sp_level99: d.sp_level99,
      atk_level99: d.atk_level99,
      def_level99: d.def_level99,
      int_level99: d.int_level99,
      spd_level99: d.spd_level99,
    }));

    // Update cache and state
    cachedDigimon = mappedDigimon;
    cachedEvolutionPaths = pathsData || [];

    setDigimon(mappedDigimon);
    setEvolutionPaths(pathsData || []);
    setLoading(false);
  };

  return { digimon, evolutionPaths, loading, refreshData };
};
