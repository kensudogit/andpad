'use client'

/**
 * 動画詳細ページ表示時に視聴回数を 1 件加算する。
 */
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { RecordVideoViewDocument } from '@/lib/generated/graphql'

export function VideoViewTracker({ videoId }: { videoId: string }) {
  const router = useRouter()
  const [recordView] = useMutation(RecordVideoViewDocument)
  const recorded = useRef<string | null>(null)

  useEffect(() => {
    if (recorded.current === videoId) return
    recorded.current = videoId

    recordView({ variables: { videoId } })
      .then(() => router.refresh())
      .catch(() => {
        recorded.current = null
      })
  }, [videoId, recordView, router])

  return null
}
