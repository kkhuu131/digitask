import { useState } from 'react';
import { Digimon } from '../store/petStore';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { getAllEvolutions } from '@/utils/evolutionsHelper';

export interface EvolutionPath {
  id: number;
  from_digimon_id: number;
  to_digimon_id: number;
  level_required: number;
}

// The catalog is bundled with the app; initialize synchronously without a loading flash.
let cachedCatalog: { digimon: Digimon[]; evolutionPaths: EvolutionPath[] } | null = null;

const getCatalog = () => {
  if (cachedCatalog) return cachedCatalog;
  const digimonData = Object.values(DIGIMON_LOOKUP_TABLE);
  const pathsData = getAllEvolutions();
  const mappedDigimon: Digimon[] = digimonData.map((d) => ({
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
  cachedCatalog = { digimon: mappedDigimon, evolutionPaths: pathsData || [] };
  return cachedCatalog;
};

export const useDigimonData = () => {
  const [catalog, setCatalog] = useState(getCatalog);

  const refreshData = async () => {
    cachedCatalog = null;
    setCatalog(getCatalog());
  };

  return { ...catalog, loading: false, refreshData };
};
