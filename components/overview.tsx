"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Sword, Zap, Award, Coins, BookOpen } from "lucide-react"
import type { Player } from "./game"
import Image from "next/image"
import { GAME_INFO, CONTENT_STATS } from "@/data/game-config"

interface OverviewProps {
  player: Player
  totalStats: {
    attack: number
    defense: number
    maxHealth: number
    maxMana: number
  }
  clicks: number
}

export default function Overview({ player, totalStats, clicks }: OverviewProps) {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Adventure Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#2a2a5a] border-[#3b3672]/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} className="text-purple-400" /> Character Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50">
                <Image
                  src={player.imageUrl || "/placeholder.svg?height=100&width=100"}
                  alt="Player"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{player.name || "Adventurer"}</h3>
                <p className="text-gray-300">
                  Level {player.level}{" "}
                  {player.race && player.class
                    ? `${formatRaceClass(player.race)} ${formatRaceClass(player.class)}`
                    : ""}
                </p>
                <p className="text-gray-400 text-sm">
                  XP: {player.experience}/{player.experienceToNextLevel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-yellow-400" />
                <span>Gold: {player.gold}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" />
                <span>Spells: {player.spells.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                <span>Skills: {player.skills.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-purple-400" />
                <span>Total Clicks: {clicks}</span>
              </div>
            </div>

            {(player.background || player.alignment) && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {player.background && (
                  <div className="mb-2">
                    <span className="text-gray-400">Background:</span>{" "}
                    <span className="text-gray-200 capitalize">{player.background}</span>
                  </div>
                )}
                {player.alignment && (
                  <div>
                    <span className="text-gray-400">Alignment:</span>{" "}
                    <span className="text-gray-200">{formatAlignment(player.alignment)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a5a] border-[#3b3672]/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" /> Combat Stats
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
                    className="bg-red-500 h-full rounded-full"
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
                    className="bg-blue-500 h-full rounded-full"
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
      </div>

      {player.spells.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-300">Spells</h3>
          <div className="grid grid-cols-1 gap-2">
            {player.spells.map((spell) => (
              <div key={spell.id} className="bg-gray-700 p-3 rounded-md border border-gray-600">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-white">{spell.name}</span>
                    <div className="text-sm text-gray-300">{spell.description}</div>
                    <div className="text-xs text-blue-300 mt-1">
                      {spell.type === "damage" ? `Damage: ${spell.power}` : `Healing: ${spell.power}`} | Mana Cost:{" "}
                      {spell.manaCost}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      spell.type === "damage"
                        ? "bg-red-900/50 text-red-300"
                        : spell.type === "heal"
                          ? "bg-green-900/50 text-green-300"
                          : "bg-blue-900/50 text-blue-300"
                    }`}
                  >
                    {spell.type.charAt(0).toUpperCase() + spell.type.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-[#2a2a5a] border-[#3b3672]/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={20} className="text-purple-400" /> Adventure Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Click the button to earn gold, which you can spend in the Shop.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Battle monsters to gain experience and level up.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Complete quests to earn rewards and special items.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Upgrade your equipment to increase your combat effectiveness.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Learn skills and spells to gain an advantage in battle.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-[#2a2a5a] border-[#3b3672]/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={20} className="text-purple-400" /> Game Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Game:</span>
              <span>
                {GAME_INFO.title} v{GAME_INFO.version}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Developer:</span>
              <span>{GAME_INFO.developer}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{CONTENT_STATS.totalItems || "???"}</span>
            </div>
            <div className="flex justify-between">
              <span>Monsters:</span>
              <span>{CONTENT_STATS.totalMonsters || "???"}</span>
            </div>
            <div className="flex justify-between">
              <span>Quests:</span>
              <span>{CONTENT_STATS.totalQuests || "???"}</span>
            </div>
            <div className="flex justify-between">
              <span>Spells:</span>
              <span>{CONTENT_STATS.totalSpells || "???"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

