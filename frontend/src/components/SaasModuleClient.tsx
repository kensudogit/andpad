'use client'

import Link from 'next/link'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import {
  ApproveLeaveRequestDocument,
  AttendanceModuleDocument,
  ClockInDocument,
  ClockOutDocument,
  ConsultThreadDocument,
  ConsultThreadsDocument,
  CreateContractDocument,
  CreateCrmContactDocument,
  CreateCrmInteractionDocument,
  CreateDxInitiativeDocument,
  CreateLeaveRequestDocument,
  CreateRagDocumentDocument,
  CrmContactsDocument,
  CrmInteractionsDocument,
  ContractsModuleDocument,
  CurrentSessionDocument,
  DxInitiativesDocument,
  RagAnswerDocument,
  RagDocumentsDocument,
  SaasModuleCode,
  SaasModulesDocument,
  SendConsultMessageDocument,
  SignContractDocument,
} from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

type ModuleSlug = 'dx' | 'crm' | 'attendance' | 'contracts' | 'chat' | 'rag'

function fmtDate(s?: string | null) {
  if (!s) return '—'
  return s.slice(0, 10)
}

function fmtDateTime(s?: string | null) {
  if (!s) return '—'
  return s.replace('T', ' ').slice(0, 16)
}

function gqlError(err: { message?: string } | undefined, fallback: string) {
  if (!err) return null
  const msg = err.message ?? ''
  const lower = msg.toLowerCase()
  if (lower === 'forbidden') {
    return 'API の再起動と再ログインが必要です。ターミナルで Ctrl+C → npm run dev:monolith → /login から demo@sakura-dental.jp / demo1234 でログインしてください。'
  }
  if (isAuthRequiredGraphQLError(err as Parameters<typeof isAuthRequiredGraphQLError>[0])) {
    return lower.includes('module not enabled')
      ? 'この SaaS モジュールは無効です。/saas で有効化してください。'
      : ui.saasLoginHint
  }
  if (
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('cannot reach api') ||
    lower.includes('timed out') ||
    lower.includes('timeout')
  ) {
    return 'API への接続がタイムアウトしました。AI 回答の生成には数十秒かかることがあります。しばらく待ってから再送してください。'
  }
  return msg || graphQLErrorHint(err.message) || fallback
}

function StatusBadge({ status }: { status: string }) {
  return <span className="saas-status">{status}</span>
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="saas-empty">
        {ui.saasEmpty}
      </td>
    </tr>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="saas-progress" aria-label={`${pct}%`}>
      <span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

function ModuleHead({ mod }: { mod: ModuleSlug }) {
  const title = {
    dx: ui.saasDx,
    crm: ui.saasCrm,
    attendance: ui.saasAttendance,
    contracts: ui.saasContracts,
    chat: ui.saasChat,
    rag: ui.saasRag,
  }[mod]

  return (
    <div className="page-head">
      <Link href="/saas" className="muted">
        {ui.saasBack}
      </Link>
      <h1>{title}</h1>
    </div>
  )
}

export function SaasModuleClient({ module: mod }: { module: ModuleSlug }) {
  const { data: sessionData, loading: sessionLoading } = useQuery(CurrentSessionDocument, {
    fetchPolicy: 'network-only',
  })

  if (sessionLoading) {
    return <p className="muted">{ui.boardLoading}</p>
  }

  if (!sessionData?.currentSession) {
    return (
      <div className="alert">
        <p>{ui.saasLoginHint}</p>
        <p className="muted small">デモ: demo@sakura-dental.jp / demo1234</p>
        <Link href="/login" className="btn">
          {ui.loginSubmit}
        </Link>
      </div>
    )
  }

  return (
    <>
      <ModuleHead mod={mod} />
      {mod === 'dx' && <DxModuleView />}
      {mod === 'crm' && <CrmModuleView />}
      {mod === 'attendance' && <AttendanceModuleView />}
      {mod === 'contracts' && <ContractsModuleView />}
      {mod === 'chat' && <ChatModuleView />}
      {mod === 'rag' && <RagModuleView />}
    </>
  )
}

function DxModuleView() {
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [desc, setDesc] = useState('')
  const { data, loading, error, refetch } = useQuery(DxInitiativesDocument, { fetchPolicy: 'network-only' })
  const [createDx, { loading: busy, error: mutErr }] = useMutation(CreateDxInitiativeDocument, {
    onCompleted: () => {
      setTitle('')
      setOwner('')
      setDesc('')
      refetch()
    },
  })

  const items = data?.dxInitiatives ?? []
  const err = gqlError(error ?? mutErr, ui.saasLoadFailed)

  return (
    <>
      {err && <p className="alert">{err}</p>}
      <section className="saas-panel">
        <h2>{ui.saasDxNew}</h2>
        <div className="saas-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ui.saasTitle} />
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder={ui.saasOwner} />
          <button
            type="button"
            className="btn"
            disabled={busy || !title.trim()}
            onClick={() =>
              createDx({
                variables: {
                  input: { title, ownerName: owner, description: desc, status: 'PLANNED' },
                },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={ui.saasDesc}
          rows={2}
          className="saas-textarea"
        />
      </section>
      <section className="saas-panel">
        <h2>{ui.saasData}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{ui.saasTitle}</th>
                  <th>{ui.saasOwner}</th>
                  <th>{ui.saasStatus}</th>
                  <th>{ui.saasProgress}</th>
                  <th>{ui.saasDueDate}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <EmptyRow colSpan={5} />
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        {item.description && <p className="saas-cell-sub">{item.description}</p>}
                      </td>
                      <td>{item.ownerName || '—'}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <ProgressBar pct={item.progressPct} />
                        <span className="saas-cell-meta">
                          {item.progressPct}% ({item.tasksDone}/{item.taskCount})
                        </span>
                      </td>
                      <td>{fmtDate(item.dueDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function CrmModuleView() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)

  const { data, loading, error, refetch } = useQuery(CrmContactsDocument, { fetchPolicy: 'network-only' })
  const {
    data: interactionData,
    loading: interactionsLoading,
    refetch: refetchInteractions,
    error: interactionError,
  } = useQuery(CrmInteractionsDocument, {
    skip: !selectedContactId,
    variables: { contactId: selectedContactId ?? '' },
    fetchPolicy: 'network-only',
  })
  const [createContact, { loading: creating, error: createErr }] = useMutation(CreateCrmContactDocument, {
    onCompleted: () => {
      setName('')
      setEmail('')
      setPhone('')
      refetch()
    },
  })
  const [addInteraction, { loading: adding, error: addErr }] = useMutation(CreateCrmInteractionDocument, {
    onCompleted: () => {
      setNote('')
      refetchInteractions()
    },
  })

  const contacts = data?.crmContacts ?? []
  const interactions = interactionData?.crmInteractions ?? []
  const err = gqlError(error ?? createErr ?? addErr ?? interactionError, ui.saasLoadFailed)
  const busy = creating || adding

  return (
    <>
      {err && <p className="alert">{err}</p>}
      <section className="saas-panel">
        <h2>{ui.saasCrmNew}</h2>
        <div className="saas-form">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={ui.saasName} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ui.saasEmail} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={ui.saasPhone} />
          <button
            type="button"
            className="btn"
            disabled={busy || !name.trim()}
            onClick={() => createContact({ variables: { input: { name, email, phone } } })}
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>
      <section className="saas-panel">
        <h2>{ui.saasData}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{ui.saasName}</th>
                  <th>{ui.saasEmail}</th>
                  <th>{ui.saasPhone}</th>
                  <th>{ui.saasStage}</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <EmptyRow colSpan={4} />
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c.id}
                      className={selectedContactId === c.id ? 'saas-row-active' : 'saas-row-clickable'}
                      onClick={() => setSelectedContactId(c.id)}
                    >
                      <td>{c.name}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.phone || '—'}</td>
                      <td>
                        <StatusBadge status={c.stage} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedContactId && (
        <section className="saas-panel">
          <h2>{ui.saasCrmHistory}</h2>
          <div className="saas-form">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={ui.saasCrmNote} />
            <button
              type="button"
              className="btn outline"
              disabled={busy || !note.trim()}
              onClick={() =>
                addInteraction({
                  variables: { contactId: selectedContactId, kind: 'NOTE', summary: note },
                })
              }
            >
              {ui.saasCreate}
            </button>
          </div>
          {interactionsLoading ? (
            <p className="muted">{ui.boardLoading}</p>
          ) : (
            <ul className="saas-list">
              {interactions.length === 0 ? (
                <li className="saas-empty-inline">{ui.saasEmpty}</li>
              ) : (
                interactions.map((i) => (
                  <li key={i.id}>
                    <span className="saas-list-meta">{fmtDateTime(i.occurredAt)}</span>
                    <span className="saas-status">{i.kind}</span>
                    <p>{i.summary}</p>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      )}
    </>
  )
}

function AttendanceModuleView() {
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')

  const { data, loading, error, refetch } = useQuery(AttendanceModuleDocument, { fetchPolicy: 'network-only' })
  const [clockIn, { loading: clockingIn, error: inErr }] = useMutation(ClockInDocument, { onCompleted: () => refetch() })
  const [clockOut, { loading: clockingOut, error: outErr }] = useMutation(ClockOutDocument, {
    onCompleted: () => refetch(),
  })
  const [requestLeave, { loading: requesting, error: leaveErr }] = useMutation(CreateLeaveRequestDocument, {
    onCompleted: () => {
      setLeaveStart('')
      setLeaveEnd('')
      setLeaveReason('')
      refetch()
    },
  })
  const [approveLeave, { loading: approving, error: approveErr }] = useMutation(ApproveLeaveRequestDocument, {
    onCompleted: () => refetch(),
  })

  const records = data?.attendanceRecords ?? []
  const leaveRequests = data?.leaveRequests ?? []
  const err = gqlError(error ?? inErr ?? outErr ?? leaveErr ?? approveErr, ui.saasLoadFailed)
  const busy = clockingIn || clockingOut || requesting || approving

  return (
    <>
      {err && <p className="alert">{err}</p>}
      <section className="saas-panel saas-actions">
        <button type="button" className="btn" disabled={busy} onClick={() => clockIn()}>
          {ui.saasClockIn}
        </button>
        <button type="button" className="btn outline" disabled={busy} onClick={() => clockOut()}>
          {ui.saasClockOut}
        </button>
      </section>
      <section className="saas-panel">
        <h2>{ui.saasLeaveRequest}</h2>
        <div className="saas-form">
          <input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} />
          <input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} />
          <input value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder={ui.saasDesc} />
          <button
            type="button"
            className="btn"
            disabled={busy || !leaveStart || !leaveEnd}
            onClick={() =>
              requestLeave({
                variables: { input: { startDate: leaveStart, endDate: leaveEnd, reason: leaveReason } },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>
      <section className="saas-panel">
        <h2>{ui.saasClockInAt}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{ui.saasName}</th>
                  <th>{ui.saasClockInAt}</th>
                  <th>{ui.saasClockOutAt}</th>
                  <th>{ui.saasDesc}</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <EmptyRow colSpan={4} />
                ) : (
                  records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.userName}</td>
                      <td>{fmtDateTime(r.clockIn)}</td>
                      <td>{fmtDateTime(r.clockOut)}</td>
                      <td>{r.note || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="saas-panel">
        <h2>{ui.saasLeaveList}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{ui.saasName}</th>
                  <th>{ui.saasLeaveStart}</th>
                  <th>{ui.saasLeaveEnd}</th>
                  <th>{ui.saasStatus}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <EmptyRow colSpan={5} />
                ) : (
                  leaveRequests.map((l) => (
                    <tr key={l.id}>
                      <td>{l.userName}</td>
                      <td>{fmtDate(l.startDate)}</td>
                      <td>{fmtDate(l.endDate)}</td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td>
                        {l.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn outline saas-btn-sm"
                            disabled={busy}
                            onClick={() => approveLeave({ variables: { id: l.id } })}
                          >
                            {ui.saasLeaveApprove}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function ContractsModuleView() {
  const [title, setTitle] = useState('')
  const [party, setParty] = useState('')
  const [email, setEmail] = useState('')

  const { data, loading, error, refetch } = useQuery(ContractsModuleDocument, { fetchPolicy: 'network-only' })
  const [createContract, { loading: creating, error: createErr }] = useMutation(CreateContractDocument, {
    onCompleted: () => {
      setTitle('')
      setParty('')
      setEmail('')
      refetch()
    },
  })
  const [signContract, { loading: signing, error: signErr }] = useMutation(SignContractDocument, {
    onCompleted: () => refetch(),
  })

  const templates = data?.contractTemplates ?? []
  const contracts = data?.contracts ?? []
  const err = gqlError(error ?? createErr ?? signErr, ui.saasLoadFailed)
  const busy = creating || signing

  return (
    <>
      {err && <p className="alert">{err}</p>}
      <section className="saas-panel">
        <h2>{ui.saasContractNew}</h2>
        <div className="saas-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ui.saasTitle} />
          <input value={party} onChange={(e) => setParty(e.target.value)} placeholder={ui.saasParty} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ui.saasEmail} />
          <button
            type="button"
            className="btn"
            disabled={busy || !title.trim() || !party.trim()}
            onClick={() =>
              createContract({
                variables: { input: { title, partyName: party, partyEmail: email } },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>
      <section className="saas-panel">
        <h2>{ui.saasContractTemplates}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : templates.length === 0 ? (
          <p className="muted">{ui.saasEmpty}</p>
        ) : (
          <ul className="saas-list">
            {templates.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong>
                <p className="saas-cell-sub">{t.body.slice(0, 120)}…</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="saas-panel">
        <h2>{ui.saasData}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{ui.saasTitle}</th>
                  <th>{ui.saasParty}</th>
                  <th>{ui.saasStatus}</th>
                  <th>{ui.saasDueDate}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <EmptyRow colSpan={5} />
                ) : (
                  contracts.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.partyName}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>{fmtDateTime(c.signedAt ?? c.createdAt)}</td>
                      <td>
                        {c.status !== 'SIGNED' && (
                          <button
                            type="button"
                            className="btn outline saas-btn-sm"
                            disabled={busy}
                            onClick={() => signContract({ variables: { id: c.id } })}
                          >
                            {ui.saasSign}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function ChatModuleView() {
  const [input, setInput] = useState('')
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [openaiReady, setOpenaiReady] = useState<boolean | null>(null)

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

  const { data: threadsData, loading: threadsLoading, error: threadsError, refetch: refetchThreads } = useQuery(
    ConsultThreadsDocument,
    { fetchPolicy: 'network-only' },
  )
  const [loadThread, { data: threadData, loading: threadLoading, error: threadError }] = useLazyQuery(
    ConsultThreadDocument,
    { fetchPolicy: 'network-only' },
  )
  const [sendMessage, { loading: sending, error: sendErr }] = useMutation(SendConsultMessageDocument)

  const threads = threadsData?.consultThreads ?? []
  const messages = threadData?.consultThread?.messages ?? []
  const err = gqlError(threadsError ?? threadError ?? sendErr, ui.saasLoadFailed)

  async function openThread(id: string) {
    setActiveThreadId(id)
    await loadThread({ variables: { id } })
  }

  function startNewThread() {
    setActiveThreadId(null)
  }

  async function send() {
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
      // sendErr に Apollo がエラーを載せる
    }
  }

  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      void openThread(threads[0].id)
    }
  }, [activeThreadId, threads])

  return (
    <>
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
                        onClick={() => openThread(t.id)}
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
            <div className="saas-chat-log">
              {activeThreadId === null && messages.length === 0 ? (
                <p className="muted saas-chat-welcome">{ui.saasChatWelcome}</p>
              ) : threadLoading && messages.length === 0 ? (
                <p className="muted">{ui.boardLoading}</p>
              ) : messages.length === 0 ? (
                <p className="muted">{ui.saasChatEmpty}</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`saas-chat-bubble ${m.role.toLowerCase()}`}>
                    <span className="saas-chat-role">{m.role}</span>
                    <p>{m.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="saas-form saas-chat-compose">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
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

function RagModuleView() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const [openaiReady, setOpenaiReady] = useState<boolean | null>(null)

  const { data: modulesData } = useQuery(SaasModulesDocument, { fetchPolicy: 'cache-first' })
  const ragEnabled =
    modulesData?.saasModules?.some((m) => m.code === SaasModuleCode.DocRag && m.enabled) ?? false

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

  const { data, loading, error, refetch } = useQuery(RagDocumentsDocument, {
    fetchPolicy: 'network-only',
    skip: !ragEnabled,
  })
  const [fetchAnswer, { data: answerData, loading: answering, error: answerErr }] = useLazyQuery(
    RagAnswerDocument,
    { fetchPolicy: 'network-only' },
  )
  const [createDoc, { loading: saving, error: saveErr }] = useMutation(CreateRagDocumentDocument, {
    onCompleted: () => {
      setTitle('')
      setContent('')
      refetch()
    },
  })

  const docs = data?.ragDocuments ?? []
  const answer = answerData?.ragAnswer?.answer ?? ''
  const sources = answerData?.ragAnswer?.sources ?? []
  const err = gqlError(error ?? answerErr ?? saveErr, ui.saasLoadFailed)
  const busy = answering || saving

  if (!ragEnabled) {
    return (
      <div className="alert">
        <p>文書検索 RAG は現在無効です。/saas で「文書検索 RAG」を有効化してください。</p>
        <Link href="/saas" className="btn">
          {ui.saasBack}
        </Link>
      </div>
    )
  }

  return (
    <>
      {err && <p className="alert">{err}</p>}
      {openaiReady === false ? (
        <p className="alert muted">
          OPENAI_API_KEY 未設定のため、キーワード検索結果の表示のみ行います。AI 要約には /status を確認してください。
        </p>
      ) : null}
      <section className="saas-panel">
        <h2>{ui.saasRagAsk}</h2>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ui.saasRagQuery}
          rows={2}
          className="saas-textarea"
        />
        <div className="saas-form">
          <button
            type="button"
            className="btn"
            disabled={busy || !query.trim()}
            onClick={() => fetchAnswer({ variables: { query } })}
          >
            {ui.saasRagAsk}
          </button>
        </div>
        {answer ? (
          <div className="saas-rag-answer">
            <h3>{ui.saasRagAnswer}</h3>
            <p>{answer}</p>
            {sources.length > 0 && (
              <ul className="saas-list saas-rag-sources">
                {sources.map((s) => (
                  <li key={`${s.documentId}-${s.title}`}>
                    <strong>{s.title}</strong>
                    <p>{s.snippet}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="muted">{ui.saasNoAnswer}</p>
        )}
      </section>
      <section className="saas-panel">
        <h2>{ui.saasRagSave}</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ui.saasTitle} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={ui.saasRagContent}
          rows={4}
          className="saas-textarea"
        />
        <button
          type="button"
          className="btn"
          disabled={busy || !title.trim() || !content.trim()}
          onClick={() => createDoc({ variables: { input: { title, content } } })}
        >
          {ui.saasRagSave}
        </button>
      </section>
      <section className="saas-panel">
        <h2>{ui.saasRagDocList}</h2>
        {loading ? (
          <p className="muted">{ui.boardLoading}</p>
        ) : docs.length === 0 ? (
          <p className="muted">{ui.saasEmpty}</p>
        ) : (
          <ul className="saas-list">
            {docs.map((d) => (
              <li key={d.id}>
                <strong>{d.title}</strong>
                {d.tags.length > 0 && (
                  <span className="saas-tags">
                    {d.tags.map((tag) => (
                      <span key={tag} className="saas-tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
                <p className="saas-cell-sub">{d.content.slice(0, 160)}…</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
