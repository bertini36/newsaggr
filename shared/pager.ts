/** Which page of a horizontal scroll-snap pager is nearest to the current scroll offset. */
export function getPageIndex(scrollLeft: number, pageWidth: number, pageCount: number) {
  if (pageWidth <= 0 || pageCount <= 0) return 0
  return Math.min(Math.max(Math.round(scrollLeft / pageWidth), 0), pageCount - 1)
}
