// scripts/testImages.js
const fs = require('fs')
const path = require('path')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

// Função para verificar se arquivo existe
function fileExists(filePath) {
  const fullPath = path.join(__dirname, '..', 'public', filePath)
  return fs.existsSync(fullPath)
}

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

console.log('🔍 Verificando imagens das árvores...\n')

let totalArvores = 0
let arvoresComImagens = 0
let totalImagens = 0
let imagensExistentes = 0

arvoresData.forEach(arvore => {
  totalArvores++
  
  if (arvore.imagens && Object.keys(arvore.imagens).length > 0) {
    arvoresComImagens++
    
    console.log(`\n🌳 ${arvore.nome} (${arvore.nome_cientifico})`)
    
    Object.entries(arvore.imagens).forEach(([categoria, imagePath]) => {
      totalImagens++
      
      if (fileExists(imagePath)) {
        imagensExistentes++
        console.log(`  ✅ ${categoria}: ${imagePath}`)
      } else {
        console.log(`  ❌ ${categoria}: ${imagePath} (não encontrada)`)
      }
    })
  }
})

console.log(`\n📊 Resumo:`)
console.log(`- Total de árvores: ${totalArvores}`)
console.log(`- Árvores com imagens configuradas: ${arvoresComImagens}`)
console.log(`- Total de imagens configuradas: ${totalImagens}`)
console.log(`- Imagens existentes: ${imagensExistentes}`)
console.log(`- Imagens faltando: ${totalImagens - imagensExistentes}`)

if (imagensExistentes > 0) {
  console.log(`\n✅ ${imagensExistentes} imagens estão prontas para uso!`)
} else {
  console.log(`\n⚠️  Nenhuma imagem foi encontrada. Verifique se as pastas estão corretas.`)
}

