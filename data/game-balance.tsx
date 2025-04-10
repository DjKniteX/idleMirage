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

