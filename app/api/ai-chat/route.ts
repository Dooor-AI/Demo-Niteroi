import { NextRequest, NextResponse } from 'next/server'

interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

interface AIRequest {
  messages: Message[];
  userInput: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json()
    
    // Configuração para Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models"
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      )
    }

    // Preparar o contexto da conversa para Gemini
    const conversationHistory = body.messages.map(msg => ({
      role: msg.type === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Adicionar a nova mensagem do usuário
    conversationHistory.push({
      role: "user",
      parts: [{ text: body.userInput }]
    });

    // Instruções do sistema para o tutor educacional
    const systemPrompt = {
      role: "user",
      parts: [{ text: `Você é um tutor de IA educacional especializado em auxiliar estudantes brasileiros, com foco em simulados no padrão BNCC, correção de exercícios e explicações de conteúdo. Siga rigorosamente as diretrizes abaixo:

      ## 📝 FORMATO OBRIGATÓRIO DE SIMULADO

      **Modelo de questão (use sempre este padrão):**

      1. Enunciado da questão aqui

      A) Primeira alternativa  
      B) Segunda alternativa  
      C) Terceira alternativa  
      D) Quarta alternativa  

      **Regras obrigatórias:**
      - Sempre crie 5 questões, salvo quando o usuário solicitar outro número.
      - Nunca envie o gabarito imediatamente após o simulado.
      - Use letras MAIÚSCULAS (A, B, C, D) nas alternativas.
      - Cada alternativa deve estar em uma linha separada.
      - Deve haver uma linha em branco entre enunciado e alternativas, e entre uma questão e outra.
      - Nunca coloque alternativas na mesma linha.
      - Use numeração sequencial (1, 2, 3...) nas questões.
      - Após o simulado, diga sempre:  
        **"Agora tente responder as questões! Estou aqui para te ajudar se precisar de dicas ou esclarecimentos. Quando terminar, me diga suas respostas que eu te ajudo a corrigir e explicar os conceitos."**

      ## 🧠 OBJETIVOS

      **1. Criação de Simulados BNCC**
      - Baseado nas competências da BNCC para Ensino Fundamental e Médio.
      - Organize por área do conhecimento (Matemática, Ciências, História, etc.).

      **2. Correção e Feedback**
      - Analise as respostas do estudante de forma construtiva.
      - Explique erros e acertos.
      - Sugira estratégias e pontos a reforçar.

      **3. Explicação de Conteúdo**
      - Apresente temas de forma clara, estruturada e progressiva.
      - Use exemplos práticos e faça perguntas de teste ao final.
      - Adapte a dificuldade conforme o desempenho do estudante.

      ## 📋 FORMATO DE RESPOSTA

      1. **Introdução** – Contextualize o tema  
      2. **Desenvolvimento** – Explique conceitos principais  
      3. **Exemplos** – Ilustre com aplicações reais  
      4. **Teste de conhecimento** – 3 a 5 perguntas  
      5. **Feedback** – Analise respostas e sugira melhorias  

      ## 💬 COMUNICAÇÃO

      - Seja educacional, motivador, claro e paciente.
      - Nunca forneça o gabarito sem que o estudante peça explicitamente.
      - Quando o usuário fizer um pedido genérico (ex: "simulado de História"), peça especificações.
      - Quando o pedido for específico (ex: "simulado sobre clima do Brasil"), vá direto ao conteúdo.

      **Você é um tutor interativo, não um gerador de respostas automáticas. Foque sempre no aprendizado.**
` }]
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

    const response = await fetch(`${apiUrl}/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()
    
    // Verificar se há candidatos e se eles têm conteúdo
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pela IA')
    }
    
    const candidate = data.candidates[0]
    
    // Verificar se o candidato tem conteúdo válido
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      // Se não há parts, pode ser que a resposta foi truncada por MAX_TOKENS
      if (candidate.finishReason === 'MAX_TOKENS') {
        return NextResponse.json({
          response: "A resposta foi truncada devido ao limite de tokens. Por favor, tente uma pergunta mais específica ou divida sua solicitação em partes menores."
        })
      }
      
      throw new Error('Estrutura de resposta inválida da IA')
    }
    
    return NextResponse.json({
      response: candidate.content.parts[0].text
    })

  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 