"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Swords, ArrowLeft, GamepadIcon as GameController, Save, Upload, Camera } from "lucide-react"
import type { Player, GameState } from "./game"
import Image from "next/image"
import { createNewPlayer, getRaceDescription, getClassDescription } from "@/data/player-config"

// Add these imports at the top of the file
import { getStarterItems } from "@/data/items"
import { getClassStartingSpellIds } from "@/data/character-config"
import { getSpellById } from "@/data/spells"
import { Sword, Shield, BookOpen, Zap, User } from "lucide-react"

interface LandingPageProps {
  onStartGame: (player: Player) => void
  onLoadGame: (gameState: GameState) => void
}

export default function LandingPage({ onStartGame, onLoadGame }: LandingPageProps) {
  const [name, setName] = useState("")
  const [race, setRace] = useState("")
  const [characterClass, setCharacterClass] = useState("")
  const [saveFiles, setSaveFiles] = useState<{ id: string; name: string; preview: any }[]>([])
  const [view, setView] = useState<"main" | "new-game" | "load-game">("main")
  const [characterImage, setCharacterImage] = useState<string>("/placeholder.svg?height=160&width=160")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Move these hooks from inside renderCharacterCreation to the top level of the component
  // Remove these hooks that are no longer needed
  const [step, setStep] = useState(1)
  const [background, setBackground] = useState("")
  const [alignment, setAlignment] = useState("")
  const [abilityPoints, setAbilityPoints] = useState(27) // Point buy system
  const [abilities, setAbilities] = useState({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  })

  // Remove all these helper functions that are no longer needed
  // Calculate ability modifier
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  // Calculate point cost for ability score
  const getPointCost = (score: number) => {
    if (score <= 13) return score - 8
    return (score - 13) * 2 + 5 // 14 costs 7, 15 costs 9
  }

  // Handle ability score change
  const handleAbilityChange = (ability: string, value: number) => {
    const currentScore = abilities[ability as keyof typeof abilities]
    const currentCost = getPointCost(currentScore)
    const newCost = getPointCost(value)
    const pointDiff = newCost - currentCost

    if (abilityPoints - pointDiff < 0 || value < 8 || value > 15) return

    setAbilityPoints((prev) => prev - pointDiff)
    setAbilities((prev) => ({
      ...prev,
      [ability]: value,
    }))
  }

  // Get race ability bonuses
  const getRaceBonus = (ability: string) => {
    if (!race) return 0

    const bonuses: Record<string, Record<string, number>> = {
      human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
      elf: { dexterity: 2, intelligence: 1 },
      dwarf: { constitution: 2, wisdom: 1 },
      orc: { strength: 2, constitution: 1 },
    }

    return bonuses[race]?.[ability] || 0
  }

  // Get class primary abilities
  const getClassPrimaryAbilities = () => {
    const primaryAbilities: Record<string, string[]> = {
      warrior: ["strength", "constitution"],
      ranger: ["dexterity", "wisdom"],
      mage: ["intelligence", "constitution"],
      cleric: ["wisdom", "charisma"],
    }

    return characterClass ? primaryAbilities[characterClass] || [] : []
  }

  // Calculate total ability score with racial bonuses
  const getTotalAbilityScore = (ability: string) => {
    return abilities[ability as keyof typeof abilities] + getRaceBonus(ability)
  }

  // Get background description
  const getBackgroundDescription = () => {
    const descriptions: Record<string, string> = {
      soldier: "You have a military background, trained in combat and tactics.",
      sage: "You spent years studying and researching in libraries and universities.",
      criminal: "You have a history of breaking the law and living in the shadows.",
      acolyte: "You devoted your life to service in a temple, learning religious teachings.",
      merchant: "You come from a family of traders and have traveled extensively.",
    }

    return descriptions[background] || ""
  }

  // Get alignment description
  const getAlignmentDescription = () => {
    const descriptions: Record<string, string> = {
      "lawful-good": "You believe in order, honor, and compassion.",
      "neutral-good": "You do what is good without bias toward order or chaos.",
      "chaotic-good": "You follow your conscience with little regard for rules.",
      "lawful-neutral": "You believe in order and organization above all.",
      "true-neutral": "You prefer balance and avoid taking sides.",
      "chaotic-neutral": "You follow your whims and value personal freedom.",
      "lawful-evil": "You methodically take what you want within the bounds of tradition.",
      "neutral-evil": "You do whatever you can get away with to advance yourself.",
      "chaotic-evil": "You act with arbitrary violence and destructive impulses.",
    }

    return descriptions[alignment] || ""
  }

  // Load save files from local storage
  useEffect(() => {
    const savedFiles = localStorage.getItem("idleRpgSaveFiles")
    if (savedFiles) {
      setSaveFiles(JSON.parse(savedFiles))
    }
  }, [])

  // Load a save file
  const loadSaveFile = (saveId: string) => {
    const savedGame = localStorage.getItem(`idleRpgSave_${saveId}`)
    if (savedGame) {
      const loadedState = JSON.parse(savedGame) as GameState
      onLoadGame(loadedState)
    }
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setCharacterImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Create a new character
  const createCharacter = () => {
    if (!name.trim()) {
      alert("Please enter a character name")
      return
    }
    if (!race) {
      alert("Please select a race")
      return
    }
    if (!characterClass) {
      alert("Please select a class")
      return
    }

    // Create new player using the data/player-config.ts utility
    const newPlayer = createNewPlayer(name, race, characterClass, characterImage)
    onStartGame(newPlayer)
  }

  // Format race and class names with proper capitalization
  const formatRaceClass = (text?: string) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  // Get race unique traits
  const getRaceUniqueTraits = (raceId: string): string => {
    const traits: Record<string, string> = {
      human:
        "Humans are versatile and adaptable, with balanced stats across all abilities. They excel in any profession.",
      elf: "Elves have higher mana and dexterity, making them excellent spellcasters and archers. They're naturally attuned to magic.",
      dwarf:
        "Dwarves have increased health and defense, making them durable fighters. They're resistant to damage and excel at tanking.",
      orc: "Orcs have superior strength and attack power, making them formidable warriors. They deal more damage in combat.",
    }
    return traits[raceId] || "No unique traits available."
  }

  // Get class unique abilities
  const getClassUniqueAbilities = (classId: string): string => {
    const abilities: Record<string, string> = {
      warrior:
        "Warriors excel in melee combat with high attack power. They gain bonus strength and can equip the best weapons and armor.",
      ranger:
        "Rangers are masters of ranged combat. They have increased dexterity and start with the Hunter's Mark ability.",
      mage: "Mages command powerful arcane magic. They start with Fireball and Frost Spike spells and have the highest mana pool.",
      cleric:
        "Clerics channel divine power to heal and protect. They start with the Heal spell and have high wisdom for spiritual abilities.",
    }
    return abilities[classId] || "No unique abilities available."
  }

  // Add these helper functions after the existing helper functions
  // Get starting equipment based on class
  const getStartingEquipment = (classId: string) => {
    if (!classId) return []
    return getStarterItems(classId)
  }

  // Get starting spells based on class
  const getStartingSpells = (classId: string) => {
    if (!classId) return []
    const spellIds = getClassStartingSpellIds(classId)
    return spellIds.map((id) => getSpellById(id)).filter((spell) => spell !== undefined)
  }

  // Get starting skills based on class
  const getStartingSkills = (classId: string) => {
    const skills: Record<string, { name: string; description: string }[]> = {
      warrior: [{ name: "Power Strike", description: "A powerful melee attack that deals extra damage" }],
      ranger: [{ name: "Precise Shot", description: "Increases accuracy and damage with ranged weapons" }],
      mage: [{ name: "Arcane Knowledge", description: "Passive ability that increases spell effectiveness" }],
      cleric: [{ name: "Divine Favor", description: "Passive ability that enhances healing spells" }],
    }

    return classId ? skills[classId] || [] : []
  }

  // Render the main menu with two buttons
  const renderMainMenu = () => (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
        <Card
          className="bg-[#2a2a5a] border-[#3b3672]/50 hover:bg-[#32327a] transition-colors cursor-pointer"
          onClick={() => setView("new-game")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <GameController className="h-6 w-6 text-purple-400" />
              New Game
            </CardTitle>
            <CardDescription>
              Create a new character and begin your adventure in the world of idleMirage
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Swords className="h-20 w-20 text-purple-400 opacity-80" />
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Create Character</Button>
          </CardFooter>
        </Card>

        <Card
          className={`bg-[#2a2a5a] border-[#3b3672]/50 ${saveFiles.length > 0 ? "hover:bg-[#32327a] cursor-pointer" : "opacity-80"} transition-colors`}
          onClick={() => saveFiles.length > 0 && setView("load-game")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Save className="h-6 w-6 text-blue-400" />
              Load Game
            </CardTitle>
            <CardDescription>Resume your previous adventure with an existing character</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Download className="h-20 w-20 text-blue-400 opacity-80" />
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={saveFiles.length === 0}>
              {saveFiles.length === 0 ? "No Saved Games" : "Load Game"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )

  // Completely revised character creation screen with two-column layout
  const renderCharacterCreation = () => {
    return (
      <Card className="bg-[#1e1e4a] border-[#3b3672]/50 max-w-6xl w-full">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setView("main")} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Create Your Character</CardTitle>
              <CardDescription>Enter your character details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Character Basics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-purple-400" />
                <h2 className="text-xl font-semibold">Character Basics</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your character's name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">Race</Label>
                  <Select value={race} onValueChange={setRace}>
                    <SelectTrigger id="race">
                      <SelectValue placeholder="Select a race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human">Human (Versatile & Balanced)</SelectItem>
                      <SelectItem value="elf">Elf (Agile & Magical)</SelectItem>
                      <SelectItem value="dwarf">Dwarf (Sturdy & Resilient)</SelectItem>
                      <SelectItem value="orc">Orc (Powerful & Fierce)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={characterClass} onValueChange={setCharacterClass}>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warrior">Warrior (Combat Expert)</SelectItem>
                      <SelectItem value="ranger">Ranger (Ranged Specialist)</SelectItem>
                      <SelectItem value="mage">Mage (Arcane Spellcaster)</SelectItem>
                      <SelectItem value="cleric">Cleric (Divine Healer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Character Avatar</Label>
                  <div className="relative w-full h-40 rounded-md overflow-hidden border-2 border-[#3b3672] mb-4 group">
                    <Image src={characterImage || "/placeholder.svg"} alt="Character" fill className="object-cover" />
                    <div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">Upload Image</span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button variant="outline" size="sm" onClick={triggerFileInput} className="w-full">
                    <Upload className="h-4 w-4 mr-2" /> Upload Avatar
                  </Button>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => {
                      // Create character with default values
                      const newPlayer = createNewPlayer(name, race, characterClass, characterImage)
                      onStartGame(newPlayer)
                    }}
                    disabled={!name || !race || !characterClass}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Create Character
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Character Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-cyan-400" />
                <h2 className="text-xl font-semibold">Character Details</h2>
              </div>

              {/* Race & Class Description */}
              <div className="space-y-4">
                {race && (
                  <div className="p-3 bg-gray-800 rounded-md text-sm">
                    <p className="font-medium text-purple-300 mb-1">{formatRaceClass(race)}</p>
                    <p className="text-gray-300">{getRaceDescription(race)}</p>
                    <p className="text-amber-300 mt-2">Unique Traits:</p>
                    <p className="text-gray-300">{getRaceUniqueTraits(race)}</p>
                  </div>
                )}

                {characterClass && (
                  <div className="p-3 bg-gray-800 rounded-md text-sm">
                    <p className="font-medium text-purple-300 mb-1">{formatRaceClass(characterClass)}</p>
                    <p className="text-gray-300">{getClassDescription(characterClass)}</p>
                    <p className="text-amber-300 mt-2">Unique Abilities:</p>
                    <p className="text-gray-300">{getClassUniqueAbilities(characterClass)}</p>
                  </div>
                )}

                {!race && !characterClass && (
                  <div className="p-4 bg-gray-800 rounded-md text-center">
                    <p className="text-gray-400">Select a race and class to see details</p>
                  </div>
                )}
              </div>

              {/* Starting Equipment Section */}
              {characterClass && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sword size={18} className="text-orange-400" /> Starting Equipment
                  </h3>
                  <div className="bg-gray-800 rounded-md p-3">
                    <div className="grid gap-2">
                      {getStartingEquipment(characterClass).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </div>
                        </div>
                      ))}
                      {getStartingEquipment(characterClass).length === 0 && (
                        <p className="text-gray-400 text-sm">No starting equipment</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Starting Spells Section */}
              {characterClass && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-400" /> Starting Spells
                  </h3>
                  <div className="bg-gray-800 rounded-md p-3">
                    <div className="grid gap-2">
                      {getStartingSpells(characterClass).map((spell, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium text-white">{spell.name}</p>
                            <p className="text-xs text-gray-400">{spell.description}</p>
                            <p className="text-xs text-blue-300 mt-1">Mana Cost: {spell.manaCost}</p>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded ${
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
                      ))}
                      {getStartingSpells(characterClass).length === 0 && (
                        <p className="text-gray-400 text-sm">This class doesn't start with any spells</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Starting Skills Section */}
              {characterClass && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" /> Starting Skills
                  </h3>
                  <div className="bg-gray-800 rounded-md p-3">
                    <div className="grid gap-2">
                      {getStartingSkills(characterClass).map((skill, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium text-white">{skill.name}</p>
                            <p className="text-xs text-gray-400">{skill.description}</p>
                          </div>
                        </div>
                      ))}
                      {getStartingSkills(characterClass).length === 0 && (
                        <p className="text-gray-400 text-sm">No starting skills</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render the load game view
  const renderLoadGame = () => (
    <Card className="bg-[#1e1e4a] border-[#3b3672]/50 max-w-4xl w-full">
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setView("main")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl">Load Game</CardTitle>
            <CardDescription>Continue your previous adventure</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {saveFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-2">No saved games found.</p>
            <p>Start a new game to begin your adventure!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {saveFiles.map((file) => (
              <Card key={file.id} className="bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{file.name}</CardTitle>
                  <CardDescription>
                    {file.preview.characterName
                      ? `${file.preview.characterName} - ${formatRaceClass(file.preview.race)} ${formatRaceClass(
                          file.preview.class,
                        )}`
                      : "Character"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm">
                    <div>Level: {file.preview.playerLevel}</div>
                    <div>Gold: {file.preview.gold}</div>
                    <div>Last played: {file.preview.date}</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button onClick={() => loadSaveFile(file.id)} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" /> Load Game
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a] p-4">
      <div className="mb-8 w-full max-w-md mx-auto flex justify-center">
        <div className="relative py-8 px-12 rounded-lg bg-[#1e1e4a] shadow-[0_0_30px_rgba(139,92,246,0.5)] border-2 border-[#4a4a9f]/30">
          <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
          <div className="relative">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-[#6a98e8]">idle</span>
              <span className="text-[#d183e8]">Mirage</span>
            </h1>
            <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {view === "main" && renderMainMenu()}
        {view === "new-game" && renderCharacterCreation()}
        {view === "load-game" && renderLoadGame()}
      </div>
    </div>
  )
}

