'use client'

import Script from 'next/script'
import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import { createElement, useEffect, useState } from 'react'
import {
  BimModelsDocument,
  ConstructionProjectsDocument,
  CreateBimModelDocument,
} from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

const DEFAULT_VIEWER = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

export function BimModuleClient() {
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState('glTF')
  const [viewerUrl, setViewerUrl] = useState(DEFAULT_VIEWER)
  const [fileSize, setFileSize] = useState('')
  const [projectId, setProjectId] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: projectsData } = useQuery(ConstructionProjectsDocument, { fetchPolicy: 'network-only' })
  const { data, loading, error, refetch } = useQuery(BimModelsDocument, {
    variables: { projectId: projectId || undefined },
    fetchPolicy: 'network-only',
  })
  const [create, { loading: busy }] = useMutation(CreateBimModelDocument, {
    onCompleted: (res) => {
      setTitle('')
      setSelectedId(res.createBimModel.id)
      refetch()
    },
  })

  const projects = projectsData?.constructionProjects ?? []
  const models = data?.bimModels ?? []
  const selected = models.find((m) => m.id === selectedId) ?? models[0] ?? null

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0].id)
    if (!selectedId && models.length > 0) setSelectedId(models[0].id)
  }, [projectId, projects, selectedId, models])

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  if (error) {
    const msg = isAuthRequiredGraphQLError(error)
      ? ui.saasLoginHint
      : error.message || graphQLErrorHint(error.message)
    return <p className="alert">{msg}</p>
  }

  const isGltf = selected?.format?.toLowerCase().includes('gltf') || selected?.format?.toLowerCase() === 'glb'

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="lazyOnload"
      />
      <div className="page-head">
        <Link href="/saas" className="muted">
          {ui.saasBack}
        </Link>
        <h1>{ui.bimTitle}</h1>
        <p className="muted">{ui.bimDesc}</p>
      </div>

      <section className="saas-panel">
        <h2>{ui.bimNew}</h2>
        <div className="saas-form">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ui.saasTitle} />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="IFC">IFC</option>
            <option value="glTF">glTF</option>
            <option value="Revit">Revit</option>
          </select>
          <input value={viewerUrl} onChange={(e) => setViewerUrl(e.target.value)} placeholder={ui.bimViewerUrl} />
          <input type="number" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder={ui.bimFileSize} />
          <button
            type="button"
            className="btn"
            disabled={busy || !title.trim() || !projectId}
            onClick={() =>
              create({
                variables: {
                  input: {
                    projectId,
                    title,
                    format,
                    viewerUrl,
                    fileSizeMb: fileSize ? parseFloat(fileSize) : undefined,
                  },
                },
              })
            }
          >
            {ui.saasCreate}
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>
        <section className="saas-panel">
          <h2>{ui.bimSelectModel}</h2>
          {models.length === 0 ? (
            <p className="muted">{ui.bimNoModel}</p>
          ) : (
            <ul className="bim-model-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {models.map((m) => (
                <li key={m.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn${selected?.id === m.id ? '' : ' btn-ghost'}`}
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => setSelectedId(m.id)}
                  >
                    <strong>{m.title}</strong>
                    <div className="muted small">
                      {m.format} · {m.projectName}
                      {m.fileSizeMb != null ? ` · ${m.fileSizeMb}MB` : ''}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="saas-panel">
          <h2>{ui.bimViewer}</h2>
          {selected ? (
            <>
              <p className="muted small">
                {selected.title} ({selected.format}) — {selected.uploadedBy}
              </p>
              <div
                className="bim-viewer-frame"
                style={{
                  width: '100%',
                  height: '480px',
                  background: '#1a1f2e',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginTop: '0.5rem',
                }}
              >
                {isGltf ? (
                  createElement('model-viewer', {
                    src: selected.viewerUrl,
                    alt: selected.title,
                    'camera-controls': true,
                    'auto-rotate': true,
                    'shadow-intensity': '1',
                    style: { width: '100%', height: '100%' },
                  })
                ) : (
                  <iframe
                    title={selected.title}
                    src={selected.viewerUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="fullscreen"
                  />
                )}
              </div>
            </>
          ) : (
            <p className="muted">{ui.bimNoModel}</p>
          )}
        </section>
      </div>
    </>
  )
}
