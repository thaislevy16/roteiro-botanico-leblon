const fs = require('fs');
const path = require('path');

function updateArvoresJson() {
  try {
    console.log('Carregando dados existentes...');
    
    // Carregar dados existentes
    const arvoresData = JSON.parse(fs.readFileSync('./data/arvores.json', 'utf8'));
    console.log(`Encontradas ${arvoresData.length} árvores no banco de dados existente`);
    
    // Carregar fichas processadas
    const fichasData = JSON.parse(fs.readFileSync('./data/fichas_processadas.json', 'utf8'));
    console.log(`Encontradas ${fichasData.length} fichas botânicas processadas`);
    
    // Criar mapa de fichas por nome científico para busca rápida
    const fichasMap = new Map();
    fichasData.forEach(ficha => {
      fichasMap.set(ficha.nome_cientifico.toLowerCase(), ficha);
    });
    
    let updatedCount = 0;
    let newSpeciesCount = 0;
    
    // Atualizar árvores existentes
    arvoresData.forEach(arvore => {
      const ficha = fichasMap.get(arvore.nome_cientifico.toLowerCase());
      if (ficha) {
        // Atualizar campos com informações da ficha
        if (ficha.nome_cientifico_completo) {
          arvore.nome_cientifico_completo = ficha.nome_cientifico_completo;
        }
        if (ficha.nomes_comuns) {
          arvore.nomes_comuns = ficha.nomes_comuns;
        }
        if (!arvore.status && ficha.status) {
          arvore.status = ficha.status;
        }
        if (!arvore.origem_distribuicao && ficha.origem_distribuicao) {
          arvore.origem_distribuicao = ficha.origem_distribuicao;
        }
        if (!arvore.caracteristicas_botanicas && ficha.caracteristicas_botanicas) {
          arvore.caracteristicas_botanicas = ficha.caracteristicas_botanicas;
        }
        if (!arvore.visitantes_botanicos && ficha.visitantes_botanicos) {
          arvore.visitantes_botanicos = ficha.visitantes_botanicos;
        }
        if (!arvore.curiosidades && ficha.curiosidades) {
          arvore.curiosidades = ficha.curiosidades;
        }
        if (!arvore.referencias && ficha.referencias) {
          arvore.referencias = ficha.referencias;
        }
        updatedCount++;
      }
    });
    
    // Verificar espécies que estão no DOCX mas não no JSON
    const existingSpecies = new Set(arvoresData.map(a => a.nome_cientifico.toLowerCase()));
    const newSpecies = fichasData.filter(ficha => !existingSpecies.has(ficha.nome_cientifico.toLowerCase()));
    
    console.log(`\nEspécies encontradas no DOCX mas não no JSON (${newSpecies.length}):`);
    newSpecies.forEach(ficha => {
      console.log(`- ${ficha.nome_cientifico} – ${ficha.nome_comum}`);
    });
    
    // Adicionar novas espécies (apenas as que estão no roteiro curto - Praça Antero de Quental)
    const especiesRoteiroCurto = [
      'Persea americana', 'Mimusops coriacea', 'Albizia lebbeck', 'Couroupita guianensis',
      'Pterocarpus violaceus', 'Hibiscus tiliaceus', 'Eriobotrya japonica', 'Araucaria bidwillii',
      'Schinus terebinthifolia', 'Schefflera actinophylla', 'Agave angustifolia', 'Peltophorum dubium',
      'Sterculia foetida', 'Carpentaria acuminata', 'Cycas revoluta', 'Ficus lyrata',
      'Delonix regia', 'Handroanthus chrysotrichus', 'Tabebuia rosea', 'Handroanthus heptaphyllus',
      'Artocarpus heterophyllus', 'Chloroleucon tortum', 'Leucaena leucocephala', 'Citrus sinensis',
      'Khaya ivorensis', 'Morinda citrifolia', 'Olea europaea', 'Caryota urens',
      'Paubrasilia echinata', 'Libidibia ferrea', 'Triplaris americana', 'Ceiba speciosa',
      'Cenostigma pluviosum'
    ];
    
    const especiesParaAdicionar = newSpecies.filter(ficha => 
      especiesRoteiroCurto.includes(ficha.nome_cientifico)
    );
    
    if (especiesParaAdicionar.length > 0) {
      console.log(`\nAdicionando ${especiesParaAdicionar.length} espécies do roteiro curto:`);
      
      especiesParaAdicionar.forEach(ficha => {
        const novaArvore = {
          id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nome: ficha.nome_comum,
          nome_cientifico: ficha.nome_cientifico,
          nome_cientifico_completo: ficha.nome_cientifico_completo || ficha.nome_cientifico,
          nomes_comuns: ficha.nomes_comuns || ficha.nome_comum,
          familia_botanica: ficha.familia_botanica || '',
          localizacao: 'Praça Antero de Quental',
          trajeto: 'Trajeto curto',
          posicao_trajeto: '1.00',
          status: ficha.status || '',
          origem_distribuicao: ficha.origem_distribuicao || '',
          caracteristicas_botanicas: ficha.caracteristicas_botanicas || '',
          visitantes_botanicos: ficha.visitantes_botanicos || '',
          curiosidades: ficha.curiosidades || '',
          referencias: ficha.referencias || '',
          lat: -22.9845244184619, // Coordenadas da Praça Antero de Quental
          lng: -43.2232001423835
        };
        
        arvoresData.push(novaArvore);
        newSpeciesCount++;
        console.log(`+ ${ficha.nome_cientifico} – ${ficha.nome_comum}`);
      });
    }
    
    // Salvar dados atualizados
    fs.writeFileSync('./data/arvores.json', JSON.stringify(arvoresData, null, 2), 'utf8');
    
    console.log(`\n✅ Atualização concluída!`);
    console.log(`- ${updatedCount} árvores existentes foram atualizadas`);
    console.log(`- ${newSpeciesCount} novas espécies foram adicionadas`);
    console.log(`- Total de árvores no banco: ${arvoresData.length}`);
    
    return arvoresData;
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  try {
    updateArvoresJson();
    console.log('Processo concluído!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

module.exports = { updateArvoresJson };
