export type PageOrientation = 'portrait' | 'landscape'

// Business rule: choose orientation automatically based on total columns.
// Total columns = Tarih + Gün + erkek sütunları + kız sütunları
export function decideOrientation(totalColumns: number): PageOrientation {
  // Heuristic: A4 portrait becomes unreadable at higher column counts.
  return totalColumns >= 10 ? 'landscape' : 'portrait'
}

