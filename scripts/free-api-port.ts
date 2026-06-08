import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT ?? '8080')

function pidsListeningOnPort(p: number): number[] {
  if (!Number.isFinite(p) || p <= 0) return []

  if (process.platform === 'win32') {
    const out = execSync('netstat -ano', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
    const pids = new Set<number>()
    const needle = `:${p}`
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes(needle) || !line.includes('LISTENING')) continue
      const parts = line.trim().split(/\s+/)
      const pid = Number.parseInt(parts[parts.length - 1] ?? '', 10)
      if (pid > 0) pids.add(pid)
    }
    return [...pids]
  }

  try {
    const out = execSync(`lsof -nP -iTCP:${p} -sTCP:LISTEN -t`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    return out
      .split(/\r?\n/)
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => n > 0)
  } catch {
    return []
  }
}

function processName(pid: number): string {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
      const m = out.match(/"([^"]+)"/)
      return m?.[1] ?? 'unknown'
    }
    return execSync(`ps -p ${pid} -o comm=`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'unknown'
  }
}

function killPid(pid: number) {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
    return
  }
  execSync(`kill -9 ${pid}`, { stdio: 'ignore' })
}

/** Stop processes listening on PORT (default 8080). Used before dev:api. */
export function freeApiPort(): void {
  const pids = pidsListeningOnPort(port)
  if (pids.length === 0) return

  if (process.env.SKIP_PORT_FREE === '1') {
    console.warn(
      `[dental-video] port ${port} is in use (PID ${pids.join(', ')}). Run "npm run stop:api" or unset SKIP_PORT_FREE.`,
    )
    return
  }

  for (const pid of pids) {
    const name = processName(pid)
    console.warn(`[dental-video] freeing port ${port}: stopping PID ${pid} (${name})`)
    try {
      killPid(pid)
    } catch {
      console.warn(`[dental-video] could not stop PID ${pid}; close it manually and retry.`)
    }
  }
}

const isCli =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])

if (isCli) {
  freeApiPort()
}
