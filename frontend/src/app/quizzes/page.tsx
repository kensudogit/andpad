/** 理解度テスト一覧。 */
import Link from 'next/link'
import { QuizzesPageDocument, type QuizzesPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function QuizzesPage() {
  let error: string | null = null
  let quizzes: QuizzesPageQuery['quizzes'] = []
  let attempts: QuizzesPageQuery['myQuizAttempts'] = []

  try {
    const data = await gqlRequest(QuizzesPageDocument, { learnerId: DEMO_LEARNER_ID })
    quizzes = data.quizzes
    attempts = data.myQuizAttempts
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  const attemptByQuiz = Object.fromEntries(attempts.map((a) => [a.quizId, a]))

  return (
    <>
      <div className="page-head">
        <h1>{ui.quizzesTitle}</h1>
        <p>{ui.quizzesDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      {quizzes.map((q) => {
        const att = attemptByQuiz[q.id]
        return (
          <div key={q.id} className="quiz-card panel">
            <h3 style={{ margin: '0 0 0.35rem' }}>{q.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {ui.questions(q.questions.length)} &middot; {ui.passLine(q.passingScore)}
              {q.videoId ? (
                <>
                  {' '}
                  &middot; <Link href={`/videos/${q.videoId}`}>{ui.relatedVideo}</Link>
                </>
              ) : null}
            </p>
            {att ? (
              <p style={{ marginTop: '0.5rem' }}>
                {ui.prevAttempt(
                  att.score,
                  att.passed,
                  new Date(att.completedAt).toLocaleDateString('ja-JP'),
                )}
              </p>
            ) : null}
            <Link href={`/quizzes/${q.id}`} className="btn" style={{ marginTop: '0.75rem' }}>
              {att ? ui.retake : ui.takeQuiz}
            </Link>
          </div>
        )
      })}
    </>
  )
}
