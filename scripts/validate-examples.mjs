#!/usr/bin/env node
// Validates every CSV in examples/ against the JSON Schema.
// Each row → JSON object → schema validation. Fails fast on first invalid row.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const schema = JSON.parse(
  fs.readFileSync(path.join(root, 'schema/sponsored-products-bulk-sheet.schema.json'), 'utf8')
)
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

// Minimal CSV row parser — handles quoted fields with commas inside, no
// quote-escapes (our examples don't need them).
function parseCsvLine(line) {
  const out = []
  let cur = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

const NUMERIC = ['Daily Budget', 'Ad Group Default Bid', 'Bid']
const INTEGER = ['Percentage', 'Shopper Cohort Percentage']

function coerceRow(row) {
  // Empty string → null for nullable fields
  for (const k of Object.keys(row)) {
    if (row[k] === '') row[k] = null
  }
  for (const k of NUMERIC) {
    if (row[k] !== null && row[k] !== undefined) row[k] = Number(row[k])
  }
  for (const k of INTEGER) {
    if (row[k] !== null && row[k] !== undefined) row[k] = parseInt(row[k], 10)
  }
  return row
}

const examplesDir = path.join(root, 'examples')
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.csv'))

let totalRows = 0
let totalBad = 0

for (const f of files) {
  const raw = fs.readFileSync(path.join(examplesDir, f), 'utf8').trim().split(/\r?\n/)
  const cols = parseCsvLine(raw[0])
  console.log(`\n${f}  (${raw.length - 1} rows)`)
  let bad = 0
  for (let i = 1; i < raw.length; i++) {
    const vals = parseCsvLine(raw[i])
    const row = {}
    cols.forEach((c, j) => { row[c] = vals[j] ?? '' })
    coerceRow(row)
    if (!validate(row)) {
      bad++
      console.log(`  ✗ row ${i + 1} (${row.Entity || '?'})`)
      validate.errors.slice(0, 3).forEach(e => {
        console.log(`     ${e.instancePath || '/'} ${e.message}`)
      })
    }
  }
  if (bad === 0) console.log(`  ✓ all ${raw.length - 1} rows valid`)
  totalRows += raw.length - 1
  totalBad += bad
}

console.log(`\n${totalBad === 0 ? '✓' : '✗'} ${totalRows - totalBad}/${totalRows} rows valid across ${files.length} file(s)`)
process.exit(totalBad === 0 ? 0 : 1)
