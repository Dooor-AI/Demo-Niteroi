import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Estilização para títulos
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-gray-900 mb-2 mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 mb-2 mt-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-gray-800 mb-1 mt-2">
              {children}
            </h3>
          ),
          // Estilização para parágrafos
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          ),
          // Estilização para listas
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">
              {children}
            </li>
          ),
          // Estilização para negrito e itálico
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">
              {children}
            </em>
          ),
          // Estilização para links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          // Estilização para blocos de código
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          // Estilização para blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-200 pl-4 italic text-gray-600 mb-2">
              {children}
            </blockquote>
          ),
          // Estilização para tabelas
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-200">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-900">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 