/** マイ学習（視聴進捗・ブックマーク・修了証）。 */
import Link from 'next/link'
import { LearningPageDocument, type LearningPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { formatDuration } from '@/lib/labels'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function LearningPage() {
  let error: string | null = null
  let data: LearningPageQuery | null = null

  try {
    data = await gqlRequest(LearningPageDocument, { learnerId: DEMO_LEARNER_ID })
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  const videoMap = Object.fromEntries((data?.videos.items ?? []).map((v) => [v.id, v]))
  const pathMap = Object.fromEntries((data?.learningPaths ?? []).map((p) => [p.id, p]))

  return (
    <>
      <div className="page-head">
        <h1>{ui.learningTitle}</h1>
        <p>{ui.learningDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      <section className="panel">
        <h3>{ui.certs}</h3>
        {(data?.myCertificates ?? []).length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>{ui.noCerts}</p>
        ) : (
          data!.myCertificates.map((c) => (
            <div key={c.id} className="cert-card">
              <strong>{c.title}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {pathMap[c.pathId]?.title ?? c.pathId} &middot;{' '}
                {new Date(c.issuedAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="panel">
        <h3>{ui.progress}</h3>
        <ul className="note-list">
          {(data?.myProgress ?? []).map((p) => {
            const v = videoMap[p.videoId]
            return (
              <li key={p.id}>
                <Link href={`/videos/${p.videoId}`}>{v?.title ?? p.videoId}</Link>
                {' - '}
                {p.completed ? (
                  <span style={{ color: '#059669' }}>{ui.done}</span>
                ) : (
                  <span>
                    {formatDuration(p.positionSec)} / {v ? formatDuration(v.durationSec) : '?'}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel">
        <h3>{ui.bookmarks}</h3>
        <ul className="note-list">
          {(data?.myBookmarks ?? []).length === 0 ? (
            <li style={{ color: 'var(--muted)' }}>{ui.noBookmarks}</li>
          ) : (
            data!.myBookmarks.map((b) => (
              <li key={b.id}>
                <Link href={`/videos/${b.videoId}`}>
                  {videoMap[b.videoId]?.title ?? b.videoId}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  )
}
