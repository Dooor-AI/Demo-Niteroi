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
      parts: [{ text: `Você é um tutor de IA educacional especializado em ajudar estudantes brasileiros. 
      Sua função é:
      - Explicar conceitos de forma clara e didática
      - Fornecer exemplos práticos quando apropriado
      - Adaptar o nível de explicação ao conhecimento do estudante
      - Ser paciente e encorajador
      - Responder em português brasileiro
      - Focar em áreas como matemática, ciências, história, português, etc.
      
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
    
    return NextResponse.json({
      response: data.candidates[0].content.parts[0].text
    })

  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 