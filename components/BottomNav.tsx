// components/BottomNav.tsx
import React from 'react'
import { useRouter } from 'next/router'

const navItems = [
  { tab: 'about', label: 'ℹ️', text: 'Sobre' },
  { tab: 'map',   label: '🗺️', text: 'Mapa' },
  { tab: 'list',  label: '🌳', text: 'Espécies' },
  { tab: 'glossary', label: '📚', text: 'Glossário' },
]

export default function BottomNav() {
  const { pathname, query, push } = useRouter()
  const isHome = pathname === '/'
  const current = isHome
    ? Array.isArray(query.tab)
      ? query.tab[0]
      : (query.tab as string) || 'about'
    : ''

  const handleClick = (tab: string) => {
    push({ pathname: '/', query: { tab } })
  }

  return (
    <nav
      className="
        fixed bottom-4 inset-x-0 mx-auto
        max-w-xs
        bg-white shadow-soft rounded-full
        flex justify-around items-center
        px-4 py-3
        z-50
        mb-2
      "
    >
      {navItems.map(({ tab, label, text }) => {
        const active = isHome && current === tab
        return (
          <button
            key={tab}
            onClick={() => handleClick(tab)}
            disabled={active}
            className={`
              flex flex-col items-center justify-center
              transition-colors duration-200
              ${active
                ? 'bg-green-500 text-white'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}
              w-16 h-16 rounded-full
            `}
            aria-label={text}
          >
            <span className="text-3xl leading-none">{label}</span>
            <span className="text-[0.65rem] mt-1 leading-tight">{text}</span>
          </button>
        )
      })}
    </nav>
  )
}
