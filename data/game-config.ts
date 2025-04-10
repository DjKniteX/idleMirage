/**
 * GAME CONFIGURATION
 *
 * This file contains all the core game settings and metadata.
 * Edit this file to make quick changes to game balance, content counts, etc.
 */

// Game Metadata
export const GAME_INFO = {
  title: "idleMirage",
  version: "0.5.0",
  description: "Create your own PBBG",
  developer: "mockinbird.dev",
  releaseDate: "2025",
  website: "https://mockinbird.dev",
  repository: "https://github.com/djknitex/idlemirage",
}

// Game Credits
export const GAME_CREDITS = [
  { name: "v0 Developer & Nikki X", role: "Game Design & Development" },
  { name: "Vercel", role: "Platform & Tools" },
]

// Game Balance Settings
export const GAME_BALANCE = {
  // Experience and Leveling
  baseExperienceToNextLevel: 100,
  experienceLevelMultiplier: 1.5, // How much more XP is needed for each level
  experienceGainMultiplier: 1.0, // Multiplier for all experience gained
  maxLevel: 50,

  // Economy
  startingGold: 50,
  goldDropMultiplier: 1.0,
  itemSellValuePercent: 50, // % of item value when selling
  shopRefreshCost: 25, // Gold cost to refresh shop inventory

  // Combat
  baseDamageVariance: 0.2, // ±20% damage variance
  criticalHitChance: 0.05, // 5% chance
  criticalHitMultiplier: 1.5, // 50% more damage
  fleeSuccessChance: 0.5, // 50% chance to flee
  monsterLevelVariance: { min: -2, max: 3 }, // Monster level range relative to player

  // Resources
  healthRegenRate: 0.05, // 5% of max health per minute when not in combat
  manaRegenRate: 0.1, // 10% of max mana per minute when not in combat
  deathHealthRecovery: 0.3, // Recover 30% health on defeat

  // Rewards
  skillPointsPerLevel: 1,
  statPointsPerLevel: 3,

  // Idle Progression
  autoClickInterval: 1000, // ms between auto-clicks
  maxAutoClickPower: 10,
}

// Base Stats for New Characters
export const BASE_PLAYER_STATS = {
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  attack: 10,
  defense: 5,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

// Content Statistics (automatically updated)
export const CONTENT_STATS = {
  // These will be calculated dynamically when the game loads
  totalItems: 0,
  totalMonsters: 0,
  totalQuests: 0,
  totalSpells: 0,
  totalSkills: 0,
}

// Update content statistics (call this when the game initializes)
export function updateContentStats(counts: {
  items?: number
  monsters?: number
  quests?: number
  spells?: number
  skills?: number
}) {
  if (counts.items !== undefined) CONTENT_STATS.totalItems = counts.items
  if (counts.monsters !== undefined) CONTENT_STATS.totalMonsters = counts.monsters
  if (counts.quests !== undefined) CONTENT_STATS.totalQuests = counts.quests
  if (counts.spells !== undefined) CONTENT_STATS.totalSpells = counts.spells
  if (counts.skills !== undefined) CONTENT_STATS.totalSkills = counts.skills
}

// Helper function to get game version string
export function getGameVersionString(): string {
  return `${GAME_INFO.title} v${GAME_INFO.version}`
}

// Helper function to get a formatted credits string
export function getCreditsString(): string {
  return GAME_CREDITS.map((credit) => `${credit.name} - ${credit.role}`).join("\n")
}

