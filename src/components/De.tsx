import type { ReactNode } from 'react'
import { targetBadge } from '../config/lang'

// Target-language translation badge. The badge text follows the active language (DE, EN…).
function De({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-sm italic text-gray-500">
      <span className="mr-1.5 rounded bg-gray-200 px-1 py-0.5 align-middle text-[10px] font-semibold not-italic text-gray-600">
        {targetBadge}
      </span>
      {children}
    </p>
  )
}

export default De
