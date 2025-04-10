"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sword, Shield, FlaskRoundIcon as Flask, Package, Coins, RefreshCw, BookOpen } from "lucide-react"
import type { Player, Item } from "./game"
import { useToast } from "@/hooks/use-toast"
import { getItemsByType, getItemsByEquipSlot, getRandomItems } from "@/data/items"

interface ShopProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
}

export default function Shop({ player, setPlayer }: ShopProps) {
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [shopItems, setShopItems] = useState<Item[]>([])

  // Function to generate random shop inventory
  const generateShopInventory = () => {
    // Get all items by category
    const allWeapons = getItemsByType("weapon")
    const allArmors = getItemsByEquipSlot("armor")
    const allHelmets = getItemsByEquipSlot("helmet")
    const allBoots = getItemsByEquipSlot("boots")
    const allAccessories = getItemsByEquipSlot("accessory")
    const allConsumables = getItemsByType("consumable")
    const allScrolls = getItemsByType("scroll")

    // Select random items from each category
    const randomWeapons = getRandomItems(allWeapons, 3)
    const randomArmors = getRandomItems(allArmors, 2)
    const randomHelmets = getRandomItems(allHelmets, 2)
    const randomBoots = getRandomItems(allBoots, 2)
    const randomAccessories = getRandomItems(allAccessories, 2)
    const randomConsumables = getRandomItems(allConsumables, 4)
    const randomScrolls = getRandomItems(allScrolls, 2)

    // Combine all random items
    const newShopItems = [
      ...randomWeapons,
      ...randomArmors,
      ...randomHelmets,
      ...randomBoots,
      ...randomAccessories,
      ...randomConsumables,
      ...randomScrolls,
    ]

    setShopItems(newShopItems)
    setSelectedItem(null)

    toast({
      title: "Shop Refreshed",
      description: "New items are available in the shop!",
    })
  }

  // Initialize shop inventory on component mount
  useEffect(() => {
    generateShopInventory()
  }, [])

  // Group items by type
  const weapons = shopItems.filter((item) => item.type === "weapon")
  const armor = shopItems.filter((item) => item.type === "armor" && item.equipSlot === "armor")
  const helmets = shopItems.filter((item) => item.equipSlot === "helmet")
  const boots = shopItems.filter((item) => item.equipSlot === "boots")
  const accessories = shopItems.filter((item) => item.equipSlot === "accessory")
  const consumables = shopItems.filter((item) => item.type === "consumable")
  const scrolls = shopItems.filter((item) => item.type === "scroll")

  // Buy item
  const buyItem = (item: Item) => {
    // Check if player has enough gold
    if (player.gold < (item.price || 0)) {
      toast({
        title: "Not enough gold",
        description: `You need ${(item.price || 0) - player.gold} more gold to buy this item.`,
        variant: "destructive",
      })
      return
    }

    // Add item to inventory and deduct gold
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold - (item.price || 0),
      inventory: [...prev.inventory, { ...item }],
    }))

    toast({
      title: "Item Purchased",
      description: `You bought ${item.name} for ${item.price} gold.`,
    })
  }

  // Check if player already has this item
  const hasItem = (itemId: string) => {
    return (
      player.inventory.some((item) => item.id === itemId) ||
      Object.values(player.equipment).some((item) => item && item.id === itemId)
    )
  }

  // Check if player already knows the spell (for scrolls)
  const knowsSpell = (spellId?: string) => {
    if (!spellId) return false
    return player.spells.some((spell) => spell.id === spellId)
  }

  // Render item details
  const renderItemDetails = (item: Item) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {item.type === "scroll" && <BookOpen size={18} className="text-blue-500" />}
            {item.name}
          </CardTitle>
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
                {item.effect.type === "health" &&
                  (item.type === "consumable"
                    ? `Restores ${item.effect.value} Health`
                    : `+${item.effect.value} Max Health`)}
                {item.effect.type === "mana" &&
                  (item.type === "consumable"
                    ? `Restores ${item.effect.value} Mana`
                    : `+${item.effect.value} Max Mana`)}
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

          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <Coins size={16} />
            <span>Price: {item.price} gold</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => buyItem(item)}
            disabled={
              player.gold < (item.price || 0) ||
              hasItem(item.id) ||
              (item.type === "scroll" && item.spellId && knowsSpell(item.spellId))
            }
            className="w-full"
          >
            {hasItem(item.id)
              ? "Already Owned"
              : item.type === "scroll" && item.spellId && knowsSpell(item.spellId)
                ? "Spell Already Known"
                : player.gold < (item.price || 0)
                  ? `Need ${(item.price || 0) - player.gold} more gold`
                  : `Buy for ${item.price} gold`}
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
            className={`cursor-pointer transition-colors ${
              hasItem(item.id) || (item.type === "scroll" && item.spellId && knowsSpell(item.spellId))
                ? "opacity-60"
                : "hover:bg-gray-800"
            } ${item.type === "scroll" ? "border-blue-500/50" : ""}`}
            onClick={() => setSelectedItem(item)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex justify-between">
                <span className="flex items-center gap-2">
                  {item.type === "scroll" && <BookOpen size={14} className="text-blue-500" />}
                  {item.name}
                </span>
                <span className="flex items-center text-amber-400">
                  <Coins size={14} className="mr-1" />
                  {item.price}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-400 truncate">{item.description}</p>
              {item.effect && (
                <p className="text-sm mt-1">
                  {item.effect.type === "attack" && (
                    <span className="text-orange-400">+{item.effect.value} Attack</span>
                  )}
                  {item.effect.type === "defense" && (
                    <span className="text-cyan-400">+{item.effect.value} Defense</span>
                  )}
                  {item.effect.type === "health" && (
                    <span className="text-green-400">
                      {item.type === "consumable" ? `Restores ${item.effect.value} HP` : `+${item.effect.value} Max HP`}
                    </span>
                  )}
                  {item.effect.type === "mana" && (
                    <span className="text-blue-400">
                      {item.type === "consumable" ? `Restores ${item.effect.value} MP` : `+${item.effect.value} Max MP`}
                    </span>
                  )}
                </p>
              )}
              {item.type === "scroll" && <p className="text-sm mt-1 text-blue-400">Magic Scroll</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-4">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Shop</h2>
          <div className="flex items-center gap-4">
            <Button onClick={generateShopInventory} variant="outline" className="flex items-center gap-2">
              <RefreshCw size={16} />
              Refresh Shop
            </Button>
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <Coins size={18} />
              <span>Your Gold: {player.gold}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="weapons">
          <TabsList className="mb-4">
            <TabsTrigger value="weapons" className="flex items-center gap-1">
              <Sword size={14} /> Weapons
            </TabsTrigger>
            <TabsTrigger value="armor" className="flex items-center gap-1">
              <Shield size={14} /> Armor
            </TabsTrigger>
            <TabsTrigger value="accessories" className="flex items-center gap-1">
              <Package size={14} /> Accessories
            </TabsTrigger>
            <TabsTrigger value="consumables" className="flex items-center gap-1">
              <Flask size={14} /> Consumables
            </TabsTrigger>
            <TabsTrigger value="scrolls" className="flex items-center gap-1">
              <BookOpen size={14} /> Scrolls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weapons">{renderItemList(weapons)}</TabsContent>

          <TabsContent value="armor">
            <h3 className="text-lg font-medium mb-3">Body Armor</h3>
            {renderItemList(armor)}

            <h3 className="text-lg font-medium mb-3 mt-6">Helmets</h3>
            {renderItemList(helmets)}

            <h3 className="text-lg font-medium mb-3 mt-6">Boots</h3>
            {renderItemList(boots)}
          </TabsContent>

          <TabsContent value="accessories">{renderItemList(accessories)}</TabsContent>

          <TabsContent value="consumables">{renderItemList(consumables)}</TabsContent>

          <TabsContent value="scrolls">{renderItemList(scrolls)}</TabsContent>
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

