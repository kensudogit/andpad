/** 講師・監修者一覧。 */
import { InstructorsPageDocument, type InstructorsPageQuery } from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function InstructorsPage() {
  let error: string | null = null
  let instructors: InstructorsPageQuery['instructors'] = []

  try {
    const data = await gqlRequest(InstructorsPageDocument)
    instructors = data.instructors
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  return (
    <>
      <div className="page-head">
        <h1>{ui.instructorsTitle}</h1>
        <p>{ui.instructorsDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      <div className="instructor-grid">
        {instructors.map((i) => (
          <article key={i.id} className="instructor-card">
            <h3 style={{ margin: '0 0 0.25rem' }}>{i.name}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent)' }}>
              {i.title} &middot; {i.specialty}
            </p>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', lineHeight: 1.5 }}>{i.bio}</p>
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
              {ui.instructorVideos(i.videoCount)}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
