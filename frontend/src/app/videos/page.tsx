/** 動画ライブラリ一覧（カテゴリ・難易度・検索・ページング）。 */
import Link from 'next/link'
import { VideoCard } from '@/components/VideoCard'
import { IconSearch } from '@/components/ui/ButtonIcons'
import {
  VideosPageDocument,
  type VideoCategory,
  type SkillLevel,
  type VideosPageQuery,
} from '@/lib/generated/graphql'
import { gqlRequest } from '@/lib/gql'
import { categoryLabels, skillLabels } from '@/lib/labels'
import { graphQLErrorHint } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

const categories = Object.keys(categoryLabels) as VideoCategory[]
const levels = Object.keys(skillLabels) as SkillLevel[]

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; skillLevel?: string; search?: string; page?: string }>
}) {
  const sp = await searchParams
  const category = sp.category as VideoCategory | undefined
  const skillLevel = sp.skillLevel as SkillLevel | undefined
  const search = sp.search
  const page = sp.page ? parseInt(sp.page, 10) : 1

  let error: string | null = null
  let items: VideosPageQuery['videos']['items'] = []
  let pageInfo = { total: 0, page: 1, pageSize: 12, totalPages: 1 }

  try {
    const data = await gqlRequest(VideosPageDocument, {
      category: category || undefined,
      skillLevel: skillLevel || undefined,
      search: search || undefined,
      page,
    })
    items = data.videos.items
    pageInfo = data.videos.pageInfo
  } catch (e) {
    error = e instanceof Error ? e.message : ui.graphqlError
  }

  const q = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (category) p.set('category', category)
    if (skillLevel) p.set('skillLevel', skillLevel)
    if (search) p.set('search', search)
    Object.entries(extra).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else p.delete(k)
    })
    const s = p.toString()
    return s ? `?${s}` : ''
  }

  return (
    <>
      <div className="page-head">
        <h1>{ui.videosTitle}</h1>
        <p>{ui.videosDesc}</p>
      </div>

      {error ? (
        <div className="alert">
          <p>{error}</p>
          <p>{graphQLErrorHint(error)}</p>
        </div>
      ) : null}

      <form className="search-bar" action="/videos" method="get">
        <input name="search" placeholder={ui.searchPlaceholder} defaultValue={search} />
        <button type="submit" className="btn">
          <IconSearch />
          {ui.search}
        </button>
      </form>

      <div className="filters">
        <Link href="/videos" className={!category ? 'filter-link active' : 'filter-link'}>
          {ui.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/videos${q({ category: c, page: undefined })}`}
            className={category === c ? 'filter-link active' : 'filter-link'}
          >
            {categoryLabels[c]}
          </Link>
        ))}
      </div>

      <div className="filters">
        {levels.map((l) => (
          <Link
            key={l}
            href={`/videos${q({ skillLevel: l, page: undefined })}`}
            className={skillLevel === l ? 'filter-link active' : 'filter-link'}
          >
            {skillLabels[l]}
          </Link>
        ))}
      </div>

      <div className="video-grid">
        {items.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>

      {pageInfo.totalPages > 1 ? (
        <div className="pagination-bar">
          {page > 1 ? (
            <Link href={`/videos${q({ page: String(page - 1) })}`} className="filter-link">
              {ui.prev}
            </Link>
          ) : null}
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', padding: '0 0.25rem' }}>
            {ui.pageOf(pageInfo.page, pageInfo.totalPages, pageInfo.total)}
          </span>
          {page < pageInfo.totalPages ? (
            <Link href={`/videos${q({ page: String(page + 1) })}`} className="filter-link">
              {ui.next}
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
