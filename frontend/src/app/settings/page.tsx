'use client'

/**
 * 組織設定（SaaS）: テナント情報・利用量・チームメンバー管理。
 */
import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { IconArrowRight, IconSave } from '@/components/ui/ButtonIcons'
import {
  CurrentSessionDocument,
  MemberRole,
  OrganizationSettingsDocument,
  SaasModulesDocument,
  UpdateOrganizationDocument,
} from '@/lib/generated/graphql'
import { isAuthRequiredGraphQLError, isNetworkGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

const roleLabels: Record<MemberRole, string> = {
  [MemberRole.Owner]: ui.memberRoleOwner,
  [MemberRole.Admin]: ui.memberRoleAdmin,
  [MemberRole.Member]: ui.memberRoleMember,
  [MemberRole.Viewer]: ui.memberRoleViewer,
}

export default function SettingsPage() {
  const {
    data: sessionData,
    loading: sessionLoading,
  } = useQuery(CurrentSessionDocument, { fetchPolicy: 'network-only' })

  const session = sessionData?.currentSession

  const { data, loading, error, refetch } = useQuery(OrganizationSettingsDocument, {
    skip: !session,
    fetchPolicy: 'network-only',
  })
  const { data: saasData } = useQuery(SaasModulesDocument, {
    skip: !session,
    fetchPolicy: 'network-only',
  })
  const [updateOrg, { loading: saving }] = useMutation(UpdateOrganizationDocument)

  const org = data?.organization
  const usage = data?.usageSummary

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await updateOrg({
      variables: {
        input: {
          name: String(fd.get('name') ?? ''),
          slug: String(fd.get('slug') ?? ''),
          seatCount: Number(fd.get('seatCount') ?? 0),
          timezone: String(fd.get('timezone') ?? ''),
        },
      },
    })
    refetch()
  }

  if (sessionLoading || (session && loading)) {
    return <p className="muted">{ui.settingsLoading}</p>
  }

  const authRequired = !session || isAuthRequiredGraphQLError(error)
  const apiFailed = error && isNetworkGraphQLError(error)

  return (
    <>
      <div className="page-head">
        <h1>{ui.settingsTitle}</h1>
        <p>{ui.settingsDesc}</p>
      </div>

      {apiFailed ? (
        <div className="panel">
          <p className="alert">{error.message}</p>
          <p className="muted small">
            {ui.settingsApiFailedHint}{' '}
            <Link href="/status">/status</Link>
          </p>
        </div>
      ) : authRequired ? (
        <div className="panel">
          <p>{ui.settingsSignIn}</p>
          <p className="muted small">{ui.settingsSignInHint}</p>
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>
        </div>
      ) : error ? (
        <div className="panel">
          <p className="alert">{error.message}</p>
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>
        </div>
      ) : !org ? (
        <div className="panel">
          <p>{ui.settingsSignIn}</p>
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>
        </div>
      ) : (
        <>
          <form className="panel auth-form" onSubmit={save}>
            <label>
              {ui.settingsOrgName}
              <input name="name" defaultValue={org.name} required />
            </label>
            <label>
              {ui.settingsSlug}
              <input name="slug" defaultValue={org.slug} required />
            </label>
            <label>
              {ui.settingsSeats}
              <input name="seatCount" type="number" defaultValue={org.seatCount} min={1} />
            </label>
            <label>
              {ui.settingsTimezone}
              <input name="timezone" defaultValue={org.timezone} />
            </label>
            <p className="muted small">
              {ui.settingsPlan(org.planTier, org.subscriptionStatus, org.memberCount)}
            </p>
            <div className="form-actions">
              <button type="submit" className="btn" disabled={saving}>
                <IconSave />
                {saving ? ui.settingsSaving : ui.settingsSave}
              </button>
            </div>
          </form>

          {usage ? (
            <section className="stat-grid" style={{ marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">{ui.settingsMembers}</div>
                <div className="stat-value">
                  {usage.members} / {usage.membersLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{ui.settingsProjects}</div>
                <div className="stat-value">
                  {usage.videos} / {usage.videosLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{ui.settingsApiMonth}</div>
                <div className="stat-value">
                  {usage.apiCallsThisMonth} / {usage.apiCallsLimit}
                </div>
              </div>
            </section>
          ) : null}

          {saasData?.saasModules?.length ? (
            <section className="panel" style={{ marginTop: '1rem' }}>
              <h3>{ui.saasModulesTitle}</h3>
              <ul className="metric-list">
                {saasData.saasModules.map((m) => (
                  <li key={m.code}>
                    <span>
                      {m.name} — {m.enabled ? ui.saasEnabled : ui.saasDisabled}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="muted small">{ui.saasToggleHint}</p>
              <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                <Link href="/saas" className="btn btn-outline">
                  {ui.navSaas}
                  <IconArrowRight />
                </Link>
              </div>
            </section>
          ) : null}

          <section className="panel" style={{ marginTop: '1rem' }}>
            <h3>{ui.settingsTeam}</h3>
            <ul className="metric-list">
              {data?.teamMembers?.map((m) => (
                <li key={m.id}>
                  <span>
                    {m.user.name} ({m.user.email}) — {roleLabels[m.role] ?? m.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}
