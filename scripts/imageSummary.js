// scripts/imageSummary.js
const fs = require('fs')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

console.log('📊 Resumo das Imagens das Árvores\n')

let totalArvores = 0
let totalImagens = 0
const categorias = {
  arvore: 0,
  flor: 0,
  folha: 0,
  fruto: 0,
  semente: 0,
  curiosidades: 0,
  visitantes: 0
}

arvoresData.forEach(arvore => {
  if (arvore.imagens && Object.keys(arvore.imagens).length > 0) {
    totalArvores++
    
    console.log(`🌳 ${arvore.nome}`)
    
    Object.entries(arvore.imagens).forEach(([categoria, imagens]) => {
      if (imagens.length > 0) {
        console.log(`  📁 ${categoria}: ${imagens.length} imagem(ns)`)
        categorias[categoria] += imagens.length
        totalImagens += imagens.length
      }
    })
    console.log('')
  }
})

console.log('📈 Estatísticas:')
console.log(`- Árvores com imagens: ${totalArvores}`)
console.log(`- Total de imagens: ${totalImagens}`)
console.log('\n📋 Por categoria:')
Object.entries(categorias).forEach(([categoria, count]) => {
  if (count > 0) {
    console.log(`  ${categoria}: ${count} imagens`)
  }
})

console.log('\n🌐 Acesse: http://localhost:3001')











