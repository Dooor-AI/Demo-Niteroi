import type React from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookUser, BrainCircuit, AreaChart, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Central Educacional Inteligente - Prefeitura de Niterói
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          O primeiro município do Brasil com IA segura para alunos e professores. Um centro de inteligência para apoio
          ao planejamento educacional e insights em tempo real, oferecendo aos gestores públicos uma poderosa ferramenta
          de acompanhamento e evolução da educação no município.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <DemoCard
          href="/teacher-copilot"
          icon={<BookUser className="w-10 h-10 text-blue-600" />}
          title="Teacher Copilot"
          description="Para Professores: Automatize correções e crie planos de aula com IA."
        />
        <DemoCard
          href="/tutor-ai"
          icon={<BrainCircuit className="w-10 h-10 text-green-600" />}
          title="Tutor AI"
          description="Para Alunos: Um tutor 24/7 para tirar dúvidas, treinar para provas e aprofundar estudos."
        />
        <DemoCard
          href="/educational-intelligence-center"
          icon={<AreaChart className="w-10 h-10 text-purple-600" />}
          title="Central de Inteligência"
          description="Para Gestores: Dashboards dinâmicos para análise de dados e tomada de decisão."
        />
      </div>
    </div>
  )
}

function DemoCard({
  href,
  icon,
  title,
  description,
}: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="flex flex-col hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex-grow">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
        </div>
        <CardDescription className="text-base text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button variant="outline" className="w-full bg-transparent">
            Acessar Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
