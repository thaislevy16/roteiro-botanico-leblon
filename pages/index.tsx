// Backup do index.tsx original
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Arvore } from '../components/types'
import data from '../data/arvores.json'
import glossarioData from '../data/glossario.json'
import Logo from '../components/Logo'
import PageSpacing from '../components/PageSpacing'

const MapView = dynamic(() => import('../components/Map'), { ssr: false })

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

type Tab = 'about' | 'map' | 'list' | 'glossary'

// Interface para representar uma espécie única
interface EspecieUnica {
  nome: string
  nome_cientifico: string
  nome_cientifico_completo: string
  familia_botanica: string
  nomes_comuns: string
  primeiroId: string // ID da primeira ocorrência para o link
}

export default function Home() {
  const router = useRouter()
  const rawTab = Array.isArray(router.query.tab)
    ? router.query.tab[0]
    : router.query.tab || 'about'
  const initialTab: Tab = ['map', 'list', 'glossary'].includes(rawTab as string)
    ? (rawTab as Tab)
    : 'about'

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [commonNameFilter, setCommonNameFilter] = useState('')
  const [streetFilter, setStreetFilter] = useState('')
  const [familyFilter, setFamilyFilter] = useState('')
  const [scientificFilter, setScientificFilter] = useState('')
  const [glossaryFilter, setGlossaryFilter] = useState('')

  useEffect(() => {
    if (['about', 'map', 'list', 'glossary'].includes(rawTab as string)) {
      setActiveTab(rawTab as Tab)
    }
  }, [rawTab])

  // Função para normalizar nome científico (remover autores e normalizar)
  const normalizarNomeCientifico = (nome: string): string => {
    if (!nome) return nome
    
    // Remover autores e normalizar
    // Exemplo: "Persea americana Mill." -> "persea americana"
    // Exemplo: "Mimusops coriacea (A.DC.) Miq." -> "mimusops coriacea"
    // Exemplo: "Schinus terebinthifolia Raddi." -> "schinus terebinthifolia"
    return nome
      .replace(/\s+\([^)]+\)\s*.*$/, '') // Remove autores entre parênteses e tudo depois
      .replace(/\s+[A-Z][a-z]*\.?\s*$/, '') // Remove autores simples no final
      .replace(/\s+[A-Z][a-z]*\s*$/, '') // Remove autores sem ponto no final
      .toLowerCase()
      .trim()
  }

  // Função para agrupar árvores por espécie
  const agruparPorEspecie = (arvores: Arvore[]): EspecieUnica[] => {
    const especiesMap = new Map<string, EspecieUnica>()
    
    arvores.forEach(arvore => {
      const chave = normalizarNomeCientifico(arvore.nome_cientifico)
      
      if (!especiesMap.has(chave)) {
        especiesMap.set(chave, {
          nome: arvore.nome,
          nome_cientifico: arvore.nome_cientifico,
          nome_cientifico_completo: arvore.nome_cientifico_completo || arvore.nome_cientifico,
          familia_botanica: arvore.familia_botanica || '',
          nomes_comuns: arvore.nomes_comuns || '',
          primeiroId: arvore.id
        })
      }
    })
    
    return Array.from(especiesMap.values()).sort((a, b) => a.nome.localeCompare(b.nome))
  }

  const especiesUnicas = agruparPorEspecie(data as Arvore[])

  const filteredEspecies =
    activeTab === 'list'
      ? especiesUnicas.filter(especie => {
          // Buscar todas as árvores da mesma espécie para verificar localizações e trajetos
          const todasArvores = (data as Arvore[]).filter(a => 
            a.nome_cientifico === especie.nome_cientifico
          )
          const localizacoes = todasArvores.map(a => a.localizacao)
          
          // Verificar se pelo menos uma árvore da espécie está no Trajeto curto
          // Verifica tanto pelo campo "trajeto" quanto pelo "posicao_trajeto" que começa com "1."
          const temTrajetoCurto = todasArvores.some(arvore => {
            const trajeto = arvore.trajeto?.toLowerCase().trim()
            const posicao = arvore.posicao_trajeto?.trim()
            
            return (
              trajeto === 'trajeto curto' ||
              (posicao && posicao.startsWith('1.'))
            )
          })
          
          // Se não tem trajeto curto, não incluir na lista
          if (!temTrajetoCurto) {
            return false
          }
          
          // Aplicar filtros de busca apenas se a espécie está no trajeto curto
          return (
            especie.nome.toLowerCase().includes(commonNameFilter.trim().toLowerCase()) &&
            (streetFilter.trim() === '' || localizacoes.some(loc => 
              loc.toLowerCase().includes(streetFilter.trim().toLowerCase())
            )) &&
            especie.familia_botanica.toLowerCase().includes(familyFilter.trim().toLowerCase()) &&
            especie.nome_cientifico.toLowerCase().includes(scientificFilter.trim().toLowerCase())
          )
        })
      : especiesUnicas

  const filteredGlossary = 
    activeTab === 'glossary'
      ? (glossarioData as Array<{Termo: string, Definição: string}>).filter(termo => {
          const matchesSearch = termo.Termo.toLowerCase().includes(glossaryFilter.trim().toLowerCase()) ||
                               termo.Definição.toLowerCase().includes(glossaryFilter.trim().toLowerCase())
          
          return matchesSearch
        })
      : []

  // Função para agrupar termos por letra inicial
  const groupGlossaryByLetter = (terms: Array<{Termo: string, Definição: string}>) => {
    const groups: { [key: string]: Array<{Termo: string, Definição: string}> } = {}
    
    terms.forEach(termo => {
      // Normalizar acentos para agrupamento
      const normalizedFirstLetter = termo.Termo.charAt(0).toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      
      if (!groups[normalizedFirstLetter]) {
        groups[normalizedFirstLetter] = []
      }
      groups[normalizedFirstLetter].push(termo)
    })
    
    // Ordenar as letras alfabeticamente
    return Object.keys(groups)
      .sort()
      .map(letter => ({
        letter,
        terms: groups[letter].sort((a, b) => a.Termo.localeCompare(b.Termo))
      }))
  }



  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <PageSpacing>
        {/* Header */}
        <header className="bg-primary-bg px-4 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <Logo showText={false} />
            <div className="flex-1">
              {activeTab === 'about' && (
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-highlight">
                  Roteiro Botânico Digital do Leblon
                </h1>
              )}
              {activeTab === 'list' && (
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-highlight">
                  Lista de Espécies
                </h1>
              )}
              {activeTab === 'glossary' && (
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-highlight">
                  Glossário Botânico
                </h1>
              )}
            </div>
          </div>
          
          {/* Subtítulos abaixo do logo e título */}
          <div className="mt-4">
            {activeTab === 'about' && (
              <p className="text-sm sm:text-base md:text-lg text-gray-700">
                Bem-vindo ao Roteiro Botânico Digital do Leblon! Este projeto visa
                conscientizar sobre a flora urbana por meio de um guia interativo.
              </p>
            )}
            {activeTab === 'list' && (
              <p className="text-sm sm:text-base md:text-lg text-gray-700">
                Conheça as espécies presentes nas ruas, praças e canteiros do Leblon,
                Rio de Janeiro! Descubra informações essenciais, curiosidades e utilidades.
              </p>
            )}
            {activeTab === 'glossary' && (
              <p className="text-sm sm:text-base md:text-lg text-gray-700">
                Explore os termos botânicos utilizados nas descrições das espécies.
                Uma ferramenta essencial para compreender melhor o mundo das plantas!
              </p>
            )}
          </div>
        </header>

        <main className="p-2 sm:p-4 space-y-6">
          {activeTab === 'about' && (
            <section className="space-y-6">
              {/* Sobre o Projeto */}
              <div className="card-bubble p-4">
                <h2 className="text-lg sm:text-xl font-bold text-highlight mb-3">Sobre o Projeto</h2>
                <p className="text-base mb-3">
                  O <strong>Roteiro Botânico Digital do Leblon</strong> é uma iniciativa inovadora 
                  que visa promover a conscientização sobre a diversidade da flora urbana do bairro 
                  do Leblon, no Rio de Janeiro. Este projeto combina tecnologia, educação ambiental 
                  e conhecimento científico para criar uma experiência interativa e educativa.
                </p>
                <p className="text-base mb-3">
                  Através de um aplicativo web acessível, moradores e visitantes podem explorar 
                  as árvores do bairro, aprender sobre suas características botânicas, origens, 
                  utilidades e curiosidades, contribuindo para uma maior valorização do patrimônio 
                  verde urbano.
                </p>
              </div>

              {/* Colaboradores */}
              <div className="card-bubble p-4">
                <h2 className="text-lg sm:text-xl font-bold text-highlight mb-3">Colaboradores</h2>
                <p className="text-base mb-3">
                  Este projeto é resultado de uma parceria entre o <strong>Departamento de Biologia da PUC-Rio</strong> e a <strong>Associação de Moradores do Verde Leblon</strong>, 
                  unindo conhecimento acadêmico e engajamento comunitário.
                </p>
                <p className="text-base mb-3">
                  A iniciativa faz parte de um produto derivado do Trabalho de Conclusão de Curso 
                  (TCC) da aluna <strong>Thais Dias Ferrão Levy de Souza</strong>, do curso de Biologia na PUC-Rio, 
                  sob orientação dos professores <strong>Richieri Antonio Sartori</strong> e <strong>Mariana Reis de Brito</strong>.
                </p>
              </div>

              {/* Informações Gerais */}
              <div className="bg-highlight/10 rounded-lg p-3 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-highlight mb-4">ℹ️ Informações Importantes</h2>
                <ul className="text-base space-y-2">
                  <li>• <strong>Roteiros interativos:</strong> Cada trajeto possui árvores numeradas sequencialmente (#1, #2, #3...) para criar uma experiência interativa, incentivando os usuários a buscar a próxima árvore do roteiro</li>
                  <li>• <strong>Navegação facilitada:</strong> Use a numeração das árvores para seguir a ordem sugerida ou explore livremente</li>
                  <li>• <strong>Recomendações:</strong> Use calçados confortáveis e protetor solar</li>
                  <li>• <strong>Melhor horário:</strong> Durante a manhã ou final da tarde para melhor observação</li>
                  <li>• <strong>QR Codes:</strong> Cada árvore possui um QR Code para acesso rápido às informações</li>
                  <li>• <strong>Base científica:</strong> As informações são baseadas em levantamento botânico científico</li>
                  <li>• <strong>Total catalogado:</strong> <strong>123 árvores</strong> e <strong>71 espécies</strong> distribuídas nos três roteiros</li>
                </ul>
              </div>

              {/* Roteiros Propostos */}
              <div className="card-bubble p-4">
                <h2 className="text-lg sm:text-xl font-bold text-highlight mb-4">Roteiros Propostos</h2>
                
                {/* Trajeto Curto */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-highlight mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white">
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
                    Trajeto Curto - Praça Antero de Quental
                  </h3>
                  <p className="text-base text-gray-600 mb-2">
                    <strong>Duração:</strong> 30-45 minutos | <strong>Localização:</strong> Praça Antero de Quental | <strong>Árvores:</strong> 30 | <strong>Espécies:</strong> 29
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-base text-gray-600">
                      <strong>Principais espécies:</strong> Abricó-da-praia, Albizia, Arueira-pimenteira, Árvore-polvo, Babosa-branca, 
                      Canafistula, Chichá-fedorento, Coquinho-vermelho, Cycas, Embaúba, 
                      Figueira-lira, Flamboyant, Ipê-amarelo, Ipê-de-El-Salvador, Ipê-rosa, 
                      Jaqueira, Jurema, Leucena, Limoeiro, Mogno africano, Noni, Oliveira, 
                      Palmeira rabo-de-peixe, Pau-Brasil, Pau-ferro, Pau-formiga, Paineira, 
                      Sibipiruna e outras.
                    </p>
                  </div>
                </div>

                {/* Trajeto Médio */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-highlight mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white">
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
                    Trajeto Médio - Circuito Central
                  </h3>
                  <p className="text-base text-gray-600 mb-2">
                    <strong>Duração:</strong> 1-1.5 horas | <strong>Localização:</strong> Região central do Leblon | <strong>Árvores:</strong> 34 | <strong>Espécies:</strong> 30
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-base font-medium mb-1">Principais ruas e praças:</p>
                    <p className="text-base text-gray-600 mb-1">
                      <strong>Ruas:</strong> General Artigas, Avenida Ataulfo de Paiva, Dias Ferreira, 
                      Avenida Visconde de Albuquerque, Avenida Niemeyer, Jerônimo Monteiro, 
                      Avenida Delfim Moreira, Aristides Espinola, Rainha Guilhermina, General Venâncio Flores
                    </p>
                    <p className="text-base text-gray-600">
                      <strong>Praças:</strong> Atahualpa
                    </p>
                    <p className="text-base text-gray-600 mt-1">
                      <strong>Principais espécies:</strong> Algodoeiro-da-praia, Araucaria australiana, 
                      Árvore-da-borracha, Carrapeta, Coco-da-bahia, Figueira-lira, Figueira-religiosa, 
                      Flamboyant, Ipê-branco, Ipê-de-jardim, Jerivá, Jaqueira, Leucena, Limoeiro, 
                      Mangueira, Munguba, Oiti, Palmeira-imperial, Palmeira-triangular, Pau-Brasil, 
                      Pau-ferro, Peito-de-pombo, Pitangatuba, Resedá-gigante, Sibipiruna, Tamareira e outras.
                    </p>
                  </div>
                </div>

                {/* Trajeto Longo */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-highlight mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md border-2 border-white">
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
                    Trajeto Longo - Circuito Completo
                  </h3>
                  <p className="text-base text-gray-600 mb-2">
                    <strong>Duração:</strong> 2-3 horas | <strong>Localização:</strong> Todo o bairro do Leblon | <strong>Árvores:</strong> 59 | <strong>Espécies:</strong> 44
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-base font-medium mb-1">Principais ruas e praças:</p>
                    <p className="text-base text-gray-600 mb-1">
                      <strong>Ruas:</strong> Capitão César de Andrade, General Venâncio Flores, 
                      Almirante Guilhem, Humberto de Campos, Carlos Góis, Ataulfo de Paiva, 
                      Conde de Bernadotte, Cupertino Durão
                    </p>
                    <p className="text-base text-gray-600">
                      <strong>Praças:</strong> Cláudio Coutinho
                    </p>
                    <p className="text-base text-gray-600 mt-1">
                      <strong>Principais espécies:</strong> Abacateiro, Abricó-de-macaco, Aldrago, 
                      Ameixa-nespereira, Araucaria australiana, Arueira-pimenteira, Árvore-da-borracha, 
                      Árvore-polvo, Cássia-de-sião, Cássia-rosa, Cajá, Cajueiro, Café, Carambola, 
                      Chichá-fedorento, Chuva-de-ouro, Cycas, Embiruçu, Flamboyant, Figueira-vermelha, 
                      Ingá-branco, Ipê-amarelo, Ipê-rosa, Jambo, Jasmim-manga, Jaqueira, Jamelão, 
                      Mogno africano, Munguba, Murta, Oiti, Pata-de-vaca, Pau-Brasil, Pau-d'álho, 
                      Pau-ferro, Pau-formiga, Pau-rei, Paineira, Quaresmeira, Resedá mirim, 
                      Sibipiruna, Tamarindo e muitas outras.
                    </p>
                  </div>
                </div>

              </div>
            </section>
          )}

          {activeTab === 'list' && (
            <section className="pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Filtrar por nome comum"
                  value={commonNameFilter}
                  onChange={e => setCommonNameFilter(e.target.value)}
                  className="rounded-full bg-white/30 backdrop-blur-md px-4 py-2 shadow-soft w-full focus:ring-2 focus:ring-highlight"
                />
                <input
                  type="text"
                  placeholder="Filtrar por rua"
                  value={streetFilter}
                  onChange={e => setStreetFilter(e.target.value)}
                  className="rounded-full bg-white/30 backdrop-blur-md px-4 py-2 shadow-soft w-full focus:ring-2 focus:ring-highlight"
                />
                <input
                  type="text"
                  placeholder="Filtrar por família botânica"
                  value={familyFilter}
                  onChange={e => setFamilyFilter(e.target.value)}
                  className="rounded-full bg-white/30 backdrop-blur-md px-4 py-2 shadow-soft w-full focus:ring-2 focus:ring-highlight"
                />
                <input
                  type="text"
                  placeholder="Filtrar por nome científico"
                  value={scientificFilter}
                  onChange={e => setScientificFilter(e.target.value)}
                  className="rounded-full bg-white/30 backdrop-blur-md px-4 py-2 shadow-soft w-full focus:ring-2 focus:ring-highlight"
                />
                {/* Filtro de roteiro removido - apenas espécies do Trajeto curto são mostradas */}
                <div className="rounded-full bg-highlight/10 backdrop-blur-md px-4 py-2 shadow-soft w-full flex items-center gap-2 pointer-events-none">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <circle cx="12" cy="8" r="6" fill="#10b981"/>
                            <circle cx="9" cy="6" r="4" fill="#10b981"/>
                            <circle cx="15" cy="6" r="4" fill="#10b981"/>
                            <circle cx="12" cy="4" r="3" fill="#10b981"/>
                            <rect x="10.5" y="14" width="3" height="8" rx="1.5" fill="#8B4513"/>
                            <rect x="11" y="15" width="2" height="6" fill="#654321" opacity="0.7"/>
                            <circle cx="10" cy="7" r="2" fill="white" opacity="0.3"/>
                            <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.2"/>
                          </svg>
                  <span className="text-sm text-gray-700">Trajeto curto - Praça Antero de Quental</span>
                </div>
              </div>

              <ul className="space-y-3 pb-8">
                {filteredEspecies.map(especie => (
                  <li key={especie.nome_cientifico}>
                    <Link
                      href={`/arvore/${especie.primeiroId}`}
                      className="btn-bubble block text-center focus:outline-none hover:bg-highlight hover:text-white"
                    >
                      <div className="text-lg font-semibold">{especie.nome}</div>
                      <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: formatScientificName(especie.nome_cientifico) }}></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

         {activeTab === 'map' && (
           <div className="fixed inset-0 z-0">
             {/* Logo flutuante sobre o mapa */}
             <div className="absolute top-2 left-2 z-[1002]">
               <Logo showText={false} />
             </div>
             <MapView fullScreen={true} />
           </div>
         )}

         {activeTab === 'glossary' && (
           <section className="relative">
             <div className="mb-4">
               <input
                 type="text"
                 placeholder="Buscar termo ou definição..."
                 value={glossaryFilter}
                 onChange={e => setGlossaryFilter(e.target.value)}
                 className="rounded-full bg-white/30 backdrop-blur-md px-4 py-2 shadow-soft w-full focus:ring-2 focus:ring-highlight"
               />
             </div>

             {!glossaryFilter && (
               <div className="text-center mb-6">
                   <span className="text-sm text-gray-600">
                     {filteredGlossary.length} termos disponíveis no glossário
                   </span>
                 </div>
               )}

             <div className="space-y-6">
               {groupGlossaryByLetter(filteredGlossary).map(({ letter, terms }) => (
                 <div key={letter} className="space-y-3">
                   {/* Cabeçalho da letra */}
                   <div className="sticky top-0 z-20 bg-gradient-to-r from-highlight/10 to-highlight/5 backdrop-blur-md border-l-4 border-highlight shadow-lg px-4 py-3 mb-4">
                     <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-bold text-highlight">
                         {letter}
                       </h2>
                       <div className="bg-highlight/20 text-highlight px-3 py-1 rounded-full text-sm font-medium">
                         {terms.length} termo{terms.length !== 1 ? 's' : ''}
                       </div>
                     </div>
             </div>

                   {/* Termos desta letra */}
             <div className="space-y-3">
                     {terms.map((termo, index) => (
                       <div key={`${letter}-${index}`} className="card-bubble p-4">
                   <h3 className="text-base sm:text-lg font-semibold text-highlight mb-2">
                     {termo.Termo}
                   </h3>
                   <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                     {termo.Definição}
                   </p>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>

             {filteredGlossary.length === 0 && glossaryFilter && (
               <div className="text-center py-8">
                 <p className="text-gray-600">
                   Nenhum termo encontrado para "{glossaryFilter}"
                 </p>
               </div>
             )}

           </section>
         )}
         </main>

         {/* Rodapé - não aparece no mapa */}
         {activeTab !== 'map' && (
        <footer className="bg-primary-bg px-4 py-2 pb-28 sm:pb-2">
           <div className="max-w-screen-md mx-auto">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               {/* PUC-Rio Biologia */}
               <a 
                 href="https://www.biologia.puc-rio.br/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
               >
                 <img 
                   src="/images/logo-puc-rio.png" 
                   alt="Logo PUC-Rio" 
                   className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                 />
                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                   <div className="text-base sm:text-lg font-medium text-highlight truncate">PUC-Rio Biologia</div>
                   <div className="text-sm sm:text-base text-gray-600 line-clamp-2">Site oficial Biologia PUC-Rio</div>
                 </div>
               </a>

               {/* Instagram Bio PUC-Rio */}
               <a 
                 href="https://www.instagram.com/bio.pucrio/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
               >
                 <img 
                   src="/images/logo biopuc.png" 
                   alt="Logo Biologia PUC-Rio Instagram" 
                   className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                 />
                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                   <div className="text-base sm:text-lg font-medium text-highlight truncate">@bio.pucrio</div>
                   <div className="text-sm sm:text-base text-gray-600 line-clamp-2">Instagram oficial Biologia PUC-Rio</div>
                 </div>
               </a>

               {/* Instagram Restauração Ecológica */}
               <a 
                 href="https://www.instagram.com/restauracao_ecologica_pucrio/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
               >
                 <img 
                   src="/images/logo-insta.png" 
                   alt="Logo Instagram Restauração Ecológica" 
                   className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                 />
                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                   <div className="text-base sm:text-lg font-medium text-highlight break-words">@restauracao_ecologica_pucrio</div>
                   <div className="text-sm sm:text-base text-gray-600 line-clamp-2">Instagram oficial Restauração Ecológica PUC-Rio</div>
                 </div>
               </a>

               {/* Instagram Verde Leblon */}
               <a 
                 href="https://www.instagram.com/verdeleblon/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
               >
                 <img 
                   src="/images/logo verde leblon.png" 
                   alt="Logo Verde Leblon Instagram" 
                   className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                 />
                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                   <div className="text-base sm:text-lg font-medium text-highlight truncate">@verdeleblon</div>
                   <div className="text-sm sm:text-base text-gray-600 line-clamp-2">Instagram oficial Verde Leblon</div>
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
         )}
         
       </PageSpacing>
     </>
   )
 }
