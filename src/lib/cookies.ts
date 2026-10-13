import { toggled } from './sets'

// Shared cookie helpers. Values are encoded/decoded; one-year lifetime, path=/
// and SameSite=Lax (matching the gelernteWoerter/satzbauWeg pattern already used
// across the project).

export function getCookie(name: string): string {
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : ''
}

export function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`
}

export function getCookieSet(name: string): Set<string> {
  const v = getCookie(name)
  return new Set(v ? v.split('|') : [])
}

export function setCookieSet(name: string, set: Set<string>) {
  if (set.size === 0) deleteCookie(name)
  else setCookie(name, [...set].join('|'))
}

/** Adds (`on`) or removes one entry of a set cookie. */
export function setCookieSetEntry(name: string, entry: string, on: boolean) {
  setCookieSet(name, toggled(getCookieSet(name), entry, on))
}

/** Flips one entry of a set cookie; returns whether it is now in the set. */
export function toggleCookieSetEntry(name: string, entry: string): boolean {
  const on = !getCookieSet(name).has(entry)
  setCookieSetEntry(name, entry, on)
  return on
}

// Returns every cookie whose name starts with the given prefix (used to list notes).
export function listCookies(prefix: string): { name: string; value: string }[] {
  return document.cookie
    .split('; ')
    .filter((c) => c.startsWith(prefix))
    .map((c) => {
      const eq = c.indexOf('=')
      return { name: c.slice(0, eq), value: decodeURIComponent(c.slice(eq + 1)) }
    })
}
