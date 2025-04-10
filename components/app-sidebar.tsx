"use client"
import { Home, Heart, Sword, Scroll, Backpack, Shield, Zap, ShoppingBag } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import type { Player } from "./game"

interface AppSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  player: Player
  totalStats: {
    attack: number
    defense: number
    maxHealth: number
    maxMana: number
  }
}

export function AppSidebar({ activeTab, setActiveTab, player, totalStats }: AppSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "stats", label: "Stats", icon: Heart },
    { id: "battle", label: "Battle", icon: Sword },
    { id: "quests", label: "Quests", icon: Scroll },
    { id: "inventory", label: "Inventory", icon: Backpack },
    { id: "equipment", label: "Equipment", icon: Shield },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "shop", label: "Shop", icon: ShoppingBag },
  ]

  // Format race and class names with proper capitalization
  const formatRaceClass = (text?: string) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <Sidebar className="bg-[#2e2a5e] border-r-0 shadow-xl">
      <SidebarHeader className="p-4 pb-2 border-b border-[#3b3672]">
        <h1 className="text-2xl font-bold text-white mb-1">idleMirage</h1>
        <div className="flex justify-between text-gray-300 text-sm">
          <div>{player.name || "Adventurer"}</div>
          <div>Lvl {player.level}</div>
        </div>
        {player.race && player.class && (
          <div className="text-gray-400 text-sm">
            {formatRaceClass(player.race)} {formatRaceClass(player.class)}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-0 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => handleTabClick(item.id)}
                isActive={activeTab === item.id}
                className={`flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#3b3672] transition-colors ${
                  activeTab === item.id ? "bg-[#3b3672] text-white border-l-4 border-purple-400" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={activeTab === item.id ? "text-purple-400" : ""} />
                  <span>{item.label}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Status bars at bottom */}
      <div className="mt-auto p-4 space-y-3 text-sm text-gray-300 border-t border-[#3b3672]">
        <div>
          <div className="flex justify-between mb-1">
            <span>Health:</span>
            <span>
              {player.stats.health}/{totalStats.maxHealth}
            </span>
          </div>
          <Progress
            value={(player.stats.health / totalStats.maxHealth) * 100}
            className="h-2 bg-gray-700"
            indicatorClassName="bg-red-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Mana:</span>
            <span>
              {player.stats.mana}/{totalStats.maxMana}
            </span>
          </div>
          <Progress
            value={(player.stats.mana / totalStats.maxMana) * 100}
            className="h-2 bg-gray-700"
            indicatorClassName="bg-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>XP:</span>
            <span>
              {player.experience}/{player.experienceToNextLevel}
            </span>
          </div>
          <Progress
            value={(player.experience / player.experienceToNextLevel) * 100}
            className="h-2 bg-gray-700"
            indicatorClassName="bg-purple-500"
          />
        </div>
      </div>
    </Sidebar>
  )
}

