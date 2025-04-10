"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sword, Shield, Zap, SkipForward, Star, BookOpen } from "lucide-react"
import type { Player, Monster, Quest } from "./game"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface BattleSystemProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  monsters: Monster[]
  currentMonster: Monster | null
  setCurrentMonster: React.Dispatch<React.SetStateAction<Monster | null>>
  inBattle: boolean
  setInBattle: React.Dispatch<React.SetStateAction<boolean>>
  totalStats: {
    attack: number
    defense: number
    maxHealth: number
    maxMana: number
  }
  quests: Quest[]
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function BattleSystem({
  player,
  setPlayer,
  monsters,
  currentMonster,
  setCurrentMonster,
  inBattle,
  setInBattle,
  totalStats,
  quests,
  setQuests,
}: BattleSystemProps) {
  const { toast } = useToast()
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [monsterHealth, setMonsterHealth] = useState(0)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [battleTimer, setBattleTimer] = useState<NodeJS.Timeout | null>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [skillToUse, setSkillToUse] = useState<string | null>(null)
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null)
  const [spellToUse, setSpellToUse] = useState<string | null>(null)
  const [isDefending, setIsDefending] = useState(false)
  const [skillActivated, setSkillActivated] = useState(false)
  const [spellActivated, setSpellActivated] = useState(false)
  const [battleEnding, setBattleEnding] = useState(false)

  // Start battle with a monster
  const startBattle = useCallback(
    (monster: Monster) => {
      // Clone the monster to avoid modifying the original
      const battleMonster = JSON.parse(JSON.stringify(monster)) as Monster
      setCurrentMonster(battleMonster)
      setMonsterHealth(battleMonster.health)
      setInBattle(true)
      setIsPlayerTurn(true)
      setIsDefending(false)
      setBattleEnding(false)
      setBattleLog([`You encounter a level ${battleMonster.level} ${battleMonster.name}!`])
      // Show hint about spells for spellcasting classes if they have spells
      if (player.spells.length > 0 && !localStorage.getItem("spellHintShown")) {
        setBattleLog((prev) => [
          ...prev,
          "Remember to use your spells in battle! Click the spell buttons to use your magical abilities.",
        ])
        localStorage.setItem("spellHintShown", "true")
      }
    },
    [setCurrentMonster, setInBattle, setBattleLog, setIsPlayerTurn, setIsDefending, player.spells],
  )

  // Update quest progress when defeating a monster
  const updateQuestProgress = useCallback(
    (monsterId: string) => {
      setQuests((prev) =>
        prev.map((quest) => {
          // Skip completed quests
          if (quest.completed) return quest

          // Check if quest requires this monster
          const requirementIndex = quest.requirements.findIndex(
            (req) => req.type === "monster" && req.id === monsterId.split("-")[0],
          )

          if (requirementIndex >= 0) {
            // Update progress
            const newProgress = [...quest.progress]
            newProgress[requirementIndex] = Math.min(
              newProgress[requirementIndex] + 1,
              quest.requirements[requirementIndex].amount,
            )

            // Check if all requirements are met
            const isCompleted = newProgress.every((progress, index) => progress >= quest.requirements[index].amount)

            if (isCompleted && !quest.completed) {
              // Quest completed notification
              toast({
                title: "Quest Completed!",
                description: `You completed the quest: ${quest.name}`,
              })
            }

            return {
              ...quest,
              progress: newProgress,
              completed: isCompleted,
            }
          }

          return quest
        }),
      )
    },
    [setQuests, toast],
  )

  // Player defeated
  const playerDefeated = useCallback(() => {
    setBattleEnding(true)
    setBattleLog((prev) => [...prev, "You have been defeated!"])

    // End battle and restore some health
    setTimeout(() => {
      setInBattle(false)
      setCurrentMonster(null)
      setIsDefending(false)
      setBattleEnding(false)
      setPlayer((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          health: Math.floor(totalStats.maxHealth * 0.3), // Restore 30% health
        },
      }))

      toast({
        title: "Defeated",
        description: "You have been defeated but recovered with 30% health.",
        variant: "destructive",
      })
    }, 2000)
  }, [setInBattle, setCurrentMonster, setPlayer, totalStats.maxHealth, toast, setBattleLog, setIsDefending])

  // Monster defeated
  const defeatMonster = useCallback(() => {
    if (!currentMonster) return

    setBattleEnding(true)

    // Calculate rewards
    const expGained = currentMonster.experience
    const goldGained = currentMonster.gold

    // Update player
    setPlayer((prev) => ({
      ...prev,
      experience: prev.experience + expGained,
      gold: prev.gold + goldGained,
      // Add monster loot to inventory
      inventory: [...prev.inventory, ...currentMonster.loot],
    }))

    // Update battle log
    setBattleLog((prev) => [
      ...prev,
      `You defeated the level ${currentMonster.level} ${currentMonster.name}!`,
      `You gained ${expGained} experience and ${goldGained} gold!`,
      `You found: ${currentMonster.loot.map((item) => item.name).join(", ") || "nothing"}`,
    ])

    // Update quest progress
    updateQuestProgress(currentMonster.id)

    // End battle
    setTimeout(() => {
      setInBattle(false)
      setCurrentMonster(null)
      setIsDefending(false)
      setBattleEnding(false)
    }, 2000)
  }, [currentMonster, setPlayer, updateQuestProgress, setInBattle, setCurrentMonster, setBattleLog, setIsDefending])

  // Player attacks monster
  const attackMonster = useCallback(() => {
    if (!currentMonster || !inBattle || battleEnding) return

    // Calculate damage
    const damage = Math.max(1, totalStats.attack - currentMonster.defense)
    const newMonsterHealth = Math.max(0, monsterHealth - damage)
    setMonsterHealth(newMonsterHealth)

    // Update battle log
    setBattleLog((prev) => [...prev, `You attack the ${currentMonster.name} for ${damage} damage!`])

    // Check if monster is defeated
    if (newMonsterHealth <= 0) {
      defeatMonster()
    } else {
      // Monster's turn
      setIsPlayerTurn(false)
      setIsDefending(false)
    }
  }, [
    currentMonster,
    inBattle,
    battleEnding,
    totalStats.attack,
    monsterHealth,
    defeatMonster,
    setBattleLog,
    setIsPlayerTurn,
    setIsDefending,
  ])

  // Player defends
  const defendAction = useCallback(() => {
    if (!currentMonster || !inBattle || battleEnding) return

    setIsDefending(true)
    setBattleLog((prev) => [...prev, `You take a defensive stance, reducing incoming damage!`])

    // Monster's turn
    setIsPlayerTurn(false)
  }, [currentMonster, inBattle, battleEnding, setBattleLog, setIsDefending, setIsPlayerTurn])

  // Flee from battle
  const fleeBattle = useCallback(() => {
    if (battleEnding) return

    // 50% chance to flee
    if (Math.random() > 0.5) {
      setBattleEnding(true)
      setBattleLog((prev) => [...prev, "You successfully fled from battle!"])

      setTimeout(() => {
        setInBattle(false)
        setCurrentMonster(null)
        setIsDefending(false)
        setBattleEnding(false)
      }, 1000)
    } else {
      setBattleLog((prev) => [...prev, "You failed to flee!"])
      setIsPlayerTurn(false) // Monster gets a free attack
      setIsDefending(false)
    }
  }, [setInBattle, setCurrentMonster, setBattleLog, setIsPlayerTurn, setIsDefending, battleEnding])

  // Use a skill in battle
  const useSkill = useCallback(() => {
    if (!currentMonster || !inBattle || !skillToUse || battleEnding) return

    const skill = player.skills.find((s) => s.id === skillToUse)
    if (!skill) return

    // Check if player has enough mana
    if (player.stats.mana < 10) {
      toast({
        title: "Not enough mana",
        description: "You don't have enough mana to use this skill.",
        variant: "destructive",
      })
      return
    }

    // Calculate skill damage
    let damage = Math.max(1, totalStats.attack - currentMonster.defense)

    // Add skill bonus
    if (skill.effect.type === "attack") {
      damage += skill.effect.value * skill.level
    }

    const newMonsterHealth = Math.max(0, monsterHealth - damage)
    setMonsterHealth(newMonsterHealth)

    // Consume mana
    setPlayer((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        mana: Math.max(0, prev.stats.mana - 10),
      },
    }))

    // Update battle log
    setBattleLog((prev) => [...prev, `You use ${skill.name} on the ${currentMonster.name} for ${damage} damage!`])

    // Check if monster is defeated
    if (newMonsterHealth <= 0) {
      defeatMonster()
    } else {
      // Monster's turn
      setIsPlayerTurn(false)
      setIsDefending(false)
    }

    // Reset skill state
    setSkillToUse(null)
    setSelectedSkillId(null)
  }, [
    currentMonster,
    inBattle,
    battleEnding,
    player.skills,
    player.stats.mana,
    totalStats.attack,
    monsterHealth,
    setPlayer,
    toast,
    defeatMonster,
    skillToUse,
    setSelectedSkillId,
    setBattleLog,
    setIsDefending,
    setIsPlayerTurn,
  ])

  // Cast a spell in battle
  const castSpell = useCallback(() => {
    if (!currentMonster || !inBattle || !spellToUse || battleEnding) return

    const spell = player.spells.find((s) => s.id === spellToUse)
    if (!spell) return

    // Check if player has enough mana
    if (player.stats.mana < spell.manaCost) {
      toast({
        title: "Not enough mana",
        description: `You need ${spell.manaCost} mana to cast ${spell.name}.`,
        variant: "destructive",
      })
      return
    }

    // Calculate spell effect
    let damage = 0
    let healAmount = 0
    let message = ""

    switch (spell.type) {
      case "damage":
        damage = spell.power
        message = `You cast ${spell.name} on the ${currentMonster.name} for ${damage} magical damage!`
        break
      case "heal":
        healAmount = spell.power
        message = `You cast ${spell.name} and heal yourself for ${healAmount} health!`
        break
      case "buff":
        message = `You cast ${spell.name}, enhancing your abilities!`
        break
    }

    // Apply spell effects
    if (damage > 0) {
      const newMonsterHealth = Math.max(0, monsterHealth - damage)
      setMonsterHealth(newMonsterHealth)

      // Check if monster is defeated
      if (newMonsterHealth <= 0) {
        setBattleLog((prev) => [...prev, message])
        defeatMonster()
        // Consume mana
        setPlayer((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            mana: Math.max(0, prev.stats.mana - spell.manaCost),
          },
        }))
        return
      }
    }

    if (healAmount > 0) {
      setPlayer((prev) => {
        const newHealth = Math.min(totalStats.maxHealth, prev.stats.health + healAmount)
        return {
          ...prev,
          stats: {
            ...prev.stats,
            health: newHealth,
          },
        }
      })
    }

    // Consume mana
    setPlayer((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        mana: Math.max(0, prev.stats.mana - spell.manaCost),
      },
    }))

    // Update battle log
    setBattleLog((prev) => [...prev, message])

    // Monster's turn
    setIsPlayerTurn(false)
    setIsDefending(false)

    // Reset spell state
    setSpellToUse(null)
    setSelectedSpellId(null)
  }, [
    currentMonster,
    inBattle,
    battleEnding,
    player.spells,
    player.stats.mana,
    monsterHealth,
    totalStats.maxHealth,
    setPlayer,
    toast,
    defeatMonster,
    spellToUse,
    setSelectedSpellId,
    setBattleLog,
    setIsDefending,
    setIsPlayerTurn,
  ])

  const skillRef = useRef(useSkill)
  useEffect(() => {
    skillRef.current = useSkill
  }, [useSkill])

  // Handle skill activation
  useEffect(() => {
    if (skillActivated && !battleEnding) {
      skillRef.current()
      setSkillActivated(false)
    }
  }, [skillActivated, battleEnding])

  // Handle spell activation
  useEffect(() => {
    if (spellActivated && spellToUse && !battleEnding) {
      castSpell()
      setSpellActivated(false)
    }
  }, [spellActivated, spellToUse, castSpell, battleEnding])

  // Monster attacks player
  useEffect(() => {
    if (inBattle && currentMonster && !isPlayerTurn && !battleEnding) {
      const timer = setTimeout(() => {
        // Calculate damage
        let damage = Math.max(1, currentMonster.attack - totalStats.defense)

        // Apply defense bonus if defending
        if (isDefending) {
          damage = Math.max(1, Math.floor(damage * 0.5)) // Reduce damage by 50% when defending
          setBattleLog((prev) => [...prev, `Your defensive stance reduces the damage!`])
        }

        // Update player health
        setPlayer((prev) => {
          const newHealth = Math.max(0, prev.stats.health - damage)
          return {
            ...prev,
            stats: {
              ...prev.stats,
              health: newHealth,
            },
          }
        })

        // Update battle log
        setBattleLog((prev) => [...prev, `The ${currentMonster.name} attacks you for ${damage} damage!`])

        // Check if player is defeated
        if (player.stats.health - damage <= 0) {
          playerDefeated()
        } else {
          // Player's turn
          setIsPlayerTurn(true)
        }
      }, 1000)

      setBattleTimer(timer)

      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [
    inBattle,
    isPlayerTurn,
    currentMonster,
    player.stats.health,
    totalStats.defense,
    setPlayer,
    playerDefeated,
    isDefending,
    setBattleLog,
    setIsPlayerTurn,
    battleEnding,
  ])

  // Clean up battle timer
  useEffect(() => {
    return () => {
      if (battleTimer) clearTimeout(battleTimer)
    }
  }, [battleTimer])

  return (
    <div>
      {inBattle && currentMonster ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{currentMonster.name}</span>
                <div className="flex items-center text-yellow-400">
                  <Star size={16} className="mr-1" />
                  <span>Lvl {currentMonster.level}</span>
                </div>
              </div>
              <span>
                HP: {monsterHealth}/{currentMonster.maxHealth}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="w-1/3">
                <div className="flex justify-center mb-2">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                    <Image
                      src={player.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt="Player"
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">You (Lvl {player.level})</div>
              </div>

              <div className="w-1/3 flex items-center justify-center">
                <div className="text-2xl font-bold">VS</div>
              </div>

              <div className="w-1/3">
                <div className="flex justify-center mb-2">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                    <Image
                      src={currentMonster.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt={currentMonster.name}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">{currentMonster.name}</div>
              </div>
            </div>

            <div className="w-full bg-gray-700 h-2 rounded-full mb-4">
              <div
                className="bg-red-600 h-full rounded-full"
                style={{ width: `${(monsterHealth / currentMonster.maxHealth) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sword size={16} className="text-orange-500" />
                <span>Attack: {currentMonster.attack}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-cyan-500" />
                <span>Defense: {currentMonster.defense}</span>
              </div>
            </div>

            <div className="battle-log bg-gray-900 p-3 rounded-md h-40 overflow-y-auto mb-4">
              {battleLog.map((log, index) => (
                <div key={index} className="mb-1 text-white">
                  {log}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sword size={16} className="text-orange-500" />
                <span>Attack: {totalStats.attack}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-cyan-500" />
                <span>Defense: {totalStats.defense}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm mb-1 text-white">
                  Health: {player.stats.health}/{totalStats.maxHealth}
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-red-600 h-full rounded-full"
                    style={{ width: `${(player.stats.health / totalStats.maxHealth) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-sm mb-1 text-white">
                  Mana: {player.stats.mana}/{totalStats.maxMana}
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(player.stats.mana / totalStats.maxMana) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <Button
                  onClick={attackMonster}
                  disabled={!isPlayerTurn || battleEnding}
                  className="flex items-center gap-2"
                >
                  <Sword size={16} /> Attack
                </Button>

                <Button
                  onClick={defendAction}
                  disabled={!isPlayerTurn || battleEnding}
                  variant={isDefending ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Shield size={16} /> Defend
                </Button>
              </div>

              <Button
                onClick={fleeBattle}
                disabled={battleEnding}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SkipForward size={16} /> Flee
              </Button>
            </div>

            {player.skills.length > 0 || player.spells.length > 0 ? (
              <div className="flex flex-wrap gap-2 w-full">
                {player.skills.length > 0 && (
                  <div className="flex gap-2">
                    {player.skills.map((skill) => (
                      <Button
                        key={skill.id}
                        onClick={() => {
                          setSelectedSkillId(skill.id)
                          setSkillToUse(skill.id)
                          setSkillActivated(true)
                        }}
                        disabled={!isPlayerTurn || player.stats.mana < 10 || battleEnding}
                        variant="secondary"
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Zap size={16} /> {skill.name}
                      </Button>
                    ))}
                  </div>
                )}

                {player.spells.length > 0 && (
                  <div className="flex gap-2">
                    {player.spells.map((spell) => (
                      <Button
                        key={spell.id}
                        onClick={() => {
                          setSelectedSpellId(spell.id)
                          setSpellToUse(spell.id)
                          setSpellActivated(true)
                        }}
                        disabled={!isPlayerTurn || player.stats.mana < spell.manaCost || battleEnding}
                        variant="secondary"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <BookOpen size={16} /> {spell.name} ({spell.manaCost} MP)
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {battleEnding && <div className="mt-2 text-center text-amber-400 animate-pulse">Battle ending...</div>}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monsters.map((monster) => (
            <Card key={monster.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{monster.name}</span>
                  <div className="flex items-center text-yellow-400">
                    <Star size={16} className="mr-1" />
                    <span>Lvl {monster.level}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700">
                    <Image
                      src={monster.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt={monster.name}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sword size={16} className="text-orange-500" />
                    <span>Attack: {monster.attack}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-cyan-500" />
                    <span>Defense: {monster.defense}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2">Rewards:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>XP: {monster.experience}</div>
                  <div>Gold: {monster.gold}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => startBattle(monster)} className="w-full" disabled={player.stats.health <= 0}>
                  Battle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

