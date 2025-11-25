// scripts/testMultipleImages.js
const fs = require('fs')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

console.log('🔍 Testando múltiplas imagens...\n')

// Testar especificamente o coquinho-vermelho
const coquinho = arvoresData.find(a => a.nome === 'Coquinho-vermelho')

if (coquinho) {
  console.log(`🌳 Testando: ${coquinho.nome} (ID: ${coquinho.id})`)
  console.log(`📁 Imagens configuradas:`)
  
  Object.entries(coquinho.imagens || {}).forEach(([categoria, imagens]) => {
    console.log(`\n📋 ${categoria}: ${imagens.length} imagem(ns)`)
    imagens.forEach((img, i) => {
      console.log(`  ${i+1}. ${img}`)
    })
  })
  
  console.log('\n🌐 Para testar no navegador:')
  console.log(`   http://localhost:3001/arvore/${coquinho.id}`)
  
} else {
  console.log('❌ Coquinho-vermelho não encontrado!')
}











