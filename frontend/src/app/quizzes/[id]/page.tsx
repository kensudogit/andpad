/** 理解度テスト受験画面。 */
import { notFound } from 'next/navigation'
import { QuizTakeForm } from '@/components/QuizTakeForm'
import { QuizTakePageDocument, type QuizTakePageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function QuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let error: string | null = null
  let quiz: QuizTakePageQuery['quiz'] = null

  try {
    const data = await gqlRequest(QuizTakePageDocument, { id })
    quiz = data.quiz
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  if (!quiz && !error) notFound()
  if (!quiz) {
    return (
      <div className="alert">
        <p>{error}</p>
        <p>{graphQLErrorHint(error)}</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>{quiz.title}</h1>
        <p>{ui.passLine(quiz.passingScore)}</p>
      </div>
      <QuizTakeForm quiz={quiz} />
    </>
  )
}
