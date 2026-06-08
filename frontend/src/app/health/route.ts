/** Railway 生存確認用（Go API は呼ばない） */
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    ok: true,
    service: 'andpad-web',
    unified: process.env.UNIFIED_DEPLOY === '1',
  })
}
