/** 動画詳細（再生・進捗・ノート・ブックマーク・クイズ）。 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryBadge } from '@/components/CategoryBadge'
import { SkillBadge } from '@/components/SkillBadge'
import { VideoDetailClient } from '@/components/VideoDetailClient'
import { VideoViewTracker } from '@/components/VideoViewTracker'
import { VideoDetailPageDocument, type VideoDetailPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { formatDuration } from '@/lib/labels'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let error: string | null = null
  let data: VideoDetailPageQuery | null = null

  try {
    data = await gqlRequest(VideoDetailPageDocument, { id, learnerId: DEMO_LEARNER_ID })
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  if (!data?.video && !error) notFound()
  const video = data?.video
  if (!video) {
    return (
      <div className="alert">
        <p>{error}</p>
        <p>{graphQLErrorHint(error)}</p>
      </div>
    )
  }

  const detail = data!
  const progress = detail.myProgress.find((p) => p.videoId === id)
  const bookmarked = detail.myBookmarks.some((b) => b.videoId === id)

  return (
    <>
      <VideoViewTracker videoId={id} />
      <div className="page-head">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CategoryBadge category={video.category} />
          <SkillBadge level={video.skillLevel} />
        </div>
        <h1>{video.title}</h1>
        <p>
          {video.procedure} &middot; {formatDuration(video.durationSec)} &middot; {video.instructorName}{' '}
          &middot; {ui.views(video.viewCount)}
        </p>
      </div>

      <div className="video-detail-layout">
        <div>
          <div className="video-player">
            <iframe
              src={video.videoUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <section className="panel" style={{ marginTop: '1rem' }}>
            <h3>{ui.overview}</h3>
            <p>{video.description}</p>
            {video.tags.length ? (
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                {ui.tags} {video.tags.join(' / ')}
              </p>
            ) : null}
          </section>

          {detail.quizzes.length > 0 ? (
            <section className="panel">
              <h3>{ui.relatedTests}</h3>
              {detail.quizzes.map((q) => (
                <div key={q.id} className="quiz-card">
                  <strong>{q.title}</strong>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {ui.passLine(q.passingScore)} &middot; {ui.questions(q.questions.length)}
                  </p>
                  <Link href={`/quizzes/${q.id}`} className="btn btn-outline">
                    {ui.takeTest}
                  </Link>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div>
          <VideoDetailClient
            videoId={id}
            durationSec={video.durationSec}
            initialPosition={progress?.positionSec ?? 0}
            initialCompleted={progress?.completed ?? false}
            bookmarked={bookmarked}
          />

          <section className="panel">
            <h3>{ui.notesList}</h3>
            <ul className="note-list">
              {detail.videoNotes.length === 0 ? (
                <li style={{ color: 'var(--muted)' }}>{ui.noNotes}</li>
              ) : (
                detail.videoNotes.map((n) => (
                  <li key={n.id}>
                    <strong>{n.timestampSec}s</strong> &mdash; {n.body}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
