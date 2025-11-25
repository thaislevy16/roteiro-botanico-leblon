const fs = require('fs');

function testSpeciesPage() {
  try {
    console.log('Testando página de espécie...');
    
    // Carregar dados das árvores
    const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'));
    
    // Encontrar uma árvore com informações completas
    const arvoreCompleta = arvoresData.find(arvore => 
      arvore.caracteristicas_botanicas && 
      arvore.caracteristicas_botanicas.trim() !== '' &&
      arvore.visitantes_botanicos && 
      arvore.visitantes_botanicos.trim() !== '' &&
      arvore.curiosidades && 
      arvore.curiosidades.trim() !== ''
    );
    
    if (arvoreCompleta) {
      console.log(`\n✅ Árvore encontrada com informações completas:`);
      console.log(`Nome: ${arvoreCompleta.nome}`);
      console.log(`Nome científico: ${arvoreCompleta.nome_cientifico}`);
      console.log(`ID: ${arvoreCompleta.id}`);
      console.log(`Localização: ${arvoreCompleta.localizacao}`);
      
      console.log(`\n📊 Informações disponíveis:`);
      console.log(`- Características botânicas: ${arvoreCompleta.caracteristicas_botanicas ? '✅' : '❌'}`);
      console.log(`- Visitantes botânicos: ${arvoreCompleta.visitantes_botanicos ? '✅' : '❌'}`);
      console.log(`- Curiosidades: ${arvoreCompleta.curiosidades ? '✅' : '❌'}`);
      console.log(`- Origem e distribuição: ${arvoreCompleta.origem_distribuicao ? '✅' : '❌'}`);
      console.log(`- Status: ${arvoreCompleta.status ? '✅' : '❌'}`);
      console.log(`- Referências: ${arvoreCompleta.referencias ? '✅' : '❌'}`);
      
      console.log(`\n🌐 Para testar, acesse:`);
      console.log(`http://localhost:3000/arvore/${arvoreCompleta.id}`);
      
      // Mostrar preview das características
      if (arvoreCompleta.caracteristicas_botanicas) {
        console.log(`\n📝 Preview das características botânicas:`);
        const preview = arvoreCompleta.caracteristicas_botanicas.substring(0, 200) + '...';
        console.log(preview);
      }
      
    } else {
      console.log('❌ Nenhuma árvore com informações completas encontrada.');
      
      // Mostrar estatísticas
      const totalArvores = arvoresData.length;
      const comCaracteristicas = arvoresData.filter(a => a.caracteristicas_botanicas && a.caracteristicas_botanicas.trim() !== '').length;
      const comVisitantes = arvoresData.filter(a => a.visitantes_botanicos && a.visitantes_botanicos.trim() !== '').length;
      const comCuriosidades = arvoresData.filter(a => a.curiosidades && a.curiosidades.trim() !== '').length;
      
      console.log(`\n📊 Estatísticas:`);
      console.log(`- Total de árvores: ${totalArvores}`);
      console.log(`- Com características: ${comCaracteristicas}`);
      console.log(`- Com visitantes: ${comVisitantes}`);
      console.log(`- Com curiosidades: ${comCuriosidades}`);
    }
    
  } catch (error) {
    console.error('Erro ao testar:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testSpeciesPage();
}

module.exports = { testSpeciesPage };

