import React from 'react'

import { translateRole } from '../../entities/feedback'
import type { FeedbackRecord, SurveyFormSpec, SurveyRecord } from '../../entities/feedback'
import { HelpCell, LongText, ZonesCell } from './AnswerCells'
import { displayText, EMPTY_VALUE, formatDateTime } from './lib'
import type { ColumnPrefs } from './settings'

/** Groups only exist to keep the settings dialog readable. */
export type ColumnGroup = 'main' | 'answers'

export const COLUMN_GROUP_LABELS: Record<ColumnGroup, string> = {
  main: 'Основные',
  answers: 'Ответы',
}

export type ColumnDef<T> = {
  /** Stable id — it is what the saved layout is keyed by, so never reuse one. */
  id: string
  label: string
  group: ColumnGroup
  /** Real DB column to sort by. Omitted means the column is not sortable. */
  sortColumn?: string
  defaultVisible: boolean
  defaultWidth: number
  /** Set on composite answers, whose compact/detailed rendering is configurable. */
  chipKind?: 'zones' | 'help'
  render: (record: T) => React.ReactNode
}

const idColumn = <T extends { id: number }>(): ColumnDef<T> => ({
  id: 'id',
  label: 'ID',
  group: 'main',
  sortColumn: 'id',
  defaultVisible: true,
  defaultWidth: 70,
  render: (record) => <span className="font-medium">{record.id}</span>,
})

const createdAtColumn = <T extends { created_at: string }>(): ColumnDef<T> => ({
  id: 'created_at',
  label: 'Дата',
  group: 'main',
  sortColumn: 'created_at',
  defaultVisible: true,
  defaultWidth: 170,
  render: (record) => <span className="whitespace-nowrap">{formatDateTime(record.created_at)}</span>,
})

/**
 * Survey columns for one form version.
 *
 * Answers come from the version's own spec, so switching tabs switches the
 * whole set of columns; technical fields are the same for every version.
 * Defaults stay narrow on purpose — anything wide (the long answers, the zone
 * and help chips) is off until someone turns it on in the settings dialog.
 */
export const buildSurveyColumns = (spec: SurveyFormSpec, prefs: ColumnPrefs): ColumnDef<SurveyRecord>[] => {
  const answerColumns: ColumnDef<SurveyRecord>[] = spec.questions.map((question) => {
    const base = {
      id: question.column,
      label: question.short,
      group: 'answers' as const,
      sortColumn: question.column,
    }

    switch (question.kind) {
      case 'zone-ratings':
        return {
          ...base,
          chipKind: 'zones' as const,
          defaultVisible: false,
          defaultWidth: prefs.zonesMode === 'detailed' ? 320 : 110,
          render: (record) => (
            <ZonesCell raw={record[question.column]} mode={prefs.zonesMode} limit={prefs.detailedLimit} />
          ),
        }
      case 'help-offer':
        return {
          ...base,
          chipKind: 'help' as const,
          defaultVisible: false,
          defaultWidth: prefs.helpMode === 'detailed' ? 320 : 130,
          render: (record) => (
            <HelpCell raw={record[question.column]} mode={prefs.helpMode} limit={prefs.detailedLimit} />
          ),
        }
      case 'i18n-key':
        return {
          ...base,
          defaultVisible: true,
          defaultWidth: 150,
          render: (record) => {
            const raw = record[question.column]
            return <span className="break-words">{raw ? translateRole(raw) : EMPTY_VALUE}</span>
          },
        }
      default:
        return {
          ...base,
          defaultVisible: question.semantic === 'name',
          defaultWidth: question.semantic === 'name' ? 160 : 260,
          render: (record) => <LongText value={record[question.column]} />,
        }
    }
  })

  // Technical fields (IP, user agent, screen, UTM…) are deliberately absent:
  // they belong to a single record being inspected, not to a list being
  // scanned, and live in the record modal instead.
  return [idColumn<SurveyRecord>(), ...answerColumns, createdAtColumn<SurveyRecord>()]
}

/** Contact-form columns: a flat, fixed shape with no version to speak of. */
export const buildFeedbackColumns = (): ColumnDef<FeedbackRecord>[] => [
  idColumn<FeedbackRecord>(),
  {
    id: 'name',
    label: 'Имя',
    group: 'main',
    sortColumn: 'name',
    defaultVisible: true,
    defaultWidth: 160,
    render: (record) => <span className="break-words">{displayText(record.name)}</span>,
  },
  {
    id: 'email',
    label: 'Email',
    group: 'main',
    sortColumn: 'email',
    defaultVisible: true,
    defaultWidth: 200,
    render: (record) => <span className="break-all">{displayText(record.email)}</span>,
  },
  {
    id: 'phone',
    label: 'Телефон',
    group: 'main',
    sortColumn: 'phone',
    defaultVisible: true,
    defaultWidth: 140,
    render: (record) => <span className="break-all">{displayText(record.phone)}</span>,
  },
  {
    id: 'message',
    label: 'Сообщение',
    group: 'main',
    sortColumn: 'message',
    defaultVisible: true,
    defaultWidth: 360,
    render: (record) => <LongText value={record.message} />,
  },
  {
    id: 'dest',
    label: 'Источник',
    group: 'main',
    sortColumn: 'dest',
    defaultVisible: true,
    defaultWidth: 120,
    render: (record) => <span className="text-stone-500">{displayText(record.dest)}</span>,
  },
  createdAtColumn<FeedbackRecord>(),
]
