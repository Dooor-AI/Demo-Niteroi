"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  TrendingUp,
  Clock,
  Send,
  Upload,
  CheckCircle,
  Settings,
  Bell,
  Download,
  BarChart3,
  Calendar,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  ClipboardCheck,
  Activity,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function TeacherCopilot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai" as const,
      content: "Olá! Sou seu assistente de IA para educação. Como posso ajudá-lo hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [answerKey, setAnswerKey] = useState<File | null>(null)
  const [studentTest, setStudentTest] = useState<File | null>(null)
  const [correctionStep, setCorrectionStep] = useState(1)
  const [showValidation, setShowValidation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const studentFileInputRef = useRef<HTMLInputElement>(null)

  const competencies = [
    { id: "reading", name: "Leitura e Interpretação", active: true },
    { id: "writing", name: "Produção Textual", active: false },
    { id: "math", name: "Raciocínio Matemático", active: true },
    { id: "science", name: "Pensamento Científico", active: false },
    { id: "critical", name: "Pensamento Crítico", active: true },
    { id: "creativity", name: "Criatividade", active: false },
    { id: "collaboration", name: "Colaboração", active: true },
    { id: "communication", name: "Comunicação", active: false },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai" as const,
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (input: string) => {
    const responses = [
      "Baseado na sua pergunta, sugiro focar nos seguintes aspectos pedagógicos...",
      "Para melhorar o engajamento dos alunos, você pode tentar estas estratégias...",
      "Analisando os dados da turma, identifiquei algumas oportunidades de melhoria...",
      "Aqui estão algumas atividades personalizadas para seus alunos...",
      "Com base nas competências selecionadas, recomendo este plano de aula...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "answer" | "student") => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === "answer") {
        setAnswerKey(file)
        setCorrectionStep(2)
      } else {
        setStudentTest(file)
        if (answerKey) {
          setCorrectionStep(3)
          setShowValidation(true)
        }
      }
    }
  }

  const resetCorrection = () => {
    setAnswerKey(null)
    setStudentTest(null)
    setCorrectionStep(1)
    setShowValidation(false)
  }

  const handleCompetencyToggle = (competencyId: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(competencyId) ? prev.filter((id) => id !== competencyId) : [...prev, competencyId],
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-roboto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-black text-gray-900">Teacher Copilot</h1>
                  <p className="text-sm font-light text-gray-500">Assistente IA para Professores</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="font-medium">PC</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards at Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold text-gray-900">8.4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Economizadas</p>
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div>
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="font-medium">
                Chat IA
              </TabsTrigger>
              <TabsTrigger value="correction" className="font-medium">
                Corrigir Prova
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-medium">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="planning" className="font-medium">
                Planejamento
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Assistente IA
                  </CardTitle>
                  <CardDescription className="font-normal">
                    Converse com a IA para obter insights pedagógicos personalizados
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm font-normal">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="font-normal"
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Correction Tab */}
            <TabsContent value="correction">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Correção Automática de Provas
                  </CardTitle>
                  <CardDescription className="font-normal">
                    Upload do gabarito e provas dos alunos para correção automática
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress Steps */}
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex items-center space-x-2 ${correctionStep >= 1 ? "text-blue-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${correctionStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      >
                        1
                      </div>
                      <span className="font-medium">Gabarito</span>
                    </div>
                    <div className={`w-8 h-0.5 ${correctionStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                    <div
                      className={`flex items-center space-x-2 ${correctionStep >= 2 ? "text-blue-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${correctionStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      >
                        2
                      </div>
                      <span className="font-medium">Prova do Aluno</span>
                    </div>
                    <div className={`w-8 h-0.5 ${correctionStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                    <div
                      className={`flex items-center space-x-2 ${correctionStep >= 3 ? "text-blue-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${correctionStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      >
                        3
                      </div>
                      <span className="font-medium">Resultado</span>
                    </div>
                  </div>

                  {/* Step 1: Answer Key Upload */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="answer-key" className="text-sm font-medium">
                        1. Upload do Gabarito
                      </Label>
                      <div className="mt-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="answer-key"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "answer")}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 border-dashed font-medium"
                          disabled={!!answerKey}
                        >
                          {answerKey ? (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span>Gabarito carregado: {answerKey.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <Upload className="h-6 w-6" />
                              <span>Clique para fazer upload do gabarito</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Step 2: Student Test Upload */}
                    {answerKey && (
                      <div>
                        <Label htmlFor="student-test" className="text-sm font-medium">
                          2. Upload da Prova do Aluno
                        </Label>
                        <div className="mt-2">
                          <input
                            ref={studentFileInputRef}
                            type="file"
                            id="student-test"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "student")}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => studentFileInputRef.current?.click()}
                            className="w-full h-20 border-dashed font-medium"
                            disabled={!!studentTest}
                          >
                            {studentTest ? (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>Prova carregada: {studentTest.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-6 w-6" />
                                <span>Clique para fazer upload da prova</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Results */}
                    {showValidation && answerKey && studentTest && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-green-800">Correção Concluída</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Nota Final:</p>
                            <p className="text-2xl font-bold text-green-600">8.5/10</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Acertos:</p>
                            <p className="text-2xl font-bold text-blue-600">17/20</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" className="font-medium">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Relatório
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetCorrection}
                            className="font-medium bg-transparent"
                          >
                            Nova Correção
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Performance da Turma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Matemática</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Português</span>
                          <span className="font-bold">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Ciências</span>
                          <span className="font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Engajamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-black text-green-600 mb-2">94%</div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Participação</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Atividades Entregues</p>
                          <p className="text-lg font-bold">146/156</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Tempo Médio</p>
                          <p className="text-lg font-bold">45min</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Planning Tab */}
            <TabsContent value="planning">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Planejamento de Aulas
                  </CardTitle>
                  <CardDescription className="font-normal">Crie planos de aula personalizados com IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Disciplina</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a disciplina" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="math">Matemática</SelectItem>
                            <SelectItem value="portuguese">Português</SelectItem>
                            <SelectItem value="science">Ciências</SelectItem>
                            <SelectItem value="history">História</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-medium">Série</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a série" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6º Ano</SelectItem>
                            <SelectItem value="7">7º Ano</SelectItem>
                            <SelectItem value="8">8º Ano</SelectItem>
                            <SelectItem value="9">9º Ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-medium">Tema da Aula</Label>
                        <Input placeholder="Ex: Frações e Decimais" className="font-normal" />
                      </div>
                      <div>
                        <Label className="font-medium">Duração (minutos)</Label>
                        <Input type="number" placeholder="50" className="font-normal" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Competências a Desenvolver</Label>
                        <div className="mt-2 space-y-2">
                          {competencies.slice(0, 4).map((comp) => (
                            <div key={comp.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={comp.id}
                                checked={selectedCompetencies.includes(comp.id)}
                                onCheckedChange={() => handleCompetencyToggle(comp.id)}
                              />
                              <Label htmlFor={comp.id} className="text-sm font-normal">
                                {comp.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full font-medium">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Gerar Plano de Aula
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Centro de Inteligência Educacional</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 font-medium">
                Suporte
              </a>
              <a href="#" className="hover:text-blue-600 font-medium">
                Documentação
              </a>
              <a href="#" className="hover:text-blue-600 font-medium">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
