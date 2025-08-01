"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { UploadCloud, Loader2, Wand2, PlusCircle } from "lucide-react"
import { BookUser } from "lucide-react" // Import BookUser component
// Adicionar no início do componente, após os imports
import { Bell, Settings, Home, FileText, BarChart3, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const mockResults = [
  { student: "Ana Silva", grade: 8.5, status: "Aprovado" },
  { student: "Bruno Costa", grade: 9.0, status: "Aprovado" },
  { student: "Carla Dias", grade: 5.5, status: "Recuperação" },
  { student: "Daniel Farias", grade: 4.0, status: "Reprovado" },
  { student: "Elisa Mendes", grade: 7.5, status: "Aprovado" },
]

const initialLessonPlan = {
  subject: "Biologia",
  title: "Plano de Aula - Ecossistemas e Cadeias Alimentares",
  sections: [
    {
      title: "Objetivos de Aprendizagem",
      content:
        "Compreender o conceito de ecossistema. Identificar os componentes de uma cadeia alimentar. Analisar o fluxo de energia nos ecossistemas.",
    },
    {
      title: "Atividades Propostas",
      content:
        "1. Leitura do capítulo 5 do livro didático. 2. Debate em grupo sobre impactos ambientais. 3. Criação de um diorama de cadeia alimentar.",
    },
    {
      title: "Recursos Necessários",
      content: "Livro didático, acesso à internet para pesquisa, materiais para o diorama (caixas, miniaturas, etc.).",
    },
    { title: "Avaliação", content: "Participação no debate e avaliação do diorama." },
  ],
}

export default function TeacherCopilotPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<typeof initialLessonPlan | null>(null)
  const [newTopic, setNewTopic] = useState("")
  const [isAddingTopic, setIsAddingTopic] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setShowResults(false)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2500) // Simula o tempo de processamento da IA
  }

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true)
    setLessonPlan(null)
    setTimeout(() => {
      setLessonPlan(initialLessonPlan)
      setIsGeneratingPlan(false)
    }, 2000) // Simula a geração do plano
  }

  const handleAddTopic = () => {
    if (!newTopic || !lessonPlan) return
    setIsAddingTopic(true)
    setTimeout(() => {
      const newSection = {
        title: `Aula Especial: ${newTopic}`,
        content: `Tópicos: Definição de ${newTopic}, principais características e exemplos. Atividades: Pesquisa guiada e apresentação. Objetivos: Aprofundar o conhecimento sobre ${newTopic}.`,
      }
      setLessonPlan({
        ...lessonPlan,
        sections: [...lessonPlan.sections, newSection],
      })
      setNewTopic("")
      setIsAddingTopic(false)
    }, 1500)
  }

  // Substituir todo o return por:
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <BookUser className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Teacher Copilot</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Home className="w-4 h-4" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-2 text-blue-600 font-medium">
              <FileText className="w-4 h-4" />
              Ferramentas
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <HelpCircle className="w-4 h-4" />
              Ajuda
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback>PF</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium">Prof. Silva</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ferramentas de Ensino</h2>
          <p className="text-gray-600">Automatize suas tarefas e otimize seu tempo em sala de aula</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-gray-600">Provas Corrigidas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">43</div>
              <div className="text-sm text-gray-600">Planos Criados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">89h</div>
              <div className="text-sm text-gray-600">Tempo Economizado</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </CardContent>
          </Card>
        </div>

        {/* Resto do conteúdo existente permanece igual */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="grade" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grade">Corrigir Prova</TabsTrigger>
                <TabsTrigger value="plan">Criar Plano de Aula</TabsTrigger>
              </TabsList>
              <TabsContent value="grade" className="mt-6">
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Escaneie ou envie a prova</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tire uma foto ou faça upload de uma avaliação de múltipla escolha.
                    </p>
                    <Button onClick={handleScan} disabled={isScanning} className="mt-4">
                      {isScanning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                        </>
                      ) : (
                        "Escanear Prova"
                      )}
                    </Button>
                  </CardContent>
                </Card>
                {showResults && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Relatório de Notas Instantâneo</h3>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Nota</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockResults.map((result) => (
                            <TableRow key={result.student}>
                              <TableCell className="font-medium">{result.student}</TableCell>
                              <TableCell>{result.grade.toFixed(1)}</TableCell>
                              <TableCell>{result.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="plan" className="mt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biologia">Biologia</SelectItem>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="historia">História</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan} className="w-full sm:w-auto">
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" /> Gerar Plano de Aula
                      </>
                    )}
                  </Button>
                </div>
                {lessonPlan && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>{lessonPlan.title}</CardTitle>
                      <CardDescription>Plano de aula gerado pela IA, alinhado à BNCC.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {lessonPlan.sections.map((section, index) => (
                          <AccordionItem value={`item-${index}`} key={section.title}>
                            <AccordionTrigger>{section.title}</AccordionTrigger>
                            <AccordionContent>{section.content}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold mb-2">Adicionar aula específica</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Genética Mendeliana"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                          />
                          <Button onClick={handleAddTopic} disabled={isAddingTopic}>
                            {isAddingTopic ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PlusCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>© 2024 Prefeitura de Niterói - Teacher Copilot v2.1.0</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-600">
                Suporte
              </a>
              <a href="#" className="hover:text-blue-600">
                Privacidade
              </a>
              <a href="#" className="hover:text-blue-600">
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
