"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle } from "lucide-react"
import type { Player, Quest } from "./game"
import { useToast } from "@/hooks/use-toast"

interface QuestSystemProps {
  quests: Quest[]
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function QuestSystem({ quests, player, setPlayer, setQuests }: QuestSystemProps) {
  const { toast } = useToast()

  // Claim quest rewards
  const claimRewards = (quest: Quest) => {
    if (!quest.completed) return

    // Add rewards to player
    setPlayer((prev) => ({
      ...prev,
      experience: prev.experience + quest.rewards.experience,
      gold: prev.gold + quest.rewards.gold,
      inventory: [...prev.inventory, ...quest.rewards.items],
    }))

    // Mark quest as claimed
    setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q)))

    toast({
      title: "Rewards Claimed",
      description: `You received ${quest.rewards.experience} XP, ${quest.rewards.gold} gold, and ${quest.rewards.items.length} items.`,
    })
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Quests</h2>

      {quests.length === 0 ? (
        <div className="text-center p-4">No quests available.</div>
      ) : (
        <div className="grid gap-4">
          {quests.map((quest) => (
            <Card key={quest.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {quest.completed ? <CheckCircle className="text-green-500" size={18} /> : <Circle size={18} />}
                  {quest.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{quest.description}</p>

                <div className="space-y-3">
                  {quest.requirements.map((req, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {req.type === "monster" ? "Defeat" : "Collect"} {req.id}
                        </span>
                        <span>
                          {quest.progress[index]}/{req.amount}
                        </span>
                      </div>
                      <Progress value={(quest.progress[index] / req.amount) * 100} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Rewards:</h4>
                  <ul className="text-sm space-y-1">
                    <li>Experience: {quest.rewards.experience}</li>
                    <li>Gold: {quest.rewards.gold}</li>
                    {quest.rewards.items.map((item, index) => (
                      <li key={index}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              {quest.completed && !quest.claimed && (
                <CardFooter>
                  <Button onClick={() => claimRewards(quest)} className="w-full">
                    Claim Rewards
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

