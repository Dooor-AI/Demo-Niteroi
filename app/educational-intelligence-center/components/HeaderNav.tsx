"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AreaChartIcon, BarChart, BookCheck, FileText, Settings, Users, Bell } from "lucide-react"

export function HeaderNav() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <AreaChartIcon className="w-8 h-8 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-800">Central de Inteligência Educacional</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-purple-600 font-medium">
            <BarChart className="w-4 h-4" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
            <Users className="w-4 h-4" />
            Usuários
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
            <BookCheck className="w-4 h-4" />
            Atividades
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
            <FileText className="w-4 h-4" />
            Relatórios
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium">Gestor Municipal</span>
        </div>
      </div>
    </header>
  )
}

