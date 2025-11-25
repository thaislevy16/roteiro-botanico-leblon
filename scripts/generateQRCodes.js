const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Carregar dados das árvores
const arvoresData = require('../data/arvores.json');

// URL base do seu site (ajuste conforme necessário)
const BASE_URL = 'https://roteiro-leblon.vercel.app'; // ou seu domínio

async function generateQRCodes() {
  console.log('🌳 Gerando QR Codes para todas as árvores...');
  
  // Criar diretório para os QR codes se não existir
  const qrDir = path.join(__dirname, '../public/qr-codes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  for (const arvore of arvoresData) {
    try {
      // URL da página da árvore
      const url = `${BASE_URL}/arvore/${arvore.id}`;
      
      // Gerar QR code
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2d5a27', // Cor verde do seu tema
          light: '#ffffff'
        }
      });

      // Salvar como arquivo PNG
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const fileName = `arvore-${arvore.id}-${arvore.nome.replace(/\s+/g, '-').toLowerCase()}.png`;
      const filePath = path.join(qrDir, fileName);
      
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      console.log(`✅ QR Code gerado: ${fileName} -> ${url}`);
      
      // Gerar também um QR code menor para as placas (150x150)
      const smallQRCodeDataURL = await QRCode.toDataURL(url, {
        width: 150,
        margin: 1,
        color: {
          dark: '#2d5a27',
          light: '#ffffff'
        }
      });
      
      const smallBase64Data = smallQRCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const smallFileName = `arvore-${arvore.id}-small.png`;
      const smallFilePath = path.join(qrDir, smallFileName);
      
      fs.writeFileSync(smallFilePath, smallBase64Data, 'base64');
      
    } catch (error) {
      console.error(`❌ Erro ao gerar QR code para árvore ${arvore.id}:`, error);
    }
  }

  console.log('🎉 Todos os QR Codes foram gerados com sucesso!');
  console.log(`📁 Arquivos salvos em: ${qrDir}`);
  console.log('\n📋 Instruções para as placas:');
  console.log('1. Use os arquivos "small" para as placas físicas');
  console.log('2. Cada QR code direciona para a página específica da árvore');
  console.log('3. Os usuários podem acessar pelo navegador ou instalar o app');
}

// Executar se chamado diretamente
if (require.main === module) {
  generateQRCodes().catch(console.error);
}

module.exports = { generateQRCodes };
