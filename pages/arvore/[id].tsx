// pages/arvore/[id].tsx
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Arvore } from '../../components/types'
import data from '../../data/arvores.json'
import TextFormatter from '../../components/TextFormatter'
import FormattedContent from '../../components/FormattedContent'
import Logo from '../../components/Logo'
import PageSpacing from '../../components/PageSpacing'

// Função para formatar nomes científicos corretamente
function formatScientificName(name: string): string {
  if (!name) return name
  
  // Limpar quebras de linha e espaços extras
  const cleanName = name.replace(/[\r\n]/g, '').trim()
  
  // Regex mais robusta para capturar o binômio
  // Captura: Gênero + espaço + espécie (pode ter hífen ou apóstrofo)
  // Exemplo: "Albizia lebbeck (L.) Benth." -> "Albizia lebbeck" em itálico, " (L.) Benth." normal
  const scientificRegex = /^([A-Z][a-z]+ [a-z]+(?:[-'][a-z]+)*)(.*)$/
  const match = cleanName.match(scientificRegex)
  
  if (match) {
    const [, binomial, authors] = match
    return `<em>${binomial}</em>${authors}`
  }
  
  // Se não seguir o padrão, aplicar itálico a todo o nome
  return `<em>${cleanName}</em>`
}

// Componente para tratar imagens com fallback
function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [imgError, setImgError] = useState(false)
  
  if (imgError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm">Imagem não disponível</p>
        </div>
      </div>
    )
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  )
}

export default function ArvorePage() {
  const router = useRouter()
  const id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id || ''

  const [arvore, setArvore] = useState<Arvore | null>(null)
  const [activeTab, setActiveTab] = useState<string>('')

  useEffect(() => {
    setArvore((data as Arvore[]).find(a => a.id === id) || null)
  }, [id])

  useEffect(() => {
    const rawTab = Array.isArray(router.query.tab)
      ? router.query.tab[0]
      : router.query.tab || ''
    setActiveTab(rawTab)
  }, [router.query.tab])

  if (!arvore) {
    return (
      <div className="mx-auto w-full max-w-screen-md px-4 sm:px-6 lg:px-8 font-body text-base text-on-primary">
        <div className="p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-highlight mb-4">Árvore não encontrada</h1>
          <p className="text-gray-600 mb-6">A árvore com ID "{id}" não foi encontrada no banco de dados.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-highlight text-white px-6 py-2 rounded-lg hover:bg-highlight-dark transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  const sections: { field: keyof Arvore; label: string; buttonLabel: string; color: string; icon: string }[] = [
    { field: 'taxonomia',                label: 'Taxonomia', buttonLabel: 'Taxonomia', color: 'indigo', icon: '🔬' },
    { field: 'localizacao',              label: 'Onde encontrar?', buttonLabel: 'Localização', color: 'emerald', icon: '🔍' },
    { field: 'status',                   label: 'Nativa ou exótica?', buttonLabel: 'Status', color: 'sky', icon: '🌍' },
    { field: 'origem_distribuicao',      label: 'Origem e distribuição', buttonLabel: 'Origem', color: 'purple', icon: '🗺️' },
    { field: 'caracteristicas_botanicas',label: 'Características botânicas', buttonLabel: 'Características', color: 'lime', icon: '🌿' },
    { field: 'visitantes_botanicos',     label: 'Visitantes botânicos', buttonLabel: 'Visitantes', color: 'coral', icon: '🦋' },
    { field: 'curiosidades',             label: 'Curiosidades', buttonLabel: 'Curiosidades', color: 'amber', icon: '💡' },
  ]

  const handleSectionClick = (field: keyof Arvore) => {
    setActiveTab(field as string)
    const el = document.getElementById(field as string)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <PageSpacing>
        {/* Header */}
        <header className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <Logo showText={false} />
            <div className="flex-1">
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-green-700">
                {arvore.nome}
              </h1>
            </div>
          </div>
        </header>

        <main className="p-2 sm:p-4 space-y-4">
          
          {/* Section navigation, horizontal scrollable */}
          <nav
            className="
              sticky top-4 z-10
              flex justify-center
              bg-white shadow-soft rounded-full
              px-2 py-2
              overflow-x-auto
              scrollbar-hide
            "
          >
            <div className="flex gap-0.5 min-w-max">
              {sections.map(({ field, label, buttonLabel, color }) => {
                const isActive = activeTab === field
                const getColorClasses = (isActive: boolean) => {
                  // Padronizado com o bottom nav - sistema de cores consistente
                  return isActive
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }

                return (
                  <button
                    key={field}
                    onClick={() => handleSectionClick(field)}
                    className={`
                      flex items-center justify-center
                      transition-colors duration-200
                      ${getColorClasses(isActive)}
                      h-10 rounded-full
                      px-3 py-1
                      text-xs font-medium
                      whitespace-nowrap
                      flex-shrink-0
                      min-w-fit
                    `}
                    aria-label={label}
                  >
                    {buttonLabel}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Sections and images */}
          {sections.map(({ field, label, color, icon }) => {
            const content = arvore[field] as string | string[]
            const isEmpty = field === 'taxonomia' 
              ? false // Taxonomia sempre tem conteúdo (nome científico)
              : Array.isArray(content) 
                ? content.length === 0 || content.every(item => !item || item.trim() === '')
                : !content || content.trim() === '' || content === 'undefined';

            const getSectionClasses = (color: string) => {
              const colorMap = {
                indigo: 'bg-indigo/20 border-indigo/40 shadow-indigo/30',
                emerald: 'bg-emerald/20 border-emerald/40 shadow-emerald/30',
                sky: 'bg-sky/20 border-sky/40 shadow-sky/30',
                purple: 'bg-purple/20 border-purple/40 shadow-purple/30',
                lime: 'bg-lime/20 border-lime/40 shadow-lime/30',
                coral: 'bg-coral/20 border-coral/40 shadow-coral/30',
                amber: 'bg-amber/20 border-amber/40 shadow-amber/30',
              }
              return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 border-gray-200'
            }

            const getTitleClasses = (color: string) => {
              // Sistema de cores padronizado
              return 'text-gray-800'
            }
              
            return (
              <div key={field} className="space-y-3">
                <section
                  id={`${field}`}
                  className={`rounded-xl p-4 shadow-lg border-2 scroll-mt-20 hover:shadow-xl transition-all duration-300 ${getSectionClasses(color)}`}
                >
                  <h2 className={`font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-4 flex items-center ${getTitleClasses(color)}`}>
                    <span className="text-2xl mr-3">{icon}</span>
                    {label}
                  </h2>
                  {isEmpty ? (
                    <div className="text-center py-8">
                      <p className="text-base text-gray-500 italic">Informação será adicionada em breve.</p>
                    </div>
                  ) : field === 'taxonomia' ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-base">
                          Nome Científico
                        </h3>
                        <p 
                          className="text-base text-gray-800"
                          dangerouslySetInnerHTML={{ 
                            __html: formatScientificName(arvore.nome_cientifico_completo || arvore.nome_cientifico) 
                          }} 
                        />
                      </div>
                      
                      {arvore.familia_botanica && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 text-base">
                            Família Botânica
                          </h3>
                          <p className="text-base text-gray-800">
                            {arvore.familia_botanica}
                          </p>
                        </div>
                      )}
                      
                      {arvore.nomes_comuns && arvore.nomes_comuns.trim() !== '' && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 text-base">
                            Nomes Comuns
                          </h3>
                          <div className="text-base text-gray-800">
                            {arvore.nomes_comuns.split(',').map((nome, index) => (
                              <span key={index} className="inline-block">
                                <span className="bg-indigo/20 text-gray-800 px-3 py-1 rounded-full text-sm mr-2 mb-2 border border-indigo/50">
                                  {nome.trim()}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : field === 'localizacao' ? (
                    <>
                      <p className="text-base mb-4 text-gray-600">Esta espécie pode ser encontrada nas seguintes localizações do Leblon:</p>
                      <div className="space-y-4">
                        {(() => {
                          // Buscar todas as árvores da mesma espécie para mostrar todas as localizações
                          const todasArvores = (data as Arvore[]).filter(a => 
                            a.nome_cientifico === arvore.nome_cientifico
                          )
                          const localizacoesUnicas = Array.from(new Set(todasArvores.map(a => a.localizacao)))
                          const roteirosUnicos = Array.from(new Set(todasArvores.map(a => a.trajeto).filter((trajeto): trajeto is string => Boolean(trajeto))))
                          
                          return (
                            <>
                              {/* Roteiros */}
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2 text-base">
                                  Roteiros Disponíveis
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {roteirosUnicos.map((roteiro, index) => {
                                    const getRoteiroInfo = (roteiro: string) => {
                                      switch(roteiro) {
                                        case 'Trajeto curto': 
                                          return {
                                            color: 'bg-emerald/25 text-gray-800 border-emerald/50',
                                            treeColor: '#10b981'
                                          }
                                        case 'Trajeto médio': 
                                          return {
                                            color: 'bg-emerald/25 text-gray-800 border-emerald/50',
                                            treeColor: '#f59e0b'
                                          }
                                        case 'Trajeto longo': 
                                          return {
                                            color: 'bg-emerald/25 text-gray-800 border-emerald/50',
                                            treeColor: '#ec4899'
                                          }
                                        default: 
                                          return {
                                            color: 'bg-emerald/25 text-gray-800 border-emerald/50',
                                            treeColor: '#6b7280'
                                          }
                                      }
                                    }
                                    
                                    const roteiroInfo = getRoteiroInfo(roteiro)
                                    
                                    return (
                                      <span 
                                        key={index} 
                                        className={`px-3 py-1 rounded-full text-base border flex items-center gap-2 ${roteiroInfo.color}`}
                                      >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="8" r="6" fill={roteiroInfo.treeColor}/>
                                            <circle cx="9" cy="6" r="4" fill={roteiroInfo.treeColor}/>
                                            <circle cx="15" cy="6" r="4" fill={roteiroInfo.treeColor}/>
                                            <circle cx="12" cy="4" r="3" fill={roteiroInfo.treeColor}/>
                                            <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                                            <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                                            <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                                            <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                                          </svg>
                                        </div>
                                        {roteiro}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                              
                              {/* Localizações */}
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-2 text-base">
                                  Localizações Específicas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {localizacoesUnicas.map((localizacao, index) => (
                                    <span 
                                      key={index} 
                                      className="px-3 py-1 rounded-full text-base border flex items-center gap-2 bg-emerald/25 text-gray-800 border-emerald/50"
                                    >
                                      <span className="text-highlight text-base">📍</span>
                                      {localizacao}
                                    </span>
                                  ))}
                                </div>
                            </div>
                            </>
                          )
                        })()}
                      </div>
                    </>
                  ) : field === 'caracteristicas_botanicas' ? (
                    <FormattedContent 
                      content={content} 
                      type="caracteristicas" 
                      color={color}
                      arvore={arvore}
                    />
                  ) : field === 'visitantes_botanicos' ? (
                    <FormattedContent 
                      content={content} 
                      type="visitantes" 
                      color={color}
                      arvore={arvore}
                    />
                  ) : field === 'curiosidades' ? (
                    <FormattedContent 
                      content={content} 
                      type="curiosidades" 
                      color={color}
                      arvore={arvore}
                    />
                  ) : field === 'origem_distribuicao' ? (
                    <FormattedContent 
                      content={content} 
                      type="origem" 
                      color={color}
                    />
                  ) : field === 'status' ? (
                    <FormattedContent 
                      content={content} 
                      type="status" 
                      color={color}
                    />
                  ) : (
                    <TextFormatter text={Array.isArray(content) ? content.join(' ') : content} italicizeTerms={[arvore.nome_cientifico]} />
                  )}
                </section>
              </div>
            )
          })}
        </main>

        {/* Rodapé */}
        <footer className="bg-primary-bg px-4 py-2">
          <div className="max-w-screen-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {/* PUC-Rio Biologia */}
              <a 
                href="https://www.biologia.puc-rio.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <img 
                  src="/images/logo-puc-rio.png" 
                  alt="Logo PUC-Rio" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-highlight">PUC-Rio Biologia</div>
                  <div className="text-xs text-gray-600">Site oficial Biologia PUC-Rio</div>
                </div>
              </a>

              {/* Instagram Bio PUC-Rio */}
              <a 
                href="https://www.instagram.com/bio.pucrio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <img 
                  src="/images/logo biopuc.png" 
                  alt="Logo Biologia PUC-Rio Instagram" 
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-highlight">@bio.pucrio</div>
                  <div className="text-xs text-gray-600">Instagram oficial Biologia PUC-Rio</div>
                </div>
              </a>

              {/* Instagram Restauração Ecológica */}
              <a 
                href="https://www.instagram.com/restauracao_ecologica_pucrio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <img 
                  src="/images/logo-insta.png" 
                  alt="Logo Instagram Restauração Ecológica" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-highlight">@restauracao_ecologica_pucrio</div>
                  <div className="text-xs text-gray-600">Instagram oficial Restauração Ecológica PUC-Rio</div>
                </div>
              </a>

              {/* Instagram Verde Leblon */}
              <a 
                href="https://www.instagram.com/verdeleblon/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <img 
                  src="/images/logo verde leblon.png" 
                  alt="Logo Verde Leblon Instagram" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-highlight">@verdeleblon</div>
                  <div className="text-xs text-gray-600">Instagram oficial Verde Leblon</div>
                </div>
              </a>
            </div>
          </div>

          {/* Seção de Contato */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <h3 className="text-base font-medium text-highlight mb-2">
                Dúvidas, sugestões ou problemas técnicos?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Entre em contato conosco clicando no botão abaixo. Sua opinião é importante para melhorarmos continuamente o site.
              </p>
              <a
                href="https://wa.me/5521968723520?text=Olá! Entrei em contato através do site do Roteiro Botânico Digital do Leblon para registrar uma dúvida/sugestão/problema técnico. Peço, por gentileza, que analisem a solicitação e retornem assim que possível. Atenciosamente,"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Enviar WhatsApp
              </a>
            </div>
          </div>
        </footer>
      </PageSpacing>
    </>
  )
}
