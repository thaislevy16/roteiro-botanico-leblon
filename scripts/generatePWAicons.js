const fs = require('fs');
const path = require('path');

// Tamanhos necessários para PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Atualizar manifest.json com os novos ícones
function updateManifest() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Atualizar ícones
  manifest.icons = iconSizes.map(icon => ({
    src: `/images/${icon.name}`,
    sizes: `${icon.size}x${icon.size}`,
    type: 'image/png',
    purpose: 'any maskable'
  }));
  
  // Adicionar ícone para Apple
  manifest.icons.push({
    src: '/images/icon-180x180.png',
    sizes: '180x180',
    type: 'image/png',
    purpose: 'any maskable'
  });
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest.json atualizado com os novos ícones');
}

// Instruções para o usuário
function printInstructions() {
  console.log('\n🎨 INSTRUÇÕES PARA CRIAR OS ÍCONES:');
  console.log('=====================================');
  console.log('\n1. Abra o logo-app.png em um editor de imagem');
  console.log('2. Crie versões quadradas (redondas) nos seguintes tamanhos:');
  
  iconSizes.forEach(icon => {
    console.log(`   - ${icon.name} (${icon.size}x${icon.size}px)`);
  });
  
  console.log('   - icon-180x180.png (180x180px) - para Apple');
  
  console.log('\n3. Salve todos os arquivos na pasta: public/images/');
  console.log('4. Execute: npm run generate-pwa-icons');
  console.log('\n📱 DICAS:');
  console.log('- Use fundo branco ou transparente');
  console.log('- Mantenha o logo centralizado');
  console.log('- Teste em diferentes tamanhos para garantir legibilidade');
  console.log('\n🚀 APÓS CRIAR OS ÍCONES:');
  console.log('- O PWA estará pronto para instalação');
  console.log('- Os usuários poderão "Adicionar à tela inicial"');
  console.log('- Funcionará offline após primeira visita');
}

// Executar
if (require.main === module) {
  console.log('🌳 Gerador de Ícones PWA - Roteiro Botânico Leblon');
  console.log('==================================================');
  
  printInstructions();
  
  // Verificar se os ícones existem
  const iconsExist = iconSizes.every(icon => {
    const iconPath = path.join(__dirname, `../public/images/${icon.name}`);
    return fs.existsSync(iconPath);
  });
  
  if (iconsExist) {
    console.log('\n✅ Todos os ícones encontrados! Atualizando manifest...');
    updateManifest();
    console.log('\n🎉 PWA configurado com sucesso!');
  } else {
    console.log('\n⚠️  Crie os ícones primeiro seguindo as instruções acima.');
  }
}

module.exports = { updateManifest, iconSizes };
