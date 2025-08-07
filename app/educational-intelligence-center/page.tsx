"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownMessage } from "@/components/ui/markdown-message"
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
  Send,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  User,
  Bot,
  Plus,
  MoreVertical,
  AlertCircle,
  Trash2,
  MessageSquare,
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

// Tipos para a API
interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: "pdf" | "csv";
  size: number;
  content?: string;
  url?: string;
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
    this.apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models";
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || "";
  }

  async generateResponse(messages: Message[], userInput: string): Promise<AIResponse> {
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      conversationHistory.push({
        role: "user",
        parts: [{ text: userInput }]
      });

      const systemPrompt = {
        role: "user",
        parts: [{ text: `Você é um assistente de inteligência educacional especializado em análise de dados educacionais. 
        Sua função é:
        - Analisar dados de performance educacional
        - Fornecer insights sobre métricas educacionais
        - Explicar tendências e padrões nos dados
        - Sugerir melhorias baseadas em evidências
        - Analisar arquivos PDF e CSV enviados pelo usuário
        - Responder em português brasileiro
        - Focar em métricas como notas, adoção de ferramentas, tempo economizado, etc.
        
        **IMPORTANTE:** Sempre formate suas respostas usando Markdown para melhor legibilidade:
        - Use **negrito** para títulos e conceitos importantes
        - Use *itálico* para ênfase
        - Use listas com bullets (*) para organizar informações
        - Use subtítulos (##) para seções
        - Use blocos de citação (>) para insights importantes
        - Mantenha parágrafos bem espaçados
        
        **ANÁLISE DE ARQUIVOS:**
        - Para arquivos CSV: Analise os dados, identifique padrões, calcule estatísticas relevantes
        - Para arquivos PDF: Extraia informações importantes, resuma conteúdo, identifique pontos-chave
        - Sempre forneça insights acionáveis baseados nos dados
        
        Sempre seja analítico, claro e baseado em dados.` }]
      };

      const requestBody = {
        contents: [systemPrompt, ...conversationHistory],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(`${this.apiUrl}/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
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

  // Método para processar arquivos
  async processFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.type === "text/csv" || file.name.endsWith('.csv')) {
            // Processar CSV
            const csvContent = content;
            const lines = csvContent.split('\n');
            const headers = lines[0]?.split(',') || [];
            const dataRows = lines.slice(1).filter(line => line.trim());
            
            let analysis = `**Análise do arquivo CSV: ${file.name}**\n\n`;
            analysis += `**Estrutura dos dados:**\n`;
            analysis += `- Colunas: ${headers.length}\n`;
            analysis += `- Linhas de dados: ${dataRows.length}\n`;
            analysis += `- Cabeçalhos: ${headers.join(', ')}\n\n`;
            
            if (dataRows.length > 0) {
              analysis += `**Primeiras 5 linhas de dados:**\n`;
              analysis += '```\n';
              analysis += headers.join(', ') + '\n';
              dataRows.slice(0, 5).forEach(row => {
                analysis += row + '\n';
              });
              analysis += '```\n\n';
            }
            
            resolve(analysis);
          } else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
            // Para PDFs, vamos simular uma análise básica
            // Em um ambiente real, você usaria uma biblioteca como pdf.js
            resolve(`**Arquivo PDF carregado: ${file.name}**\n\n` +
                   `**Tamanho:** ${(file.size / 1024).toFixed(2)} KB\n\n` +
                   `*Nota: Para análise completa de PDFs, é recomendado usar ferramentas especializadas.*`);
          } else {
            resolve(`**Arquivo carregado: ${file.name}**\n\n` +
                   `**Tipo:** ${file.type}\n` +
                   `**Tamanho:** ${(file.size / 1024).toFixed(2)} KB`);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
}

// Componente de Chat
function EducationalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = new AIService()

  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para upload de arquivos
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedChats = localStorage.getItem('educational-chats')
    if (savedChats) {
      const chats = JSON.parse(savedChats)
      const parsedChats = chats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
      
      setChatHistory(parsedChats)
      
      if (parsedChats.length > 0) {
        const activeChat = parsedChats.find((chat: ChatHistory) => chat.isActive) || parsedChats[0]
        loadChat(activeChat.id)
      }
    }
  }, [])

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('educational-chats', JSON.stringify(chatHistory))
    } else {
      localStorage.removeItem('educational-chats')
    }
  }, [chatHistory])

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat: ChatHistory = {
      id: newChatId,
      title: "Nova Análise",
      lastMessage: "Inicie uma nova análise...",
      timestamp: new Date(),
      isActive: true,
      messages: [
        {
          id: Date.now(),
          type: "ai",
          content: "Olá! Sou seu assistente de inteligência educacional. Estou aqui para ajudá-lo a analisar dados educacionais e fornecer insights valiosos. Você pode enviar arquivos PDF ou CSV para análise, ou fazer perguntas sobre os dados. Sobre qual aspecto dos dados educacionais gostaria de conversar hoje?",
          timestamp: new Date(),
        }
      ]
    }

    const updatedChats = chatHistory.map(chat => ({ ...chat, isActive: false }))
    setChatHistory([newChat, ...updatedChats])
    setCurrentChatId(newChatId)
    setMessages(newChat.messages)
    setUploadedFiles([])
  }

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    
    if (chat) {
      const updatedChats = chatHistory.map(c => ({ ...c, isActive: c.id === chatId }))
      setChatHistory(updatedChats)
      setCurrentChatId(chatId)
      
      const validMessages = chat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }))
      setMessages(validMessages)
      
      // Recuperar arquivos da conversa
      const files: FileAttachment[] = []
      validMessages.forEach(msg => {
        if (msg.files) {
          files.push(...msg.files)
        }
      })
      setUploadedFiles(files)
    }
  }

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

  const deleteChat = (chatId: string) => {
    const updatedChats = chatHistory.filter(chat => chat.id !== chatId)
    
    if (chatId === currentChatId) {
      setCurrentChatId("")
      setMessages([])
      setUploadedFiles([])
      
      if (updatedChats.length > 0) {
        const firstChat = updatedChats[0]
        const updatedChatsWithActive = updatedChats.map((chat, index) => ({
          ...chat,
          isActive: index === 0
        }))
        
        localStorage.setItem('educational-chats', JSON.stringify(updatedChatsWithActive))
        setChatHistory(updatedChatsWithActive)
        setCurrentChatId(firstChat.id)
        setMessages(firstChat.messages)
      } else {
        localStorage.removeItem('educational-chats')
        setChatHistory([])
      }
    } else {
      localStorage.setItem('educational-chats', JSON.stringify(updatedChats))
      setChatHistory(updatedChats)
    }
  }

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

  // Funções para upload de arquivos
  const handleFileUpload = async (files: FileList) => {
    const newFiles: FileAttachment[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Verificar tipo de arquivo
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.csv')) {
        setError(`Tipo de arquivo não suportado: ${file.name}. Apenas PDF e CSV são aceitos.`)
        continue
      }
      
      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`Arquivo muito grande: ${file.name}. Tamanho máximo: 10MB`)
        continue
      }
      
      try {
        const fileContent = await aiService.processFile(file)
        
        const fileAttachment: FileAttachment = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.name.endsWith('.csv') ? 'csv' : 'pdf',
          size: file.size,
          content: fileContent
        }
        
        newFiles.push(fileAttachment)
      } catch (error) {
        setError(`Erro ao processar arquivo ${file.name}: ${error}`)
      }
    }
    
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
      
      // Criar mensagem com os arquivos
      const fileMessage: Message = {
        id: Date.now(),
        type: "user",
        content: `Enviei ${newFiles.length} arquivo(s) para análise: ${newFiles.map(f => f.name).join(', ')}`,
        timestamp: new Date(),
        files: newFiles
      }
      
      const newMessages = [...messages, fileMessage]
      setMessages(newMessages)
      updateCurrentChat(newMessages)
      
      // Processar arquivos com IA
      setIsLoading(true)
      try {
        const fileAnalysis = newFiles.map(file => file.content).join('\n\n')
        const aiResponse = await aiService.generateResponse(messages, `Analise os seguintes arquivos:\n\n${fileAnalysis}`)
        
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
        setError("Erro ao analisar arquivos. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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
      "analise": "Pode fazer uma análise detalhada dos dados de performance?",
      "tendencias": "Quais são as principais tendências nos dados educacionais?",
      "insights": "Quais insights você pode extrair dos dados atuais?"
    }
    
    setInputMessage(quickMessages[action as keyof typeof quickMessages] || "")
  }

  const formatTime = (date: Date) => {
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
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                <Brain className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-gray-900">
                {chatHistory.find(chat => chat.id === currentChatId)?.title || "Assistente de IA"}
              </h3>
              <p className="text-sm text-gray-500 font-normal">Análise Educacional • Online</p>
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
      <ScrollArea className="h-96 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-dashed border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Assistente de IA Educacional
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estou aqui para ajudá-lo a analisar dados educacionais e fornecer insights valiosos. 
                Você pode enviar arquivos PDF ou CSV para análise, ou fazer perguntas sobre os dados.
              </p>
              <Button
                onClick={createNewChat}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Análise
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
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
                        {message.files && message.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.files.map((file) => (
                              <div key={file.id} className="flex items-center space-x-2 bg-blue-50 rounded-lg p-2">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-blue-900">{file.name}</p>
                                  <p className="text-xs text-blue-700">{formatFileSize(file.size)} • {file.type.toUpperCase()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          {/* Arquivos carregados como chips compactos */}
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
                  <FileText className="h-3 w-3 mr-1 text-purple-500" />
                  <span className="mr-2">{file.name}</span>
                  <span className="mr-2 text-gray-400">({file.type.toUpperCase()}, {formatFileSize(file.size)})</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-1 text-red-400 hover:text-red-600 focus:outline-none"
                    title="Remover arquivo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex space-x-3 items-end">
            {/* Botão de upload compacto */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="mb-1"
              title="Enviar arquivo PDF ou CSV"
            >
              <FileText className="h-5 w-5 text-purple-600" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.csv"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={messages.length === 0 ? "Crie uma nova análise para começar..." : "Digite sua pergunta sobre dados educacionais..."}
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
                onClick={() => handleQuickAction("analise")}
                disabled={isLoading}
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Análise detalhada
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-normal bg-transparent"
                onClick={() => handleQuickAction("tendencias")}
                disabled={isLoading}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Tendências
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-normal bg-transparent"
                onClick={() => handleQuickAction("insights")}
                disabled={isLoading}
              >
                <Zap className="h-3 w-3 mr-1" />
                Insights
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

        {/* Chat Component */}
        <div className="mt-8">
          <EducationalChat />
        </div>

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
