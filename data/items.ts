import type { Item } from "@/components/game"

// Item Template For Weapons




// All items in the game
export const allItems: Item[] = [
  // Weapons
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    description: "A basic wooden training sword.",
    type: "weapon",
    value: 5,
    price: 10,
    effect: {
      type: "attack",
      value: 2,
    },
    equipSlot: "weapon",
  },

  // Armor
  {
    id: "cloth-robe",
    name: "Cloth Robe",
    description: "A simple cloth robe that offers minimal protection.",
    type: "armor",
    value: 5,
    price: 10,
    effect: {
      type: "defense",
      value: 1,
    },
    equipSlot: "armor",
  },
  

  // Boots
  {
    id: "leather-boots",
    name: "Leather Boots",
    description: "Simple boots made of leather.",
    type: "armor",
    value: 5,
    price: 15,
    effect: {
      type: "defense",
      value: 1,
    },
    equipSlot: "boots",
  },
  

  // Accessories
  {
    id: "health-amulet",
    name: "Health Amulet",
    description: "An amulet that increases maximum health.",
    type: "armor",
    value: 20,
    price: 75,
    effect: {
      type: "health",
      value: 15,
    },
    equipSlot: "accessory",
  },
  

  // Consumables
  {
    id: "health-potion",
    name: "Health Potion",
    description: "Restores 30 health points.",
    type: "consumable",
    value: 10,
    price: 20,
    effect: {
      type: "health",
      value: 30,
    },
  },
  

  // Materials
  {
    id: "slime-goo",
    name: "Slime Goo",
    description: "A sticky substance collected from slimes.",
    type: "material",
    value: 2,
    price: 5,
  },
  
  // Scrolls (for learning spells)
  {
    id: "fireball-scroll",
    name: "Fireball Scroll",
    description: "A scroll containing the Fireball spell.",
    type: "scroll",
    value: 30,
    price: 100,
    spellId: "fireball",
  },
  
]

// Helper function to get an item by ID
export const getItemById = (id: string): Item | undefined => {
  return allItems.find((item) => item.id === id)
}

// Helper function to get items by type
export const getItemsByType = (type: string): Item[] => {
  return allItems.filter((item) => item.type === type)
}

// Helper function to get items by equipment slot
export const getItemsByEquipSlot = (slot: string): Item[] => {
  return allItems.filter((item) => item.equipSlot === slot)
}

// Helper function to get random items from a list
export const getRandomItems = (items: Item[], count: number): Item[] => {
  const shuffled = [...items].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper function to get starter items based on class
export const getStarterItems = (characterClass?: string): Item[] => {
  const items: Item[] = []

  // Add class-specific starter weapon
  switch (characterClass) {
    case "warrior":
      items.push(getItemById("wooden-sword")!)
      break
    default:
      // Default starter items if no class is specified
      items.push(getItemById("wooden-sword")!)
      break
  }

  // Add some health potions for everyone
  items.push(getItemById("health-potion")!)
  items.push(getItemById("health-potion")!)

  return items
}

// Helper function to get monster loot
export const getMonsterLoot = (monsterId: string): Item[] => {
  const loot: Item[] = []

  // Random chance to drop nothing
  if (Math.random() < 0.3) return loot

  // Add monster-specific loot
  switch (monsterId) {
    case "slime":
      if (Math.random() < 0.7) loot.push(getItemById("slime-goo")!)
      if (Math.random() < 0.1) loot.push(getItemById("health-potion")!)
      break
  }

  return loot
}

