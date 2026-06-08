'use client'

/**
 * 理解度テストの回答フォームと採点結果表示。
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import type { QuizTakePageQuery } from '@/lib/generated/graphql'
import { SubmitQuizAttemptDocument } from '@/lib/generated/graphql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { ui } from '@/lib/ui'

export function QuizTakeForm({ quiz }: { quiz: NonNullable<QuizTakePageQuery['quiz']> }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<number[]>(quiz.questions.map(() => 0))
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [submitQuiz, { loading: busy }] = useMutation(SubmitQuizAttemptDocument)

  async function submit() {
    try {
      const { data } = await submitQuiz({
        variables: { input: { quizId: quiz.id, learnerId: DEMO_LEARNER_ID, answers } },
      })
      const attempt = data?.submitQuizAttempt
      if (attempt) {
        setResult({ score: attempt.score, passed: attempt.passed })
        router.refresh()
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : ui.saveFailed)
    }
  }

  if (result) {
    return (
      <div className="panel">
        <h3>{ui.quizResult}</h3>
        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {ui.score} {result.score}% &mdash; {result.passed ? ui.passed : ui.failed}
        </p>
        <p style={{ color: 'var(--muted)' }}>{ui.passLine(quiz.passingScore)}</p>
      </div>
    )
  }

  return (
    <div className="panel">
      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="quiz-card">
          <p>
            <strong>{ui.question(qi + 1)}</strong> {q.prompt}
          </p>
          {q.choices.map((c, ci) => (
            <label key={c.id} style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[qi] === ci}
                onChange={() => {
                  const next = [...answers]
                  next[qi] = ci
                  setAnswers(next)
                }}
              />{' '}
              {c.label}
            </label>
          ))}
        </div>
      ))}
      <button type="button" className="btn" disabled={busy} onClick={submit}>
        {busy ? ui.submitting : ui.submitAnswers}
      </button>
    </div>
  )
}
