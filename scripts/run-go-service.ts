import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const monolith = argv.includes('--monolith')
const service = argv.find((a) => !a.startsWith('--')) ?? 'server'

const defaultPorts: Record<string, string> = {
  server: '8080',
  'saas-dx': '8081',
  'saas-crm': '8082',
  'saas-attendance': '8083',
  'saas-contract': '8084',
  'saas-chat': '8085',
  'saas-rag': '8086',
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend')

function loadEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      out[key] = val
    }
  }
  return out
}

const dotenv = loadEnvFile(path.join(root, '.env'))

const goCandidates = [
  process.env.GO,
  process.platform === 'win32'
    ? path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Go', 'bin', 'go.exe')
    : '/usr/local/go/bin/go',
  'go',
].filter((c): c is string => Boolean(c))

const go = goCandidates.find((c) => c === 'go' || existsSync(c)) ?? 'go'

const childEnv: NodeJS.ProcessEnv = {
  ...dotenv,
  ...process.env,
  PORT: process.env.PORT ?? defaultPorts[service] ?? '8080',
  LOCAL_DEV: '1',
}

for (const key of Object.keys(childEnv)) {
  if (key.startsWith('RAILWAY_')) {
    delete childEnv[key]
  }
}

if (monolith && service === 'server') {
  childEnv.SAAS_MONOLITH = 'true'
  delete childEnv.DATABASE_URL
  delete childEnv.DATABASE_PRIVATE_URL
  delete childEnv.POSTGRES_URL
  delete childEnv.POSTGRES_PRIVATE_URL
  delete childEnv.PGHOST
  delete childEnv.PGUSER
  delete childEnv.PGPASSWORD
  delete childEnv.PGDATABASE
  delete childEnv.PGPORT
}

const child: ChildProcess = spawn(go, ['run', `./cmd/${service}`], {
  cwd: backend,
  stdio: 'inherit',
  env: childEnv,
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
