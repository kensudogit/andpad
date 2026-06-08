'use client'

import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import { useState } from 'react'
import {
  ApiIntegrationsDocument,
  CreateApiIntegrationDocument,
  SyncApiIntegrationDocument,
} from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

function fmtDateTime(s?: string | null) {
  if (!s) return '—'
  return s.replace('T', ' ').slice(0, 16)
}

export function ApiIntegrationClient() {
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [keyHint, setKeyHint] = useState('')

  const { data, loading, error, refetch } = useQuery(ApiIntegrationsDocument, {
    fetchPolicy: 'network-only',
  })
  const [create, { loading: busy }] = useMutation(CreateApiIntegrationDocument, {
    onCompleted: () => {
      setName('')
      setProvider('')
      setEndpoint('')
      setKeyHint('')
      refetch()
    },
  })
  const [sync, { loading: syncing }] = useMutation(SyncApiIntegrationDocument, {
    onCompleted: () => refetch(),
  })

  const items = data?.apiIntegrations ?? []

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  const errMsg = error
    ? isAuthRequiredGraphQLError(error)
      ? ui.saasLoginHint
      : error.message
    : null

  return (
    <>
      <div className="page-head">
        <Link href="/saas" className="muted">
          {ui.saasBack}
        </Link>
        <h1>{ui.apiIntegrationTitle}</h1>
        <p className="muted">{ui.apiIntegrationDesc}</p>
      </div>

      {errMsg && <p className="alert">{errMsg}</p>}

      <section className="saas-panel">
        <h2>{ui.apiIntegrationNew}</h2>
        <div className="saas-form">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={ui.saasTitle} />
          <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder={ui.apiProvider} />
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder={ui.apiEndpoint} />
          <input value={keyHint} onChange={(e) => setKeyHint(e.target.value)} placeholder={ui.apiKeyHint} />
          <button
            type="button"
            className="btn"
            disabled={busy || !name.trim()}
            onClick={() =>
              create({
                variables: {
                  input: { name, provider, endpointUrl: endpoint, apiKeyHint: keyHint },
                },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>

      <section className="saas-panel">
        <h2>{ui.saasData}</h2>
        <div className="saas-table-wrap">
          <table className="saas-table">
            <thead>
              <tr>
                <th>{ui.saasTitle}</th>
                <th>{ui.apiProvider}</th>
                <th>{ui.apiEndpoint}</th>
                <th>{ui.saasStatus}</th>
                <th>{ui.apiLastSync}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="saas-empty">
                    {ui.saasEmpty}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="muted small">{item.apiKeyHint}</div>
                    </td>
                    <td>{item.provider || '—'}</td>
                    <td className="small">{item.endpointUrl || '—'}</td>
                    <td>
                      <span className="saas-status">{item.status}</span>
                    </td>
                    <td>{fmtDateTime(item.lastSyncAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={syncing}
                        onClick={() => sync({ variables: { id: item.id } })}
                      >
                        {ui.apiSync}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
