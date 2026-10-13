import type { ReactNode } from 'react'
import { Link } from 'react-router'

// Shared by lesson documents and any page copy that carries a link (VerbMap's footer).
// Inline formatting: **bold**, *italic*, [link](/path).
export function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] != null) nodes.push(<strong key={key++}>{m[1]}</strong>)
    else if (m[2] != null) nodes.push(<em key={key++}>{m[2]}</em>)
    else
      nodes.push(
        <Link key={key++} to={m[4]} className="text-brand-600 hover:underline">
          {m[3]}
        </Link>,
      )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
