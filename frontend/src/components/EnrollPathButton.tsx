'use client'

/**
 * 学習パスへの受講登録ボタン（デモ学習者 ID 使用）。
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EnrollLearningPathDocument } from '@/lib/generated/graphql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { ui } from '@/lib/ui'

export function EnrollPathButton({ pathId }: { pathId: string }) {
  const router = useRouter()
  const [done, setDone] = useState(false)
  const [enroll, { loading: busy }] = useMutation(EnrollLearningPathDocument)

  async function onEnroll() {
    try {
      await enroll({ variables: { pathId, learnerId: DEMO_LEARNER_ID } })
      setDone(true)
      router.refresh()
    } catch {
      /* Apollo surfaces errors in UI extensions later */
    }
  }

  return (
    <button type="button" className="btn" disabled={busy || done} onClick={onEnroll}>
      {done ? ui.enrolled : busy ? ui.enrolling : ui.enroll}
    </button>
  )
}
