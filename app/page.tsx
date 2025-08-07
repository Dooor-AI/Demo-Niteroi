import type React from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookUser, BrainCircuit, AreaChart, ArrowRight } from "lucide-react"

export default function HomePage() {
  const heroBgUrl =
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1920&auto=format&fit=crop" // Sala de aula (Unsplash)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative min-h-[60vh] md:min-h-[68vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="Apresentação da Central Educacional Inteligente"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.25),transparent_40%),_radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.25),transparent_35%)]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <p className="inline-block px-3 py-1 rounded-full text-xs tracking-wide bg-white/10 backdrop-blur border border-white/20">
            Prefeitura de Niterói
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
            Central Educacional Inteligente
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            IA segura para alunos e professores. Insights em tempo real para gestores públicos, apoiando o planejamento
            educacional e a evolução da rede de ensino do município.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryLink href="/educational-intelligence-center" label="Acessar Central" />
            <SecondaryLink href="#solucoes" label="Explorar Soluções" />
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 0h1440v49.5S1098 120 720 120 0 49.5 0 49.5V0Z" fill="url(#grad)" fillOpacity="0.95" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      {/* Soluções */}
      <section id="solucoes" className="relative -mt-6 md:-mt-10 pb-16 pt-10 md:pt-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Soluções para a Educação Municipal</h2>
            <p className="text-gray-600 mt-2">Três experiências demonstrativas para públicos diferentes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <DemoCard
              href="/teacher-copilot"
              icon={<BookUser className="w-10 h-10 text-blue-600" />}
              title="Teacher Copilot"
              description="Para Professores: Automatize correções e crie planos de aula com IA."
              accent="from-blue-50 to-cyan-50"
            />
            <DemoCard
              href="/tutor-ai"
              icon={<BrainCircuit className="w-10 h-10 text-green-600" />}
              title="Tutor AI"
              description="Para Alunos: Um tutor 24/7 para tirar dúvidas, treinar para provas e aprofundar estudos."
              accent="from-emerald-50 to-green-50"
            />
            <DemoCard
              href="/educational-intelligence-center"
              icon={<AreaChart className="w-10 h-10 text-purple-600" />}
              title="Central de Inteligência"
              description="Para Gestores: Dashboards dinâmicos para análise de dados e tomada de decisão."
              accent="from-purple-50 to-indigo-50"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function PrimaryLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className="inline-block">
      <Button className="px-6 py-2 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow">
        {label}
      </Button>
    </Link>
  )
}

function SecondaryLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className="inline-block">
      <Button variant="outline" className="px-6 py-2 rounded-xl bg-white/5 text-white border-white/30 hover:bg-white/10 font-semibold">
        {label}
      </Button>
    </Link>
  )
}

function DemoCard({
  href,
  icon,
  title,
  description,
  accent,
}: { href: string; icon: React.ReactNode; title: string; description: string; accent: string }) {
  return (
    <Card className={`flex flex-col hover:shadow-xl transition-all duration-300 border-gray-200/70 bg-gradient-to-b ${accent}`}>
      <CardHeader className="flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <div className="shrink-0 rounded-xl bg-white shadow p-2">{icon}</div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
            <span className="mt-1 inline-block text-[11px] uppercase tracking-wider text-gray-500">Demo</span>
          </div>
        </div>
        <CardDescription className="text-base text-gray-700 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="w-full" aria-label={`Acessar ${title}`}>
          <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
            Acessar Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
