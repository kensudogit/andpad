/** 処置分野 enum のバッジ表示 */
import type { VideoCategory } from '@/lib/generated/graphql'
import { categoryLabels } from '@/lib/labels'

export function CategoryBadge({ category }: { category: VideoCategory }) {
  return <span className="badge badge-category">{categoryLabels[category] ?? category}</span>
}
