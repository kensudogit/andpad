const url = process.env.API_URL?.trim() || 'http://localhost:8080'

try {
  const res = await fetch(`${url.replace(/\/+$/, '')}/health`, {
    signal: AbortSignal.timeout(800),
  })
  if (!res.ok) {
    console.warn(`[dental-video] API not ready at ${url} — run "npm run dev" from repo root`)
  }
} catch {
  console.warn(
    `[dental-video] API not reachable at ${url} — start with "npm run dev" from repository root`,
  )
}
