'use client'

/**
 * 組織設定（SaaS）: テナント情報・利用量・チームメンバー管理。
 * セッション確認後に OrganizationSettings を取得する。
 */
import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { IconArrowRight, IconSave } from '@/components/ui/ButtonIcons'
import {
  CurrentSessionDocument,
  OrganizationSettingsDocument,
  SaasModulesDocument,
  UpdateOrganizationDocument,
} from '@/lib/generated/graphql'
import { isAuthRequiredGraphQLError, isNetworkGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

export default function SettingsPage() {
  const {
    data: sessionData,
    loading: sessionLoading,
  } = useQuery(CurrentSessionDocument, { fetchPolicy: 'network-only' })

  const session = sessionData?.currentSession

  const { data, loading, error, refetch } = useQuery(OrganizationSettingsDocument, {
    skip: !session, // 未ログイン時は org クエリを送らない
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
    return <p className="muted">Loading...</p>
  }

  // 未ログイン・403 と API 接続失敗を分岐して表示
  const authRequired = !session || isAuthRequiredGraphQLError(error)
  const apiFailed = error && isNetworkGraphQLError(error)

  return (
    <>
      <div className="page-head">
        <h1>Organization settings (SaaS)</h1>
        <p>Manage tenant isolation, plan, and usage.</p>
      </div>

      {apiFailed ? (
        <div className="panel">
          <p className="alert">{error.message}</p>
          <p className="muted small">
            API connection failed. Check <Link href="/status">/status</Link> first, then redeploy.
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
              Clinic name
              <input name="name" defaultValue={org.name} required />
            </label>
            <label>
              Slug
              <input name="slug" defaultValue={org.slug} required />
            </label>
            <label>
              Seats
              <input name="seatCount" type="number" defaultValue={org.seatCount} min={1} />
            </label>
            <label>
              Timezone
              <input name="timezone" defaultValue={org.timezone} />
            </label>
            <p className="muted small">
              Plan: {org.planTier} / {org.subscriptionStatus} / members {org.memberCount}
            </p>
            <div className="form-actions">
              <button type="submit" className="btn" disabled={saving}>
                <IconSave />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>

          {usage ? (
            <section className="stat-grid" style={{ marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">Members</div>
                <div className="stat-value">
                  {usage.members} / {usage.membersLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Videos</div>
                <div className="stat-value">
                  {usage.videos} / {usage.videosLimit}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">API (month)</div>
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
            <h3>Team</h3>
            <ul className="metric-list">
              {data?.teamMembers?.map((m) => (
                <li key={m.id}>
                  <span>
                    {m.user.name} ({m.user.email}) - {m.role}
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
