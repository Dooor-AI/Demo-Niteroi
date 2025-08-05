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
  Trash2,
  MessageSquare,
} from "lucide-react"

// Tipos para a API
interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
  messages: Message[];
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
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = new AIService()

  // Histórico de conversas dinâmico
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Carregar chats do localStorage na inicialização
  useEffect(() => {
    console.log('Carregando chats do localStorage...')
    const savedChats = localStorage.getItem('tutor-ai-chats')
    if (savedChats) {
      const chats = JSON.parse(savedChats)
      console.log('Chats encontrados:', chats.length)
      
      // Converter strings de data de volta para objetos Date
      const parsedChats = chats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
      
      setChatHistory(parsedChats)
      
      // Se há chats, carregar o ativo
      if (parsedChats.length > 0) {
        const activeChat = parsedChats.find((chat: ChatHistory) => chat.isActive) || parsedChats[0]
        console.log('Carregando chat ativo:', activeChat.id)
        loadChat(activeChat.id)
      } else {
        console.log('Nenhum chat encontrado, mantendo estado vazio')
      }
    } else {
      console.log('Nenhum dado no localStorage, mantendo estado vazio')
    }
  }, [])

  // Salvar chats no localStorage sempre que mudar
  useEffect(() => {
    console.log('Salvando chats no localStorage:', chatHistory.length)
    if (chatHistory.length > 0) {
      localStorage.setItem('tutor-ai-chats', JSON.stringify(chatHistory))
    } else {
      // Se não há chats, limpar o localStorage
      localStorage.removeItem('tutor-ai-chats')
    }
  }, [chatHistory])

  // Função para criar novo chat
  const createNewChat = () => {
    console.log('Criando novo chat...')
    const newChatId = `chat-${Date.now()}`
    const newChat: ChatHistory = {
      id: newChatId,
      title: "Nova Conversa",
      lastMessage: "Inicie uma nova conversa...",
      timestamp: new Date(),
      isActive: true,
      messages: [
        {
          id: Date.now(),
          type: "ai",
          content: "Olá! Sou seu tutor de IA personalizado. Estou aqui para ajudá-lo a aprender de forma mais eficiente. Sobre o que gostaria de conversar hoje?",
          timestamp: new Date(),
        }
      ]
    }

    // Desativar todos os outros chats
    const updatedChats = chatHistory.map(chat => ({ ...chat, isActive: false }))
    setChatHistory([newChat, ...updatedChats])
    setCurrentChatId(newChatId)
    setMessages(newChat.messages)
    console.log('Novo chat criado:', newChatId)
  }

  // Função para carregar um chat
  const loadChat = (chatId: string) => {
    console.log('Tentando carregar chat:', chatId)
    const chat = chatHistory.find(c => c.id === chatId)
    
    if (chat) {
      console.log('Chat encontrado, carregando mensagens:', chat.messages.length)
      
      // Desativar todos os outros chats
      const updatedChats = chatHistory.map(c => ({ ...c, isActive: c.id === chatId }))
      setChatHistory(updatedChats)
      setCurrentChatId(chatId)
      
      // Garantir que as mensagens tenham timestamps válidos
      const validMessages = chat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }))
      setMessages(validMessages)
    } else {
      console.log('Chat não encontrado:', chatId)
    }
  }

  // Função para atualizar o chat atual
  const updateCurrentChat = (newMessages: Message[]) => {
    setChatHistory(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const lastMessage = newMessages[newMessages.length - 1]
        return {
          ...chat,
          messages: newMessages,
          lastMessage: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? "..." : ""),
          timestamp: new Date()
        }
      }
      return chat
    }))
  }

  // Função para deletar um chat
  const deleteChat = (chatId: string) => {
    console.log('Deletando chat:', chatId, 'Chat atual:', currentChatId)
    console.log('Chats antes da deleção:', chatHistory.length)
    
    // Filtrar o chat deletado
    const updatedChats = chatHistory.filter(chat => chat.id !== chatId)
    console.log('Chats restantes:', updatedChats.length)
    
    // Se o chat deletado era o ativo
    if (chatId === currentChatId) {
      setCurrentChatId("")
      setMessages([])
      
      // Se ainda há outros chats, carregar o primeiro
      if (updatedChats.length > 0) {
        const firstChat = updatedChats[0]
        console.log('Carregando primeiro chat:', firstChat.id)
        
        // Atualizar o estado do chat ativo
        const updatedChatsWithActive = updatedChats.map((chat, index) => ({
          ...chat,
          isActive: index === 0
        }))
        
        // Atualizar localStorage primeiro
        localStorage.setItem('tutor-ai-chats', JSON.stringify(updatedChatsWithActive))
        console.log('localStorage atualizado com:', updatedChatsWithActive.length, 'chats')
        
        // Atualizar o estado
        setChatHistory(updatedChatsWithActive)
        setCurrentChatId(firstChat.id)
        setMessages(firstChat.messages)
      } else {
        // Se não há mais chats, limpar localStorage e estado
        localStorage.removeItem('tutor-ai-chats')
        setChatHistory([])
        console.log('Todos os chats deletados')
      }
    } else {
      // Se não era o chat ativo, apenas atualizar a lista
      localStorage.setItem('tutor-ai-chats', JSON.stringify(updatedChats))
      setChatHistory(updatedChats)
      console.log('Chat não ativo deletado, lista atualizada')
    }
  }

  // Função para gerar título automático baseado na primeira mensagem do usuário
  const generateChatTitle = (userMessage: string) => {
    const words = userMessage.split(' ').slice(0, 5)
    return words.join(' ') + (userMessage.split(' ').length > 5 ? '...' : '')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || messages.length === 0) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    // Se é a primeira mensagem do usuário, gerar título do chat
    if (messages.length === 1) {
      const title = generateChatTitle(inputMessage)
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title, messages: newMessages }
          : chat
      ))
    } else {
      updateCurrentChat(newMessages)
    }

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

      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)
      updateCurrentChat(finalMessages)
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
    // Verificar se date é um objeto Date válido
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Agora"
    }
    
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={createNewChat}
                className="hover:bg-purple-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar conversas..." 
                className="pl-10 font-normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 flex flex-col items-center">
              <div className="w-full max-w-[280px] space-y-2">
                {chatHistory
                  .filter(chat => 
                    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors group w-full ${
                      chat.isActive ? "bg-purple-50 border border-purple-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => loadChat(chat.id)}
                  >
                    <div className="flex items-start gap-1">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3
                          className={`text-sm font-medium truncate ${
                            chat.isActive ? "text-purple-900" : "text-gray-900"
                          }`}
                        >
                          {chat.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-1 font-normal leading-tight max-w-full">{chat.lastMessage}</p>
                        <div className="flex items-center mt-1 space-x-1">
                          <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400 font-normal truncate">{formatTime(chat.timestamp)}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Deletar conversa"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatHistory.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Nenhuma conversa encontrada</p>
                    <p className="text-xs mt-1">Clique no + para criar uma nova</p>
                  </div>
                )}
              </div>
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
                  <h3 className="font-bold text-gray-900">
                    {chatHistory.find(chat => chat.id === currentChatId)?.title || "Nova Conversa"}
                  </h3>
                  <p className="text-sm text-gray-500 font-normal">Tutor IA • Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-medium">
                  <Target className="h-3 w-3 mr-1" />
                  {messages.length > 1 ? `${messages.length - 1} mensagens` : "Nova conversa"}
                </Badge>
                {currentChatId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Botão deletar clicado para chat:', currentChatId)
                      if (confirm('Tem certeza que deseja deletar esta conversa?')) {
                        deleteChat(currentChatId)
                      }
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Deletar conversa atual"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
            {messages.length === 0 ? (
              // Estado vazio - mostrar botão para criar novo chat
              <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 border-2 border-dashed border-purple-200">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Bem-vindo ao Tutor AI!
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Estou aqui para ajudá-lo a aprender de forma mais eficiente. 
                    Crie uma nova conversa para começar a explorar qualquer assunto.
                  </p>
                  <Button
                    onClick={createNewChat}
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Nova Conversa
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    Ou escolha uma conversa existente no painel lateral
                  </p>
                </div>
              </div>
            ) : (
              // Chat ativo - mostrar mensagens
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
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-white border-t p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={messages.length === 0 ? "Crie uma nova conversa para começar..." : "Digite sua pergunta ou dúvida..."}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="font-normal"
                    disabled={isLoading || messages.length === 0}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim() || messages.length === 0}
                  className="font-medium"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              {messages.length > 0 && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
