import { parseMetaObject } from '../../entities/feedback'

export const EMPTY_VALUE = '—'

/** Trim a stored answer and turn blanks (including "  ") into a dash. */
export const displayText = (value: string | null | undefined): string => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : EMPTY_VALUE
}

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return EMPTY_VALUE
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

/** `fill_time_ms` is stored as a string; show it in seconds. */
export const formatFillTime = (value: string | null | undefined): string => {
  const ms = Number(value)
  if (!value || Number.isNaN(ms)) {
    return EMPTY_VALUE
  }

  return `${(ms / 1000).toFixed(1)} с`
}

/** `screen` and `viewport` hold `{width, height}` as JSON. */
export const formatDimensions = (value: string | null | undefined): string => {
  const parsed = parseMetaObject(value)
  if (!parsed) {
    return displayText(value)
  }

  const { width, height } = parsed
  return width && height ? `${width}×${height}` : displayText(value)
}

/** `utm` holds `{source, medium, campaign}`; an empty object means no campaign. */
export const formatUtm = (value: string | null | undefined): string => {
  const parsed = parseMetaObject(value)
  if (!parsed) {
    return displayText(value)
  }

  const entries = Object.entries(parsed).filter(([, item]) => item !== null && item !== '')
  return entries.length ? entries.map(([key, item]) => `${key}: ${item}`).join(', ') : EMPTY_VALUE
}

/** `languages` holds a JSON array of locale tags. */
export const formatLanguages = (value: string | null | undefined): string => {
  if (!value) {
    return EMPTY_VALUE
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) && parsed.length ? parsed.join(', ') : EMPTY_VALUE
  } catch {
    return value
  }
}
