import React from 'react'

import { parseHelpOffer, parseZoneRatings } from '../../entities/feedback'
import { displayText, EMPTY_VALUE } from './lib'
import type { DisplayMode } from './settings'

/** Free-form answers can be long; clamp the row height and keep the full text in a tooltip. */
export const LongText: React.FC<{ value: string | null }> = ({ value }) => {
  const text = displayText(value)

  return (
    <span className="line-clamp-4 whitespace-pre-wrap break-words" title={text === EMPTY_VALUE ? undefined : text}>
      {text}
    </span>
  )
}

type CellProps = {
  raw: string | null
  mode: DisplayMode
  /** Chips shown before the rest collapses into "+N"; 0 means no limit. */
  limit: number
}

const Chip: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`px-1.5 py-0.5 rounded text-xs whitespace-nowrap ${className}`}>{children}</span>
)

const Overflow: React.FC<{ count: number }> = ({ count }) => (
  <span className="text-xs text-stone-500 whitespace-nowrap">+{count}</span>
)

/** Chips wrap onto as many rows as the column width needs. */
const ChipRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap gap-1">{children}</div>
)

const applyLimit = <T,>(items: T[], limit: number): { shown: T[]; hidden: number } => {
  if (limit <= 0 || items.length <= limit) {
    return { shown: items, hidden: 0 }
  }

  return { shown: items.slice(0, limit), hidden: items.length - limit }
}

export const ZonesCell: React.FC<CellProps> = ({ raw, mode, limit }) => {
  const ratings = parseZoneRatings(raw)

  if (!ratings.length) {
    return <span className="text-stone-400">{EMPTY_VALUE}</span>
  }

  if (mode === 'compact') {
    const good = ratings.filter((zone) => zone.rating === 'good').length

    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-green-700 font-medium">{good} ✓</span>
        <span className="text-red-700 font-medium">{ratings.length - good} −</span>
      </span>
    )
  }

  // Problem zones first: a list truncated to N is only useful if the N that
  // survive are the ones worth acting on.
  const ordered = [...ratings].sort((a, b) => Number(a.rating === 'good') - Number(b.rating === 'good'))
  const { shown, hidden } = applyLimit(ordered, limit)

  return (
    <ChipRow>
      {shown.map((zone) => (
        <Chip
          key={zone.id}
          className={zone.rating === 'good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {zone.label} {zone.rating === 'good' ? '✓' : '−'}
        </Chip>
      ))}
      {hidden > 0 && <Overflow count={hidden} />}
    </ChipRow>
  )
}

export const HelpCell: React.FC<CellProps> = ({ raw, mode, limit }) => {
  const { contact, options } = parseHelpOffer(raw)

  if (!options.length && !contact) {
    return <span className="text-stone-400">{EMPTY_VALUE}</span>
  }

  if (mode === 'compact') {
    return (
      <span className="inline-flex items-center gap-2">
        <Chip className="bg-amber-100 text-amber-800">{options.length ? `Да · ${options.length}` : 'Да'}</Chip>
        {contact && <span className="text-xs text-stone-500">есть контакт</span>}
      </span>
    )
  }

  const { shown, hidden } = applyLimit(options, limit)

  return (
    <div className="space-y-1">
      <ChipRow>
        {shown.map((option) => (
          <Chip key={option.key} className="bg-amber-100 text-amber-800">{option.label}</Chip>
        ))}
        {hidden > 0 && <Overflow count={hidden} />}
      </ChipRow>
      {contact && <div className="text-xs text-stone-600 break-all">{contact}</div>}
    </div>
  )
}
