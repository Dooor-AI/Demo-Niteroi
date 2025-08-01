"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BrainCircuit, Send, Youtube, MessageSquare, BookOpen, Target, TrendingUp, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: number
  sender: "user" | "ai"
  content: React.ReactNode
}

export default function TutorAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      content:
        "Olá! Eu sou o Tutor AI, seu assistente de estudos 24/7. Como posso te ajudar hoje? Você pode pedir explicações, simulados do ENEM ou ajuda com pesquisas.",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newUserMessage: Message = { id: Date.now(), sender: "user", content: input }
    setMessages((prev) => [...prev, newUserMessage])

    // Simulação de resposta da IA
    setTimeout(() => handleAiResponse(input.toLowerCase()), 1500)

    setInput("")
  }

  const handleAiResponse = (userInput: string) => {
    let aiResponse: Message

    if (userInput.includes("revolução francesa")) {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-2">
            <p>
              Claro! A Revolução Francesa (1789-1799) foi um período de intensa agitação política e social que
              transformou a França e teve um impacto duradouro no mundo. Ela derrubou a monarquia, estabeleceu uma
              república e culminou com a ascensão de Napoleão Bonaparte.
            </p>
            <p>Os principais motivos foram a desigualdade social, a crise econômica e as ideias iluministas.</p>
            <p className="font-semibold mt-2">Você entendeu a diferença entre Girondinos e Jacobinos?</p>
          </div>
        ),
      }
    } else if (userInput.includes("química") && userInput.includes("enem")) {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-4">
            <p>
              Ótima escolha! Aqui estão 5 questões de Química sobre estequiometria no estilo do ENEM para você treinar:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                (ENEM 2020 adaptada) O gás hidrogênio é uma opção de combustível... Qual a massa de água formada a
                partir de 10g de H₂?
              </li>
              <li>
                (ENEM 2019 adaptada) O ácido fosfórico é utilizado na indústria... Calcule o número de mols de H₃PO₄ em
                196g do composto.
              </li>
              <li>
                (ENEM 2021 adaptada) A queima completa de 1 mol de etanol (C₂H₅OH)... Qual o volume de CO₂ produzido nas
                CNTP?
              </li>
              <li>
                (ENEM 2018 adaptada) Para a reação N₂(g) + 3H₂(g) → 2NH₃(g), qual a massa de amônia produzida a partir
                de 56g de nitrogênio?
              </li>
              <li>
                (ENEM 2022 adaptada) O mármore (CaCO₃) reage com ácido clorídrico... Qual a massa de cloreto de cálcio
                formada a partir de 50g de mármore?
              </li>
            </ol>
          </div>
        ),
      }
    } else if (userInput.includes("buracos negros")) {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-3">
            <p>
              Excelente tópico! Buracos negros são regiões no espaço-tempo onde a gravidade é tão forte que nada, nem
              mesmo a luz, pode escapar. Eles se formam quando estrelas muito massivas colapsam no final de suas vidas.
            </p>
            <p>Para aprofundar, separei alguns vídeos que podem te ajudar:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <VideoSuggestion title="O que são Buracos Negros?" channel="Ciência Todo Dia" />
              <VideoSuggestion title="A Física dos Buracos Negros" channel="Canal do Schwarza" />
            </div>
          </div>
        ),
      }
    } else {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content:
          "Não entendi muito bem. Você poderia tentar perguntar de outra forma? Lembre-se que sou uma demo. Tente pedir sobre 'Revolução Francesa', 'simulado de química para o ENEM' ou 'pesquisar sobre Buracos Negros'.",
      }
    }
    setMessages((prev) => [...prev, aiResponse])
  }

  const VideoSuggestion = ({ title, channel }: { title: string; channel: string }) => (
    <a href="#" className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-100 w-full">
      <Youtube className="w-8 h-8 text-red-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{channel}</p>
      </div>
    </a>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <BrainCircuit className="w-8 h-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">Tutor AI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 text-green-600 font-medium">
              <MessageSquare className="w-4 h-4" />
              Chat
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <BookOpen className="w-4 h-4" />
              Biblioteca
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <Target className="w-4 h-4" />
              Simulados
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <TrendingUp className="w-4 h-4" />
              Progresso
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium">Ana Luiza</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Matemática</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>História</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Química</span>
                    <span>82%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Simulado ENEM</div>
                  <div className="text-gray-600">Química - 8.5/10</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Dúvida Resolvida</div>
                  <div className="text-gray-600">Revolução Francesa</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Pesquisa</div>
                  <div className="text-gray-600">Buracos Negros</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Chat com Tutor AI</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex items-end gap-2", message.sender === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite sua dúvida aqui..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
