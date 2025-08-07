"use client"

import { useState } from "react"
import { HeaderNav } from "./components/HeaderNav"
import { EducationalChat } from "./components/EducationalChat"
import { MetricCard } from "./components/MetricCard"
import { ChartCard } from "./components/ChartCard"
import { NLQCard } from "./components/NLQCard"
import { adoptionData, performanceData } from "./constants"
import { BarChart, LineChart, BookCheck, Clock, Users } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart as ReLineChart,
  Line,
} from "recharts"

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
      <HeaderNav />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard Executivo</h2>
          <p className="text-gray-600">Visão geral da rede municipal de ensino em tempo real</p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:sticky lg:top-6 self-start">
            <EducationalChat />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <MetricCard icon={<Users className="text-blue-500" />} title="Professores Ativos" value="450" description="no Teacher Copilot" />
              <MetricCard icon={<BookCheck className="text-green-500" />} title="Simulados Realizados" value="1.230" description="no Tutor AI" />
              <MetricCard icon={<Clock className="text-orange-500" />} title="Tempo Médio Economizado" value="~4h/sem" description="por professor em correções" />
            </div>

            <NLQCard nlqQuery={nlqQuery} setNlqQuery={setNlqQuery} nlqResult={nlqResult} handleNlqSearch={handleNlqSearch} />

            <ChartCard title="Análise de Adoção das Ferramentas" icon={<BarChart />}>
              <ResponsiveContainer width="100%" height={260}>
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
              <ResponsiveContainer width="100%" height={260}>
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
          </div>
        </div>
      </div>
    </div>
  )
}

