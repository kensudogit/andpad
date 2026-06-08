/** 学習パス詳細（カリキュラム動画・登録）。 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnrollPathButton } from '@/components/EnrollPathButton'
import { CategoryBadge } from '@/components/CategoryBadge'
import { SkillBadge } from '@/components/SkillBadge'
import { PathDetailPageDocument, type PathDetailPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { formatDuration } from '@/lib/labels'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { displayText } from '@/lib/display-text'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let error: string | null = null
  let data: PathDetailPageQuery | null = null

  try {
    data = await gqlRequest(PathDetailPageDocument, { id })
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  const path = data?.learningPath
  if (!path && !error) notFound()
  if (!path) {
    return (
      <div className="alert">
        <p>{error}</p>
        <p>{graphQLErrorHint(error)}</p>
      </div>
    )
  }

  const videos = data!.videos.items.filter((v) => path.videoIds.includes(v.id))

  return (
    <>
      <div className="page-head">
        <CategoryBadge category={path.category} />
        <SkillBadge level={path.skillLevel} />
        <h1 style={{ marginTop: '0.5rem' }}>{displayText(path.title)}</h1>
        <p>{displayText(path.description)}</p>
      </div>

      <section className="panel">
        <p>
          {ui.pathVideos(path.videoIds.length, path.estimatedMinutes)} &middot; {path.enrolledCount}{' '}
          {ui.unitLearners}
        </p>
        <p>
          <strong>{ui.pathDetailCert}</strong> {path.certificateTitle}
        </p>
        <EnrollPathButton pathId={path.id} />
      </section>

      <section className="panel">
        <h3>{ui.pathCurriculum}</h3>
        <ol style={{ paddingLeft: '1.25rem' }}>
          {videos.map((v, i) => (
            <li key={v.id} style={{ marginBottom: '0.5rem' }}>
              <Link href={`/videos/${v.id}`}>
                {i + 1}. {v.title}
              </Link>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {' '}
                &mdash; {formatDuration(v.durationSec)}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
