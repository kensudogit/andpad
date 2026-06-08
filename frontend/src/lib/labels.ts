/**
 * GraphQL enum の日本語ラベルと動画尺フォーマット。
 */
import type { SkillLevel, VideoCategory } from '@/lib/generated/graphql'

export const categoryLabels: Record<VideoCategory, string> = {
  ENDODONTICS: '\u6b6f\u5185\u7642\u6cd5',
  PERIODONTICS: '\u6b6f\u5468\u75c5',
  PROSTHODONTICS: '\u88dc\u7db6',
  ORAL_SURGERY: '\u53e3\u8154\u5916\u79d1',
  IMPLANT: '\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8',
  ORTHODONTICS: '\u77ef\u6b63',
  PEDIATRIC: '\u5c0f\u5150',
  RADIOLOGY: '\u753b\u50cf\u8a3a\u65ad',
  INFECTION_CONTROL: '\u611f\u67d3\u5bfe\u7b56',
  COMMUNICATION: '\u30b3\u30df\u30e5\u30cb\u30b1\u30fc\u30b7\u30e7\u30f3',
}

export const skillLabels: Record<SkillLevel, string> = {
  BEGINNER: '\u521d\u7d1a',
  INTERMEDIATE: '\u4e2d\u7d1a',
  ADVANCED: '\u4e0a\u7d1a',
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}\u5206${s}\u79d2` : `${m}\u5206`
}
