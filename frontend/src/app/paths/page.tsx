/** 学習パス一覧（カリキュラム・修了証）。 */
import Link from 'next/link'
import { CategoryBadge } from '@/components/CategoryBadge'
import { SkillBadge } from '@/components/SkillBadge'
import { PathsPageDocument, type PathsPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { displayText } from '@/lib/display-text'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function PathsPage() {
  let error: string | null = null
  let paths: PathsPageQuery['learningPaths'] = []

  try {
    const data = await gqlRequest(PathsPageDocument, {})
    paths = data.learningPaths
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  return (
    <>
      <div className="page-head">
        <h1>{ui.pathsTitle}</h1>
        <p>{ui.pathsDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      <div className="path-list">
        {paths.map((p) => (
          <Link key={p.id} href={`/paths/${p.id}`} className="path-item">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <CategoryBadge category={p.category} />
              <SkillBadge level={p.skillLevel} />
            </div>
            <h4>{displayText(p.title)}</h4>
            <p>{displayText(p.description)}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {ui.pathVideos(p.videoIds.length, p.estimatedMinutes)} &middot; {displayText(p.certificateTitle)}
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
