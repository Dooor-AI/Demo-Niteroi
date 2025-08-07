"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownMessage } from "@/components/ui/markdown-message"
import { AlertCircle, Bot, Brain, FileText, Lightbulb, MessageSquare, Plus, Send, Target, Trash2, User } from "lucide-react"
import { AIService } from "../services/ai-service"
import { ChatHistory, FileAttachment, Message } from "../types"

export function EducationalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = new AIService()

  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedChats = localStorage.getItem("educational-chats")
    if (savedChats) {
      const chats = JSON.parse(savedChats)
      const parsedChats = chats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
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
      localStorage.setItem("educational-chats", JSON.stringify(chatHistory))
    } else {
      localStorage.removeItem("educational-chats")
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
          content:
            "Olá! Sou seu assistente de inteligência educacional. Estou aqui para ajudá-lo a analisar dados educacionais e fornecer insights valiosos. Você pode enviar arquivos PDF ou CSV para análise, ou fazer perguntas sobre os dados. Sobre qual aspecto dos dados educacionais gostaria de conversar hoje?",
          timestamp: new Date(),
        },
      ],
    }

    const updatedChats = chatHistory.map((chat) => ({ ...chat, isActive: false }))
    setChatHistory([newChat, ...updatedChats])
    setCurrentChatId(newChatId)
    setMessages(newChat.messages)
    setUploadedFiles([])
  }

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId)

    if (chat) {
      const updatedChats = chatHistory.map((c) => ({ ...c, isActive: c.id === chatId }))
      setChatHistory(updatedChats)
      setCurrentChatId(chatId)

      const validMessages = chat.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      }))
      setMessages(validMessages)

      const files: FileAttachment[] = []
      validMessages.forEach((msg) => {
        if (msg.files) {
          files.push(...msg.files)
        }
      })
      setUploadedFiles(files)
    }
  }

  const updateCurrentChat = (newMessages: Message[]) => {
    setChatHistory((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const lastMessage = newMessages[newMessages.length - 1]
          return {
            ...chat,
            messages: newMessages,
            lastMessage:
              lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? "..." : ""),
            timestamp: new Date(),
          }
        }
        return chat
      })
    )
  }

  const deleteChat = (chatId: string) => {
    const updatedChats = chatHistory.filter((chat) => chat.id !== chatId)

    if (chatId === currentChatId) {
      setCurrentChatId("")
      setMessages([])
      setUploadedFiles([])

      if (updatedChats.length > 0) {
        const firstChat = updatedChats[0]
        const updatedChatsWithActive = updatedChats.map((chat, index) => ({
          ...chat,
          isActive: index === 0,
        }))

        localStorage.setItem("educational-chats", JSON.stringify(updatedChatsWithActive))
        setChatHistory(updatedChatsWithActive)
        setCurrentChatId(firstChat.id)
        setMessages(firstChat.messages)
      } else {
        localStorage.removeItem("educational-chats")
        setChatHistory([])
      }
    } else {
      localStorage.setItem("educational-chats", JSON.stringify(updatedChats))
      setChatHistory(updatedChats)
    }
  }

  const generateChatTitle = (userMessage: string) => {
    const words = userMessage.split(" ").slice(0, 5)
    return words.join(" ") + (userMessage.split(" ").length > 5 ? "..." : "")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (files: FileList) => {
    const newFiles: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.name.endsWith(".pdf") && !file.name.endsWith(".csv")) {
        setError(`Tipo de arquivo não suportado: ${file.name}. Apenas PDF e CSV são aceitos.`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`Arquivo muito grande: ${file.name}. Tamanho máximo: 10MB`)
        continue
      }

      try {
        const fileContent = await aiService.processFile(file)

        const fileAttachment: FileAttachment = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.name.endsWith(".csv") ? "csv" : "pdf",
          size: file.size,
          content: fileContent,
        }

        newFiles.push(fileAttachment)
      } catch (error) {
        setError(`Erro ao processar arquivo ${file.name}: ${error}`)
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || messages.length === 0) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    if (messages.length === 1) {
      const title = generateChatTitle(inputMessage)
      setChatHistory((prev) =>
        prev.map((chat) => (chat.id === currentChatId ? { ...chat, title, messages: newMessages } : chat))
      )
    } else {
      updateCurrentChat(newMessages)
    }

    try {
      const filesContext = uploadedFiles.length > 0
        ? `\n\n[Arquivos anexados]\n${uploadedFiles.map((f) => f.content).join("\n\n")}`
        : ""
      const combinedPrompt = `${userMessage.content}${filesContext}`
      const aiResponse = await aiService.generateResponse(messages, combinedPrompt)

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
      if (uploadedFiles.length > 0) {
        setUploadedFiles([])
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      setError("Erro ao processar sua mensagem. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      analise: "Pode fazer uma análise detalhada dos dados de performance?",
      tendencias: "Quais são as principais tendências nos dados educacionais?",
      insights: "Quais insights você pode extrair dos dados atuais?",
    }

    setInputMessage(quickMessages[action as keyof typeof quickMessages] || "")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
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
                {chatHistory.find((chat) => chat.id === currentChatId)?.title || "Assistente de IA"}
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
                  if (confirm("Tem certeza que deseja deletar esta conversa?")) {
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

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <ScrollArea className="h-[60vh] md:h-[65vh] lg:h-[70vh] p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-dashed border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Assistente de IA Educacional</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estou aqui para ajudá-lo a analisar dados educacionais e fornecer insights valiosos. Você pode enviar arquivos
                PDF ou CSV para análise, ou fazer perguntas sobre os dados.
              </p>
              <Button onClick={createNewChat} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Análise
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
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
                  <div className={`rounded-2xl p-4 shadow-sm ${message.type === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 hover:border-gray-300 transition-colors"}`}>
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
                        <p className="text-xs mt-2 text-blue-100 opacity-80">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ) : (
                      <div className="ai-message">
                        <MarkdownMessage content={message.content} className="text-gray-800" />
                        <p className="text-xs mt-3 text-gray-500 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700">
                  <FileText className="h-3 w-3 mr-1 text-purple-500" />
                  <span className="mr-2">{file.name}</span>
                  <span className="mr-2 text-gray-400">({file.type.toUpperCase()}, {formatFileSize(file.size)})</span>
                  <button onClick={() => removeFile(file.id)} className="ml-1 text-red-400 hover:text-red-600 focus:outline-none" title="Remover arquivo">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex space-x-3 items-end">
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="mb-1" title="Enviar arquivo PDF ou CSV">
              <FileText className="h-5 w-5 text-purple-600" />
            </Button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.csv" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} className="hidden" />
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
            <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim() || messages.length === 0} className="font-medium">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {messages.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-gray-500 font-medium">Sugestões:</span>
              <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent" onClick={() => handleQuickAction("analise")} disabled={isLoading}>
                <Lightbulb className="h-3 w-3 mr-1" />
                Análise detalhada
              </Button>
              <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent" onClick={() => handleQuickAction("tendencias")} disabled={isLoading}>
                <Lightbulb className="h-3 w-3 mr-1 rotate-180" />
                Tendências
              </Button>
              <Button variant="outline" size="sm" className="text-xs font-normal bg-transparent" onClick={() => handleQuickAction("insights")} disabled={isLoading}>
                <Lightbulb className="h-3 w-3 mr-1" />
                Insights
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

