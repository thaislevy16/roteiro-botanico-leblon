// utils/imageUtils.ts
import { Arvore } from '../components/types'

/**
 * Gera o nome da pasta baseado no nome da árvore
 * Converte para formato kebab-case (minúsculas, hífens)
 */
export function getImageFolderName(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais, mas mantém hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .trim()
}

/**
 * Verifica se uma imagem existe para uma árvore específica
 */
export function getImagePath(arvore: Arvore, categoria: string, extensao: string = 'jpg'): string | null {
  const folderName = getImageFolderName(arvore.nome)
  const imagePath = `/images/arvores/${categoria}/${folderName}.${extensao}`
  
  // Em produção, você pode verificar se o arquivo existe
  // Por enquanto, retornamos o caminho assumindo que existe
  return imagePath
}

/**
 * Gera todas as imagens disponíveis para uma árvore
 */
export function getArvoreImages(arvore: Arvore): Arvore['imagens'] {
  const folderName = getImageFolderName(arvore.nome)
  
  const imagens: Arvore['imagens'] = {}
  
  // Categorias de características botânicas
  const categoriasCaracteristicas = ['arvore', 'flor', 'folha', 'fruto', 'semente']
  const extensoesCaracteristicas = ['png', 'jpg'] // Priorizar PNG primeiro
  
  categoriasCaracteristicas.forEach(categoria => {
    const categoriaImagens: string[] = []
    
    // Primeira imagem (sem número)
    extensoesCaracteristicas.forEach(extensao => {
      const path = `/images/arvores/caracteristicas/${categoria}/${folderName}.${extensao}`
      categoriaImagens.push(path)
      return // Parar na primeira extensão
    })
    
    // Imagens numeradas (2, 3, 4, etc.)
    for (let i = 2; i <= 10; i++) { // Limitar a 10 imagens por categoria
      extensoesCaracteristicas.forEach(extensao => {
        const path = `/images/arvores/caracteristicas/${categoria}/${folderName}${i}.${extensao}`
        categoriaImagens.push(path)
      })
    }
    
    if (categoriaImagens.length > 0) {
      imagens[categoria as keyof typeof imagens] = categoriaImagens
    }
  })
  
  // Categorias especiais
  const categoriasEspeciais = ['curiosidades', 'visitantes']
  const extensoesEspeciais = ['jpg', 'png'] // Priorizar JPG primeiro para essas categorias
  
  categoriasEspeciais.forEach(categoria => {
    const categoriaImagens: string[] = []
    
    // Primeira imagem (sem número)
    extensoesEspeciais.forEach(extensao => {
      const path = `/images/arvores/${categoria}/${folderName}.${extensao}`
      categoriaImagens.push(path)
      return // Parar na primeira extensão
    })
    
    // Imagens numeradas (2, 3, 4, etc.)
    for (let i = 2; i <= 10; i++) { // Limitar a 10 imagens por categoria
      extensoesEspeciais.forEach(extensao => {
        const path = `/images/arvores/${categoria}/${folderName}${i}.${extensao}`
        categoriaImagens.push(path)
      })
    }
    
    if (categoriaImagens.length > 0) {
      imagens[categoria as keyof typeof imagens] = categoriaImagens
    }
  })
  
  return imagens
}

/**
 * Atualiza os dados de uma árvore com suas imagens
 */
export function addImagesToArvore(arvore: Arvore): Arvore {
  return {
    ...arvore,
    imagens: getArvoreImages(arvore)
  }
}

/**
 * Atualiza uma lista de árvores com suas imagens
 */
export function addImagesToArvores(arvores: Arvore[]): Arvore[] {
  return arvores.map(addImagesToArvore)
}
