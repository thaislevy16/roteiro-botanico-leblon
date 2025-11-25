// components/TextFormatter.tsx
import React from 'react'

interface TextFormatterProps {
  text?: string
  italicizeTerms?: string[]
}

/**
 * Recebe um bloco de texto e:
 * 1) Separa em parágrafos onde houver linhas em branco
 * 2) Dentro de cada parágrafo, aplica <em> ao redor de cada termo em italicizeTerms
 */
export default function TextFormatter({
  text,
  italicizeTerms = [],
}: TextFormatterProps) {
  if (!text) return null

  // Quebra em parágrafos nas linhas em branco
  const paragraphs = text
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return (
    <>
      {paragraphs.map((p, idx) => {
        let html = p
        // para cada termo, envolve em <em> … </em>
        italicizeTerms.forEach((term) => {
          if (!term) return
          // escapa caracteres especiais no termo
          const esc = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
          const regex = new RegExp(`(${esc})`, 'gi')
          html = html.replace(regex, '<em>$1</em>')
        })

        return (
          <p
            key={idx}
            className="mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </>
  )
}

