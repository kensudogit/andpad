/** REST client for SaaS business modules (proxied to Go /api/saas). */

export class SaasApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'SaasApiError'
  }
}

async function saasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/saas/${path.replace(/^\//, '')}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new SaasApiError(data.error ?? `HTTP ${res.status}`, res.status)
  }
  return data
}

export type SaasModule = {
  code: string
  name: string
  description: string
  enabled: boolean
}

export const saasApi = {
  modules: () => saasFetch<{ modules: SaasModule[] }>('modules'),
  setModuleEnabled: (code: string, enabled: boolean) =>
    saasFetch<SaasModule>(`modules/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
  dx: {
    list: () => saasFetch<{ initiatives: DxInitiative[] }>('dx/initiatives'),
    create: (body: Partial<DxInitiative>) =>
      saasFetch<DxInitiative>('dx/initiatives', { method: 'POST', body: JSON.stringify(body) }),
  },
  crm: {
    list: () => saasFetch<{ contacts: CrmContact[] }>('crm/contacts'),
    create: (body: Partial<CrmContact>) =>
      saasFetch<CrmContact>('crm/contacts', { method: 'POST', body: JSON.stringify(body) }),
    interactions: (contactId: string) =>
      saasFetch<{ interactions: CrmInteraction[] }>(`crm/contacts/${contactId}/interactions`),
    addInteraction: (contactId: string, kind: string, summary: string) =>
      saasFetch<CrmInteraction>(`crm/contacts/${contactId}/interactions`, {
        method: 'POST',
        body: JSON.stringify({ kind, summary }),
      }),
  },
  attendance: {
    records: () => saasFetch<{ records: AttendanceRecord[] }>('attendance/records'),
    clockIn: (note?: string) =>
      saasFetch<AttendanceRecord>('attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({ note: note ?? '' }),
      }),
    clockOut: () => saasFetch<AttendanceRecord>('attendance/clock-out', { method: 'POST' }),
    leave: () => saasFetch<{ requests: LeaveRequest[] }>('attendance/leave'),
    requestLeave: (startDate: string, endDate: string, reason: string) =>
      saasFetch<LeaveRequest>('attendance/leave', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, reason }),
      }),
    approveLeave: (id: string) =>
      saasFetch<LeaveRequest>(`attendance/leave/${id}/approve`, { method: 'POST' }),
  },
  contracts: {
    templates: () => saasFetch<{ templates: ContractTemplate[] }>('contracts/templates'),
    createTemplate: (name: string, body: string) =>
      saasFetch<ContractTemplate>('contracts/templates', {
        method: 'POST',
        body: JSON.stringify({ name, body }),
      }),
    list: () => saasFetch<{ contracts: Contract[] }>('contracts'),
    create: (input: {
      templateId?: string
      title: string
      partyName: string
      partyEmail?: string
      body?: string
    }) =>
      saasFetch<Contract>('contracts', { method: 'POST', body: JSON.stringify(input) }),
    sign: (id: string) => saasFetch<Contract>(`contracts/${id}/sign`, { method: 'POST' }),
  },
  chat: {
    threads: () => saasFetch<{ threads: ChatThread[] }>('chat/threads'),
    thread: (id: string) =>
      saasFetch<{ thread: ChatThread; messages: ChatMessage[] }>(`chat/threads/${id}`),
    send: (message: string, threadId?: string) =>
      saasFetch<ConsultReply>('chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message, threadId: threadId ?? '' }),
      }),
  },
  rag: {
    documents: () => saasFetch<{ documents: RagDocument[] }>('rag/documents'),
    create: (title: string, content: string, tags?: string[]) =>
      saasFetch<RagDocument>('rag/documents', {
        method: 'POST',
        body: JSON.stringify({ title, content, tags: tags ?? [] }),
      }),
    search: (q: string) => saasFetch<{ hits: RagHit[] }>(`rag/search?q=${encodeURIComponent(q)}`),
    answer: (query: string) =>
      saasFetch<{ answer: string; sources: RagHit[] }>('rag/answer', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },
}

export type DxInitiative = {
  id: string
  title: string
  description: string
  status: string
  progressPct: number
  ownerName: string
  dueDate?: string
  taskCount: number
  tasksDone: number
  createdAt: string
}

export type CrmContact = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  stage: string
  notes: string
  createdAt: string
}

export type CrmInteraction = {
  id: string
  contactId: string
  kind: string
  summary: string
  occurredAt: string
}

export type AttendanceRecord = {
  id: string
  userId: string
  userName: string
  clockIn: string
  clockOut?: string
  note: string
}

export type LeaveRequest = {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string
  reason: string
  status: string
  createdAt: string
}

export type ContractTemplate = { id: string; name: string; body: string; createdAt: string }

export type Contract = {
  id: string
  templateId?: string
  title: string
  partyName: string
  partyEmail: string
  body: string
  status: string
  createdAt: string
  signedAt?: string
}

export type ChatThread = { id: string; title: string; createdAt: string }
export type ChatMessage = { id: string; threadId: string; role: string; content: string; createdAt: string }
export type ConsultReply = {
  threadId: string
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}

export type RagDocument = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
}

export type RagHit = {
  documentId: string
  title: string
  snippet: string
  score: number
}
