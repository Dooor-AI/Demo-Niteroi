import type React from "react"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Centro de Inteligência Educacional",
  description: "Plataforma educacional com IA para professores e alunos",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${roboto.style.fontFamily};
  --font-roboto: ${roboto.variable};
}
        `}</style>
      </head>
      <body className={roboto.variable}>{children}</body>
    </html>
  )
}
