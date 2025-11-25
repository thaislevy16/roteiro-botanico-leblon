// scripts/debugImages.js
const fs = require('fs')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

console.log('🐛 Debug das imagens do coquinho-vermelho...\n')

const coquinho = arvoresData.find(a => a.nome === 'Coquinho-vermelho')

if (coquinho) {
  console.log(`🌳 ${coquinho.nome} (ID: ${coquinho.id})`)
  console.log(`📁 Imagens configuradas:`)
  
  if (coquinho.imagens) {
    Object.entries(coquinho.imagens).forEach(([categoria, imagens]) => {
      console.log(`\n📋 ${categoria}:`)
      console.log(`  Tipo: ${Array.isArray(imagens) ? 'array' : typeof imagens}`)
      console.log(`  Quantidade: ${Array.isArray(imagens) ? imagens.length : 'N/A'}`)
      
      if (Array.isArray(imagens)) {
        imagens.forEach((img, i) => {
          console.log(`    ${i+1}. ${img}`)
        })
      } else {
        console.log(`    Valor: ${imagens}`)
      }
    })
  } else {
    console.log('❌ Nenhuma imagem configurada!')
  }
  
  // Verificar se as imagens existem fisicamente
  console.log('\n🔍 Verificando existência física das imagens:')
  const path = require('path')
  
  if (coquinho.imagens) {
    Object.entries(coquinho.imagens).forEach(([categoria, imagens]) => {
      if (Array.isArray(imagens)) {
        imagens.forEach((img, i) => {
          const fullPath = path.join(__dirname, '..', 'public', img)
          const exists = fs.existsSync(fullPath)
          console.log(`  ${exists ? '✅' : '❌'} ${img}`)
        })
      }
    })
  }
  
} else {
  console.log('❌ Coquinho-vermelho não encontrado!')
}











