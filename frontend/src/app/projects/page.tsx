import { ProjectsClient } from '@/components/ProjectsClient'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
  return (
    <>
      <div className="page-head">
        <h1>{ui.projectsTitle}</h1>
        <p>{ui.projectsDesc}</p>
      </div>
      <ProjectsClient />
    </>
  )
}
