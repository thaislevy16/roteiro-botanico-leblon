// components/PageSpacing.tsx
import React from 'react'

interface PageSpacingProps {
  children: React.ReactNode
  className?: string
}

export default function PageSpacing({ children, className = '' }: PageSpacingProps) {
  return (
    <div className={`mx-auto w-full max-w-screen-md px-4 sm:px-6 lg:px-8 font-body text-base text-gray-700 ${className}`}>
      {children}
      
      {/* Espaço para o bottom navigation - padronizado para todas as páginas */}
      <div className="h-32"></div>
    </div>
  )
}