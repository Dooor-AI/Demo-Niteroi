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
import { MarkdownMessage } from "@/components/ui/markdown-message"

// Component to handle timestamp rendering client-side only
function Timestamp({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="text-xs text-gray-500">...</span>
  }

  return (
    <span className="text-xs text-gray-500">
      {date.toLocaleTimeString()}
    </span>
  )
}

export default function TeacherCopilot() {
  const [messages, setMessages] = useState<Array<{
    id: number
    type: "ai" | "user"
    content: string
    timestamp: Date
  }>>([
    {
      id: 1,
      type: "ai" as const,
      content: "Olá! Sou seu assistente de IA para educação. Como posso ajudá-lo hoje?",
      timestamp: new Date("2024-01-15T15:00:00.000Z"), // Static timestamp to avoid hydration issues
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [answerKey, setAnswerKey] = useState<File | null>(null)
  const [studentTests, setStudentTests] = useState<Array<{
    id: string
    file: File
    studentName: string
    status: 'pending' | 'correcting' | 'completed'
    score?: number
    correctAnswers?: number
    totalQuestions?: number
    correctedAt?: Date
    feedback?: string
    corrections?: Array<{
      question: number
      studentAnswer: string
      correctAnswer: string
      isCorrect: boolean
      explanation: string
    }>
    strengths?: string[]
    improvements?: string[]
  }>>([])
  const [currentStudentName, setCurrentStudentName] = useState("")
  const [correctionStep, setCorrectionStep] = useState(1)
  const [lessonPlan, setLessonPlan] = useState("")
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<string>>(new Set())
  const [planFormData, setPlanFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    duration: ""
  })
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

    try {
      // Chamar a API do Gemini
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          userInput: inputMessage,
          context: "teacher" // Adicionar contexto para diferenciação
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const aiResponse = {
        id: messages.length + 2,
        type: "ai" as const,
        content: data.response,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      const errorMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "answer" | "student") => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === "answer") {
        setAnswerKey(file)
        setCorrectionStep(2)
      } else {
        if (currentStudentName.trim() && answerKey) {
          const newTest = {
            id: Date.now().toString(),
            file,
            studentName: currentStudentName.trim(),
            status: 'pending' as const
          }
          setStudentTests(prev => [...prev, newTest])
          setCurrentStudentName("")
          
          // Converter arquivos para Base64
          try {
            const answerKeyBase64 = await fileToBase64(answerKey)
            const studentTestBase64 = await fileToBase64(file)
            
            // Atualizar status para 'correcting'
            setStudentTests(prev => prev.map(test => 
              test.id === newTest.id 
                ? { ...test, status: 'correcting' as const }
                : test
            ))
            
            // Chamar API de correção
            const response = await fetch("/api/correct-test", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                answerKeyFile: answerKeyBase64,
                studentTestFile: studentTestBase64,
                studentName: newTest.studentName,
                subject: "Não especificada",
                grade: "Não especificada"
              }),
            })

            if (!response.ok) {
              throw new Error(`Erro na API: ${response.status}`)
            }

            const data = await response.json()
            
            if (data.error) {
              throw new Error(data.error)
            }

            // Atualizar com resultado da correção
            setStudentTests(prev => prev.map(test => 
              test.id === newTest.id 
                ? { 
                    ...test, 
                    status: 'completed' as const,
                    score: data.score || 0,
                    correctAnswers: data.correctAnswers || 0,
                    totalQuestions: data.totalQuestions || 0,
                    correctedAt: new Date(),
                    feedback: data.feedback,
                    corrections: data.corrections || [],
                    strengths: data.strengths || [],
                    improvements: data.improvements || []
                  }
                : test
            ))
          } catch (error) {
            console.error("Erro ao corrigir prova:", error)
            // Em caso de erro, manter status como 'completed' mas com dados mockados
            setStudentTests(prev => prev.map(test => 
              test.id === newTest.id 
                ? { 
                    ...test, 
                    status: 'completed' as const,
                    score: Math.floor(Math.random() * 3) + 7.5,
                    correctAnswers: Math.floor(Math.random() * 5) + 15,
                    totalQuestions: 20,
                    correctedAt: new Date(),
                    feedback: "Erro na correção automática. Dados simulados."
                  }
                : test
            ))
          }
        }
      }
      // Reset file input
      event.target.value = ''
    }
  }

  // Função auxiliar para converter arquivo para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remover o prefixo "data:application/pdf;base64," ou similar
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const resetCorrection = () => {
    setAnswerKey(null)
    setStudentTests([])
    setCurrentStudentName("")
    setCorrectionStep(1)
  }

  const removeStudentTest = (testId: string) => {
    setStudentTests(prev => prev.filter(test => test.id !== testId))
  }

  const toggleFeedbackExpansion = (testId: string) => {
    setExpandedFeedbacks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(testId)) {
        newSet.delete(testId)
      } else {
        newSet.add(testId)
      }
      return newSet
    })
  }

  const handleCompetencyToggle = (competencyId: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(competencyId) ? prev.filter((id) => id !== competencyId) : [...prev, competencyId],
    )
  }

  const generateLessonPlan = async () => {
    if (!planFormData.subject || !planFormData.grade || !planFormData.topic || !planFormData.duration) {
      return
    }

    setIsGeneratingPlan(true)
    
    const competenciesText = selectedCompetencies.length > 0 
      ? competencies.filter(c => selectedCompetencies.includes(c.id)).map(c => c.name).join(", ")
      : "Não especificadas"

    const prompt = `Crie um plano de aula detalhado com as seguintes especificações:

**Disciplina:** ${planFormData.subject}
**Série:** ${planFormData.grade}
**Tema:** ${planFormData.topic}
**Duração:** ${planFormData.duration} minutos
**Competências a desenvolver:** ${competenciesText}

O plano deve incluir:
1. Objetivos de aprendizagem
2. Conteúdos a serem abordados
3. Metodologia e estratégias pedagógicas
4. Recursos necessários
5. Avaliação
6. Cronograma da aula
7. Atividades práticas

Formate a resposta de forma clara e organizada para fácil implementação em sala de aula.`

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [],
          userInput: prompt,
          context: "teacher"
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setLessonPlan(data.response)
    } catch (error) {
      console.error("Erro ao gerar plano de aula:", error)
      setLessonPlan("Erro ao gerar plano de aula. Tente novamente.")
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-roboto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
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
      <main className="flex-1 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 max-w-[1600px]">
        {/* Stats Cards at Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Alunos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Média Geral</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">8.4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Horas<br/>Economizadas</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">24h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Atividades<br/>Corrigidas</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">342</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Interações IA</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">1.2k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 leading-tight">Taxa Engajamento</p>
                  <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-0">
          {/* Main Chat/Content Area */}
          <div className="xl:col-span-8 min-h-0">
            <Tabs defaultValue="chat" className="space-y-6 flex flex-col min-h-0">
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
            <TabsContent value="chat" className="flex-1 min-h-0">
              <Card className="flex flex-col h-[600px]">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Assistente IA
                  </CardTitle>
                  <CardDescription className="font-normal">
                    Converse com a IA para obter insights pedagógicos personalizados
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg p-4 ${
                                message.type === "user" 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-50 text-gray-900 border border-gray-200"
                              }`}
                            >
                              {message.type === "user" ? (
                                <p className="text-sm font-normal whitespace-pre-wrap break-words">{message.content}</p>
                              ) : (
                                <div className="prose prose-sm max-w-none">
                                  <MarkdownMessage 
                                    content={message.content} 
                                    className="text-gray-800 leading-relaxed"
                                  />
                                </div>
                              )}
                              <p
                                className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                              >
                                <Timestamp date={message.timestamp} />
                              </p>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-[85%]">
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 font-medium">IA está pensando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="p-4 border-t flex-shrink-0 bg-white">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="font-normal flex-1"
                        disabled={isLoading}
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading} className="flex-shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Correction Tab */}
            <TabsContent value="correction">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="xl:col-span-2 space-y-6">
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
                      {/* Step 1: Answer Key Upload */}
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
                          <Label htmlFor="student-name" className="text-sm font-medium">
                            2. Nome do Aluno e Upload da Prova
                          </Label>
                          <div className="mt-2 space-y-3">
                            <Input
                              id="student-name"
                              placeholder="Digite o nome do aluno"
                              value={currentStudentName}
                              onChange={(e) => setCurrentStudentName(e.target.value)}
                              className="font-normal"
                            />
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
                              className="w-full h-16 border-dashed font-medium"
                              disabled={!currentStudentName.trim()}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-5 w-5" />
                                <span>
                                  {currentStudentName.trim() 
                                    ? `Upload da prova de ${currentStudentName}` 
                                    : "Digite o nome do aluno primeiro"
                                  }
                                </span>
                              </div>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Reset Button */}
                      {(answerKey || studentTests.length > 0) && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={resetCorrection}
                            className="font-medium"
                          >
                            Reiniciar Correção
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="font-bold text-lg">Provas Enviadas</CardTitle>
                      <CardDescription className="font-normal">
                        {studentTests.length} {studentTests.length === 1 ? 'prova' : 'provas'} na fila
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {studentTests.length === 0 ? (
                        <div className="text-center py-8">
                          <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">
                            Nenhuma prova enviada ainda
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[600px]">
                          <div className="space-y-3">
                            {studentTests.map((test) => (
                              <div
                                key={test.id}
                                className="p-3 border rounded-lg bg-white shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm">{test.studentName}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStudentTest(test.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    ×
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-xs">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        test.status === 'pending' ? 'bg-yellow-500' :
                                        test.status === 'correcting' ? 'bg-blue-500 animate-pulse' :
                                        'bg-green-500'
                                      }`}
                                    />
                                    <span className="font-medium">
                                      {test.status === 'pending' ? 'Aguardando' :
                                       test.status === 'correcting' ? 'Corrigindo...' :
                                       'Concluída'}
                                    </span>
                                  </div>

                                  {test.status === 'completed' && test.score && (
                                    <div className="bg-green-50 p-2 rounded text-xs space-y-2">
                                      <div className="flex justify-between">
                                        <span>Nota:</span>
                                        <span className="font-bold text-green-600">
                                          {test.score.toFixed(1)}/10
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Acertos:</span>
                                        <span className="font-bold text-blue-600">
                                          {test.correctAnswers}/{test.totalQuestions}
                                        </span>
                                      </div>
                                      {test.feedback && (
                                        <div className="mt-2 pt-2 border-t border-green-200">
                                          <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-gray-700 font-medium">Feedback:</p>
                                            {test.feedback.length > 100 && (
                                              <button
                                                onClick={() => toggleFeedbackExpansion(test.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                              >
                                                {expandedFeedbacks.has(test.id) ? 'Ver menos' : 'Ver mais'}
                                              </button>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-600 leading-relaxed">
                                            {test.feedback.length > 100 && !expandedFeedbacks.has(test.id)
                                              ? test.feedback.substring(0, 100) + '...'
                                              : test.feedback
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

                {/* Additional Analytics Card for larger screens */}
                <Card className="xl:block hidden">
                  <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Tendências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-black text-purple-600 mb-1">+12%</div>
                        <p className="text-sm font-medium text-gray-600">Melhoria Geral</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Esta Semana</span>
                          <span className="font-bold text-green-600">+5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Este Mês</span>
                          <span className="font-bold text-blue-600">+8%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Planning Tab */}
            <TabsContent value="planning">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Form Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Planejamento de Aulas
                    </CardTitle>
                    <CardDescription className="font-normal">Crie planos de aula personalizados com IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Disciplina</Label>
                        <Select value={planFormData.subject} onValueChange={(value) => setPlanFormData(prev => ({...prev, subject: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a disciplina" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Matemática">Matemática</SelectItem>
                            <SelectItem value="Português">Português</SelectItem>
                            <SelectItem value="Ciências">Ciências</SelectItem>
                            <SelectItem value="História">História</SelectItem>
                            <SelectItem value="Geografia">Geografia</SelectItem>
                            <SelectItem value="Inglês">Inglês</SelectItem>
                            <SelectItem value="Educação Física">Educação Física</SelectItem>
                            <SelectItem value="Arte">Arte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-medium">Série</Label>
                        <Select value={planFormData.grade} onValueChange={(value) => setPlanFormData(prev => ({...prev, grade: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a série" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6º Ano">6º Ano</SelectItem>
                            <SelectItem value="7º Ano">7º Ano</SelectItem>
                            <SelectItem value="8º Ano">8º Ano</SelectItem>
                            <SelectItem value="9º Ano">9º Ano</SelectItem>
                            <SelectItem value="1º Ano EM">1º Ano EM</SelectItem>
                            <SelectItem value="2º Ano EM">2º Ano EM</SelectItem>
                            <SelectItem value="3º Ano EM">3º Ano EM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-medium">Tema da Aula</Label>
                        <Input 
                          placeholder="Ex: Frações e Decimais" 
                          className="font-normal"
                          value={planFormData.topic}
                          onChange={(e) => setPlanFormData(prev => ({...prev, topic: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label className="font-medium">Duração (minutos)</Label>
                        <Input 
                          type="number" 
                          placeholder="50" 
                          className="font-normal"
                          value={planFormData.duration}
                          onChange={(e) => setPlanFormData(prev => ({...prev, duration: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label className="font-medium">Competências a Desenvolver</Label>
                        <div className="mt-2 space-y-2">
                          {competencies.slice(0, 6).map((comp) => (
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
                      <Button 
                        className="w-full font-medium" 
                        onClick={generateLessonPlan}
                        disabled={isGeneratingPlan || !planFormData.subject || !planFormData.grade || !planFormData.topic || !planFormData.duration}
                      >
                        {isGeneratingPlan ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando Plano...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Gerar Plano de Aula
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Result Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold text-lg">Plano de Aula Gerado</CardTitle>
                    <CardDescription className="font-normal">
                      Resultado da IA baseado nas suas especificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!lessonPlan ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 font-medium">
                          Preencha o formulário e clique em "Gerar Plano de Aula" para ver o resultado
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px]">
                        <div className="prose prose-sm max-w-none">
                          <MarkdownMessage content={lessonPlan} className="text-gray-800" />
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar for Desktop */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-bold text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start font-medium" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Nova Correção
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Criar Plano de Aula
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório da Turma
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Sugestões IA
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-bold text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prova de Matemática corrigida</p>
                      <p className="text-xs text-gray-500">há 2 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Plano de aula gerado</p>
                      <p className="text-xs text-gray-500">há 15 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-50">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Chat com IA iniciado</p>
                      <p className="text-xs text-gray-500">há 1 hora</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-orange-50">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Relatório baixado</p>
                      <p className="text-xs text-gray-500">há 2 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-bold text-lg">Resumo Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Provas Corrigidas</span>
                    <span className="text-lg font-bold text-blue-600">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Planos Criados</span>
                    <span className="text-lg font-bold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Insights IA</span>
                    <span className="text-lg font-bold text-purple-600">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo Economizado</span>
                    <span className="text-lg font-bold text-orange-600">12h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 max-w-[1600px]">
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
