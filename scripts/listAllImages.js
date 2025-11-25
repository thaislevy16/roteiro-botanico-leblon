// scripts/listAllImages.js
const fs = require('fs')
const path = require('path')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

console.log('🖼️  Listando todas as imagens disponíveis...\n')

let totalArvores = 0
let totalImagens = 0

arvoresData.forEach(arvore => {
  if (arvore.imagens && Object.keys(arvore.imagens).length > 0) {
    totalArvores++
    
    console.log(`🌳 ${arvore.nome}`)
    
    Object.entries(arvore.imagens).forEach(([categoria, imagens]) => {
      if (imagens.length > 0) {
        console.log(`  📁 ${categoria}: ${imagens.length} imagem(ns)`)
        imagens.forEach((img, i) => {
          console.log(`    ${i+1}. ${img}`)
          totalImagens++
        })
      }
    })
    console.log('')
  }
})

console.log(`📊 Resumo:`)
console.log(`- Árvores com imagens: ${totalArvores}`)
console.log(`- Total de imagens: ${totalImagens}`)











