"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sword, Shield, HardHatIcon as Helmet, HardDriveIcon as Boot, Gem } from "lucide-react"
import type { Player } from "./game"
import { useToast } from "@/hooks/use-toast"

interface EquipmentProps {
  player: Player
  setPlayer: React.Dispatch<React.SetStateAction<Player>>
  totalStats: {
    attack: number
    defense: number
    maxHealth: number
    maxMana: number
  }
}

export default function Equipment({ player, setPlayer, totalStats }: EquipmentProps) {
  const { toast } = useToast()

  // Unequip item
  const unequipItem = (slot: keyof typeof player.equipment) => {
    const item = player.equipment[slot]
    if (!item) return

    setPlayer((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [slot]: null,
      },
      // Add unequipped item to inventory
      inventory: [...prev.inventory, item],
    }))

    toast({
      title: "Item Unequipped",
      description: `You unequipped ${item.name}.`,
    })
  }

  // Render equipment slot
  const renderEquipmentSlot = (slot: keyof typeof player.equipment, icon: React.ReactNode, label: string) => {
    const item = player.equipment[slot]

    return (
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            {icon} {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {item ? (
            <div>
              <div className="font-medium mb-2">{item.name}</div>
              <p className="text-sm text-gray-400 mb-2">{item.description}</p>

              {item.effect && (
                <div className="text-sm mb-3">
                  {item.effect.type === "attack" && <span className="text-green-500">+{item.effect.value} Attack</span>}
                  {item.effect.type === "defense" && (
                    <span className="text-green-500">+{item.effect.value} Defense</span>
                  )}
                  {item.effect.type === "health" && <span className="text-green-500">+{item.effect.value} Health</span>}
                  {item.effect.type === "mana" && <span className="text-green-500">+{item.effect.value} Mana</span>}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={() => unequipItem(slot)}>
                Unequip
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-400">No item equipped</div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {renderEquipmentSlot("weapon", <Sword size={16} className="text-orange-500" />, "Weapon")}
        {renderEquipmentSlot("armor", <Shield size={16} className="text-cyan-500" />, "Armor")}
        {renderEquipmentSlot("helmet", <Helmet size={16} className="text-blue-500" />, "Helmet")}
        {renderEquipmentSlot("boots", <Boot size={16} className="text-green-500" />, "Boots")}
        {renderEquipmentSlot("accessory", <Gem size={16} className="text-purple-500" />, "Accessory")}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Bonuses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-1">Attack</div>
              <div className="text-lg">
                {totalStats.attack}
                {totalStats.attack > player.stats.attack && (
                  <span className="text-green-500 text-sm ml-2">(+{totalStats.attack - player.stats.attack})</span>
                )}
              </div>
            </div>

            <div>
              <div className="font-medium mb-1">Defense</div>
              <div className="text-lg">
                {totalStats.defense}
                {totalStats.defense > player.stats.defense && (
                  <span className="text-green-500 text-sm ml-2">(+{totalStats.defense - player.stats.defense})</span>
                )}
              </div>
            </div>

            <div>
              <div className="font-medium mb-1">Max Health</div>
              <div className="text-lg">
                {totalStats.maxHealth}
                {totalStats.maxHealth > player.stats.maxHealth && (
                  <span className="text-green-500 text-sm ml-2">
                    (+{totalStats.maxHealth - player.stats.maxHealth})
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="font-medium mb-1">Max Mana</div>
              <div className="text-lg">
                {totalStats.maxMana}
                {totalStats.maxMana > player.stats.maxMana && (
                  <span className="text-green-500 text-sm ml-2">(+{totalStats.maxMana - player.stats.maxMana})</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

