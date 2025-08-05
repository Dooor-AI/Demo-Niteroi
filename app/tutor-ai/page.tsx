"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Clock,
  Settings,
  Bell,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  User,
  Bot,
  Plus,
  Search,
  MoreVertical,
} from "lucide-react"

export default function TutorAI() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai" as const,
      content:
        "Olá! Sou seu tutor de IA personalizado. Estou aqui para ajudá-lo a aprender de forma mais eficiente. Sobre o que gostaria de conversar hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Histórico de conversas com nomes gerados por IA
  const [chatHistory] = useState([
    {
      id: 1,
      title: "Matemática: Equações Quadráticas",
      lastMessage: "Como resolver x² + 5x + 6 = 0?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isActive: true,
    },
    {
      id: 2,
      title: "História: Revolução Francesa",
      lastMessage: "Quais foram as principais causas?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isActive: false,
    },
    {
      id: 3,
      title: "Física: Leis de Newton",
      lastMessage: "Explique a terceira lei",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isActive: false,
    },
    {
      id: 4,
      title: "Português: Análise Sintática",
      lastMessage: "Como identificar o sujeito?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isActive: false,
    },
    {
      id: 5,
      title: "Química: Tabela Periódica",
      lastMessage: "Propriedades dos elementos",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      isActive: false,
    },
    {
      id: 6,
      title: "Biologia: Fotossíntese",
      lastMessage: "Processo de conversão de energia",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      isActive: false,
    },
    {
      id: 7,
      title: "Geografia: Clima Tropical",
      lastMessage: "Características e localização",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isActive: false,
    },
    {
      id: 8,
      title: "Inglês: Present Perfect",
      lastMessage: "Quando usar have/has + particípio",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isActive: false,
    },
  ])

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
      "Excelente pergunta! Vou explicar isso de forma clara e didática...",
      "Vamos abordar esse conceito passo a passo para facilitar seu entendimento...",
      "Baseado no seu nível de aprendizado, sugiro começarmos por aqui...",
      "Essa é uma dúvida muito comum! Deixe-me esclarecer com exemplos práticos...",
      "Para consolidar esse conhecimento, que tal resolvermos alguns exercícios juntos?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 font-roboto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-black text-gray-900">Tutor AI</h1>
                  <p className="text-sm font-light text-gray-500">Seu Assistente de Aprendizagem</p>
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
                <AvatarFallback className="font-medium">TA</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Histórico de Conversas */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Atividades Recentes</h2>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar conversas..." className="pl-10 font-normal" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    chat.isActive ? "bg-purple-50 border border-purple-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-medium truncate ${
                          chat.isActive ? "text-purple-900" : "text-gray-900"
                        }`}
                      >
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-1 font-normal">{chat.lastMessage}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400 font-normal">{formatTime(chat.timestamp)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900">Matemática: Equações Quadráticas</h3>
                  <p className="text-sm text-gray-500 font-normal">Tutor IA • Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-medium">
                  <Target className="h-3 w-3 mr-1" />
                  Nível Intermediário
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-3 max-w-[80%] ${
                      message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.type === "user" ? (
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 ${
                        message.type === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-normal leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm rounded-lg p-4">
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
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-white border-t p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua pergunta ou dúvida..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="font-normal"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="font-medium"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-xs text-gray-500 font-medium">Sugestões:</span>
                <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Explicar conceito
                </Button>
                <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Exercícios práticos
                </Button>
                <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent">
                  <Zap className="h-3 w-3 mr-1" />
                  Resumo rápido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
