"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Sword, Zap, Award, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player, RPGStats } from "./game"
import Image from "next/image"
import { useState } from "react"

interface PlayerStatsProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  totalStats: {
    attack: number
    defense: number
    maxHealth: number
    maxMana: number
  }
}

export default function PlayerStats({ player, setPlayer, totalStats }: PlayerStatsProps) {
  const [activeTab, setActiveTab] = useState<"combat" | "character">("combat")

  // Function to increase a specific RPG stat
  const increaseStat = (stat: keyof RPGStats) => {
    if (player.statPoints <= 0) return

    setPlayer((prev) => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      rpgStats: {
        ...prev.rpgStats,
        [stat]: prev.rpgStats[stat] + 1,
      },
    }))
  }

  // Get stat bonus description
  const getStatBonus = (stat: keyof RPGStats) => {
    switch (stat) {
      case "strength":
        return `+${Math.floor(player.rpgStats.strength / 5)} Attack`
      case "dexterity":
        return `+${Math.floor(player.rpgStats.dexterity / 5)} Defense`
      case "constitution":
        return `+${player.rpgStats.constitution * 2} Max Health`
      case "intelligence":
        return `+${player.rpgStats.intelligence * 2} Max Mana`
      case "wisdom":
        return "Improves perception"
      case "charisma":
        return "Improves social interactions"
      default:
        return ""
    }
  }

  // Format race and class names with proper capitalization
  const formatRaceClass = (text?: string) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  // Format alignment with proper capitalization
  const formatAlignment = (alignment?: string) => {
    if (!alignment) return ""
    return alignment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={18} /> Character Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700">
              <Image
                src={player.imageUrl || "/placeholder.svg?height=150&width=150"}
                alt="Player"
                width={150}
                height={150}
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            {player.name && (
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{player.name}</span>
              </div>
            )}
            {player.race && (
              <div className="flex justify-between">
                <span>Race:</span>
                <span>{formatRaceClass(player.race)}</span>
              </div>
            )}
            {player.class && (
              <div className="flex justify-between">
                <span>Class:</span>
                <span>{formatRaceClass(player.class)}</span>
              </div>
            )}
            {player.background && (
              <div className="flex justify-between">
                <span>Background:</span>
                <span>{formatRaceClass(player.background)}</span>
              </div>
            )}
            {player.alignment && (
              <div className="flex justify-between">
                <span>Alignment:</span>
                <span>{formatAlignment(player.alignment)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Level:</span>
              <span>{player.level}</span>
            </div>
            <div className="flex justify-between">
              <span>Experience:</span>
              <span>
                {player.experience} / {player.experienceToNextLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gold:</span>
              <span>{player.gold}</span>
            </div>
            <div className="flex justify-between">
              <span>Skill Points:</span>
              <span>{player.skillPoints}</span>
            </div>
            <div className="flex justify-between">
              <span>Stat Points:</span>
              <span>{player.statPoints}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === "combat" ? "default" : "outline"}
            onClick={() => setActiveTab("combat")}
            className="flex-1"
          >
            Combat Stats
          </Button>
          <Button
            variant={activeTab === "character" ? "default" : "outline"}
            onClick={() => setActiveTab("character")}
            className="flex-1"
          >
            Character Stats
          </Button>
        </div>

        {activeTab === "combat" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} /> Combat Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center gap-2">
                      <Heart size={16} className="text-red-500" /> Health:
                    </span>
                    <span>
                      {player.stats.health} / {totalStats.maxHealth}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div
                      className="bg-red-600 h-full rounded-full"
                      style={{ width: `${(player.stats.health / totalStats.maxHealth) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center gap-2">
                      <Zap size={16} className="text-blue-500" /> Mana:
                    </span>
                    <span>
                      {player.stats.mana} / {totalStats.maxMana}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${(player.stats.mana / totalStats.maxMana) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Sword size={16} className="text-orange-500" /> Attack:
                  </span>
                  <span>
                    {totalStats.attack}
                    {totalStats.attack > player.stats.attack && (
                      <span className="text-green-500 ml-1">(+{totalStats.attack - player.stats.attack})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Shield size={16} className="text-cyan-500" /> Defense:
                  </span>
                  <span>
                    {totalStats.defense}
                    {totalStats.defense > player.stats.defense && (
                      <span className="text-green-500 ml-1">(+{totalStats.defense - player.stats.defense})</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Character Statistics</span>
                {player.statPoints > 0 && (
                  <span className="text-sm font-normal text-green-400">{player.statPoints} points available</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Strength: {player.rpgStats.strength}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("strength")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("strength")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Dexterity: {player.rpgStats.dexterity}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("dexterity")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("dexterity")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Constitution: {player.rpgStats.constitution}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("constitution")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("constitution")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Intelligence: {player.rpgStats.intelligence}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("intelligence")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("intelligence")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Wisdom: {player.rpgStats.wisdom}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("wisdom")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("wisdom")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Charisma: {player.rpgStats.charisma}</span>
                    <p className="text-xs text-gray-400">{getStatBonus("charisma")}</p>
                  </div>
                  {player.statPoints > 0 && (
                    <Button size="sm" variant="outline" onClick={() => increaseStat("charisma")}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

