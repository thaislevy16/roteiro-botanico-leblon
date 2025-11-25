// scripts/parseExcel.js
const fs   = require('fs')
const path = require('path')
const xlsx = require('xlsx')           // ← aqui você precisa desta linha

// agora o resto do script...
const arquivoExcel = path.join(__dirname, '../data/arvores trajetos.xlsx')
if (!fs.existsSync(arquivoExcel)) {
  console.error(`❌ Não achei a planilha em: ${arquivoExcel}`)
  process.exit(1)
}

const workbook  = xlsx.readFile(arquivoExcel)
const sheetName = workbook.SheetNames[0]
const raw      = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

// Função para gerar nome da pasta de imagens
function getImageFolderName(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais, mas mantém hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .trim()
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
  const fs = require('fs')
  const path = require('path')
  const fullPath = path.join(__dirname, '..', 'public', filePath)
  return fs.existsSync(fullPath)
}

// Função para gerar imagens disponíveis (incluindo múltiplas imagens)
function getArvoreImages(nome) {
  const folderName = getImageFolderName(nome)
  
  const imagens = {}
  
  // Categorias de características botânicas
  const categoriasCaracteristicas = ['arvore', 'flor', 'folha', 'fruto', 'semente']
  const extensoesCaracteristicas = ['png', 'jpg'] // Priorizar PNG primeiro
  
  categoriasCaracteristicas.forEach(categoria => {
    const categoriaImagens = []
    
    // Primeira imagem (sem número)
    extensoesCaracteristicas.forEach(extensao => {
      const path = `/images/arvores/caracteristicas/${categoria}/${folderName}.${extensao}`
      if (fileExists(path)) {
        categoriaImagens.push(path)
        return // Parar na primeira extensão encontrada
      }
    })
    
    // Imagens numeradas (2, 3, 4, etc.)
    for (let i = 2; i <= 10; i++) { // Limitar a 10 imagens por categoria
      let found = false
      extensoesCaracteristicas.forEach(extensao => {
        const path = `/images/arvores/caracteristicas/${categoria}/${folderName}${i}.${extensao}`
        if (fileExists(path)) {
          categoriaImagens.push(path)
          found = true
        }
      })
      if (!found) break // Se não encontrou a imagem i, não vai ter i+1
    }
    
    if (categoriaImagens.length > 0) {
      imagens[categoria] = categoriaImagens
    }
  })
  
  // Categorias especiais
  const categoriasEspeciais = ['curiosidades', 'visitantes']
  const extensoesEspeciais = ['jpg', 'png'] // Priorizar JPG primeiro para essas categorias
  
  categoriasEspeciais.forEach(categoria => {
    const categoriaImagens = []
    
    // Primeira imagem (sem número)
    extensoesEspeciais.forEach(extensao => {
      const path = `/images/arvores/${categoria}/${folderName}.${extensao}`
      if (fileExists(path)) {
        categoriaImagens.push(path)
        return // Parar na primeira extensão encontrada
      }
    })
    
    // Imagens numeradas (2, 3, 4, etc.)
    for (let i = 2; i <= 10; i++) { // Limitar a 10 imagens por categoria
      let found = false
      extensoesEspeciais.forEach(extensao => {
        const path = `/images/arvores/${categoria}/${folderName}${i}.${extensao}`
        if (fileExists(path)) {
          categoriaImagens.push(path)
          found = true
        }
      })
      if (!found) break // Se não encontrou a imagem i, não vai ter i+1
    }
    
    if (categoriaImagens.length > 0) {
      imagens[categoria] = categoriaImagens
    }
  })
  
  return imagens
}

// Filtrar linhas vazias e processar dados
const validRows = raw.filter(r => {
  // Verificar se tem pelo menos nome científico ou nome
  return (r['Nome científico'] && r['Nome científico'].toString().trim() !== '') ||
         (r['Nome'] && r['Nome'].toString().trim() !== '')
})

const rows = validRows.map((r, index) => {
  const sLat = String(r['Latitude'] || '').trim()
  const sLng = String(r['Longitude'] || '').trim()
  
  let lat = 0, lng = 0
  if (sLat && sLng && sLat !== 'undefined' && sLng !== 'undefined') {
    const signLat = sLat.startsWith('-') ? '-' : ''
    const signLng = sLng.startsWith('-') ? '-' : ''
    const dLat = sLat.replace(/^[-+]/, '')
    const dLng = sLng.replace(/^[-+]/, '')
    lat = parseFloat(`${signLat}${dLat.slice(0,2)}.${dLat.slice(2)}`)
    lng = parseFloat(`${signLng}${dLng.slice(0,2)}.${dLng.slice(2)}`)
  }

  // Função para coletar múltiplas colunas como array de strings
  const collectColumns = (...columns) => {
    return columns
      .filter(col => col && col.toString().trim() !== '')
      .map(col => col.toString().trim())
  }

  // Gerar ID único se não existir ou estiver vazio
  const originalId = String(r['ID'] || '').trim()
  const id = originalId && originalId !== '' ? originalId : `auto_${index + 1}`
  
  const nome = r['Nome'] || ''
  const imagens = nome ? getArvoreImages(nome) : {}

  return {
    id:                    id,
    nome:                  nome,
    nome_cientifico:       r['Nome científico'] || '',
    nome_cientifico_completo: r['Nome científico'] || '',
    nomes_comuns:          r['Nome comum'] || '',
    familia_botanica:      r['Família'] || '',
    localizacao:           r['Localização'] || '',
    trajeto:               r['Trajeto'] || '',
    posicao_trajeto:       r['Posição do Trajeto'] || '',
    status:                r['Nativa ou Exótica'] || '',
    origem_distribuicao:   collectColumns(
      r['Origem e Distribuição'],
      r['Origem e Distribuição2'],
      r['Origem e Distribuição3']
    ),
    caracteristicas_botanicas: collectColumns(
      r['Características Botânicas'],
      r['Características Botânicas2'],
      r['Características Botânicas3'],
      r['Características Botânicas4'],
      r['Características Botânicas5'],
      r['Características Botânicas6']
    ),
    visitantes_botanicos:   collectColumns(
      r['Visitantes Botanicos'],
      r['Visitantes Botanicos2']
    ),
    curiosidades:          collectColumns(
      r['Curiosidades'],
      r['Curiosidades2'],
      r['Curiosidades3'],
      r['Curiosidades4']
    ),
    imagens:               imagens,
    lat,
    lng
  }
})

fs.writeFileSync(
  path.join(__dirname, '../data/arvores.json'),
  JSON.stringify(rows, null, 2),
  'utf-8'
)

console.log('✅ data/arvores.json atualizado a partir de arvores trajetos.xlsx')

