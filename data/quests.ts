import type { Quest } from "@/components/game"
import { getItemById } from "./items"

export const allQuests: Quest[] = [
  {
    id: "quest1",
    name: "Slime Extermination",
    description: "Defeat 3 slimes that have been causing trouble.",
    requirements: [
      {
        type: "monster",
        id: "slime",
        amount: 3,
      },
    ],
    rewards: {
      experience: 50,
      gold: 20,
      items: [getItemById("health-potion")!],
    },
    completed: false,
    progress: [0],
  },
]

// Helper function to get all available quests
export const getAvailableQuests = (): Quest[] => {
  return allQuests
}

// Helper function to get a specific quest by ID
export const getQuestById = (id: string): Quest | undefined => {
  return allQuests.find((quest) => quest.id === id)
}

