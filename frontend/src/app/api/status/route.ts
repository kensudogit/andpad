/**
 * API 接続診断 JSON（/status ページと同内容）。
 */
import { fetchApiStatus } from '@/lib/status-check'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await fetchApiStatus()
  return Response.json(payload)
}
