'use client'

import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import { BrandLogo } from '@/components/BrandLogo'
import { businessModules } from '@/lib/business-modules'
import { constructionModules } from '@/lib/construction-modules'
import {
  CurrentSessionDocument,
  SaasModulesDocument,
  SetSaasModuleEnabledDocument,
  SaasModuleCode,
  MemberRole,
} from '@/lib/generated/graphql'
import { isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { saasModuleArtUrl } from '@/lib/saas-module-art'
import { ui } from '@/lib/ui'

function canManageModules(role: MemberRole | undefined): boolean {
  return role === MemberRole.Owner || role === MemberRole.Admin
}

export function SaasHubClient() {
  const { data: sessionData } = useQuery(CurrentSessionDocument, { fetchPolicy: 'cache-first' })
  const { data, loading, error, refetch } = useQuery(SaasModulesDocument, {
    fetchPolicy: 'network-only',
  })
  const [setEnabled, { loading: toggling }] = useMutation(SetSaasModuleEnabledDocument)

  const modules = data?.saasModules ?? []
  const role = sessionData?.currentSession?.role
  const canToggle = canManageModules(role)

  async function toggle(code: SaasModuleCode, enabled: boolean) {
    if (!canToggle) return
    await setEnabled({ variables: { code, enabled } })
    await refetch()
  }

  if (loading) {
    return (
      <div className="saas-hub-loading">
        <BrandLogo size={56} animated />
        <p className="muted">{ui.boardLoading}</p>
      </div>
    )
  }

  if (error) {
    const authRequired = isAuthRequiredGraphQLError(error)
    return (
      <div className="alert">
        <p>{authRequired ? ui.saasLoginHint : error.message}</p>
        {authRequired && (
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>
        )}
      </div>
    )
  }

  const enabledCodes = new Set(modules.filter((m) => m.enabled).map((m) => m.code))

  function renderModuleCard(
    item: {
      slug: string
      href: string
      code: SaasModuleCode
      label: string
      icon: string
      tone: string
    },
    index: number,
    description: string,
  ) {
    const on = enabledCodes.has(item.code)
    return (
      <article
        key={item.href}
        className={`saas-card saas-card--${item.tone}${on ? '' : ' disabled'}`}
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <div
          className="saas-card-art"
          style={{ backgroundImage: `url(${saasModuleArtUrl(item.slug)})` }}
          aria-hidden
        />
        <div className="saas-card-inner">
          <div className="saas-card-head">
            <span className={`saas-card-icon saas-card-icon--${item.tone}`} aria-hidden>
              {item.icon}
            </span>
            <div className="saas-card-body">
              <Link href={on ? item.href : '/saas'} className="saas-card-link">
                <h3>{item.label}</h3>
                <p>{description}</p>
              </Link>
            </div>
            {canToggle ? (
              <label className="saas-toggle" title={on ? ui.saasDisable : ui.saasEnable}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={toggling}
                  onChange={(e) => toggle(item.code, e.target.checked)}
                />
                <span className="saas-toggle-ui" aria-hidden />
              </label>
            ) : null}
          </div>
          <div className="saas-card-foot">
            <span className={`saas-badge${on ? ' on' : ''}`}>
              {on ? ui.saasEnabled : ui.saasDisabled}
            </span>
            {on ? (
              <Link href={item.href} className="saas-open-link">
                {ui.saasOpen}
                <span aria-hidden>›</span>
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <header className="saas-hub-hero">
        <BrandLogo size={72} animated className="saas-hub-hero-logo" />
        <div className="saas-hub-hero-text">
          <h1>{ui.saasHubTitle}</h1>
          <p>{ui.saasHubDesc}</p>
        </div>
      </header>

      <p className="muted saas-hub-hint">
        {canToggle ? ui.saasToggleHint : ui.saasToggleViewOnly}
      </p>

      <h2 className="saas-section-title">{ui.saasBusinessModules}</h2>
      <div className="saas-grid">
        {businessModules.map((item, index) => {
          const mod = modules.find((m) => m.code === item.code)
          return renderModuleCard(item, index, mod?.description ?? item.description)
        })}
      </div>

      <h2 className="saas-section-title">{ui.saasConstructionModules}</h2>
      <div className="saas-grid">
        {constructionModules.map((item, index) => {
          const mod = modules.find((m) => m.code === item.code)
          return renderModuleCard(item, index, mod?.description ?? '')
        })}
      </div>
    </>
  )
}
