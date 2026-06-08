/**
 * 動画一覧・ダッシュボード用カード（サムネ・分野・難易度・尺）。
 */
import Image from 'next/image'
import Link from 'next/link'
import type { SkillLevel, VideoCategory } from '@/lib/generated/graphql'
import { formatDuration } from '@/lib/labels'
import { displayText } from '@/lib/display-text'
import { ui } from '@/lib/ui'
import { CategoryBadge } from './CategoryBadge'
import { SkillBadge } from './SkillBadge'

export type VideoCardData = {
  id: string
  title: string
  category: VideoCategory
  skillLevel: SkillLevel
  durationSec: number
  thumbnailUrl: string
  instructorName?: string | null
  viewCount?: number
  description?: string
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <Link href={`/videos/${video.id}`} className="video-card">
      <div className="video-thumb">
        <Image
          src={video.thumbnailUrl}
          alt=""
          width={640}
          height={360}
          unoptimized
        />
        <span className="video-duration">{formatDuration(video.durationSec)}</span>
      </div>
      <div className="video-body">
        <div className="video-badges">
          <CategoryBadge category={video.category} />
          <SkillBadge level={video.skillLevel} />
        </div>
        <h3>{displayText(video.title)}</h3>
        {video.description ? <p className="video-desc">{displayText(video.description)}</p> : null}
        <div className="video-meta">
          {video.instructorName ? <span>{video.instructorName}</span> : null}
          {video.viewCount != null ? (
            <span>
              {video.viewCount.toLocaleString()} {ui.viewCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
