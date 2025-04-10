"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sword, Shield, FlaskRoundIcon as Flask, Package, BookOpen } from "lucide-react"
import type { Player, Item } from "./game"
import { useToast } from "@/hooks/use-toast"

interface InventoryProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  learnSpell?: (spellId: string) => void
}

export default function Inventory({ player, setPlayer, learnSpell }: InventoryProps) {
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [itemToUse, setItemToUse] = useState<Item | null>(null)

  // Group items by type
  const weapons = player.inventory.filter((item) => item.type === "weapon")
  const armor = player.inventory.filter((item) => item.type === "armor")
  const consumables = player.inventory.filter((item) => item.type === "consumable")
  const materials = player.inventory.filter((item) => item.type === "material")
  const scrolls = player.inventory.filter((item) => item.type === "scroll")

  // Use consumable item
  const useItemEffect = (item: Item | null) => {
    useEffect(() => {
      if (!item) return

      if (item.type === "scroll" && item.spellId && learnSpell) {
        // Learn spell from scroll
        learnSpell(item.spellId)

        // Remove scroll from inventory
        setPlayer((prev) => ({
          ...prev,
          inventory: prev.inventory.filter((i) => i !== item),
        }))

        // Reset selected item and itemToUse
        setSelectedItem(null)
        setItemToUse(null)
        return
      }

      if (item.type !== "consumable" || !item.effect) return

      // Apply effect
      if (item.effect.type === "health") {
        setPlayer((prev) => {
          // Cap health at max health
          const newHealth = Math.min(prev.stats.health + item.effect!.value, prev.stats.maxHealth)

          return {
            ...prev,
            stats: {
              ...prev.stats,
              health: newHealth,
            },
            // Remove item from inventory
            inventory: prev.inventory.filter((i) => i !== item),
          }
        })

        toast({
          title: `Used ${item.name}`,
          description: `Restored ${item.effect.value} health.`,
        })
      } else if (item.effect.type === "mana") {
        setPlayer((prev) => {
          // Cap mana at max mana
          const newMana = Math.min(prev.stats.mana + item.effect!.value, prev.stats.maxMana)

          return {
            ...prev,
            stats: {
              ...prev.stats,
              mana: newMana,
            },
            // Remove item from inventory
            inventory: prev.inventory.filter((i) => i !== item),
          }
        })

        toast({
          title: `Used ${item.name}`,
          description: `Restored ${item.effect.value} mana.`,
        })
      }

      // Reset selected item and itemToUse
      setSelectedItem(null)
      setItemToUse(null)
    }, [item, setPlayer, toast, learnSpell])
  }

  // Equip item
  const equipItem = (item: Item) => {
    if (!item.equipSlot) return

    setPlayer((prev) => {
      // Get currently equipped item in this slot
      const currentEquipped = prev.equipment[item.equipSlot as keyof typeof prev.equipment] as Item | null

      // Update equipment and inventory
      return {
        ...prev,
        equipment: {
          ...prev.equipment,
          [item.equipSlot]: item,
        },
        // Remove equipped item from inventory and add unequipped item if any
        inventory: [...prev.inventory.filter((i) => i !== item), ...(currentEquipped ? [currentEquipped] : [])],
      }
    })

    toast({
      title: "Item Equipped",
      description: `You equipped ${item.name}.`,
    })
  }

  // Sell item
  const sellItem = (item: Item) => {
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold + item.value,
      inventory: prev.inventory.filter((i) => i !== item),
    }))

    toast({
      title: "Item Sold",
      description: `You sold ${item.name} for ${item.value} gold.`,
    })

    // Reset selected item
    setSelectedItem(null)
  }

  // Render item details
  const renderItemDetails = (item: Item) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>{item.type}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{item.description}</p>

          {item.effect && (
            <div className="mb-4">
              <div className="font-medium mb-1">Effect:</div>
              <div className="text-sm">
                {item.effect.type === "attack" && `+${item.effect.value} Attack`}
                {item.effect.type === "defense" && `+${item.effect.value} Defense`}
                {item.effect.type === "health" && `Restores ${item.effect.value} Health`}
                {item.effect.type === "mana" && `Restores ${item.effect.value} Mana`}
              </div>
            </div>
          )}

          {item.type === "scroll" && item.spellId && (
            <div className="mb-4">
              <div className="font-medium mb-1">Spell:</div>
              <div className="text-sm">
                Contains the spell {item.spellId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            </div>
          )}

          <div className="text-sm">Value: {item.value} gold</div>
        </CardContent>
        <CardFooter className="flex gap-2">
          {item.type === "consumable" && <Button onClick={() => setItemToUse(item)}>Use</Button>}

          {item.type === "scroll" && (
            <Button onClick={() => setItemToUse(item)} className="bg-blue-600 hover:bg-blue-700">
              Learn Spell
            </Button>
          )}

          {item.equipSlot && <Button onClick={() => equipItem(item)}>Equip</Button>}

          <Button variant="outline" onClick={() => sellItem(item)}>
            Sell for {item.value} gold
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Render item list
  const renderItemList = (items: Item[]) => {
    if (items.length === 0) {
      return <div className="text-center p-4">No items in this category.</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <Card
            key={index}
            className={`cursor-pointer hover:bg-gray-800 transition-colors ${
              item.type === "scroll" ? "border-blue-500" : ""
            }`}
            onClick={() => setSelectedItem(item)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                {item.type === "scroll" && <BookOpen size={16} className="text-blue-500" />}
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-400 truncate">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  useItemEffect(itemToUse)

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-4">
      <div>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({player.inventory.length})</TabsTrigger>
            <TabsTrigger value="weapons" className="flex items-center gap-1">
              <Sword size={14} /> Weapons ({weapons.length})
            </TabsTrigger>
            <TabsTrigger value="armor" className="flex items-center gap-1">
              <Shield size={14} /> Armor ({armor.length})
            </TabsTrigger>
            <TabsTrigger value="consumables" className="flex items-center gap-1">
              <Flask size={14} /> Consumables ({consumables.length})
            </TabsTrigger>
            <TabsTrigger value="scrolls" className="flex items-center gap-1">
              <BookOpen size={14} /> Scrolls ({scrolls.length})
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1">
              <Package size={14} /> Materials ({materials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderItemList(player.inventory)}</TabsContent>

          <TabsContent value="weapons">{renderItemList(weapons)}</TabsContent>

          <TabsContent value="armor">{renderItemList(armor)}</TabsContent>

          <TabsContent value="consumables">{renderItemList(consumables)}</TabsContent>

          <TabsContent value="scrolls">{renderItemList(scrolls)}</TabsContent>

          <TabsContent value="materials">{renderItemList(materials)}</TabsContent>
        </Tabs>
      </div>

      <div>
        {selectedItem ? (
          renderItemDetails(selectedItem)
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-400">Select an item to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

