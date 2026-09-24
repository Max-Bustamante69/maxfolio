import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'
import { MetricsAlive } from './experienceLayouts/MetricsAlive'

interface ExperienceProps {
  /** False when the page's own non-lazy wrapper carries the section id (Apple), so the id stays unique and hash links land before this chunk mounts. */
  ownId?: boolean
  skin: Skin
  heading: SectionHeading
}

/**
 * Split 50/50: the roles down a hairline rail on the left (a horizontal strip on phones), one
 * editorial panel on the right — no tiles. "Métricas vivas" (round 44, picked round 46): the panel
 * never unmounts on a role switch, so each metric card's CountUp ticks from the old role's value
 * straight to the new one instead of crossfading through a blank frame. See experienceLayouts/.
 */
export function Experience({ skin, heading, ownId = true }: ExperienceProps) {
  const { strings } = useContent()
  const x = strings.sections.experience

  return (
    <section id={ownId ? 'experience' : undefined} className="scroll-mt-20">
      {heading(x.eyebrow, x.title, x.titleAccent)}
      <MetricsAlive skin={skin} />
    </section>
  )
}
