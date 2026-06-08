/** AI Board（建設 PM KPI と OpenAI 経営インサイト）。 */
import { AIBoardClient } from '@/components/AIBoardClient'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default function BoardPage() {
  return (
    <>
      <div className="page-head">
        <h1>{ui.boardTitle}</h1>
        <p>{ui.boardDesc}</p>
      </div>
      <AIBoardClient />
    </>
  )
}
