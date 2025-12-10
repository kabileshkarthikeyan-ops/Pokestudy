export interface PokemonSpecies {
  id: number;
  name: string;
  type: string[];
  sprite: string;
  stage: 1 | 2 | 3; // 1 = Basic, 2 = Stage 1, 3 = Stage 2
  evolutionId?: number; // The ID this pokemon evolves into (linear)
  branchEvolutions?: number[]; // IDs for branching evolutions
  familyId: number; // To group them in Pokedex
}

export interface OwnedPokemon {
  instanceId: string; // Unique ID for this specific caught pokemon
  speciesId: number;
  nickname?: string;
  isFavorite: boolean;
  caughtAt: string;
}

export interface TradeRecord {
  timestamp: number;
}

export interface UserSettings {
  dailyTarget: number; // Hours
  themeColor: string; // Hex
  scale: number; // 0.5 to 1.5
  darkMode: boolean;
}

export interface AppData {
  coins: number;
  totalStudyHours: number;
  ownedPokemon: OwnedPokemon[];
  seenPokemon: number[]; // IDs of pokemon seen (revealed in dex)
  trades: TradeRecord[];
  settings: UserSettings;
  lastLoginDate: string; // YYYY-MM-DD to reset daily stats if needed
}
