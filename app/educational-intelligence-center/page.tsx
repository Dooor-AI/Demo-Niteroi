"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AreaChartIcon,
  Users,
  BookCheck,
  Clock,
  Search,
  BarChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  Settings,
  Bell,
  FileText,
} from "lucide-react"
import {
  Bar,
  BarChart as ReBarChart,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const adoptionData = [
  { name: "Teacher Copilot", "Usuários Ativos": 450 },
  { name: "Tutor AI", "Simulados Realizados": 1230 },
]

const performanceData = [
  { name: "Antes", "Nota Média": 5.8 },
  { name: "Depois", "Nota Média": 7.2 },
]

export default function EducationalCenterPage() {
  const [nlqQuery, setNlqQuery] = useState("")
  const [nlqResult, setNlqResult] = useState<string | null>(null)

  const handleNlqSearch = () => {
    if (nlqQuery.toLowerCase().includes("enem")) {
      setNlqResult("O percentual de alunos do ensino médio que já usou o simulado do ENEM é de 78%.")
    } else {
      setNlqResult("Não foi possível encontrar uma resposta. Tente perguntar sobre o 'simulado do ENEM'.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Executivo</h2>
          <p className="text-gray-600">Visão geral da rede municipal de ensino em tempo real</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Período: Último Mês
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Faça uma pergunta... Ex: Qual o percentual de alunos que usou o simulado do ENEM?"
              className="pl-10 h-12 text-base"
              value={nlqQuery}
              onChange={(e) => setNlqQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleNlqSearch()}
            />
          </div>
          {nlqResult && (
            <Card className="mt-4 bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <p className="text-purple-800 font-medium">{nlqResult}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <main className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={<Users className="text-blue-500" />}
            title="Professores Ativos"
            value="450"
            description="no Teacher Copilot"
          />
          <MetricCard
            icon={<BookCheck className="text-green-500" />}
            title="Simulados Realizados"
            value="1.230"
            description="no Tutor AI"
          />
          <MetricCard
            icon={<Clock className="text-orange-500" />}
            title="Tempo Médio Economizado"
            value="~4h/sem"
            description="por professor em correções"
          />
        </main>

        <section className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-2">
          <ChartCard title="Análise de Adoção das Ferramentas" icon={<BarChart />}>
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={adoptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Usuários Ativos" fill="#3b82f6" />
                <Bar dataKey="Simulados Realizados" fill="#22c55e" />
              </ReBarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Análise de Performance (Matéria: Frações)" icon={<LineChart />}>
            <ResponsiveContainer width="100%" height={300}>
              <ReLineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Nota Média" stroke="#8b5cf6" strokeWidth={2} />
              </ReLineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </div>
    </div>
  )
}

const MetricCard = ({
  icon,
  title,
  value,
  description,
}: { icon: React.ReactNode; title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

const ChartCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)
