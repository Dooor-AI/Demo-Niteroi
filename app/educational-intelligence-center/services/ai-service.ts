import { AIResponse, Message } from "../types";

export class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models";
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || "";
  }

  async generateResponse(messages: Message[], userInput: string): Promise<AIResponse> {
    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      conversationHistory.push({
        role: "user",
        parts: [{ text: userInput }],
      });

      const systemPrompt = {
        role: "user",
        parts: [
          {
            text: `Você é um assistente de inteligência educacional especializado em análise de dados educacionais. 
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
        
        Sempre seja analítico, claro e baseado em dados.`,
          },
        ],
      } as const;

      const requestBody = {
        contents: [systemPrompt, ...conversationHistory],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      } as const;

      const response = await fetch(
        `${this.apiUrl}/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.candidates[0].content.parts[0].text,
      };
    } catch (error) {
      console.error("Erro ao chamar API de IA:", error);
      return {
        content:
          "Desculpe, estou enfrentando dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async processFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;

          if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            const csvContent = content;
            const lines = csvContent.split("\n");
            const headers = lines[0]?.split(",") || [];
            const dataRows = lines.slice(1).filter((line) => line.trim());

            let analysis = `**Análise do arquivo CSV: ${file.name}**\n\n`;
            analysis += `**Estrutura dos dados:**\n`;
            analysis += `- Colunas: ${headers.length}\n`;
            analysis += `- Linhas de dados: ${dataRows.length}\n`;
            analysis += `- Cabeçalhos: ${headers.join(", ")}\n\n`;

            if (dataRows.length > 0) {
              analysis += `**Primeiras 5 linhas de dados:**\n`;
              analysis += "```\n";
              analysis += headers.join(", ") + "\n";
              dataRows.slice(0, 5).forEach((row) => {
                analysis += row + "\n";
              });
              analysis += "```\n\n";
            }

            resolve(analysis);
          } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            resolve(
              `**Arquivo PDF carregado: ${file.name}**\n\n` +
                `**Tamanho:** ${(file.size / 1024).toFixed(2)} KB\n\n` +
                `*Nota: Para análise completa de PDFs, é recomendado usar ferramentas especializadas.*`
            );
          } else {
            resolve(
              `**Arquivo carregado: ${file.name}**\n\n` +
                `**Tipo:** ${file.type}\n` +
                `**Tamanho:** ${(file.size / 1024).toFixed(2)} KB`
            );
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
}

