import type { ReactNode } from 'react'
import Mascot from './Mascot'

function TipBox({
  children,
  className = 'mt-4',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-gray-700 ${className}`}
    >
      <Mascot mood="teach" className="mt-0.5 w-10 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default TipBox
