import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import data from '../data/arvores.json'
import { Arvore } from './types'

// Importação dinâmica do mapa para evitar problemas de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })
const MapLegend = dynamic(() => import('./Maplegend'), { ssr: false })

// Importação dinâmica do Leaflet
let L: any = null
if (typeof window !== 'undefined') {
  L = require('leaflet')
  require('leaflet/dist/leaflet.css')
}

// SVG árvore para a legenda
const treeSvg = `
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="15" fill="#6ee7b7"/>
    <circle cx="26" cy="14" r="10" fill="#34d399"/>
    <rect x="17" y="28" width="6" height="10" rx="3" fill="#92400e"/>
  </svg>
`

export default function MapView({ fullScreen = false }: { fullScreen?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Estado para controlar quais trajetos estão visíveis
  const [trajetosVisiveis, setTrajetosVisiveis] = useState({
    curto: true,
    medio: true,
    longo: true
  })

  // Função para organizar as árvores por trajeto
  const trajetos = useMemo(() => {
    const arvores = data as Arvore[]
    
    // Função para calcular distância entre duas coordenadas (em metros)
    const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371e3 // Raio da Terra em metros
      const φ1 = lat1 * Math.PI / 180
      const φ2 = lat2 * Math.PI / 180
      const Δφ = (lat2 - lat1) * Math.PI / 180
      const Δλ = (lng2 - lng1) * Math.PI / 180
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      
      return R * c
    }
    
    // Função para criar trajetos contínuos sem quebras por distância
    const criarTrajetoContinuo = (arvoresTrajeto: Arvore[], maxDistancia: number = 500) => {
      if (arvoresTrajeto.length <= 1) return arvoresTrajeto
      
      const resultado: Arvore[] = []
      let arvoreAtual = arvoresTrajeto[0]
      resultado.push(arvoreAtual)
      
      for (let i = 1; i < arvoresTrajeto.length; i++) {
        const proximaArvore = arvoresTrajeto[i]
        const distancia = calcularDistancia(
          arvoreAtual.lat, arvoreAtual.lng,
          proximaArvore.lat, proximaArvore.lng
        )
        
        // Se a próxima árvore estiver muito longe, não conectar
        if (distancia > maxDistancia) {
          break
        }
        
        resultado.push(proximaArvore)
        arvoreAtual = proximaArvore
      }
      
      return resultado
    }
    
    // Função para ordenar corretamente as posições do trajeto
    const ordenarPorPosicaoTrajeto = (a: Arvore, b: Arvore): number => {
      const posA = a.posicao_trajeto || '0'
      const posB = b.posicao_trajeto || '0'
      
      // Se ambas as posições são 1.00, 2.00, 3.00, ordenar por nome
      if (posA.endsWith('.00') && posB.endsWith('.00')) {
        return a.nome.localeCompare(b.nome)
      }
      
      // Se uma é .00 e outra não, a .00 vem depois
      if (posA.endsWith('.00') && !posB.endsWith('.00')) return 1
      if (!posA.endsWith('.00') && posB.endsWith('.00')) return -1
      
      // Caso contrário, ordenar numericamente
      return parseFloat(posA) - parseFloat(posB)
    }
    
    // Agrupar árvores por trajeto
    const trajetoCurto = arvores
      .filter(a => a.posicao_trajeto && a.posicao_trajeto.startsWith('1.'))
      .sort(ordenarPorPosicaoTrajeto)
    
    const trajetoMedio = arvores
      .filter(a => a.posicao_trajeto && a.posicao_trajeto.startsWith('2.'))
      .sort(ordenarPorPosicaoTrajeto)
    
    const trajetoLongo = arvores
      .filter(a => a.posicao_trajeto && a.posicao_trajeto.startsWith('3.'))
      .sort(ordenarPorPosicaoTrajeto)
    
    // Criar trajetos contínuos (sem quebras por distância)
    const trajetoCurtoContinuo = criarTrajetoContinuo(trajetoCurto, 300) // 300m para trajeto curto
    const trajetoMedioContinuo = criarTrajetoContinuo(trajetoMedio, 400) // 400m para trajeto médio
    const trajetoLongoContinuo = criarTrajetoContinuo(trajetoLongo, 500) // 500m para trajeto longo
    
    return {
      curto: trajetoCurtoContinuo,
      medio: trajetoMedioContinuo,
      longo: trajetoLongoContinuo
    }
  }, [])

  // Função para alternar visibilidade de um trajeto
  const toggleTrajeto = (trajeto: keyof typeof trajetosVisiveis) => {
    setTrajetosVisiveis(prev => ({
      ...prev,
      [trajeto]: !prev[trajeto]
    }))
  }

  // Função para mostrar apenas um trajeto específico
  const mostrarApenasTrajeto = (trajeto: keyof typeof trajetosVisiveis) => {
    setTrajetosVisiveis({
      curto: trajeto === 'curto',
      medio: trajeto === 'medio',
      longo: trajeto === 'longo'
    })
  }

  // Função para mostrar todos os trajetos
  const mostrarTodosTrajetos = () => {
    setTrajetosVisiveis({
      curto: true,
      medio: true,
      longo: true
    })
  }

  // Função para obter o nome específico do trajeto
  const obterNomeTrajeto = (trajeto: string): string => {
    switch (trajeto) {
      case 'Trajeto curto':
        return 'Praça Antero de Quental'
      case 'Trajeto médio':
        return 'Circuito Central'
      case 'Trajeto longo':
        return 'Circuito Completo'
      default:
        return trajeto
    }
  }

  // Função para obter o número da árvore no roteiro
  const obterNumeroRoteiro = (posicaoTrajeto: string): number | null => {
    if (!posicaoTrajeto) return null
    
    // Extrair o número após o ponto (ex: "1.15" -> 15)
    const partes = posicaoTrajeto.split('.')
    if (partes.length >= 2) {
      const numero = parseInt(partes[1])
      return isNaN(numero) ? null : numero
    }
    
    return null
  }

  // Função para criar coordenadas de linha para um trajeto
  const criarCoordenadasTrajeto = (arvores: Arvore[]): [number, number][] => {
    return arvores.map(arvore => [arvore.lat, arvore.lng] as [number, number])
  }

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const newUserPos = [coords.latitude, coords.longitude] as [number, number]
        setUserPos(newUserPos)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watcher)
  }, [isClient])

  const center: [number, number] = [-22.983169, -43.223647]
  const zoomLevel = 19

  // Não renderizar se não estivermos no cliente
  if (!isClient || !L) {
    return (
      <div className="relative w-full h-screen fixed inset-0 z-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
          <p className="text-highlight">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen fixed inset-0 z-0">

      <MapContainer
        center={center}
        zoom={zoomLevel}
        maxZoom={19}
        minZoom={12}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution="© Google Maps"
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={19}
        />
        
        {/* Linhas dos trajetos - SÓ MOSTRAR SE ESTIVER VISÍVEL */}
        {trajetosVisiveis.curto && trajetos.curto.length > 1 && (
          <Polyline
            positions={criarCoordenadasTrajeto(trajetos.curto)}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }}
          />
        )}
        {trajetosVisiveis.medio && trajetos.medio.length > 1 && (
          <Polyline
            positions={criarCoordenadasTrajeto(trajetos.medio)}
            pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8 }}
          />
        )}
        {trajetosVisiveis.longo && trajetos.longo.length > 1 && (
          <Polyline
            positions={criarCoordenadasTrajeto(trajetos.longo)}
            pathOptions={{ color: '#ec4899', weight: 4, opacity: 0.8 }}
          />
        )}
        
        {/* Marcadores das árvores */}
        {(data as Arvore[]).map(arvore => {
          // FILTRO CRÍTICO: Não renderizar árvores com posição .00 (coordenadas placeholder)
          // Essas árvores não têm posição real no trajeto e causam sobreposição
          if (arvore.posicao_trajeto?.endsWith('.00')) {
            return null
          }
          
          // Verificar se o trajeto da árvore está visível
          let trajetoVisivel = false
          if (arvore.posicao_trajeto?.startsWith('1.') && trajetosVisiveis.curto) trajetoVisivel = true
          else if (arvore.posicao_trajeto?.startsWith('2.') && trajetosVisiveis.medio) trajetoVisivel = true
          else if (arvore.posicao_trajeto?.startsWith('3.') && trajetosVisiveis.longo) trajetoVisivel = true
          
          // Se o trajeto não estiver visível, não renderizar a árvore
          if (!trajetoVisivel) return null
          
          // Determinar cor baseada no trajeto
          let corTrajeto = '#10b981' // verde padrão
          if (arvore.posicao_trajeto?.startsWith('1.')) corTrajeto = '#10b981' // verde para curto
          else if (arvore.posicao_trajeto?.startsWith('2.')) corTrajeto = '#f59e0b' // laranja para médio
          else if (arvore.posicao_trajeto?.startsWith('3.')) corTrajeto = '#ec4899' // rosa para longo
          
          return (
            <Marker
              key={`${arvore.id}-${arvore.posicao_trajeto}-${arvore.nome}`}
              position={[arvore.lat, arvore.lng]}
              icon={L.divIcon({
                html: `
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
                    border: 2px solid white;
                  ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <!-- Copa da árvore - formato clássico de árvore -->
                      <circle cx="12" cy="8" r="6" fill="${corTrajeto}"/>
                      <circle cx="9" cy="6" r="4" fill="${corTrajeto}"/>
                      <circle cx="15" cy="6" r="4" fill="${corTrajeto}"/>
                      <circle cx="12" cy="4" r="3" fill="${corTrajeto}"/>
                      <!-- Tronco -->
                      <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                      <!-- Detalhes do tronco -->
                      <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                      <!-- Destaque na copa -->
                      <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                      <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                    </svg>
                  </div>
                `,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            >
              <Popup>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-highlight">{arvore.nome}</h3>
                    {arvore.posicao_trajeto && obterNumeroRoteiro(arvore.posicao_trajeto) && (
                      <span className="bg-highlight text-white text-xs font-bold px-2 py-1 rounded-full">
                        #{obterNumeroRoteiro(arvore.posicao_trajeto)}
                      </span>
                    )}
                  </div>
                  {arvore.trajeto && (
                    <div className="text-sm text-gray-600">
                      <strong>Trajeto:</strong> {obterNomeTrajeto(arvore.trajeto)}
                    </div>
                  )}
                  <a
                    href={`/arvore/${arvore.id}`}
                    className="inline-block mt-2 px-3 py-1.5 text-sm font-medium rounded-full border-2 border-highlight text-highlight hover:bg-highlight hover:text-white transition"
                  >
                    Mais detalhes
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {userPos && (
          <>
            <Circle center={userPos} radius={20} pathOptions={{ color: '#10b981', fillOpacity: 0.2 }} />
            <Marker 
              position={userPos} 
              icon={L.divIcon({
                className: '',
                html: `
                  <div style="
                    width: 24px; 
                    height: 24px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
                    border: 2px solid white;
                  ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
                      <!-- Cabeça -->
                      <circle cx="12" cy="8" r="3" fill="#10b981"/>
                      <!-- Corpo -->
                      <path d="M12 11c-4 0-7 2-7 4v3h14v-3c0-2-3-4-7-4z" fill="#10b981"/>
                      <!-- Pernas em movimento -->
                      <path d="M9 18l1-2 1 2" stroke="#10b981" stroke-width="1.5" fill="none"/>
                      <path d="M15 18l-1-2-1 2" stroke="#10b981" stroke-width="1.5" fill="none"/>
                    </svg>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>Você está aqui</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Legenda no topo direito */}
      <div className="absolute top-4 right-4 z-[1001]">
        <MapLegend 
          treeSvg={treeSvg}
          trajetosVisiveis={trajetosVisiveis}
          toggleTrajeto={toggleTrajeto}
          mostrarTodosTrajetos={mostrarTodosTrajetos}
        />
      </div>
    </div>
  )
}
