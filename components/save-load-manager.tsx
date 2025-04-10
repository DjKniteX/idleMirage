"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GameState } from "./game"

interface SaveFile {
  id: string
  name: string
  timestamp: number
  preview: {
    playerLevel: number
    gold: number
    date: string
    characterName?: string
    race?: string
    class?: string
  }
}

interface SaveLoadManagerProps {
  gameState: GameState
  loadGame: (state: GameState) => void
}

export default function SaveLoadManager({ gameState, loadGame }: SaveLoadManagerProps) {
  const { toast } = useToast()
  const [saveFiles, setSaveFiles] = useState<SaveFile[]>([])
  const [newSaveName, setNewSaveName] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Load save files from local storage
  useEffect(() => {
    const savedFiles = localStorage.getItem("idleRpgSaveFiles")
    if (savedFiles) {
      setSaveFiles(JSON.parse(savedFiles))
    }
  }, [])

  // Save the list of save files to local storage
  const updateSaveFilesList = (files: SaveFile[]) => {
    setSaveFiles(files)
    localStorage.setItem("idleRpgSaveFiles", JSON.stringify(files))
  }

  // Create a new save file
  const saveGame = () => {
    if (!newSaveName.trim()) {
      setErrorMessage("Please enter a save name")
      return
    }

    if (saveFiles.length >= 3 && !saveFiles.some((file) => file.name === newSaveName)) {
      setErrorMessage("You can only have 3 save files. Please delete one or overwrite an existing save.")
      return
    }

    // Create save file preview with character information
    const preview = {
      playerLevel: gameState.player.level,
      gold: gameState.player.gold,
      date: new Date().toLocaleString(),
      characterName: gameState.player.name,
      race: gameState.player.race,
      class: gameState.player.class,
    }

    // Check if we're overwriting an existing save
    const existingIndex = saveFiles.findIndex((file) => file.name === newSaveName)

    if (existingIndex >= 0) {
      // Update existing save
      const updatedFiles = [...saveFiles]
      const saveId = updatedFiles[existingIndex].id

      updatedFiles[existingIndex] = {
        id: saveId,
        name: newSaveName,
        timestamp: Date.now(),
        preview,
      }

      updateSaveFilesList(updatedFiles)
      localStorage.setItem(`idleRpgSave_${saveId}`, JSON.stringify(gameState))
    } else {
      // Create new save
      const saveId = Date.now().toString()
      const newSaveFile: SaveFile = {
        id: saveId,
        name: newSaveName,
        timestamp: Date.now(),
        preview,
      }

      updateSaveFilesList([...saveFiles, newSaveFile])
      localStorage.setItem(`idleRpgSave_${saveId}`, JSON.stringify(gameState))
    }

    toast({
      title: "Game Saved",
      description: `Your game has been saved as "${newSaveName}".`,
    })

    setNewSaveName("")
    setErrorMessage("")
    setSaveDialogOpen(false)
  }

  // Load a save file
  const loadSaveFile = (saveId: string) => {
    const savedGame = localStorage.getItem(`idleRpgSave_${saveId}`)
    if (savedGame) {
      const loadedState = JSON.parse(savedGame) as GameState
      loadGame(loadedState)

      toast({
        title: "Game Loaded",
        description: "Your saved game has been loaded successfully.",
      })

      setLoadDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: "Could not load the save file.",
        variant: "destructive",
      })
    }
  }

  // Delete a save file
  const deleteSaveFile = (saveId: string, saveName: string) => {
    localStorage.removeItem(`idleRpgSave_${saveId}`)
    const updatedFiles = saveFiles.filter((file) => file.id !== saveId)
    updateSaveFilesList(updatedFiles)

    toast({
      title: "Save Deleted",
      description: `"${saveName}" has been deleted.`,
    })
  }

  // Determine if there are any save files available
  const hasSaveFiles = saveFiles.length > 0

  // Format race and class names with proper capitalization
  const formatRaceClass = (text?: string) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  return (
    <div className="flex gap-2">
      {/* Save Game Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Save size={16} /> Save Game
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Game</DialogTitle>
            <DialogDescription>Enter a name for your save file. You can have up to 3 save files.</DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <Input placeholder="Save name" value={newSaveName} onChange={(e) => setNewSaveName(e.target.value)} />
          </div>

          {saveFiles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Existing Saves:</h4>
              <div className="space-y-2">
                {saveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700"
                    onClick={() => setNewSaveName(file.name)}
                  >
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-gray-400">
                        {file.preview.characterName && (
                          <span>
                            {file.preview.characterName} - {formatRaceClass(file.preview.race)}{" "}
                            {formatRaceClass(file.preview.class)} •
                          </span>
                        )}
                        Level {file.preview.playerLevel} • {file.preview.gold} Gold • {file.preview.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSaveFile(file.id, file.name)
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGame}>Save Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Game Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={hasSaveFiles ? "outline" : "secondary"}
            className={`flex items-center gap-2 ${
              hasSaveFiles
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                : "bg-gray-600 text-gray-300 cursor-not-allowed hover:bg-gray-600"
            }`}
            disabled={!hasSaveFiles}
          >
            <Download size={16} /> Load Game
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Game</DialogTitle>
            <DialogDescription>Select a save file to load.</DialogDescription>
          </DialogHeader>

          {saveFiles.length === 0 ? (
            <div className="text-center py-4">
              <p>No save files found.</p>
            </div>
          ) : (
            <div className="space-y-2 my-4">
              {saveFiles.map((file) => (
                <Card key={file.id} className="cursor-pointer hover:bg-gray-800">
                  <CardHeader className="p-4 pb-2">
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
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="destructive" size="sm" onClick={() => deleteSaveFile(file.id, file.name)}>
                      <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                    <Button size="sm" onClick={() => loadSaveFile(file.id)}>
                      <Download size={16} className="mr-2" /> Load
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

