// Turkish titles become ascii ids (anchors, tab ids): decomposing strips the accents, and
// dotless ı has no decomposition so it is mapped by hand.
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
