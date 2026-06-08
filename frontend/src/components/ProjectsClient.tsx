'use client'

import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import { useState } from 'react'
import {
  ConstructionProjectStatus,
  ConstructionProjectsDocument,
  CreateConstructionProjectDocument,
} from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

function fmtDate(s?: string | null) {
  if (!s) return '—'
  return s.slice(0, 10)
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PLANNING: ui.projectPlanning,
    IN_PROGRESS: ui.projectInProgress,
    COMPLETED: ui.projectCompleted,
    ON_HOLD: ui.projectOnHold,
  }
  return map[status] ?? status
}

export function ProjectsClient() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [manager, setManager] = useState('')

  const { data, loading, error, refetch } = useQuery(ConstructionProjectsDocument, {
    fetchPolicy: 'network-only',
  })
  const [createProject, { loading: busy, error: mutErr }] = useMutation(CreateConstructionProjectDocument, {
    onCompleted: () => {
      setName('')
      setAddress('')
      setManager('')
      refetch()
    },
  })

  const projects = data?.constructionProjects ?? []
  const errMsg = (() => {
    const err = error ?? mutErr
    if (!err) return null
    if (isAuthRequiredGraphQLError(err as Parameters<typeof isAuthRequiredGraphQLError>[0])) {
      return ui.saasLoginHint
    }
    return err.message || graphQLErrorHint(err.message) || ui.saasLoadFailed
  })()

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  return (
    <>
      {errMsg && <p className="alert">{errMsg}</p>}

      <section className="saas-panel">
        <h2>{ui.projectNew}</h2>
        <div className="saas-form">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={ui.projectName} />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={ui.siteAddress} />
          <input value={manager} onChange={(e) => setManager(e.target.value)} placeholder={ui.saasOwner} />
          <button
            type="button"
            className="btn"
            disabled={busy || !name.trim()}
            onClick={() =>
              createProject({
                variables: {
                  input: {
                    name,
                    siteAddress: address,
                    managerName: manager,
                    status: ConstructionProjectStatus.Planning,
                  },
                },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>

      <section className="saas-panel">
        <h2>{ui.projectList}</h2>
        <div className="saas-table-wrap">
          <table className="saas-table">
            <thead>
              <tr>
                <th>{ui.projectName}</th>
                <th>{ui.siteAddress}</th>
                <th>{ui.saasStatus}</th>
                <th>{ui.saasOwner}</th>
                <th>{ui.recordCount}</th>
                <th>{ui.period}</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="saas-empty">
                    {ui.saasEmpty}
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.siteAddress || '—'}</td>
                    <td>
                      <span className="saas-status">{statusLabel(p.status)}</span>
                    </td>
                    <td>{p.managerName || '—'}</td>
                    <td>{p.recordCount}</td>
                    <td>
                      {fmtDate(p.startDate)} 〜 {fmtDate(p.endDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="muted">
        {ui.projectModuleHint}{' '}
        <Link href="/saas">{ui.navSaas}</Link>
      </p>
    </>
  )
}
