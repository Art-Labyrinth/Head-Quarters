import { useCallback, useEffect, useState } from 'react'

import { LOCALSTORAGE_FEEDBACK_COLUMNS_PREFIX } from '../../shared/configs/constants'

/** Compact renders a one-line summary; detailed renders every value as a chip. */
export type DisplayMode = 'compact' | 'detailed'

export type ColumnPrefs = {
  /**
   * Visibility overrides keyed by column id. Absent means "use the column's
   * default", so a column added in a later release shows up without anyone
   * having to clear their saved layout.
   */
  visible: Record<string, boolean>
  /** Widths in px, keyed by column id; absent means the column's default. */
  widths: Record<string, number>
  zonesMode: DisplayMode
  helpMode: DisplayMode
  /** How many chips a detailed cell shows before collapsing the rest into "+N". */
  detailedLimit: number
}

export const DEFAULT_PREFS: ColumnPrefs = {
  visible: {},
  widths: {},
  zonesMode: 'compact',
  helpMode: 'compact',
  detailedLimit: 3,
}

/** Nothing narrower stays readable; nothing wider fits beside other columns. */
export const MIN_COLUMN_WIDTH = 60
export const MAX_COLUMN_WIDTH = 720

export const clampWidth = (width: number): number =>
  Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, Math.round(width)))

const storageKey = (source: string): string => `${LOCALSTORAGE_FEEDBACK_COLUMNS_PREFIX}${source}`

const readPrefs = (source: string): ColumnPrefs => {
  try {
    const raw = localStorage.getItem(storageKey(source))
    if (!raw) {
      return DEFAULT_PREFS
    }

    const parsed = JSON.parse(raw) as Partial<ColumnPrefs>

    // Merged field by field: a layout saved by an older release is missing the
    // keys added since, and spreading defaults first keeps it usable.
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      visible: { ...parsed.visible },
      widths: { ...parsed.widths },
    }
  } catch {
    return DEFAULT_PREFS
  }
}

/**
 * Column layout for one source, persisted to localStorage.
 *
 * Switching tabs swaps the whole layout: the survey and the contact form have
 * no columns in common, and two survey versions may not either.
 */
export const useColumnPrefs = (source: string) => {
  const [prefs, setPrefs] = useState<ColumnPrefs>(() => readPrefs(source))

  useEffect(() => {
    setPrefs(readPrefs(source))
  }, [source])

  // The write stays outside the state updater: React may invoke an updater more
  // than once, and persistence is a side effect that should happen exactly once.
  const update = useCallback(
    (patch: Partial<ColumnPrefs>) => {
      const next = { ...prefs, ...patch }

      try {
        localStorage.setItem(storageKey(source), JSON.stringify(next))
      } catch {
        // A full or disabled storage must not break the table.
      }

      setPrefs(next)
    },
    [prefs, source],
  )

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(source))
    } catch {
      // Ignored for the same reason as above.
    }

    setPrefs(DEFAULT_PREFS)
  }, [source])

  return { prefs, update, reset }
}
