// scripts/testSectionImages.js
const fs = require('fs')
const path = require('path')

// Carregar dados das árvores
const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'))

// Função para verificar se arquivo existe
function fileExists(filePath) {
  const fullPath = path.join(__dirname, '..', 'public', filePath)
  return fs.existsSync(fullPath)
}

console.log('🔍 Testando imagens nas seções...\n')

// Testar especificamente o coquinho-vermelho
const coquinho = arvoresData.find(a => a.nome === 'Coquinho-vermelho')

if (coquinho) {
  console.log(`🌳 Testando: ${coquinho.nome} (ID: ${coquinho.id})`)
  console.log(`📁 Imagens configuradas:`, coquinho.imagens)
  
  // Testar seção de características botânicas
  console.log('\n📋 Seção: Características Botânicas')
  const caracteristicasImages = ['arvore', 'flor', 'folha', 'fruto', 'semente']
  caracteristicasImages.forEach(categoria => {
    const imagePath = coquinho.imagens?.[categoria]
    if (imagePath) {
      const exists = fileExists(imagePath)
      console.log(`  ${exists ? '✅' : '❌'} ${categoria}: ${imagePath}`)
    } else {
      console.log(`  ⚪ ${categoria}: não configurada`)
    }
  })
  
  // Testar seção de visitantes
  console.log('\n🦋 Seção: Visitantes Botânicos')
  const visitantesPath = coquinho.imagens?.visitantes
  if (visitantesPath) {
    const exists = fileExists(visitantesPath)
    console.log(`  ${exists ? '✅' : '❌'} visitantes: ${visitantesPath}`)
  } else {
    console.log(`  ⚪ visitantes: não configurada`)
  }
  
  // Testar seção de curiosidades
  console.log('\n🔍 Seção: Curiosidades')
  const curiosidadesPath = coquinho.imagens?.curiosidades
  if (curiosidadesPath) {
    const exists = fileExists(curiosidadesPath)
    console.log(`  ${exists ? '✅' : '❌'} curiosidades: ${curiosidadesPath}`)
  } else {
    console.log(`  ⚪ curiosidades: não configurada`)
  }
  
  console.log('\n🌐 Para testar no navegador:')
  console.log(`   http://localhost:3001/arvore/${coquinho.id}`)
  
} else {
  console.log('❌ Coquinho-vermelho não encontrado!')
}

