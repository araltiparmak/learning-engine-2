import type { ReactNode } from 'react'
import { Link } from 'react-router'

// The frame shared by the pages that show one item of a list (/okuma/:id, /dinleme/:id,
// /konusma/:id, /vakalar/:id, /dersler/:slug…): the way back at the top, a short message
// for an unknown id, and previous/next links at the foot.

/** The "← back to the list" link at the top of a detail page. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm text-brand-600 hover:underline">
      {children}
    </Link>
  )
}

/** What a detail page shows when its id matches nothing. */
export function NotFound({
  back,
  backLabel,
  message,
  className = 'max-w-2xl',
  children,
}: {
  back: string
  backLabel: ReactNode
  message: ReactNode
  className?: string
  /** Anything offered besides the way back (e.g. the lesson in another language). */
  children?: ReactNode
}) {
  return (
    <section className={className}>
      <BackLink to={back}>{backLabel}</BackLink>
      <p className="mt-4 text-gray-600">{message}</p>
      {children}
    </section>
  )
}

export type PagerLink = { to: string; label: ReactNode }

/** Previous/next links at the foot of a detail page; either side may be missing. */
export function PrevNextNav({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
      {prev ? (
        <Link to={prev.to} className="text-brand-600 hover:underline">
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.to} className="text-right text-brand-600 hover:underline">
          {next.label} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
