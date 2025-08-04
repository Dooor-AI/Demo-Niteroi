"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadCloud, Loader2, Wand2, Send, X } from "lucide-react"
import { BookUser } from "lucide-react"
import { Bell, Settings, Home, FileText, BarChart3, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const mockResults = [
  { student: "Ana Silva", grade: 8.5, status: "Aprovado" },
  { student: "Bruno Costa", grade: 9.0, status: "Aprovado" },
  { student: "Carla Dias", grade: 5.5, status: "Recuperação" },
  { student: "Daniel Farias", grade: 4.0, status: "Reprovado" },
  { student: "Elisa Mendes", grade: 7.5, status: "Aprovado" },
]

type BNCCCompetence = {
  code: string
  description: string
}

type Message = {
  id: number
  sender: "user" | "ai"
  content: React.ReactNode
}

// Base de dados das competências BNCC por matéria e ano
const bnccCompetences: Record<string, Record<string, BNCCCompetence[]>> = {
  Matemática: {
    "1º": [
      {
        code: "EM13MAT101",
        description: "Interpretar criticamente situações econômicas, sociais e fatos relativos às Ciências da Natureza",
      },
      { code: "EM13MAT102", description: "Analisar tabelas, gráficos e amostras de pesquisas estatísticas" },
      { code: "EM13MAT103", description: "Interpretar e compreender textos científicos ou divulgados pelas mídias" },
      { code: "EM13MAT104", description: "Interpretar taxas e índices de natureza socioeconômica" },
      { code: "EM13MAT105", description: "Utilizar as noções de transformações isométricas" },
    ],
    "2º": [
      {
        code: "EM13MAT201",
        description: "Propor ou participar de ações para investigar desafios do mundo contemporâneo",
      },
      { code: "EM13MAT202", description: "Planejar e executar pesquisa amostral sobre questões relevantes" },
      {
        code: "EM13MAT203",
        description: "Aplicar conceitos matemáticos no planejamento, na execução e na análise de ações",
      },
      {
        code: "EM13MAT204",
        description: "Reconhecer e empregar unidades usadas para expressar medidas muito grandes ou muito pequenas",
      },
      { code: "EM13MAT205", description: "Resolver e elaborar problemas com funções polinomiais de 2º grau" },
    ],
    "3º": [
      {
        code: "EM13MAT301",
        description: "Resolver e elaborar problemas do cotidiano, da Matemática e de outras áreas do conhecimento",
      },
      { code: "EM13MAT302", description: "Construir modelos empregando as funções polinomiais de 1º ou 2º graus" },
      {
        code: "EM13MAT303",
        description: "Interpretar e comparar situações que envolvam juros simples com as que envolvem juros compostos",
      },
      { code: "EM13MAT304", description: "Resolver e elaborar problemas com funções exponenciais e logarítmicas" },
      {
        code: "EM13MAT305",
        description:
          "Resolver e elaborar problemas usando conceitos e procedimentos relacionados ao estudo de triângulos",
      },
    ],
  },
  Biologia: {
    "1º": [
      {
        code: "EM13CNT101",
        description: "Analisar e representar, com ou sem o uso de dispositivos e de aplicativos digitais específicos",
      },
      {
        code: "EM13CNT102",
        description:
          "Realizar previsões, avaliar intervenções e/ou construir protótipos de sistemas e processos naturais",
      },
      {
        code: "EM13CNT103",
        description:
          "Utilizar o conhecimento sobre as radiações e suas origens para avaliar as potencialidades e os riscos",
      },
      {
        code: "EM13CNT104",
        description: "Avaliar os benefícios e os riscos à saúde e ao ambiente, considerando a composição",
      },
      {
        code: "EM13CNT105",
        description:
          "Analisar os ciclos biogeoquímicos e interpretar os efeitos de fenômenos naturais e da interferência humana",
      },
    ],
    "2º": [
      {
        code: "EM13CNT201",
        description: "Analisar e discutir modelos, teorias e leis propostos em diferentes épocas e culturas",
      },
      {
        code: "EM13CNT202",
        description: "Analisar as diversas formas de manifestação da vida em seus diferentes níveis de organização",
      },
      {
        code: "EM13CNT203",
        description:
          "Avaliar e prever efeitos de intervenções nos ecossistemas, e seus impactos nos seres vivos e no corpo humano",
      },
      {
        code: "EM13CNT204",
        description: "Elaborar explicações, previsões e cálculos a respeito dos movimentos de objetos na Terra",
      },
      {
        code: "EM13CNT205",
        description:
          "Interpretar resultados e realizar previsões sobre atividades experimentais, fenômenos naturais e processos tecnológicos",
      },
    ],
    "3º": [
      {
        code: "EM13CNT301",
        description:
          "Construir questões, elaborar hipóteses, previsões e estimativas, empregar instrumentos de medição",
      },
      {
        code: "EM13CNT302",
        description:
          "Comunicar, para públicos variados, em diversos contextos, resultados de análises, pesquisas e/ou experimentos",
      },
      {
        code: "EM13CNT303",
        description: "Interpretar textos de divulgação científica que tratem de temáticas das Ciências da Natureza",
      },
      {
        code: "EM13CNT304",
        description:
          "Analisar e debater situações controversas sobre a aplicação de conhecimentos da área de Ciências da Natureza",
      },
      {
        code: "EM13CNT305",
        description: "Investigar e discutir o uso de tecnologias e seus impactos socioeconômicos e socioambientais",
      },
    ],
  },
  Química: {
    "1º": [
      {
        code: "EM13CNT101",
        description: "Analisar e representar, com ou sem o uso de dispositivos e de aplicativos digitais específicos",
      },
      {
        code: "EM13CNT102",
        description:
          "Realizar previsões, avaliar intervenções e/ou construir protótipos de sistemas e processos naturais",
      },
      {
        code: "EM13CNT103",
        description:
          "Utilizar o conhecimento sobre as radiações e suas origens para avaliar as potencialidades e os riscos",
      },
      {
        code: "EM13CNT106",
        description:
          "Avaliar, com ou sem o uso de dispositivos e aplicativos digitais, tecnologias e possíveis soluções",
      },
      {
        code: "EM13CNT107",
        description:
          "Realizar previsões qualitativas e quantitativas sobre o funcionamento de geradores, motores elétricos",
      },
    ],
    "2º": [
      {
        code: "EM13CNT201",
        description: "Analisar e discutir modelos, teorias e leis propostos em diferentes épocas e culturas",
      },
      { code: "EM13CNT206", description: "Discutir a importância da preservação e conservação da biodiversidade" },
      {
        code: "EM13CNT207",
        description:
          "Identificar, analisar e discutir vulnerabilidades vinculadas às vivências e aos desafios contemporâneos",
      },
      {
        code: "EM13CNT208",
        description: "Aplicar os princípios da evolução biológica para analisar a história humana",
      },
      {
        code: "EM13CNT209",
        description:
          "Analisar a evolução estelar associando-a aos modelos de origem e distribuição dos elementos químicos",
      },
    ],
    "3º": [
      {
        code: "EM13CNT301",
        description:
          "Construir questões, elaborar hipóteses, previsões e estimativas, empregar instrumentos de medição",
      },
      {
        code: "EM13CNT306",
        description:
          "Avaliar os riscos envolvidos em atividades cotidianas, aplicando conhecimentos das Ciências da Natureza",
      },
      {
        code: "EM13CNT307",
        description:
          "Analisar as propriedades dos materiais para avaliar a adequação de seu uso em diferentes aplicações",
      },
      {
        code: "EM13CNT308",
        description:
          "Investigar e analisar o funcionamento de equipamentos elétricos e/ou eletrônicos e sistemas de automação",
      },
      {
        code: "EM13CNT309",
        description: "Analisar questões socioambientais, políticas e econômicas relativas à dependência do mundo atual",
      },
    ],
  },
  Física: {
    "1º": [
      {
        code: "EM13CNT101",
        description: "Analisar e representar, com ou sem o uso de dispositivos e de aplicativos digitais específicos",
      },
      {
        code: "EM13CNT102",
        description:
          "Realizar previsões, avaliar intervenções e/ou construir protótipos de sistemas e processos naturais",
      },
      {
        code: "EM13CNT103",
        description:
          "Utilizar o conhecimento sobre as radiações e suas origens para avaliar as potencialidades e os riscos",
      },
      {
        code: "EM13CNT107",
        description:
          "Realizar previsões qualitativas e quantitativas sobre o funcionamento de geradores, motores elétricos",
      },
      {
        code: "EM13CNT108",
        description:
          "Analisar o funcionamento de equipamentos elétricos e/ou eletrônicos, redes de informática e sistemas de automação",
      },
    ],
    "2º": [
      {
        code: "EM13CNT204",
        description: "Elaborar explicações, previsões e cálculos a respeito dos movimentos de objetos na Terra",
      },
      {
        code: "EM13CNT205",
        description:
          "Interpretar resultados e realizar previsões sobre atividades experimentais, fenômenos naturais e processos tecnológicos",
      },
      {
        code: "EM13CNT209",
        description:
          "Analisar a evolução estelar associando-a aos modelos de origem e distribuição dos elementos químicos",
      },
      {
        code: "EM13CNT210",
        description: "Identificar riscos e interpretar mapas, cartas e imagens de sensoriamento remoto",
      },
      {
        code: "EM13CNT211",
        description:
          "Comunicar, para públicos variados, em diversos contextos, resultados de análises, pesquisas e/ou experimentos",
      },
    ],
    "3º": [
      {
        code: "EM13CNT301",
        description:
          "Construir questões, elaborar hipóteses, previsões e estimativas, empregar instrumentos de medição",
      },
      {
        code: "EM13CNT308",
        description:
          "Investigar e analisar o funcionamento de equipamentos elétricos e/ou eletrônicos e sistemas de automação",
      },
      {
        code: "EM13CNT309",
        description: "Analisar questões socioambientais, políticas e econômicas relativas à dependência do mundo atual",
      },
      {
        code: "EM13CNT310",
        description: "Investigar e analisar os efeitos de programas de infraestrutura e demais serviços básicos",
      },
      {
        code: "EM13CNT311",
        description: "Selecionar e mobilizar intencionalmente recursos criativos relacionados às Ciências da Natureza",
      },
    ],
  },
  História: {
    "1º": [
      {
        code: "EM13CHS101",
        description: "Identificar, analisar e comparar diferentes fontes e narrativas expressas em diversas linguagens",
      },
      {
        code: "EM13CHS102",
        description:
          "Identificar, analisar e discutir as circunstâncias históricas, geográficas, políticas, econômicas, sociais, ambientais e culturais",
      },
      {
        code: "EM13CHS103",
        description:
          "Elaborar hipóteses, selecionar evidências e compor argumentos relativos a processos políticos, econômicos, sociais, ambientais, culturais e epistemológicos",
      },
      {
        code: "EM13CHS104",
        description:
          "Analisar objetos e vestígios da cultura material e imaterial de modo a identificar conhecimentos, valores, crenças e práticas",
      },
      {
        code: "EM13CHS105",
        description:
          "Identificar, contextualizar e criticar tipologias evolutivas (populações nômades e sedentárias, entre outras)",
      },
    ],
    "2º": [
      {
        code: "EM13CHS201",
        description:
          "Analisar e caracterizar as dinâmicas das populações, das mercadorias e do capital nos diversos continentes",
      },
      {
        code: "EM13CHS202",
        description:
          "Analisar e avaliar os impactos das tecnologias na estruturação e nas dinâmicas de grupos, povos e sociedades contemporâneos",
      },
      {
        code: "EM13CHS203",
        description: "Contrapor e avaliar diferentes políticas econômicas, comparando suas propostas e seus impactos",
      },
      {
        code: "EM13CHS204",
        description:
          "Comparar e avaliar os processos de ocupação do espaço e a formação de territórios, territorialidades e fronteiras",
      },
      {
        code: "EM13CHS205",
        description:
          "Analisar a produção de diferentes territorialidades em suas dimensões culturais, econômicas, ambientais, políticas e sociais",
      },
    ],
    "3º": [
      {
        code: "EM13CHS301",
        description:
          "Problematizar hábitos e práticas individuais e coletivos de produção, reaproveitamento e descarte de resíduos",
      },
      {
        code: "EM13CHS302",
        description: "Analisar e avaliar criticamente os impactos econômicos e socioambientais de cadeias produtivas",
      },
      {
        code: "EM13CHS303",
        description:
          "Debater e avaliar o papel da indústria cultural e das culturas de massa no estímulo ao consumismo",
      },
      {
        code: "EM13CHS304",
        description:
          "Analisar os impactos socioambientais decorrentes de práticas de instituições governamentais, de empresas e de indivíduos",
      },
      {
        code: "EM13CHS305",
        description:
          "Analisar e discutir o papel e as competências legais dos organismos nacionais e internacionais de regulação, controle e fiscalização ambiental",
      },
    ],
  },
  Geografia: {
    "1º": [
      {
        code: "EM13CHS101",
        description: "Identificar, analisar e comparar diferentes fontes e narrativas expressas em diversas linguagens",
      },
      {
        code: "EM13CHS106",
        description:
          "Utilizar as linguagens cartográfica, gráfica e iconográfica, diferentes gêneros textuais e tecnologias digitais de informação e comunicação",
      },
      {
        code: "EM13CHS201",
        description:
          "Analisar e caracterizar as dinâmicas das populações, das mercadorias e do capital nos diversos continentes",
      },
      {
        code: "EM13CHS204",
        description:
          "Comparar e avaliar os processos de ocupação do espaço e a formação de territórios, territorialidades e fronteiras",
      },
      {
        code: "EM13CHS205",
        description:
          "Analisar a produção de diferentes territorialidades em suas dimensões culturais, econômicas, ambientais, políticas e sociais",
      },
    ],
    "2º": [
      {
        code: "EM13CHS202",
        description:
          "Analisar e avaliar os impactos das tecnologias na estruturação e nas dinâmicas de grupos, povos e sociedades contemporâneos",
      },
      {
        code: "EM13CHS203",
        description: "Contrapor e avaliar diferentes políticas econômicas, comparando suas propostas e seus impactos",
      },
      {
        code: "EM13CHS206",
        description:
          "Analisar a ocupação humana e a produção do espaço em diferentes tempos, aplicando os princípios de localização, distribuição, ordem, extensão, conexão, arranjos, casualidade, entre outros",
      },
      {
        code: "EM13CHS301",
        description:
          "Problematizar hábitos e práticas individuais e coletivos de produção, reaproveitamento e descarte de resíduos",
      },
      {
        code: "EM13CHS302",
        description: "Analisar e avaliar criticamente os impactos econômicos e socioambientais de cadeias produtivas",
      },
    ],
    "3º": [
      {
        code: "EM13CHS304",
        description:
          "Analisar os impactos socioambientais decorrentes de práticas de instituições governamentais, de empresas e de indivíduos",
      },
      {
        code: "EM13CHS305",
        description:
          "Analisar e discutir o papel e as competências legais dos organismos nacionais e internacionais de regulação, controle e fiscalização ambiental",
      },
      {
        code: "EM13CHS306",
        description:
          "Contextualizar, comparar e avaliar os impactos de diferentes modelos socioeconômicos no uso dos recursos naturais e na promoção da sustentabilidade econômica e socioambiental do planeta",
      },
      {
        code: "EM13CHS601",
        description:
          "Identificar e analisar as demandas e os protagonismos políticos, sociais e culturais dos povos indígenas e das populações afrodescendentes",
      },
      {
        code: "EM13CHS602",
        description:
          "Identificar e caracterizar a presença do paternalismo, do autoritarismo e do populismo na política, na sociedade e nas culturas brasileira e latino-americana",
      },
    ],
  },
  Português: {
    "1º": [
      {
        code: "EM13LP01",
        description:
          "Relacionar o texto, tanto na produção como na leitura/escuta, com suas condições de produção e seu contexto sócio-histórico de circulação",
      },
      {
        code: "EM13LP02",
        description:
          "Estabelecer relações entre as partes do texto, tanto na produção como na leitura/escuta, considerando a construção composicional e o estilo do gênero",
      },
      {
        code: "EM13LP03",
        description:
          "Analisar relações de intertextualidade e interdiscursividade que permitam a explicitação de relações dialógicas",
      },
      {
        code: "EM13LP04",
        description:
          "Estabelecer relações de interdiscursividade e intertextualidade para explicitar, sustentar e conferir consistência a posicionamentos e para construir e corroborar explicações e relatos",
      },
      {
        code: "EM13LP05",
        description:
          "Analisar, em textos argumentativos, os movimentos argumentativos de sustentação, refutação e negociação e os tipos de argumentos",
      },
    ],
    "2º": [
      {
        code: "EM13LP06",
        description:
          "Analisar efeitos de sentido decorrentes de usos expressivos da linguagem, da escolha de determinadas palavras ou expressões e da ordenação, combinação e contraposição de palavras",
      },
      {
        code: "EM13LP07",
        description:
          "Analisar, em textos de diferentes gêneros, marcas que expressam a posição do enunciador frente àquilo que é dito",
      },
      {
        code: "EM13LP08",
        description:
          "Analisar elementos e aspectos da sintaxe do português, como a ordem dos constituintes da sentença (e os efeito que causam sua inversão)",
      },
      {
        code: "EM13LP09",
        description:
          "Comparar o tratamento dado pela gramática tradicional e pelas gramáticas de uso contemporâneas em relação a diferentes tópicos gramaticais",
      },
      {
        code: "EM13LP10",
        description:
          "Analisar o fenômeno da variação linguística, em seus diferentes níveis (variações fonético-fonológica, lexical, sintática, semântica e estilístico-pragmática)",
      },
    ],
    "3º": [
      {
        code: "EM13LP11",
        description: "Fazer curadoria de informação, tendo em vista diferentes propósitos e projetos discursivos",
      },
      {
        code: "EM13LP12",
        description:
          "Selecionar informações, dados e argumentos em fontes confiáveis, impressas e digitais, e utilizá-los de forma referenciada e ética para construir repertórios e sustentar posicionamentos",
      },
      {
        code: "EM13LP13",
        description:
          "Analisar, a partir de referências contextuais, estéticas e culturais, efeitos de sentido decorrentes de escolhas de elementos sonoros (volume, timbre, intensidade, pausas, ritmo, efeitos sonoros, sincronização etc.)",
      },
      {
        code: "EM13LP14",
        description:
          "Analisar, a partir de referências contextuais, estéticas e culturais, efeitos de sentido decorrentes de escolhas e composição das imagens (enquadramento, ângulo/vetor, foco/profundidade de campo, iluminação, cor, linhas, formas etc.)",
      },
      {
        code: "EM13LP15",
        description:
          "Planejar, produzir, revisar, editar, reescrever e avaliar textos escritos e multissemióticos, considerando sua adequação às condições de produção do texto",
      },
    ],
  },
}

export default function TeacherCopilotPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [hasGabarito, setHasGabarito] = useState(false)
  const [gabaritoFile, setGabaritoFile] = useState<File | null>(null)
  const [isUploadingGabarito, setIsUploadingGabarito] = useState(false)

  // Estados para o plano de aula
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleScan = () => {
    setIsScanning(true)
    setShowResults(false)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2500)
  }

  const handleGabaritoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setIsUploadingGabarito(true)
      setGabaritoFile(files[0])

      setTimeout(() => {
        setIsUploadingGabarito(false)
        setHasGabarito(true)
      }, 2000)
    }
  }

  const handleProvaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleScan()
    }
  }

  const handleCompetenceToggle = (competenceCode: string) => {
    setSelectedCompetences((prev) =>
      prev.includes(competenceCode) ? prev.filter((code) => code !== competenceCode) : [...prev, competenceCode],
    )
  }

  const removeCompetence = (competenceCode: string) => {
    setSelectedCompetences((prev) => prev.filter((code) => code !== competenceCode))
  }

  const getAvailableCompetences = (): BNCCCompetence[] => {
    if (!selectedYear || !selectedSubject) return []
    return bnccCompetences[selectedSubject]?.[selectedYear] || []
  }

  const getSelectedCompetenceDetails = (): BNCCCompetence[] => {
    const available = getAvailableCompetences()
    return available.filter((comp) => selectedCompetences.includes(comp.code))
  }

  const handleStartChat = () => {
    if (selectedYear && selectedSubject && selectedCompetences.length > 0) {
      const competencesList = getSelectedCompetenceDetails()
        .map((comp) => `• ${comp.code}: ${comp.description}`)
        .join("\n")

      const welcomeMessage: Message = {
        id: Date.now(),
        sender: "ai",
        content: (
          <div className="space-y-3">
            <p>
              Olá! Estou pronto para criar um plano de aula personalizado para o{" "}
              <strong>{selectedYear} ano do Ensino Médio</strong> na disciplina de <strong>{selectedSubject}</strong>.
            </p>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Competências BNCC selecionadas:</h4>
              <div className="text-sm text-blue-700 whitespace-pre-line">{competencesList}</div>
            </div>

            <p>Agora me diga:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Qual tema específico você gostaria de abordar?</li>
              <li>Qual a duração da aula? (ex: 1 hora, 50 minutos)</li>
              <li>Há alguma metodologia específica que prefere?</li>
              <li>Qual o nível de conhecimento prévio da turma sobre o tema?</li>
            </ul>
          </div>
        ),
      }
      setMessages([welcomeMessage])
    }
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newUserMessage: Message = { id: Date.now(), sender: "user", content: input }
    setMessages((prev) => [...prev, newUserMessage])
    setIsAiTyping(true)

    setTimeout(() => {
      handleAiResponse(input.toLowerCase())
      setIsAiTyping(false)
    }, 2000)

    setInput("")
  }

  const handleAiResponse = (userInput: string) => {
    let aiResponse: Message
    const selectedCompetenceDetails = getSelectedCompetenceDetails()

    if (userInput.includes("fotossíntese") || userInput.includes("biologia")) {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Plano de Aula: Fotossíntese ({selectedYear} ano - {selectedSubject})
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Competências BNCC trabalhadas:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {selectedCompetenceDetails.map((comp) => (
                  <div key={comp.code}>
                    <strong>{comp.code}:</strong> {comp.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium">🎯 Objetivos (50 minutos):</h4>
                <ul className="text-sm list-disc list-inside ml-2">
                  <li>Compreender o processo de fotossíntese e sua importância ecológica</li>
                  <li>Identificar os reagentes e produtos da fotossíntese</li>
                  <li>Relacionar fotossíntese com o ciclo do carbono e sustentabilidade</li>
                  <li>Desenvolver habilidades de observação e análise científica</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">📚 Desenvolvimento:</h4>
                <div className="text-sm space-y-2 ml-2">
                  <p>
                    <strong>Introdução (10 min):</strong> Questão problematizadora: "Por que as plantas morrem no
                    escuro?"
                  </p>
                  <p>
                    <strong>Desenvolvimento (25 min):</strong> Explicação da equação química, fases fotoquímica e
                    bioquímica
                  </p>
                  <p>
                    <strong>Atividade prática (10 min):</strong> Observação de cloroplastos ao microscópio
                  </p>
                  <p>
                    <strong>Fechamento (5 min):</strong> Síntese e conexão com mudanças climáticas
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium">🔬 Recursos necessários:</h4>
                <p className="text-sm ml-2">Microscópio, lâminas, folhas de Elodea, projetor, slides interativos</p>
              </div>

              <div>
                <h4 className="font-medium">📝 Avaliação alinhada às competências:</h4>
                <p className="text-sm ml-2">
                  Análise de gráficos sobre taxa fotossintética, interpretação de experimentos e discussão sobre
                  impactos ambientais
                </p>
              </div>
            </div>
          </div>
        ),
      }
    } else if (userInput.includes("matemática") || userInput.includes("função")) {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Plano de Aula: Função Quadrática ({selectedYear} ano - {selectedSubject})
            </h3>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Competências BNCC trabalhadas:</h4>
              <div className="text-sm text-green-700 space-y-1">
                {selectedCompetenceDetails.map((comp) => (
                  <div key={comp.code}>
                    <strong>{comp.code}:</strong> {comp.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium">🎯 Objetivos (1 hora):</h4>
                <ul className="text-sm list-disc list-inside ml-2">
                  <li>Identificar e construir gráficos de funções quadráticas</li>
                  <li>Determinar vértice, raízes e eixo de simetria</li>
                  <li>Aplicar em situações-problema do cotidiano</li>
                  <li>Desenvolver pensamento algébrico e interpretação gráfica</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">📚 Desenvolvimento:</h4>
                <div className="text-sm space-y-2 ml-2">
                  <p>
                    <strong>Motivação (10 min):</strong> Vídeo sobre trajetória de projéteis no esporte
                  </p>
                  <p>
                    <strong>Conceituação (20 min):</strong> Forma geral f(x) = ax² + bx + c e suas propriedades
                  </p>
                  <p>
                    <strong>Prática (20 min):</strong> Construção colaborativa de gráficos
                  </p>
                  <p>
                    <strong>Aplicação (10 min):</strong> Problema: otimização de área de um terreno
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium">📝 Avaliação contextualizada:</h4>
                <p className="text-sm ml-2">
                  Resolução de problemas reais envolvendo maximização de lucro e análise crítica de gráficos econômicos
                </p>
              </div>
            </div>
          </div>
        ),
      }
    } else {
      aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: (
          <div className="space-y-2">
            <p>
              Perfeito! Vou criar um plano específico para{" "}
              <strong>
                {selectedYear} ano - {selectedSubject}
              </strong>{" "}
              considerando as competências selecionadas.
            </p>
            <p>Para personalizar ainda mais o plano, me conte:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Qual o tema ou conteúdo específico?</li>
              <li>Quantos minutos de aula?</li>
              <li>A turma tem alguma característica especial?</li>
              <li>Há recursos tecnológicos disponíveis?</li>
            </ul>
            <p className="text-sm text-gray-600">
              Exemplo: "Quero uma aula de 50 minutos sobre equações do 2º grau com foco em aplicações práticas para uma
              turma interessada em engenharia"
            </p>
          </div>
        ),
      }
    }

    setMessages((prev) => [...prev, aiResponse])
  }

  const resetPlanCreation = () => {
    setSelectedYear("")
    setSelectedSubject("")
    setSelectedCompetences([])
    setMessages([])
  }

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

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="grade" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grade">Corrigir Prova</TabsTrigger>
                <TabsTrigger value="plan">Criar Plano de Aula</TabsTrigger>
              </TabsList>
              <TabsContent value="grade" className="mt-6">
                {!hasGabarito ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="p-6 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Primeiro, envie o gabarito</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Faça upload do PDF com o gabarito ou tire fotos das questões com as respostas marcadas.
                      </p>
                      <div className="mt-4">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          multiple
                          onChange={handleGabaritoUpload}
                          className="hidden"
                          id="gabarito-upload"
                        />
                        <label htmlFor="gabarito-upload">
                          <Button asChild disabled={isUploadingGabarito}>
                            <span>
                              {isUploadingGabarito ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando gabarito...
                                </>
                              ) : (
                                "Enviar Gabarito"
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Gabarito carregado com sucesso! Agora envie a prova do aluno.
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2">
                      <CardContent className="p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Agora envie a prova do aluno</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Tire uma foto ou faça upload da avaliação preenchida pelo aluno.
                        </p>
                        <div className="flex gap-2 mt-4 justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProvaUpload}
                            className="hidden"
                            id="prova-upload"
                          />
                          <label htmlFor="prova-upload">
                            <Button asChild disabled={isScanning}>
                              <span>Enviar Foto da Prova</span>
                            </Button>
                          </label>
                          <Button onClick={handleScan} disabled={isScanning} variant="outline">
                            {isScanning ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Corrigindo...
                              </>
                            ) : (
                              "Usar Câmera"
                            )}
                          </Button>
                        </div>
                        <Button onClick={() => setHasGabarito(false)} variant="ghost" size="sm" className="mt-2">
                          Trocar gabarito
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {showResults && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Relatório de Correção Automática</h3>
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
                <div className="space-y-6">
                  {/* Etapa 1: Seleção de Ano e Matéria */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select
                      value={selectedYear}
                      onValueChange={(value) => {
                        setSelectedYear(value)
                        setSelectedSubject("")
                        setSelectedCompetences([])
                        setMessages([])
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ano da turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1º">1º ano</SelectItem>
                        <SelectItem value="2º">2º ano</SelectItem>
                        <SelectItem value="3º">3º ano</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedSubject}
                      onValueChange={(value) => {
                        setSelectedSubject(value)
                        setSelectedCompetences([])
                        setMessages([])
                      }}
                      disabled={!selectedYear}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Matemática">Matemática</SelectItem>
                        <SelectItem value="Biologia">Biologia</SelectItem>
                        <SelectItem value="Química">Química</SelectItem>
                        <SelectItem value="Física">Física</SelectItem>
                        <SelectItem value="História">História</SelectItem>
                        <SelectItem value="Geografia">Geografia</SelectItem>
                        <SelectItem value="Português">Português</SelectItem>
                      </SelectContent>
                    </Select>

                    {messages.length > 0 && (
                      <Button onClick={resetPlanCreation} variant="outline" className="w-full sm:w-auto bg-transparent">
                        Nova Configuração
                      </Button>
                    )}
                  </div>

                  {/* Etapa 2: Seleção de Competências BNCC */}
                  {selectedYear && selectedSubject && messages.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Competências BNCC - {selectedYear} ano ({selectedSubject})
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Selecione uma ou mais competências que deseja trabalhar no plano de aula:
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Lista de competências disponíveis */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {getAvailableCompetences().map((competence) => (
                            <div
                              key={competence.code}
                              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <Checkbox
                                id={competence.code}
                                checked={selectedCompetences.includes(competence.code)}
                                onCheckedChange={() => handleCompetenceToggle(competence.code)}
                              />
                              <div className="flex-1">
                                <label htmlFor={competence.code} className="text-sm font-medium cursor-pointer">
                                  {competence.code}
                                </label>
                                <p className="text-xs text-gray-600 mt-1">{competence.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Competências selecionadas */}
                        {selectedCompetences.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">
                              Competências selecionadas ({selectedCompetences.length}):
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {getSelectedCompetenceDetails().map((competence) => (
                                <Badge key={competence.code} variant="secondary" className="flex items-center gap-1">
                                  {competence.code}
                                  <button
                                    onClick={() => removeCompetence(competence.code)}
                                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Botão para iniciar chat */}
                        {selectedCompetences.length > 0 && (
                          <div className="flex justify-center pt-4">
                            <Button onClick={handleStartChat} className="w-full sm:w-auto">
                              <Wand2 className="mr-2 h-4 w-4" />
                              Iniciar Chat AI ({selectedCompetences.length} competência
                              {selectedCompetences.length > 1 ? "s" : ""})
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Chat AI */}
                  {messages.length > 0 && (
                    <Card className="h-[600px] flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Chat AI - Plano de Aula ({selectedYear} ano - {selectedSubject})
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">IA Especialista BNCC</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedCompetenceDetails().map((comp) => (
                            <Badge key={comp.code} variant="outline" className="text-xs">
                              {comp.code}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex items-end gap-2",
                              message.sender === "user" ? "justify-end" : "justify-start",
                            )}
                          >
                            {message.sender === "ai" && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                                message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
                              )}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))}
                        {isAiTyping && (
                          <div className="flex items-end gap-2 justify-start">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-lg px-4 py-3">
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
                      </CardContent>
                      <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Digite sua solicitação para o plano de aula..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            disabled={isAiTyping}
                          />
                          <Button onClick={handleSendMessage} size="icon" disabled={isAiTyping || !input.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Exemplo: "Preciso de uma aula de 1 hora sobre fotossíntese com experimento prático"
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Status da configuração */}
                  {selectedYear && selectedSubject && messages.length === 0 && selectedCompetences.length === 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Configuração:</strong> {selectedYear} ano do Ensino Médio - {selectedSubject}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Agora selecione as competências BNCC que deseja trabalhar no plano de aula.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
