// scripts/parseGlossario.js
const fs   = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const arquivoExcel = path.join(__dirname, '../data/glossario_botanico.xlsx')
if (!fs.existsSync(arquivoExcel)) {
  console.error(`❌ Não achei a planilha em: ${arquivoExcel}`)
  process.exit(1)
}

const workbook  = xlsx.readFile(arquivoExcel, { cellDates: true })
const sheetName = workbook.SheetNames[0]
const raw      = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false })

// Filtrar linhas vazias e processar dados
const validRows = raw.filter(r => {
  // Verificar se tem pelo menos termo e definição
  return (r['Termo'] && r['Termo'].toString().trim() !== '') &&
         (r['Definição'] && r['Definição'].toString().trim() !== '')
})

const glossario = validRows.map(r => ({
  Termo: r['Termo'].toString().trim(),
  Definição: r['Definição'].toString().trim()
}))

fs.writeFileSync(
  path.join(__dirname, '../data/glossario.json'),
  JSON.stringify(glossario, null, 2),
  'utf-8'
)

console.log(`✅ data/glossario.json atualizado com ${glossario.length} termos a partir de glossario_botanico.xlsx`)
