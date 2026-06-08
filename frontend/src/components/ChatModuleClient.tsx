'use client'

import Link from 'next/link'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ConsultThreadDocument,
  ConsultThreadsDocument,
  CurrentSessionDocument,
  SaasModuleCode,
  SaasModulesDocument,
  SendConsultMessageDocument,
} from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

function fmtDateTime(s?: string | null) {
  if (!s) return '—'
  return s.replace('T', ' ').slice(0, 16)
}

export function ChatModuleClient() {
  const [input, setInput] = useState('')
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [openaiReady, setOpenaiReady] = useState<boolean | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const { data: sessionData, loading: sessionLoading } = useQuery(CurrentSessionDocument, {
    fetchPolicy: 'network-only',
  })
  const { data: modulesData } = useQuery(SaasModulesDocument, { fetchPolicy: 'cache-first' })
  const chatEnabled =
    modulesData?.saasModules?.some((m) => m.code === SaasModuleCode.Chatbot && m.enabled) ?? false

  useEffect(() => {
    void fetch('/api/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { openai?: boolean } | null) => {
        if (data && typeof data.openai === 'boolean') {
          setOpenaiReady(data.openai)
        }
      })
      .catch(() => {})
  }, [])

  const { data: threadsData, loading: threadsLoading, error: threadsError, refetch: refetchThreads } =
    useQuery(ConsultThreadsDocument, {
      fetchPolicy: 'network-only',
      skip: !chatEnabled || !sessionData?.currentSession,
    })
  const [loadThread, { data: threadData, loading: threadLoading, error: threadError }] = useLazyQuery(
    ConsultThreadDocument,
    { fetchPolicy: 'network-only' },
  )
  const [sendMessage, { loading: sending, error: sendErr }] = useMutation(SendConsultMessageDocument)

  const threads = threadsData?.consultThreads ?? []
  const messages = threadData?.consultThread?.messages ?? []
  const err = formatGqlError(threadsError ?? threadError ?? sendErr, ui.saasLoadFailed)

  const openThread = useCallback(
    async (id: string) => {
      setActiveThreadId(id)
      await loadThread({ variables: { id } })
    },
    [loadThread],
  )

  const startNewThread = () => {
    setActiveThreadId(null)
  }

  const send = async () => {
    if (!input.trim() || sending) return
    try {
      const res = await sendMessage({
        variables: { message: input, threadId: activeThreadId },
      })
      setInput('')
      const threadId = res.data?.sendConsultMessage.threadId
      if (threadId) {
        setActiveThreadId(threadId)
        await refetchThreads()
        await loadThread({ variables: { id: threadId } })
      }
    } catch {
      // sendErr に Apollo が載せる
    }
  }

  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      void openThread(threads[0].id)
    }
  }, [activeThreadId, threads, openThread])

  useEffect(() => {
    const el = logRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, threadLoading, sending])

  if (sessionLoading) {
    return <p className="muted">{ui.boardLoading}</p>
  }

  if (!sessionData?.currentSession) {
    return (
      <div className="alert">
        <p>{ui.saasLoginHint}</p>
        <Link href="/login" className="btn">
          {ui.loginSubmit}
        </Link>
      </div>
    )
  }

  if (!chatEnabled) {
    return (
      <div className="alert">
        <p>{ui.moduleDisabledHint}</p>
        <Link href="/saas" className="btn">
          {ui.saasBack}
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-head">
        <Link href="/saas" className="muted">
          {ui.saasBack}
        </Link>
        <h1>{ui.saasChat}</h1>
        <p className="muted">{ui.saasChatDesc}</p>
      </div>

      {err && <p className="alert">{err}</p>}
      {openaiReady === false ? (
        <p className="alert muted">
          {ui.saasChatOpenaiHint}{' '}
          <Link href="/status">/status</Link>
        </p>
      ) : null}

      <section className="saas-panel">
        <div className="saas-chat-layout">
          <aside className="saas-chat-threads">
            <div className="saas-chat-threads-head">
              <h2>{ui.saasChatThreads}</h2>
              <button type="button" className="btn outline saas-btn-sm" onClick={startNewThread}>
                {ui.saasChatNewThread}
              </button>
            </div>
            {threadsLoading ? (
              <p className="muted saas-chat-threads-empty">{ui.boardLoading}</p>
            ) : threads.length === 0 && !activeThreadId ? (
              <p className="muted saas-chat-threads-empty">{ui.saasChatThreadsEmpty}</p>
            ) : (
              <div className="saas-chat-threads-list">
                <ul>
                  {threads.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={activeThreadId === t.id ? 'active' : ''}
                        onClick={() => void openThread(t.id)}
                      >
                        <span className="saas-chat-thread-title">{t.title || ui.saasChatThread}</span>
                        <span className="saas-chat-thread-date">{fmtDateTime(t.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
          <div className="saas-chat-main">
            <div className="saas-chat-log" ref={logRef}>
              {activeThreadId === null && messages.length === 0 ? (
                <p className="muted saas-chat-welcome">{ui.saasChatWelcome}</p>
              ) : threadLoading && messages.length === 0 ? (
                <p className="muted">{ui.boardLoading}</p>
              ) : messages.length === 0 ? (
                <p className="muted">{ui.saasChatEmpty}</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`saas-chat-bubble ${m.role.toLowerCase() === 'user' ? 'user' : 'assistant'}`}
                  >
                    <p>{m.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="saas-form saas-chat-compose">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                placeholder={ui.saasChatPlaceholder}
                rows={3}
                className="saas-textarea"
              />
              <button type="button" className="btn" disabled={sending || !input.trim()} onClick={() => void send()}>
                {sending ? ui.boardAiBusy : ui.saasChatSend}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function formatGqlError(err: { message?: string } | undefined, fallback: string): string | null {
  if (!err) return null
  const msg = err.message ?? ''
  const lower = msg.toLowerCase()
  if (lower === 'forbidden') {
    return ui.saasLoginHint
  }
  if (isAuthRequiredGraphQLError(err as Parameters<typeof isAuthRequiredGraphQLError>[0])) {
    return lower.includes('module not enabled') ? ui.moduleDisabledHint : ui.saasLoginHint
  }
  if (
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('cannot reach api') ||
    lower.includes('timed out') ||
    lower.includes('timeout')
  ) {
    return 'API への接続がタイムアウトしました。AI 回答の生成には数十秒かかることがあります。'
  }
  return msg || graphQLErrorHint(err.message) || fallback
}
