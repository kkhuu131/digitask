/** A single member in a team template — only the ID is stored; all other data is resolved via DIGIMON_LOOKUP_TABLE at runtime. */
export interface TemplateDigimon {
  digimon_id: number;
}

/** A thematic trio of Digimon species. Levels and species metadata are computed at tournament entry time. */
export interface TournamentTeamTemplate {
  id: string;
  name: string;
  digimon: [TemplateDigimon, TemplateDigimon, TemplateDigimon];
}

export const TOURNAMENT_TEAM_POOL: TournamentTeamTemplate[] = [
  { id: 'hundred_souls', name: 'Hundred Souls', digimon: [{ digimon_id: 177 }, { digimon_id: 273 }, { digimon_id: 225 }] },
  { id: 'million_solo_dive', name: 'Million Solo Dive', digimon: [{ digimon_id: 292 }, { digimon_id: 198 }, { digimon_id: 148 }] },
  { id: 'thousand_souls', name: 'Thousand Souls', digimon: [{ digimon_id: 294 }, { digimon_id: 299 }, { digimon_id: 274 }] },
  { id: 'bit_agent', name: 'Bit Agent', digimon: [{ digimon_id: 9 }, { digimon_id: 11 }, { digimon_id: 8 }] },
  { id: 'dancing_dolls', name: 'Dancing Dolls', digimon: [{ digimon_id: 45 }, { digimon_id: 45 }, { digimon_id: 45 }] },
  { id: 'nature_king', name: 'Nature King', digimon: [{ digimon_id: 118 }, { digimon_id: 129 }, { digimon_id: 59 }] },
  { id: 'security_finalist', name: 'Security Finalist', digimon: [{ digimon_id: 272 }, { digimon_id: 169 }, { digimon_id: 240 }] },
  { id: 'queen_of_duelists', name: 'Queen of Duelists', digimon: [{ digimon_id: 259 }, { digimon_id: 152 }, { digimon_id: 214 }] },
  { id: 'dark_soldiers', name: 'Dark Soldiers', digimon: [{ digimon_id: 116 }, { digimon_id: 79 }, { digimon_id: 92 }] },
  { id: 'saint_soldiers', name: 'Saint Soldiers', digimon: [{ digimon_id: 195 }, { digimon_id: 364 }, { digimon_id: 115 }] },
  { id: 'bug_busters', name: 'Bug Busters', digimon: [{ digimon_id: 201 }, { digimon_id: 168 }, { digimon_id: 193 }] },
  { id: 'sunshine_revolutions', name: 'Sunshine Revolutions', digimon: [{ digimon_id: 366 }, { digimon_id: 240 }, { digimon_id: 284 }] },
  { id: 'metal_emperor', name: 'Metal Emperor', digimon: [{ digimon_id: 177 }, { digimon_id: 201 }, { digimon_id: 144 }] },
  { id: 'aqua_centurion', name: 'Aqua Centurion', digimon: [{ digimon_id: 34 }, { digimon_id: 24 }, { digimon_id: 24 }] },
  { id: 'blade_guardian', name: 'Blade Guardian', digimon: [{ digimon_id: 262 }, { digimon_id: 252 }, { digimon_id: 248 }] },
  { id: 'volcano_striker', name: 'Volcano Striker', digimon: [{ digimon_id: 365 }, { digimon_id: 168 }, { digimon_id: 168 }] },
  { id: 'seas_of_emeralds', name: 'Seas of Emeralds', digimon: [{ digimon_id: 118 }, { digimon_id: 165 }, { digimon_id: 129 }] },
  { id: 'gene_savers', name: 'Gene Savers', digimon: [{ digimon_id: 8 }, { digimon_id: 16 }, { digimon_id: 14 }] },
  { id: 'clear_fighters', name: 'Clear Fighters', digimon: [{ digimon_id: 39 }, { digimon_id: 37 }, { digimon_id: 111 }] },
  { id: 'dragon_lord', name: 'Dragon Lord', digimon: [{ digimon_id: 248 }, { digimon_id: 163 }, { digimon_id: 228 }] },
  { id: 'desert_stormer', name: 'Desert Stormer', digimon: [{ digimon_id: 49 }, { digimon_id: 22 }, { digimon_id: 31 }] },
  { id: 'insect_royale', name: 'Insect Royale', digimon: [{ digimon_id: 82 }, { digimon_id: 93 }, { digimon_id: 108 }] },
  { id: 'aqua_crusher', name: 'Aqua Crusher', digimon: [{ digimon_id: 173 }, { digimon_id: 83 }, { digimon_id: 179 }] },
  { id: 'top_of_the_world', name: 'Top of the World', digimon: [{ digimon_id: 72 }, { digimon_id: 111 }, { digimon_id: 182 }] },
  { id: 'tough_digitizer', name: 'Tough Digitizer', digimon: [{ digimon_id: 25 }, { digimon_id: 40 }, { digimon_id: 27 }] },
  { id: 'mame_world', name: 'Mame World', digimon: [{ digimon_id: 277 }, { digimon_id: 157 }, { digimon_id: 199 }] },
  { id: 'infinity_soul', name: 'Infinity Soul', digimon: [{ digimon_id: 252 }, { digimon_id: 276 }, { digimon_id: 231 }] },
  { id: 'noisy_divider', name: 'Noisy Divider', digimon: [{ digimon_id: 274 }, { digimon_id: 274 }, { digimon_id: 274 }] },
  { id: 'metal_armageddon', name: 'Metal Armageddon', digimon: [{ digimon_id: 144 }, { digimon_id: 211 }, { digimon_id: 167 }] },
  { id: 'access_trooper', name: 'Access Trooper', digimon: [{ digimon_id: 41 }, { digimon_id: 23 }, { digimon_id: 30 }] },
  { id: 'perfect_battler', name: 'Perfect Battler', digimon: [{ digimon_id: 269 }, { digimon_id: 237 }, { digimon_id: 225 }] },
  { id: 'gravity_knights', name: 'Gravity Knights', digimon: [{ digimon_id: 280 }, { digimon_id: 278 }, { digimon_id: 297 }] },
  { id: 'rainbow_flyer', name: 'Rainbow Flyer', digimon: [{ digimon_id: 122 }, { digimon_id: 81 }, { digimon_id: 75 }] },
  { id: 'sky_walkers', name: 'Sky Walkers', digimon: [{ digimon_id: 209 }, { digimon_id: 154 }, { digimon_id: 189 }] },
  { id: 'data_destroyers', name: 'Data Destroyers', digimon: [{ digimon_id: 72 }, { digimon_id: 102 }, { digimon_id: 117 }] },
  { id: 'golden_feather', name: 'Golden Feather', digimon: [{ digimon_id: 277 }, { digimon_id: 296 }, { digimon_id: 254 }] },
  { id: 'captain_region', name: 'Captain Region', digimon: [{ digimon_id: 84 }, { digimon_id: 131 }, { digimon_id: 80 }] },
  { id: 'lonesome_heaven', name: 'Lonesome Heaven', digimon: [{ digimon_id: 193 }, { digimon_id: 164 }, { digimon_id: 124 }] },
  { id: 'vector_partition', name: 'Vector Partition', digimon: [{ digimon_id: 62 }, { digimon_id: 36 }, { digimon_id: 44 }] },
  { id: 'beast_champion', name: 'Beast Champion', digimon: [{ digimon_id: 296 }, { digimon_id: 224 }, { digimon_id: 267 }] },
  { id: 'moon_evolution', name: 'Moon Evolution', digimon: [{ digimon_id: 259 }, { digimon_id: 307 }, { digimon_id: 236 }] },
  { id: 'blizzard_dominion', name: 'Blizzard Dominion', digimon: [{ digimon_id: 65 }, { digimon_id: 133 }, { digimon_id: 349 }] },
  { id: 'wild_hunters', name: 'Wild Hunters', digimon: [{ digimon_id: 33 }, { digimon_id: 32 }, { digimon_id: 38 }] },
  { id: 'silver_freeze', name: 'Silver Freeze', digimon: [{ digimon_id: 138 }, { digimon_id: 66 }, { digimon_id: 185 }] },
  { id: 'general_of_winter', name: 'General of Winter', digimon: [{ digimon_id: 208 }, { digimon_id: 173 }, { digimon_id: 194 }] },
  { id: 'nightmare_head', name: 'Nightmare Head', digimon: [{ digimon_id: 114 }, { digimon_id: 92 }, { digimon_id: 79 }] },
  { id: 'reflect_war', name: 'Reflect War', digimon: [{ digimon_id: 187 }, { digimon_id: 187 }, { digimon_id: 286 }] },
  { id: 'pendulum_distortion', name: 'Pendulum Distortion', digimon: [{ digimon_id: 298 }, { digimon_id: 284 }, { digimon_id: 207 }] },
];
