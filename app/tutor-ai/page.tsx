"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownMessage } from "@/components/ui/markdown-message"
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
  AlertCircle,
} from "lucide-react"

// Tipos para a API
interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
}

interface AIResponse {
  content: string;
  error?: string;
}

// Serviço de API para IA
class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    // Configure sua API aqui - você pode usar OpenAI, Claude, ou qualquer outra API de IA
    this.apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models";
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || "";
  }

  async generateResponse(messages: Message[], userInput: string): Promise<AIResponse> {
    try {
      // Preparar o contexto da conversa para a IA
      const conversationHistory = messages.map(msg => ({
        role: msg.type === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      // Adicionar a nova mensagem do usuário
      conversationHistory.push({
        role: "user",
        parts: [{ text: userInput }]
      });

      // Adicionar instruções do sistema para o tutor educacional
      const systemPrompt = {
        role: "user",
        parts: [{ text: `Você é um tutor de IA educacional especializado em ajudar estudantes brasileiros. 
        Sua função é:
        - Explicar conceitos de forma clara e didática
        - Fornecer exemplos práticos quando apropriado
        - Adaptar o nível de explicação ao conhecimento do estudante
        - Ser paciente e encorajador
        - Responder em português brasileiro
        - Focar em áreas como matemática, ciências, história, português, etc.
        
        **IMPORTANTE:** Sempre formate suas respostas usando Markdown para melhor legibilidade:
        - Use **negrito** para títulos e conceitos importantes
        - Use *itálico* para ênfase
        - Use listas com bullets (*) para organizar informações
        - Use subtítulos (##) para seções
        - Use blocos de citação (>) para dicas importantes
        - Mantenha parágrafos bem espaçados
        
        Sempre seja educacional, claro e motivador.` }]
      };

      const requestBody = {
        contents: [systemPrompt, ...conversationHistory],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(`${this.apiUrl}/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text
      };

    } catch (error) {
      console.error("Erro ao chamar API de IA:", error);
      return {
        content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  // Método alternativo para APIs que não seguem o formato OpenAI
  async generateResponseAlternative(messages: Message[], userInput: string): Promise<AIResponse> {
    try {
      // Exemplo para outras APIs (Claude, Gemini, etc.)
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          userInput: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.response
      };

    } catch (error) {
      console.error("Erro ao chamar API de IA:", error);
      return {
        content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

export default function TutorAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Olá! Sou seu tutor de IA personalizado. Estou aqui para ajudá-lo a aprender de forma mais eficiente. Sobre o que gostaria de conversar hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = new AIService()

  // Histórico de conversas com nomes gerados por IA
  const [chatHistory] = useState<ChatHistory[]>([
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

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    try {
      // Chamar a API de IA real
      const aiResponse = await aiService.generateResponse(messages, userMessage.content)
      
      if (aiResponse.error) {
        setError(aiResponse.error)
        setIsLoading(false)
        return
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponse.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      setError("Erro ao processar sua mensagem. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      "explicar": "Pode explicar este conceito de forma mais detalhada?",
      "exercicios": "Gostaria de ver alguns exercícios práticos sobre este tema.",
      "resumo": "Pode fazer um resumo rápido dos pontos principais?"
    }
    
    setInputMessage(quickMessages[action as keyof typeof quickMessages] || "")
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-3 max-w-[85%] ${
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
                      className={`rounded-2xl p-4 shadow-sm ${
                        message.type === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                      }`}
                    >
                      {message.type === "user" ? (
                        <div>
                          <p className="text-sm font-normal leading-relaxed">{message.content}</p>
                          <p className="text-xs mt-2 text-blue-100 opacity-80">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <div className="ai-message">
                          <MarkdownMessage 
                            content={message.content} 
                            className="text-gray-800"
                          />
                          <p className="text-xs mt-3 text-gray-500 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
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
                    disabled={isLoading}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-normal bg-transparent"
                  onClick={() => handleQuickAction("explicar")}
                  disabled={isLoading}
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Explicar conceito
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-normal bg-transparent"
                  onClick={() => handleQuickAction("exercicios")}
                  disabled={isLoading}
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Exercícios práticos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-normal bg-transparent"
                  onClick={() => handleQuickAction("resumo")}
                  disabled={isLoading}
                >
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
