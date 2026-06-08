'use client'

/**
 * 動画詳細の学習操作: 視聴進捗・ブックマーク・タイムスタンプメモ。
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import {
  CreateVideoNoteDocument,
  ToggleBookmarkDocument,
  UpdateWatchProgressDocument,
} from '@/lib/generated/graphql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { ui } from '@/lib/ui'

export function VideoDetailClient({
  videoId,
  durationSec,
  initialPosition,
  initialCompleted,
  bookmarked,
}: {
  videoId: string
  durationSec: number
  initialPosition: number
  initialCompleted: boolean
  bookmarked: boolean
}) {
  const router = useRouter()
  const [position, setPosition] = useState(initialPosition)
  const [completed, setCompleted] = useState(initialCompleted)
  const [isBookmarked, setBookmarked] = useState(bookmarked)
  const [noteBody, setNoteBody] = useState('')
  const [noteTime, setNoteTime] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  const [updateProgress, { loading: savingProgress }] = useMutation(UpdateWatchProgressDocument)
  const [createNote, { loading: savingNote }] = useMutation(CreateVideoNoteDocument)
  const [toggleBookmark, { loading: savingBookmark }] = useMutation(ToggleBookmarkDocument)

  const busy = savingProgress || savingNote || savingBookmark

  async function saveProgress(markComplete?: boolean) {
    setMsg(null)
    try {
      await updateProgress({
        variables: {
          input: {
            videoId,
            learnerId: DEMO_LEARNER_ID,
            // 完了ボタン時は末尾位置 + completed=true
            positionSec: markComplete ? durationSec : position,
            completed: markComplete ?? completed,
          },
        },
      })
      if (markComplete) setCompleted(true)
      setMsg(ui.progressSaved)
      router.refresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : ui.saveFailed)
    }
  }

  async function addNote() {
    if (!noteBody.trim()) return
    try {
      await createNote({
        variables: {
          input: {
            videoId,
            learnerId: DEMO_LEARNER_ID,
            timestampSec: noteTime,
            body: noteBody.trim(),
          },
        },
      })
      setNoteBody('')
      setMsg(ui.noteAdded)
      router.refresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : ui.saveFailed)
    }
  }

  async function onToggleBookmark() {
    try {
      const res = await toggleBookmark({
        variables: { videoId, learnerId: DEMO_LEARNER_ID },
      })
      setBookmarked(Boolean(res.data?.toggleBookmark))
      router.refresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : ui.saveFailed)
    }
  }

  return (
    <div className="video-actions panel">
      <h3>{ui.learningActions}</h3>
      <div className="row video-actions__progress">
        <label>
          {ui.playbackPos}
          <input
            type="number"
            min={0}
            max={durationSec}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
          />
        </label>
        <button type="button" className="btn" disabled={busy} onClick={() => saveProgress()}>
          {ui.saveProgress}
        </button>
        <button type="button" className="btn secondary" disabled={busy} onClick={() => saveProgress(true)}>
          {ui.markComplete}
        </button>
        <button type="button" className={`btn ghost${isBookmarked ? ' active' : ''}`} disabled={busy} onClick={onToggleBookmark}>
          {isBookmarked ? ui.bookmarkRemove : ui.bookmarkAdd}
        </button>
      </div>
      <div className="row video-actions__note">
        <label>
          {ui.timestampNotes}
          <input type="number" min={0} max={durationSec} value={noteTime} onChange={(e) => setNoteTime(Number(e.target.value))} />
        </label>
        <input
          type="text"
          placeholder={ui.notePlaceholder}
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
        />
        <button type="button" className="btn" disabled={busy} onClick={addNote}>
          {ui.addNote}
        </button>
      </div>
      {msg ? <p className="form-msg">{msg}</p> : null}
    </div>
  )
}
