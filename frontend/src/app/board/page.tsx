/** AI Board（学習 KPI と OpenAI 経営インサイト）。 */
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
