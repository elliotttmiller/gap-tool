import { existsSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const docsDir = path.join(repoRoot, 'docs')

if (!existsSync(docsDir)) process.exit(0)

for (const entry of readdirSync(docsDir)) {
  rmSync(path.join(docsDir, entry), { recursive: true, force: true })
}
