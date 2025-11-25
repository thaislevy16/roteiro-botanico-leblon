const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function processPlantasDocx() {
  try {
    console.log('Processando documento Plantas.docx...');
    
    // Ler o arquivo DOCX
    const result = await mammoth.extractRawText({ path: './data/Plantas.docx' });
    const text = result.value;
    
    console.log('Texto extraído com sucesso!');
    
    // Salvar o texto extraído para análise
    fs.writeFileSync('./data/plantas_texto_extraido.txt', text, 'utf8');
    console.log('Texto salvo em ./data/plantas_texto_extraido.txt');
    
    // Processar o texto para extrair fichas botânicas
    const fichas = extractFichas(text);
    
    console.log(`\nEncontradas ${fichas.length} fichas botânicas:`);
    fichas.forEach((ficha, index) => {
      console.log(`${index + 1}. ${ficha.nome_cientifico} – ${ficha.nome_comum}`);
    });
    
    // Salvar as fichas processadas
    fs.writeFileSync('./data/fichas_processadas.json', JSON.stringify(fichas, null, 2), 'utf8');
    console.log('\nFichas processadas salvas em ./data/fichas_processadas.json');
    
    return fichas;
  } catch (error) {
    console.error('Erro ao processar o documento:', error);
    throw error;
  }
}

function extractFichas(text) {
  const fichas = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentFicha = null;
  let currentSection = null;
  let currentContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início de nova ficha (padrão: "Nome científico – Nome comum")
    const fichaMatch = line.match(/^([A-Z][a-z]+ [a-z]+) – (.+)$/);
    if (fichaMatch) {
      // Salvar ficha anterior se existir
      if (currentFicha) {
        if (currentSection) {
          currentFicha[currentSection] = currentContent.join(' ').trim();
        }
        fichas.push(currentFicha);
      }
      
      // Iniciar nova ficha
      currentFicha = {
        nome_cientifico: fichaMatch[1],
        nome_comum: fichaMatch[2],
        nome_cientifico_completo: '',
        nomes_comuns: '',
        familia_botanica: '',
        status: '',
        origem_distribuicao: '',
        caracteristicas_botanicas: '',
        visitantes_botanicos: '',
        curiosidades: '',
        referencias: ''
      };
      currentSection = null;
      currentContent = [];
      continue;
    }
    
    // Detectar seções - verificar se a linha é exatamente o nome da seção
    if (line === 'Nome científico') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'nome_cientifico_completo';
      currentContent = [];
      continue;
    } else if (line.startsWith('Nome científico') && line !== 'Nome científico') {
      // Caso especial: "Nome científicoMimusops coriacea (A.DC.) Miq."
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      const scientificName = line.replace('Nome científico', '').trim();
      if (currentFicha) {
        currentFicha.nome_cientifico_completo = scientificName;
      }
      currentSection = null;
      currentContent = [];
      continue;
    } else if (line === 'Nomes Comuns') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'nomes_comuns';
      currentContent = [];
      continue;
    } else if (line.startsWith('Nomes Comuns') && line !== 'Nomes Comuns') {
      // Caso especial: "Nomes ComunsAlgodoeiro-da-praia, hibisco-da-praia."
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      const commonNames = line.replace('Nomes Comuns', '').trim();
      if (currentFicha) {
        currentFicha.nomes_comuns = commonNames;
      }
      currentSection = null;
      currentContent = [];
      continue;
    } else if (line === 'Nativa ou Exótica?') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'status';
      currentContent = [];
      continue;
    } else if (line === 'Origem e Distribuição Geográfica') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'origem_distribuicao';
      currentContent = [];
      continue;
    } else if (line === 'Características Botânicas') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'caracteristicas_botanicas';
      currentContent = [];
      continue;
    } else if (line === 'Visitantes Botânicos e Animais que Usam o Fruto') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'visitantes_botanicos';
      currentContent = [];
      continue;
    } else if (line === 'Curiosidades e Usos') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'curiosidades';
      currentContent = [];
      continue;
    } else if (line === 'Referências Bibliográficas') {
      if (currentSection && currentFicha) {
        currentFicha[currentSection] = currentContent.join(' ').trim();
      }
      currentSection = 'referencias';
      currentContent = [];
      continue;
    }
    
    // Adicionar conteúdo à seção atual
    if (currentSection && currentFicha) {
      currentContent.push(line);
    }
  }
  
  // Salvar última ficha
  if (currentFicha) {
    if (currentSection) {
      currentFicha[currentSection] = currentContent.join(' ').trim();
    }
    fichas.push(currentFicha);
  }
  
  return fichas;
}

// Executar se chamado diretamente
if (require.main === module) {
  processPlantasDocx()
    .then(() => console.log('Processamento concluído!'))
    .catch(console.error);
}

module.exports = { processPlantasDocx };
