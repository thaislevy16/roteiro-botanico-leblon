import React, { useState, useEffect, useRef } from 'react'

interface MapLegendProps {
  treeSvg: string
  trajetosVisiveis: {
    curto: boolean
    medio: boolean
    longo: boolean
  }
  toggleTrajeto: (trajeto: 'curto' | 'medio' | 'longo') => void
  mostrarTodosTrajetos: () => void
}

export default function MapLegend({ 
  treeSvg, 
  trajetosVisiveis, 
  toggleTrajeto, 
  mostrarTodosTrajetos 
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const legendRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora da legenda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (legendRef.current && !legendRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div
      ref={legendRef}
      className={`fixed top-6 right-6 z-[1000] bg-white/95 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 transition-all duration-500 ease-in-out transform ${
        isExpanded
          ? 'px-4 py-3 min-w-[200px] max-w-[300px] sm:max-w-[350px] scale-100 opacity-100'
          : 'px-6 py-3 min-w-[130px] max-w-[130px] scale-95 opacity-90 hover:scale-100 hover:opacity-100'
      }`}
    >
      {/* Cabeçalho clicável */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <span className="font-bold text-base text-gray-800 transition-all duration-300">Legenda</span>
            <button className="text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="transition-transform duration-300"
              >
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-highlight/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-highlight/20">
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                className="transition-transform duration-300"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 transition-all duration-300">Legenda</span>
          </div>
        )}
      </div>

      {/* Conteúdo expansível */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'max-h-[500px] opacity-100 mt-3' 
          : 'max-h-0 opacity-0 mt-0'
      }`}>
        <div className="space-y-3">
          {/* Árvores */}
          <div className={`flex items-center gap-3 mb-3 transition-all duration-300 delay-100 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}>
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="6" fill="#10b981"/>
                <circle cx="9" cy="6" r="4" fill="#10b981"/>
                <circle cx="15" cy="6" r="4" fill="#10b981"/>
                <circle cx="12" cy="4" r="3" fill="#10b981"/>
                <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-800">Árvore do roteiro</span>
          </div>
          
          {/* Usuário */}
          <div className={`flex items-center gap-3 mb-4 transition-all duration-300 delay-150 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}>
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
                <circle cx="12" cy="8" r="3" fill="#10b981"/>
                <path d="M12 11c-4 0-7 2-7 4v3h14v-3c0-2-3-4-7-4z" fill="#10b981"/>
                <path d="M9 18l1-2 1 2" stroke="#10b981" strokeWidth="1.5" fill="none"/>
                <path d="M15 18l-1-2-1 2" stroke="#10b981" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-800">Sua localização</span>
          </div>
          
          {/* Trajetos */}
          <div className={`border-t border-gray-200 pt-3 transition-all duration-300 delay-200 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}>
            <span className="text-xs font-semibold text-gray-600 mb-3 block">Trajetos:</span>
            
            <div className="space-y-3">
              {/* Trajeto Curto */}
              <div className={`flex items-center gap-3 transition-all duration-300 delay-300 ${
                isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <input
                  type="checkbox"
                  id="trajeto-curto"
                  checked={trajetosVisiveis.curto}
                  onChange={() => toggleTrajeto('curto')}
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500 transition-all duration-200 hover:scale-110"
                />
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-200 hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="6" fill="#10b981"/>
                    <circle cx="9" cy="6" r="4" fill="#10b981"/>
                    <circle cx="15" cy="6" r="4" fill="#10b981"/>
                    <circle cx="12" cy="4" r="3" fill="#10b981"/>
                    <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                    <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                    <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                    <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-gray-800">Praça Antero de Quental</span>
                  <span className="text-xs text-gray-600">30-45 min</span>
                </div>
              </div>
              
              {/* Trajeto Médio */}
              <div className={`flex items-center gap-3 transition-all duration-300 delay-350 ${
                isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <input
                  type="checkbox"
                  id="trajeto-medio"
                  checked={trajetosVisiveis.medio}
                  onChange={() => toggleTrajeto('medio')}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 transition-all duration-200 hover:scale-110"
                />
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-200 hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="6" fill="#f59e0b"/>
                    <circle cx="9" cy="6" r="4" fill="#f59e0b"/>
                    <circle cx="15" cy="6" r="4" fill="#f59e0b"/>
                    <circle cx="12" cy="4" r="3" fill="#f59e0b"/>
                    <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                    <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                    <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                    <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-gray-800">Circuito Central</span>
                  <span className="text-xs text-gray-600">1-1.5 horas</span>
                </div>
              </div>
              
              {/* Trajeto Longo */}
              <div className={`flex items-center gap-3 transition-all duration-300 delay-400 ${
                isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <input
                  type="checkbox"
                  id="trajeto-longo"
                  checked={trajetosVisiveis.longo}
                  onChange={() => toggleTrajeto('longo')}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500 transition-all duration-200 hover:scale-110"
                />
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform duration-200 hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="6" fill="#ec4899"/>
                    <circle cx="9" cy="6" r="4" fill="#ec4899"/>
                    <circle cx="15" cy="6" r="4" fill="#ec4899"/>
                    <circle cx="12" cy="4" r="3" fill="#ec4899"/>
                    <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                    <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                    <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                    <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-gray-800">Circuito Completo</span>
                  <span className="text-xs text-gray-600">2-3 horas</span>
                </div>
              </div>
            </div>
            
            {/* Botão de ação rápida */}
            <div className={`border-t border-gray-200 pt-3 mt-3 transition-all duration-300 delay-500 ${
              isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              <button
                onClick={mostrarTodosTrajetos}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Mostrar todos os trajetos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}