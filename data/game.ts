export type GameState = {
  clicks: number
  clickPower: number
  autoClickPower: number
  // player: Player; // Removing Player type to avoid circular dependency
  // monsters: Monster[]; // Removing Monster type to avoid circular dependency
  // quests: Quest[]; // Removing Quest type to avoid circular dependency
  // availableSkills: Skill[]; // Removing Skill type to avoid circular dependency
  // availableSpells: Spell[]; // Removing Spell type to avoid circular dependency
  player: any
  monsters: any[]
  quests: any[]
  availableSkills: any[]
  availableSpells: any[]
}

