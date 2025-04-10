"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Zap, Plus } from "lucide-react"
import type { Player, Skill } from "./game"
import { useToast } from "@/hooks/use-toast"

interface SkillsProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  availableSkills: Skill[]
  setAvailableSkills: React.Dispatch<React.SetStateAction<Skill[]>>
}

export default function Skills({ player, setPlayer, availableSkills, setAvailableSkills }: SkillsProps) {
  const { toast } = useToast()

  // Learn a new skill
  const learnSkill = (skill: Skill) => {
    if (player.skillPoints <= 0) {
      toast({
        title: "Not enough skill points",
        description: "You need more skill points to learn this skill.",
        variant: "destructive",
      })
      return
    }

    setPlayer((prev) => ({
      ...prev,
      skillPoints: prev.skillPoints - 1,
      skills: [...prev.skills, { ...skill, level: 1 }],
    }))

    // Remove from available skills
    setAvailableSkills((prev) => prev.filter((s) => s.id !== skill.id))

    toast({
      title: "Skill Learned",
      description: `You learned ${skill.name}!`,
    })
  }

  // Upgrade an existing skill
  const upgradeSkill = (skillId: string) => {
    if (player.skillPoints <= 0) {
      toast({
        title: "Not enough skill points",
        description: "You need more skill points to upgrade this skill.",
        variant: "destructive",
      })
      return
    }

    const skill = player.skills.find((s) => s.id === skillId)
    if (!skill) return

    if (skill.level >= skill.maxLevel) {
      toast({
        title: "Maximum level reached",
        description: "This skill is already at maximum level.",
        variant: "destructive",
      })
      return
    }

    setPlayer((prev) => ({
      ...prev,
      skillPoints: prev.skillPoints - 1,
      skills: prev.skills.map((s) => (s.id === skillId ? { ...s, level: s.level + 1 } : s)),
    }))

    toast({
      title: "Skill Upgraded",
      description: `You upgraded ${skill.name} to level ${skill.level + 1}!`,
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills</h2>
        <div className="text-lg">
          Skill Points: <span className="font-bold">{player.skillPoints}</span>
        </div>
      </div>

      {player.skills.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Learned Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.skills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    {skill.name}
                  </CardTitle>
                  <CardDescription>
                    Level {skill.level}/{skill.maxLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">{skill.description}</p>

                  <div className="mb-3">
                    <div className="text-sm mb-1">
                      {skill.effect.type === "attack" && <span>+{skill.effect.value * skill.level} Attack</span>}
                      {skill.effect.type === "defense" && <span>+{skill.effect.value * skill.level} Defense</span>}
                      {skill.effect.type === "health" && <span>+{skill.effect.value * skill.level} Health</span>}
                      {skill.effect.type === "mana" && <span>+{skill.effect.value * skill.level} Mana</span>}
                    </div>
                    <Progress value={(skill.level / skill.maxLevel) * 100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => upgradeSkill(skill.id)}
                    disabled={skill.level >= skill.maxLevel || player.skillPoints <= 0}
                    className="w-full"
                  >
                    {skill.level >= skill.maxLevel ? "Maxed" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {availableSkills.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Available Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSkills.map((skill) => (
              <Card key={skill.id}>
                <CardHeader>
                  <CardTitle>{skill.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">{skill.description}</p>

                  <div className="text-sm">
                    {skill.effect.type === "attack" && <span>+{skill.effect.value} Attack per level</span>}
                    {skill.effect.type !== "attack" && skill.effect.type === "defense" && (
                      <span>+{skill.effect.value} Defense per level</span>
                    )}
                    {skill.effect.type === "health" && <span>+{skill.effect.value} Health per level</span>}
                    {skill.effect.type === "mana" && <span>+{skill.effect.value} Mana per level</span>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => learnSkill(skill)}
                    disabled={player.skillPoints <= 0}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus size={16} /> Learn Skill
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {player.skills.length === 0 && availableSkills.length === 0 && (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <p>No skills available. Level up to earn skill points.</p>
        </div>
      )}
    </div>
  )
}

