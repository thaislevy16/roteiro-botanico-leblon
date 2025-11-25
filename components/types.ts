export interface Arvore {
  id: string
  nome: string
  nome_cientifico: string
  nome_cientifico_completo?: string
  nomes_comuns?: string
  familia_botanica?: string
  localizacao: string
  trajeto?: string
  posicao_trajeto?: string
  status?: string
  
  // Múltiplas informações da mesma categoria
  origem_distribuicao?: string[]
  caracteristicas_botanicas?: string[]
  visitantes_botanicos?: string[]
  curiosidades?: string[]
  
  // Imagens organizadas por categoria (pode ter múltiplas imagens)
  imagens?: {
    arvore?: string[]
    flor?: string[]
    folha?: string[]
    fruto?: string[]
    semente?: string[]
    curiosidades?: string[]
    visitantes?: string[]
  }
  
  lat: number
  lng: number
  [key: string]: any
}
