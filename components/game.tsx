"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import PlayerStats from "./player-stats"
import BattleSystem from "./battle-system"
import QuestSystem from "./quest-system"
import Inventory from "./inventory"
import Equipment from "./equipment"
import Skills from "./skills"
import Shop from "./shop"
import SaveLoadManager from "./save-load-manager"
import LandingPage from "./landing-page"
import { useToast } from "@/hooks/use-toast"
import { allQuests } from "@/data/quests"
import { getStarterItems } from "@/data/items"
import { generateRandomMonsters } from "@/data/monsters"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
// First, import the Overview component at the top of the file
import Overview from "./overview"

// Add these imports for the new spells system
import { allItems } from "@/data/items"
import { monsterTemplates } from "@/data/monsters"
import { allSpells, getSpellsCount } from "@/data/spells"
// Add content stats initialization
import { updateContentStats, GAME_BALANCE } from "@/data/game-config"
// Import character configuration
import { getClassStartingSpellIds } from "@/data/character-config"

// Game types
export type Item = {
  id: string
  name: string
  description: string
  type: "weapon" | "armor" | "consumable" | "material" | "scroll"
  value: number
  effect?: {
    type: "attack" | "defense" | "health" | "mana"
    value: number
  }
  equipSlot?: "weapon" | "armor" | "helmet" | "boots" | "accessory"
  price?: number
  spellId?: string // Added for scroll items
}

export type Monster = {
  id: string
  name: string
  level: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  experience: number
  gold: number
  loot: Item[]
  imageUrl?: string
}

export type Quest = {
  id: string
  name: string
  description: string
  requirements: {
    type: "monster" | "item"
    id: string
    amount: number
  }[]
  rewards: {
    experience: number
    gold: number
    items: Item[]
  }
  completed: boolean
  progress: number[]
  claimed?: boolean
}

export type Skill = {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  effect: {
    type: "attack" | "defense" | "health" | "mana" | "critical"
    value: number
  }
  cost: number
}

// New type for spells
export type Spell = {
  id: string
  name: string
  description: string
  type: "damage" | "heal" | "buff"
  power: number
  manaCost: number
  learned: boolean
}

// New RPG Stats type
export type RPGStats = {
  strength: number // Physical power
  dexterity: number // Agility and precision
  constitution: number // Endurance and resilience
  intelligence: number // Knowledge and reasoning
  wisdom: number // Perception and insight
  charisma: number // Social skills and leadership
}

// Update the Player type to include background and alignment
export type Player = {
  name?: string // Character name
  race?: string // Character race
  class?: string // Character class
  background?: string // Character background
  alignment?: string // Character alignment
  level: number
  experience: number
  experienceToNextLevel: number
  gold: number
  stats: {
    health: number
    maxHealth: number
    attack: number
    defense: number
    mana: number
    maxMana: number
  }
  rpgStats: RPGStats // New RPG stats
  inventory: Item[]
  equipment: {
    weapon: Item | null
    armor: Item | null
    helmet: Item | null
    boots: Item | null
    accessory: Item | null
  }
  skills: Skill[]
  skillPoints: number
  spells: Spell[] // Added spells array
  statPoints: number // Points to allocate to RPG stats
  imageUrl?: string
}

// Game state type for save/load
export type GameState = {
  clicks: number
  clickPower: number
  autoClickPower: number
  player: Player
  monsters: Monster[]
  quests: Quest[]
  availableSkills: Skill[]
  availableSpells: Spell[] // Added available spells
}

export default function Game() {
  const { toast } = useToast()
  const [gameStarted, setGameStarted] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [autoClickPower, setAutoClickPower] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [player, setPlayer] = useState<Player>({
    level: 1,
    experience: 0,
    experienceToNextLevel: GAME_BALANCE.baseExperienceToNextLevel,
    gold: GAME_BALANCE.startingGold,
    stats: {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      mana: 50,
      maxMana: 50,
    },
    rpgStats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      accessory: null,
    },
    skills: [],
    skillPoints: 0,
    spells: [], // Initialize empty spells array
    statPoints: 0, // Initialize stat points
    imageUrl: "/placeholder.svg?height=150&width=150",
  })

  const [monsters, setMonsters] = useState<Monster[]>([])
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null)
  const [inBattle, setInBattle] = useState(false)
  const [quests, setQuests] = useState<Quest[]>([])
  const [totalStats, setTotalStats] = useState({
    attack: 10,
    defense: 5,
    maxHealth: 100,
    maxMana: 50,
  })

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([
    {
      id: "power-strike",
      name: "Power Strike",
      description: "Increases attack power by 5 per level.",
      level: 0,
      maxLevel: 5,
      effect: {
        type: "attack",
        value: 5,
      },
      cost: 1,
    },
    {
      id: "tough-skin",
      name: "Tough Skin",
      description: "Increases defense by 3 per level.",
      level: 0,
      maxLevel: 5,
      effect: {
        type: "defense",
        value: 3,
      },
      cost: 1,
    },
    {
      id: "vitality",
      name: "Vitality",
      description: "Increases maximum health by 20 per level.",
      level: 0,
      maxLevel: 5,
      effect: {
        type: "health",
        value: 20,
      },
      cost: 1,
    },
  ])

  // Available spells that can be learned - now from the data file
  const [availableSpells, setAvailableSpells] = useState<Spell[]>(
    allSpells.map((spell) => ({
      id: spell.id,
      name: spell.name,
      description: spell.description,
      type: spell.type,
      power: spell.power,
      manaCost: spell.manaCost,
      learned: spell.learned,
    })),
  )

  // Function to get spell by ID
  const getSpellById = useCallback(
    (spellId: string): Spell | undefined => {
      return availableSpells.find((spell) => spell.id === spellId)
    },
    [availableSpells],
  )

  // Function to start a new game with a created character
  const startNewGame = (newPlayer: Player) => {
    // Add starting spells based on class from the character config
    let startingSpells: Spell[] = []

    if (newPlayer.class) {
      // Get starting spell IDs from character config
      const startingSpellIds = getClassStartingSpellIds(newPlayer.class)

      // Convert spell IDs to actual spell objects
      startingSpells = startingSpellIds
        .map((spellId) => {
          const spell = getSpellById(spellId)
          return spell ? { ...spell, learned: true } : null
        })
        .filter((spell): spell is Spell => spell !== null)

      // Show toast notification about starting spells if any
      if (startingSpells.length > 0) {
        const spellNames = startingSpells.map((spell) => spell.name).join(" and ")
        toast({
          title: `${formatRaceClass(newPlayer.class)} Spells`,
          description: `You start with ${spellNames} ${startingSpells.length === 1 ? "spell" : "spells"}.`,
        })
      }
    }

    // Update player with class-specific spells and ensure health/mana are at maximum
    const updatedPlayer = {
      ...newPlayer,
      spells: startingSpells,
      stats: {
        ...newPlayer.stats,
        health: newPlayer.stats.maxHealth, // Ensure health is at maximum
        mana: newPlayer.stats.maxMana, // Ensure mana is at maximum
      },
    }

    setPlayer(updatedPlayer)

    // Set initial quests
    setQuests(allQuests)

    // Generate initial monsters
    refreshMonsters()

    // Add starter items to inventory based on class
    const starterItems = getStarterItems(updatedPlayer.class)
    setPlayer((prev) => ({
      ...prev,
      inventory: starterItems,
    }))

    // Start the game
    setGameStarted(true)
  }

  // Function to learn a spell from a scroll
  const learnSpell = useCallback(
    (spellId: string) => {
      const spellToLearn = availableSpells.find((spell) => spell.id === spellId)

      if (!spellToLearn) {
        toast({
          title: "Error",
          description: "Spell not found.",
          variant: "destructive",
        })
        return
      }

      if (player.spells.some((spell) => spell.id === spellId)) {
        toast({
          title: "Already Known",
          description: `You already know the spell ${spellToLearn.name}.`,
          variant: "destructive",
        })
        return
      }

      setPlayer((prev) => ({
        ...prev,
        spells: [...prev.spells, { ...spellToLearn, learned: true }],
      }))

      toast({
        title: "Spell Learned",
        description: `You learned the spell ${spellToLearn.name}!`,
      })
    },
    [availableSpells, player.spells, toast],
  )

  // Apply experience multiplier to any experience gained
  const applyExperienceMultiplier = useCallback((baseExperience: number) => {
    return Math.round(baseExperience * GAME_BALANCE.experienceGainMultiplier)
  }, [])

  // Generate random monsters based on player level
  const refreshMonsters = useCallback(() => {
    const newMonsters = generateRandomMonsters(6, player.level)

    // Apply experience multiplier to monster experience rewards
    const monstersWithMultiplier = newMonsters.map((monster) => ({
      ...monster,
      experience: applyExperienceMultiplier(monster.experience),
    }))

    setMonsters(monstersWithMultiplier)

    toast({
      title: "Monsters Refreshed",
      description: "New monsters have appeared!",
    })
  }, [player.level, toast, applyExperienceMultiplier])

  // Calculate total stats including equipment, skills, and RPG stats
  const calculateTotalStats = useCallback(() => {
    let totalAttack = player.stats.attack
    let totalDefense = player.stats.defense
    let totalMaxHealth = player.stats.maxHealth
    let totalMaxMana = player.stats.maxMana

    // Add RPG stats bonuses
    // Strength affects attack
    totalAttack += Math.floor(player.rpgStats.strength / 5)

    // Dexterity affects defense
    totalDefense += Math.floor(player.rpgStats.dexterity / 5)

    // Constitution affects max health
    totalMaxHealth += player.rpgStats.constitution * 2

    // Intelligence affects max mana
    totalMaxMana += player.rpgStats.intelligence * 2

    // Add equipment bonuses
    Object.values(player.equipment).forEach((item) => {
      if (item && item.effect) {
        if (item.effect.type === "attack") totalAttack += item.effect.value
        if (item.effect.type === "defense") totalDefense += item.effect.value
        if (item.effect.type === "health") totalMaxHealth += item.effect.value
        if (item.effect.type === "mana") totalMaxMana += item.effect.value
      }
    })

    // Add skill bonuses
    player.skills.forEach((skill) => {
      if (skill.effect.type === "attack") totalAttack += skill.effect.value * skill.level
      if (skill.effect.type === "defense") totalDefense += skill.effect.value * skill.level
      if (skill.effect.type === "health") totalMaxHealth += skill.effect.value * skill.level
      if (skill.effect.type === "mana") totalMaxMana += skill.effect.value * skill.level
    })

    return {
      attack: totalAttack,
      defense: totalDefense,
      maxHealth: totalMaxHealth,
      maxMana: totalMaxMana,
    }
  }, [player])

  // Update total stats when player changes
  useEffect(() => {
    setTotalStats(calculateTotalStats())
  }, [player, calculateTotalStats])

  // Get current game state for saving
  const getCurrentGameState = useCallback((): GameState => {
    return {
      clicks,
      clickPower,
      autoClickPower,
      player,
      monsters,
      quests,
      availableSkills,
      availableSpells,
    }
  }, [clicks, clickPower, autoClickPower, player, monsters, quests, availableSkills, availableSpells])

  // Apply experience multiplier to quest rewards
  useEffect(() => {
    if (quests.length > 0) {
      // Apply experience multiplier to quest rewards
      const updatedQuests = quests.map((quest) => ({
        ...quest,
        rewards: {
          ...quest.rewards,
          experience: applyExperienceMultiplier(quest.rewards.experience),
        },
      }))

      // Only update if the quests have changed
      if (JSON.stringify(updatedQuests) !== JSON.stringify(quests)) {
        setQuests(updatedQuests)
      }
    }
  }, [quests, applyExperienceMultiplier])

  // Load game state
  const loadGameState = useCallback((gameState: GameState) => {
    setClicks(gameState.clicks)
    setClickPower(gameState.clickPower)
    setAutoClickPower(gameState.autoClickPower)

    // Handle loading older save files that don't have RPG stats
    if (gameState.player && !gameState.player.rpgStats) {
      gameState.player.rpgStats = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      }
      gameState.player.statPoints = 0
    }

    // Ensure health and mana are properly set when loading a game
    if (gameState.player) {
      // If health or mana are missing or 0, set them to their maximum values
      if (!gameState.player.stats.health || gameState.player.stats.health <= 0) {
        gameState.player.stats.health = gameState.player.stats.maxHealth
      }
      if (!gameState.player.stats.mana || gameState.player.stats.mana <= 0) {
        gameState.player.stats.mana = gameState.player.stats.maxMana
      }
    }

    setPlayer(gameState.player)
    setMonsters(gameState.monsters)
    setQuests(gameState.quests)
    setAvailableSkills(gameState.availableSkills)

    // Use the spells from the data file if the save doesn't have them
    setAvailableSpells(
      gameState.availableSpells ||
        allSpells.map((spell) => ({
          id: spell.id,
          name: spell.name,
          description: spell.description,
          type: spell.type,
          power: spell.power,
          manaCost: spell.manaCost,
          learned: spell.learned,
        })),
    )

    setGameStarted(true)
  }, [])

  // Reset game
  const resetGame = () => {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      setGameStarted(false)
    }
  }

  // Handle click
  const handleClick = () => {
    setClicks((prev) => prev + clickPower)
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold + clickPower,
    }))
  }

  // Level up player
  const levelUp = useCallback(() => {
    setPlayer((prev) => {
      const newLevel = prev.level + 1
      const newExpToNextLevel = Math.floor(prev.experienceToNextLevel * GAME_BALANCE.experienceLevelMultiplier)

      return {
        ...prev,
        level: newLevel,
        experience: prev.experience - prev.experienceToNextLevel,
        experienceToNextLevel: newExpToNextLevel,
        skillPoints: prev.skillPoints + GAME_BALANCE.skillPointsPerLevel,
        statPoints: prev.statPoints + GAME_BALANCE.statPointsPerLevel,
        stats: {
          ...prev.stats,
          maxHealth: prev.stats.maxHealth + 10,
          health: prev.stats.maxHealth + 10, // Full health on level up
          maxMana: prev.stats.maxMana + 5,
          mana: prev.stats.maxMana + 5, // Full mana on level up
          attack: prev.stats.attack + 2,
          defense: prev.stats.defense + 1,
        },
      }
    })

    toast({
      title: "Level Up!",
      description: `You are now level ${player.level + 1}! You gained ${GAME_BALANCE.skillPointsPerLevel} skill point and ${GAME_BALANCE.statPointsPerLevel} stat points.`,
    })

    // Refresh monsters when player levels up
    refreshMonsters()
  }, [player.level, toast, refreshMonsters])

  // Check if player can level up
  useEffect(() => {
    if (player.experience >= player.experienceToNextLevel) {
      levelUp()
    }
  }, [player.experience, player.experienceToNextLevel, levelUp])

  // Auto-click effect
  useEffect(() => {
    if (autoClickPower <= 0) return

    const autoClickInterval = setInterval(() => {
      setClicks((prev) => prev + autoClickPower)
    }, GAME_BALANCE.autoClickInterval)

    return () => clearInterval(autoClickInterval)
  }, [autoClickPower])

  // Initialize content statistics
  useEffect(() => {
    if (gameStarted) {
      updateContentStats({
        items: allItems?.length || 0,
        monsters: monsterTemplates?.length || 0,
        quests: allQuests?.length || 0,
        spells: getSpellsCount(),
        skills: availableSkills.length,
      })
    }
  }, [gameStarted, availableSkills.length])

  // Add an effect to show the current experience multiplier when it changes
  useEffect(() => {
    if (gameStarted && GAME_BALANCE.experienceGainMultiplier > 1.0) {
      toast({
        title: "Experience Boost",
        description: `You are earning ${GAME_BALANCE.experienceGainMultiplier}x experience!`,
      })
    }
  }, [gameStarted, toast])

  // Then update the renderActiveContent function to use it
  const renderActiveContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview player={player} totalStats={totalStats} clicks={clicks} />
      case "stats":
        return <PlayerStats player={player} setPlayer={setPlayer} totalStats={totalStats} />
      case "battle":
        return (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={refreshMonsters} className="flex items-center gap-2">
                <RefreshCw size={16} /> Refresh Monsters
              </Button>
            </div>
            <BattleSystem
              player={player}
              setPlayer={setPlayer}
              monsters={monsters}
              currentMonster={currentMonster}
              setCurrentMonster={setCurrentMonster}
              inBattle={inBattle}
              setInBattle={setInBattle}
              totalStats={totalStats}
              quests={quests}
              setQuests={setQuests}
            />
          </>
        )
      case "quests":
        return <QuestSystem quests={quests} player={player} setPlayer={setPlayer} setQuests={setQuests} />
      case "inventory":
        return <Inventory player={player} setPlayer={setPlayer} learnSpell={learnSpell} />
      case "equipment":
        return <Equipment player={player} setPlayer={setPlayer} totalStats={totalStats} />
      case "skills":
        return (
          <Skills
            player={player}
            setPlayer={setPlayer}
            availableSkills={availableSkills}
            setAvailableSkills={setAvailableSkills}
          />
        )
      case "shop":
        return <Shop player={player} setPlayer={setPlayer} />
      default:
        return <PlayerStats player={player} setPlayer={setPlayer} totalStats={totalStats} />
    }
  }

  // Add this helper function inside the Game component
  const formatRaceClass = (text?: string) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  // If game hasn't started, show landing page
  if (!gameStarted) {
    return <LandingPage onStartGame={startNewGame} onLoadGame={loadGameState} />
  }

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} player={player} totalStats={totalStats} />
      <SidebarInset className="bg-[#0a0a1a]">
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center mb-8">
            {/* Game Logo */}
            <div className="mb-6 w-full flex justify-center">
              <div className="relative py-8 px-12 rounded-lg bg-[#1e1e4a] shadow-[0_0_30px_rgba(139,92,246,0.5)] border-2 border-[#4a4a9f]/30">
                <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                <div className="relative">
                  <h1 className="text-6xl font-bold tracking-tight">
                    <span className="text-[#6a98e8]">idle</span>
                    <span className="text-[#d183e8]">Mirage</span>
                  </h1>
                  <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-purple-300/60 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-purple-300/60 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-purple-300/60 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-purple-300/60 rounded-br-lg"></div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-medium mb-4 text-gray-300">
              {player.name ? `${player.name}` : "Adventurer"}
              <div className="text-center text-lg text-gray-400">
                Level {player.level}{" "}
                {player.race && player.class ? `${formatRaceClass(player.race)} ${formatRaceClass(player.class)}` : ""}
              </div>
            </h2>

            <div className="stats bg-[#1e1e4a] p-4 rounded-lg w-full max-w-md mb-4 shadow-lg border border-[#3b3672]/50">
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400">⦿</span> Gold: {player.gold}
                </span>
                <span>Level: {player.level}</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between">
                  <span className="text-white">
                    Experience: {player.experience} / {player.experienceToNextLevel}
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${(player.experience / player.experienceToNextLevel) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between">
                  <span className="text-white">
                    Health: {player.stats.health} / {totalStats.maxHealth}
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(player.stats.health / totalStats.maxHealth) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between">
                  <span className="text-white">
                    Mana: {player.stats.mana} / {totalStats.maxMana}
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(player.stats.mana / totalStats.maxMana) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="clicker mb-8">
              <Button
                size="lg"
                onClick={handleClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-xl shadow-lg transform hover:scale-105 transition-transform"
              >
                Click to Gain Gold ({clickPower})
              </Button>
              <div className="text-center mt-2">Total Clicks: {clicks}</div>
            </div>

            <div className="flex gap-4 mb-4">
              <SaveLoadManager gameState={getCurrentGameState()} loadGame={loadGameState} />
              <Button variant="destructive" onClick={resetGame} className="shadow-md">
                Reset Game
              </Button>
            </div>
          </div>

          <div className="bg-[#1e1e4a] p-6 rounded-lg shadow-lg border border-[#3b3672]/50">
            {renderActiveContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

