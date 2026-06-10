import { SaasModuleCode } from '@/lib/generated/graphql'
import { ui } from '@/lib/ui'

export type ConstructionModuleSlug =
  | 'construction'
  | 'drawings'
  | 'blackboard'
  | 'inspection'
  | 'project-board'
  | 'inquiry-profit'
  | 'orders'
  | 'remote-site'
  | 'doc-approval'
  | 'scan-3d'
  | 'billing'
  | 'work-rate'
  | 'site-access'
  | 'e-delivery'
  | 'bm'
  | 'analytics'
  | 'api-integration'
  | 'bim'
  | 'budget'

export const constructionModuleSlugs: ConstructionModuleSlug[] = [
  'construction',
  'drawings',
  'blackboard',
  'inspection',
  'project-board',
  'inquiry-profit',
  'orders',
  'remote-site',
  'doc-approval',
  'scan-3d',
  'billing',
  'work-rate',
  'site-access',
  'e-delivery',
  'bm',
  'analytics',
  'api-integration',
  'bim',
  'budget',
]

export const specializedModuleSlugs = new Set<ConstructionModuleSlug>([
  'analytics',
  'api-integration',
  'bim',
  'budget',
])

export const constructionModules = [
  { slug: 'construction' as const, code: SaasModuleCode.ConstructionMgmt, label: ui.modConstruction, icon: '施', tone: 'violet', href: '/saas/construction' },
  { slug: 'drawings' as const, code: SaasModuleCode.Drawings, label: ui.modDrawings, icon: '図', tone: 'blue', href: '/saas/drawings' },
  { slug: 'blackboard' as const, code: SaasModuleCode.Blackboard, label: ui.modBlackboard, icon: '黒', tone: 'amber', href: '/saas/blackboard' },
  { slug: 'inspection' as const, code: SaasModuleCode.Inspection, label: ui.modInspection, icon: '検', tone: 'rose', href: '/saas/inspection' },
  { slug: 'project-board' as const, code: SaasModuleCode.ProjectBoard, label: ui.modProjectBoard, icon: '板', tone: 'cyan', href: '/saas/project-board' },
  { slug: 'inquiry-profit' as const, code: SaasModuleCode.InquiryProfit, label: ui.modInquiryProfit, icon: '利', tone: 'indigo', href: '/saas/inquiry-profit' },
  { slug: 'orders' as const, code: SaasModuleCode.Orders, label: ui.modOrders, icon: '発', tone: 'violet', href: '/saas/orders' },
  { slug: 'remote-site' as const, code: SaasModuleCode.RemoteSite, label: ui.modRemoteSite, icon: '遠', tone: 'blue', href: '/saas/remote-site' },
  { slug: 'doc-approval' as const, code: SaasModuleCode.DocApproval, label: ui.modDocApproval, icon: '承', tone: 'amber', href: '/saas/doc-approval' },
  { slug: 'scan-3d' as const, code: SaasModuleCode.Scan_3D, label: ui.modScan3d, icon: '3D', tone: 'rose', href: '/saas/scan-3d' },
  { slug: 'billing' as const, code: SaasModuleCode.Billing, label: ui.modBilling, icon: '請', tone: 'cyan', href: '/saas/billing' },
  { slug: 'work-rate' as const, code: SaasModuleCode.WorkRate, label: ui.modWorkRate, icon: '歩', tone: 'indigo', href: '/saas/work-rate' },
  { slug: 'site-access' as const, code: SaasModuleCode.SiteAccess, label: ui.modSiteAccess, icon: '入', tone: 'violet', href: '/saas/site-access' },
  { slug: 'e-delivery' as const, code: SaasModuleCode.EDelivery, label: ui.modEDelivery, icon: '納', tone: 'blue', href: '/saas/e-delivery' },
  { slug: 'bm' as const, code: SaasModuleCode.Bm, label: ui.modBm, icon: 'BM', tone: 'amber', href: '/saas/bm' },
  { slug: 'analytics' as const, code: SaasModuleCode.Analytics, label: ui.modAnalytics, icon: '析', tone: 'cyan', href: '/saas/analytics' },
  { slug: 'api-integration' as const, code: SaasModuleCode.ApiIntegration, label: ui.modApiIntegration, icon: 'API', tone: 'indigo', href: '/saas/api-integration' },
  { slug: 'bim' as const, code: SaasModuleCode.Bim, label: ui.modBim, icon: 'BIM', tone: 'rose', href: '/saas/bim' },
  { slug: 'budget' as const, code: SaasModuleCode.BudgetMgmt, label: ui.modBudget, icon: '予', tone: 'violet', href: '/saas/budget' },
] as const

export function slugToModuleCode(slug: ConstructionModuleSlug): SaasModuleCode {
  const mod = constructionModules.find((m) => m.slug === slug)
  if (!mod) throw new Error(`unknown module slug: ${slug}`)
  return mod.code
}

export function slugToLabel(slug: ConstructionModuleSlug): string {
  const mod = constructionModules.find((m) => m.slug === slug)
  return mod?.label ?? slug
}
