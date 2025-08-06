import { NextRequest, NextResponse } from 'next/server'

interface CorrectionRequest {
  answerKeyFile: string; // Base64 do arquivo
  studentTestFile: string; // Base64 do arquivo
  studentName: string;
  subject?: string;
  grade?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CorrectionRequest = await request.json()
    
    // Configuração para Gemini API
    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || process.env.GEMINI_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models"
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      )
    }

    // Prompt específico para correção de provas
    const systemPrompt = {
      role: "user",
      parts: [{ text: `Você é um assistente especializado em correção de provas escolares. Sua função é:

## 📋 TAREFA DE CORREÇÃO

**1. Análise dos Arquivos**
- O PRIMEIRO arquivo é o GABARITO (respostas corretas)
- O SEGUNDO arquivo é a PROVA DO ALUNO (respostas do estudante)
- Analise APENAS as questões que existem na prova do aluno
- NÃO crie questões adicionais ou duplicadas

**2. Processo de Correção**
- Identifique quantas questões existem na prova do aluno
- Compare cada resposta do aluno com o gabarito correspondente
- Conte APENAS as questões que realmente existem na prova do aluno
- O totalQuestions deve ser igual ao número de questões na prova do aluno

**3. Critérios de Correção**
- Considere respostas parciais quando apropriado
- Identifique erros conceituais vs. erros de cálculo
- Avalie a clareza e organização das respostas

**4. Feedback Detalhado**
- Forneça explicações para cada erro
- Sugira pontos de melhoria
- Destaque os acertos e pontos fortes

## 📊 FORMATO DE RESPOSTA

Responda APENAS o JSON abaixo, sem nenhum texto adicional ou formatação:

{
  "score": (nota final da prova),
  "correctAnswers": (número de questões corretas),
  "totalQuestions": (número de questões na prova do aluno),
  "feedback": "Feedback detalhado sobre a prova...",
  "corrections": [
    {
      "question": 1,
      "studentAnswer": "Resposta do aluno",
      "correctAnswer": "Resposta correta",
      "isCorrect": true,
      "explanation": "Explicação do erro ou acerto"
    }
  ],
  "strengths": ["Lista de pontos fortes"],
  "improvements": ["Sugestões de melhoria"]
}

**IMPORTANTE:** Responda APENAS o JSON, sem blocos de código, sem explicações adicionais.

**IMPORTANTE:** 
- A nota deve ser de 0 a 10
- totalQuestions deve ser o número REAL de questões na prova do aluno
- Conte apenas acertos totais (não parciais)
- Seja construtivo no feedback
- Considere o nível escolar do aluno
- NÃO duplique ou crie questões que não existem na prova do aluno` }]
    }

    // Preparar os arquivos para o Gemini
    const requestBody = {
      contents: [
        systemPrompt,
        {
          role: "user",
          parts: [
            { text: `Aluno: ${body.studentName}
Disciplina: ${body.subject || 'Não especificada'}
Série: ${body.grade || 'Não especificada'}

Por favor, analise o gabarito e a prova do aluno e forneça a correção no formato JSON especificado.` },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: body.answerKeyFile
              }
            },
            {
              inlineData: {
                mimeType: "application/pdf", 
                data: body.studentTestFile
              }
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.3, // Mais determinístico para correção
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
      const errorText = await response.text()
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pela IA')
    }
    
    const candidate = data.candidates[0]
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('Estrutura de resposta inválida da IA')
    }
    
    const responseText = candidate.content.parts[0].text
    
    // Tentar extrair JSON da resposta (pode estar dentro de blocos de código)
    let jsonText = responseText
    
    // Se a resposta contém blocos de código markdown, extrair o conteúdo
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
    } else if (responseText.includes('```')) {
      // Se não tem especificação de linguagem, tentar extrair qualquer bloco de código
      const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/)
      if (codeMatch) {
        jsonText = codeMatch[1].trim()
      }
    }
    
    // Tentar fazer parse do JSON da resposta
    try {
      const correctionResult = JSON.parse(jsonText)
      return NextResponse.json(correctionResult)
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError)
      console.log("Texto recebido:", responseText)
      console.log("JSON extraído:", jsonText)
      
      // Se não conseguir fazer parse, retornar como texto
      return NextResponse.json({
        score: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        feedback: "Erro ao processar correção automática. Resposta da IA: " + responseText,
        corrections: [],
        strengths: [],
        improvements: []
      })
    }

  } catch (error) {
    console.error("Erro ao processar correção:", error)
    
    return NextResponse.json(
      { 
        error: `Erro na correção: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        score: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        feedback: "Erro ao processar correção automática.",
        corrections: [],
        strengths: [],
        improvements: []
      },
      { status: 500 }
    )
  }
} 