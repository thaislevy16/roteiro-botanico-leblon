import React from 'react';
import MultipleImageDisplay from './MultipleImageDisplay';
import { Arvore } from './types';

interface FormattedContentProps {
  content: string | string[];
  type: 'caracteristicas' | 'visitantes' | 'curiosidades' | 'origem' | 'status';
  className?: string;
  color?: string;
  arvore?: Arvore;
}

export default function FormattedContent({ content, type, className = '', color = 'green', arvore }: FormattedContentProps) {
  // Verificar se content é array vazio ou string vazia
  const isEmpty = Array.isArray(content) 
    ? content.length === 0 || content.every(item => !item || item.trim() === '')
    : !content || content.trim() === '' || content === 'undefined' || content === 'null';

  if (isEmpty) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 text-3xl mb-2">📝</div>
        <p className="text-gray-500 italic text-base">
          Informação será adicionada em breve.
        </p>
      </div>
    );
  }

  // Função para capitalizar a primeira letra de cada frase
  const capitalizeFirstLetter = (text: string): string => {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length === 0) return trimmed;
        
        // Encontrar a primeira letra que não seja espaço, pontuação ou número
        let firstLetterIndex = 0;
        for (let i = 0; i < trimmed.length; i++) {
          const char = trimmed[i];
          if (/[a-zA-ZÀ-ÿ]/.test(char)) {
            firstLetterIndex = i;
            break;
          }
        }
        
        if (firstLetterIndex < trimmed.length) {
          return trimmed.slice(0, firstLetterIndex) + 
                 trimmed[firstLetterIndex].toUpperCase() + 
                 trimmed.slice(firstLetterIndex + 1);
        }
        
        return trimmed;
      })
      .join(' ');
  };

  const formatContent = (text: string, contentType: string) => {
    // Verificar se o texto contém tópicos com •
    if (text.includes('•')) {
      // Dividir por quebras de linha e processar cada tópico
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      const topics = lines.map(line => line.trim()).filter(line => line.length > 0);
      
      return (
        <ul className="mb-4 space-y-2 list-none">
          {topics.map((topic, topicIdx) => {
            let html = topic;
            
            // Remover o • do início se existir
            if (html.startsWith('•')) {
              html = html.substring(1).trim();
            }
            
            return (
              <li key={topicIdx} className="mb-2">
                <span className={`text-base leading-relaxed ${colors.body}`}>
                  {html}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
    
    // Capitalizar primeira letra
    const capitalizedText = capitalizeFirstLetter(text);
    
    // Dividir em parágrafos baseado em pontos seguidos de espaço e maiúscula
    const paragraphs = capitalizedText
      .split(/(?<=\.)\s+(?=[A-Z])/)
      .filter(p => p.trim().length > 0);

    // Obter classes de cor baseadas no tipo de conteúdo
    const colors = getColorClasses(color);

    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Detectar subtítulos (texto seguido de dois pontos)
      const subtitleMatch = trimmedParagraph.match(/^([^:]+):\s*(.+)$/);
      
      if (subtitleMatch) {
        const [, subtitle, content] = subtitleMatch;
        return (
          <div key={index} className="mb-4">
            <h4 className={`font-semibold ${colors.subtitle} mb-2 text-lg`}>
              {subtitle.trim()}
            </h4>
            <p className={`text-base leading-relaxed ${colors.body}`}>
              {content.trim()}
            </p>
          </div>
        );
      }
      
      // Parágrafo normal
      return (
        <p key={index} className={`text-base leading-relaxed ${colors.body} mb-3`}>
          {trimmedParagraph}
        </p>
      );
    });
  };


  const getColorClasses = (color: string) => {
    // Sistema de cores padronizado para todas as seções
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      accent: 'text-highlight',
      subtitle: 'text-gray-700',
      body: 'text-gray-600'
    }
  }

  const formatCharacteristics = (text: string) => {
    // Capitalizar primeira letra
    const capitalizedText = capitalizeFirstLetter(text);
    const colors = getColorClasses(color);
    
    // Dividir em seções baseadas em palavras-chave
    const sections = capitalizedText.split(/(?=Árvore:|Folhas:|Flores:|Frutos:|Sementes:|Ciclo Reprodutivo:)/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      const sectionMatch = trimmedSection.match(/^(Árvore|Folhas|Flores|Frutos|Sementes|Ciclo Reprodutivo):\s*(.+)$/);
      
      if (sectionMatch) {
        const [, sectionTitle, content] = sectionMatch;
        
        // Mapear títulos para chaves de imagem
        const getImageKey = (title: string) => {
          switch (title) {
            case 'Árvore': return 'arvore';
            case 'Folhas': return 'folha';
            case 'Flores': return 'flor';
            case 'Frutos': return 'fruto';
            case 'Sementes': return 'semente';
            default: return null;
          }
        };
        
        const imageKey = getImageKey(sectionTitle);
        const images = arvore?.imagens?.[imageKey as keyof typeof arvore.imagens];
        
        
        return (
          <div key={index} className={`mb-6 p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
            <h4 className={`font-semibold ${colors.subtitle} mb-3 text-lg flex items-center`}>
              <span className="mr-2">
                {sectionTitle === 'Árvore' && '🌳'}
                {sectionTitle === 'Folhas' && '🍃'}
                {sectionTitle === 'Flores' && '🌸'}
                {sectionTitle === 'Frutos' && '🍎'}
                {sectionTitle === 'Sementes' && '🌰'}
                {sectionTitle === 'Ciclo Reprodutivo' && '🔄'}
              </span>
              {sectionTitle}
            </h4>
            <p className={`text-base leading-relaxed ${colors.body}`}>
              {content.trim()}
            </p>
            {images && images.length > 0 && (
              <MultipleImageDisplay 
                images={images} 
                alt={`${sectionTitle} da ${arvore?.nome}`}
                className="max-w-4xl mx-auto"
              />
            )}
          </div>
        );
      }
      
      return (
        <p key={index} className={`text-base leading-relaxed ${colors.body} mb-3`}>
          {trimmedSection}
        </p>
      );
    });
  };

  const formatVisitors = (text: string) => {
    // Capitalizar primeira letra
    const capitalizedText = capitalizeFirstLetter(text);
    const colors = getColorClasses(color);
    
    // Dividir em seções de polinizadores e animais
    const sections = capitalizedText.split(/(?=Polinizadores:|Animais que consomem|Animais frugívoros)/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      const sectionMatch = trimmedSection.match(/^(Polinizadores|Animais que consomem|Animais frugívoros)[^:]*:\s*(.+)$/);
      
      if (sectionMatch) {
        const [, sectionTitle, content] = sectionMatch;
        const images = arvore?.imagens?.visitantes;
        
        return (
          <div key={index} className={`mb-4 p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
            <h4 className={`font-semibold ${colors.subtitle} mb-2 text-lg flex items-center`}>
              <span className="mr-2">
                {sectionTitle.includes('Polinizadores') && '🐝'}
                {sectionTitle.includes('Animais') && '🦋'}
              </span>
              {sectionTitle}
            </h4>
            <p className={`text-base leading-relaxed ${colors.body}`}>
              {content.trim()}
            </p>
            {images && images.length > 0 && (
              <MultipleImageDisplay 
                images={images} 
                alt={`Visitantes da ${arvore?.nome}`}
                className="max-w-4xl mx-auto"
              />
            )}
          </div>
        );
      }
      
      return (
        <p key={index} className={`text-base leading-relaxed ${colors.body} mb-3`}>
          {trimmedSection}
        </p>
      );
    });
  };

  const formatCuriosities = (text: string) => {
    // Capitalizar primeira letra
    const capitalizedText = capitalizeFirstLetter(text);
    const colors = getColorClasses(color);
    
    // Dividir em seções baseadas em palavras-chave
    const sections = capitalizedText.split(/(?=Alimentação:|Medicinal:|Cultura:|Ecologia:)/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      const sectionMatch = trimmedSection.match(/^(Alimentação|Medicinal|Cultura|Ecologia):\s*(.+)$/);
      
      if (sectionMatch) {
        const [, sectionTitle, content] = sectionMatch;
        const images = arvore?.imagens?.curiosidades;
        
        return (
          <div key={index} className={`mb-4 p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
            <h4 className={`font-semibold ${colors.subtitle} mb-2 text-lg flex items-center`}>
              <span className="mr-2">
                {sectionTitle === 'Alimentação' && '🍽️'}
                {sectionTitle === 'Medicinal' && '💊'}
                {sectionTitle === 'Cultura' && '🏛️'}
                {sectionTitle === 'Ecologia' && '🌍'}
              </span>
              {sectionTitle}
            </h4>
            <p className={`text-base leading-relaxed ${colors.body}`}>
              {content.trim()}
            </p>
            {images && images.length > 0 && (
              <MultipleImageDisplay 
                images={images} 
                alt={`Curiosidades da ${arvore?.nome}`}
                className="max-w-4xl mx-auto"
              />
            )}
          </div>
        );
      }
      
      return (
        <p key={index} className={`text-base leading-relaxed ${colors.body} mb-3`}>
          {trimmedSection}
        </p>
      );
    });
  };

  // Se content é array, processar cada item separadamente
  if (Array.isArray(content)) {
    return (
      <div className={className}>
        {content.map((item, index) => (
          <div key={index} className="mb-6">
            {formatContent(item, type)}
          </div>
        ))}
      </div>
    );
  }

  const renderContent = () => {
    switch (type) {
      case 'caracteristicas':
        return formatCharacteristics(content);
      case 'visitantes':
        return formatVisitors(content);
      case 'curiosidades':
        return formatCuriosities(content);
      default:
        return formatContent(content, type);
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}
