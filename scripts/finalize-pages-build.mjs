import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.resolve(scriptDir, '..', 'docs')

mkdirSync(docsDir, { recursive: true })
writeFileSync(path.join(docsDir, '.nojekyll'), '')
