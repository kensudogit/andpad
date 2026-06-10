import { AnalyticsModuleClient } from '@/components/AnalyticsModuleClient'
import { ApiIntegrationClient } from '@/components/ApiIntegrationClient'
import { BimModuleClient } from '@/components/BimModuleClient'
import { BudgetModuleClient } from '@/components/BudgetModuleClient'
import { ConstructionModuleClient } from '@/components/ConstructionModuleClient'
import {
  constructionModuleSlugs,
  specializedModuleSlugs,
  type ConstructionModuleSlug,
} from '@/lib/construction-modules'
import { notFound } from 'next/navigation'

const allowed = new Set<string>(constructionModuleSlugs)

export const dynamic = 'force-dynamic'

export default async function SaasModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  if (!allowed.has(module)) notFound()

  const slug = module as ConstructionModuleSlug

  if (slug === 'analytics') return <AnalyticsModuleClient />
  if (slug === 'api-integration') return <ApiIntegrationClient />
  if (slug === 'bim') return <BimModuleClient />
  if (slug === 'budget') return <BudgetModuleClient />
  if (specializedModuleSlugs.has(slug)) notFound()

  return <ConstructionModuleClient module={slug} />
}
