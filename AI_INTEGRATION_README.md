# Integração com API de IA - Tutor AI

Este componente foi adaptado para integrar com APIs de IA reais. Aqui estão as opções de configuração:

## 🔧 Configuração

### Opção 1: Gemini 2.0 Flash (Recomendado)

1. Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
NEXT_PUBLIC_AI_API_KEY=your_gemini_api_key_here
```

2. Obtenha sua API key em: https://makersuite.google.com/app/apikey

### Opção 2: OpenAI

1. Configure o arquivo `.env.local`:
```env
NEXT_PUBLIC_AI_API_URL=https://api.openai.com/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=sk-your_openai_api_key_here
```

2. Obtenha sua API key em: https://platform.openai.com/api-keys

### Opção 3: Claude (Anthropic)

1. Configure o arquivo `.env.local`:
```env
NEXT_PUBLIC_AI_API_URL=https://api.anthropic.com/v1/messages
NEXT_PUBLIC_AI_API_KEY=sk-ant-your_anthropic_api_key_here
```

2. Obtenha sua API key em: https://console.anthropic.com/

### Opção 4: API Route Local (Mais Seguro)

1. Configure o arquivo `.env.local`:
```env
NEXT_PUBLIC_AI_API_URL=/api/ai-chat
NEXT_PUBLIC_AI_API_KEY=
GEMINI_API_KEY=your_gemini_api_key_here
```

2. A API route local (`app/api/ai-chat/route.ts`) processará as chamadas de forma segura.

## 🚀 Funcionalidades Implementadas

### ✅ Recursos Adicionados:
- **Integração real com APIs de IA** (OpenAI, Claude, etc.)
- **Tratamento de erros** com mensagens amigáveis
- **Loading states** durante processamento
- **Quick actions** funcionais (explicar, exercícios, resumo)
- **Contexto de conversa** mantido entre mensagens
- **System prompt** especializado para educação
- **Tipagem TypeScript** completa

### 🔄 Melhorias no Componente:
- Substituição do mock por chamadas reais de API
- Gerenciamento de estado de erro
- Feedback visual durante carregamento
- Botões de ação rápida funcionais
- Desabilitação de inputs durante processamento

## 📝 Como Usar

1. **Configure sua API key** no arquivo `.env.local`
2. **Escolha sua API** (OpenAI, Claude, ou API route local)
3. **Execute o projeto** - o componente já está pronto para uso

## 🔒 Segurança

- **API Route Local**: Recomendado para produção, mantém sua API key segura no servidor
- **Variáveis de ambiente**: Nunca commite suas API keys no repositório
- **Tratamento de erros**: Implementado para falhas de rede e API

## 🎯 Personalização

### Modificar o System Prompt:
Edite o conteúdo do `systemPrompt` no arquivo `app/tutor-ai/page.tsx` ou `app/api/ai-chat/route.ts` para personalizar o comportamento do tutor.

### Adicionar Novas APIs:
1. Crie um novo método na classe `AIService`
2. Implemente a lógica específica da API
3. Configure as variáveis de ambiente correspondentes

## 🐛 Troubleshooting

### Erro "API key não configurada":
- Verifique se o arquivo `.env.local` existe
- Confirme se a variável `NEXT_PUBLIC_AI_API_KEY` está definida
- Reinicie o servidor de desenvolvimento

### Erro de rede:
- Verifique sua conexão com a internet
- Confirme se a URL da API está correta
- Verifique se sua API key é válida

### Respostas lentas:
- Ajuste o `max_tokens` no código
- Considere usar um modelo mais rápido
- Implemente cache se necessário

## 📚 Próximos Passos

1. **Implementar persistência** de conversas
2. **Adicionar autenticação** de usuários
3. **Implementar streaming** de respostas
4. **Adicionar upload de arquivos** para análise
5. **Criar dashboard** de métricas de uso 