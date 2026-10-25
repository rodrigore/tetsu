/** Select the whole value on focus so a new number can be typed straight away (works on iOS too). */
export function selectAll(e: Event) {
  const el = e.target as HTMLInputElement
  setTimeout(() => el.setSelectionRange(0, el.value.length), 0)
}
