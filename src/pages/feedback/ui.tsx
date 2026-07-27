import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import debounce from 'debounce'

import { MainLayout } from '../../widgets/layouts/main'
import {
  FeedbackRecordModal,
  RecordsPanel,
  SurveyRecordModal,
  buildFeedbackColumns,
  buildSurveyColumns,
  useColumnPrefs,
} from '../../widgets/feedback'
import {
  FEEDBACK_SOURCE,
  SURVEY_FORMS,
  getSurveyFormSpec,
  isFeedbackSource,
  isSurveyRecord,
  useFeedbackRecordsStore,
} from '../../entities/feedback'
import type { FeedbackAnyRecord, FeedbackRecord, SortOrder, SurveyRecord } from '../../entities/feedback'
import { useUserStore } from '../../entities/user'
import { hasModuleRight } from '../../shared/lib'

const ITEMS_PER_PAGE = 20

/**
 * URL parameter holding the answer filters, repeated once per active filter and
 * carrying the API's own `column:expression` syntax — so building the request is
 * a copy rather than a translation.
 */
const FILTER_PARAM = 'ff'

/** Tabs are the datasets themselves: one per survey version, plus contact messages. */
const TABS = [
  ...SURVEY_FORMS.map((spec) => ({ source: spec.version, label: spec.title })),
  { source: FEEDBACK_SOURCE, label: 'Фидбеки' },
]

export const FeedbackPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { session } = useUserStore()
  const { items, total, loading, error, getRecords, removeRecord } = useFeedbackRecordsStore()

  const canDelete = hasModuleRight(session, 'feedback', 4)

  const source = searchParams.get('source') || TABS[0].source
  const isFeedback = isFeedbackSource(source)
  const spec = useMemo(() => getSurveyFormSpec(source), [source])

  const currentPage = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') ?? ''
  const createdFrom = searchParams.get('created_from') ?? ''
  const createdTo = searchParams.get('created_to') ?? ''
  const sortBy = searchParams.get('sort_by') ?? 'created_at'
  const order: SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
  const fieldFilters = useMemo(() => searchParams.getAll(FILTER_PARAM), [searchParams])

  const [searchInput, setSearchInput] = useState(search)
  // Both tabs open a detail view, but over different tables — the record itself
  // says which modal to render, so one slot serves both.
  const [selected, setSelected] = useState<FeedbackAnyRecord | null>(null)

  const { prefs, update: updatePrefs, reset: resetPrefs } = useColumnPrefs(source)

  const surveyColumns = useMemo(() => buildSurveyColumns(spec, prefs), [spec, prefs])
  const feedbackColumns = useMemo(() => buildFeedbackColumns(), [])

  const patchParams = useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)

        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === '') {
            next.delete(key)
          } else {
            next.set(key, value)
          }
        }

        return next
      }, { replace })
    },
    [setSearchParams],
  )

  // Typing must not spam the API nor flood the history stack, hence debounce +
  // replace. The value itself still lives in the URL, so the view is shareable.
  const pushSearch = useMemo(
    () => debounce((value: string) => patchParams({ search: value, page: null }, true), 400),
    [patchParams],
  )

  useEffect(() => () => pushSearch.clear(), [pushSearch])

  const fetchRecords = useCallback(() => {
    const params = new URLSearchParams()
    params.set('source', source)
    params.set('offset', String((currentPage - 1) * ITEMS_PER_PAGE))
    params.set('limit', String(ITEMS_PER_PAGE))
    params.set('sort_by', sortBy)
    params.set('order', order)

    if (search) params.set('search', search)
    if (createdFrom) params.set('created_from', createdFrom)
    // The picker yields a date, but the filter compares datetimes — without the
    // end of day the chosen day itself would be excluded.
    if (createdTo) params.set('created_to', `${createdTo}T23:59:59`)

    for (const filter of fieldFilters) {
      params.append('field_filter', filter)
    }

    void getRecords(params)
  }, [source, currentPage, sortBy, order, search, createdFrom, createdTo, fieldFilters, getRecords])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleTabChange = (next: string) => {
    if (next === source) {
      return
    }

    // Datasets share no columns, so a sort or an answer filter carried over
    // from another tab would silently do nothing on the backend.
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.delete(FILTER_PARAM)
      params.delete('page')
      params.delete('sort_by')
      params.delete('order')
      params.set('source', next)
      return params
    })
  }

  const handleSort = (column: string) => {
    const nextOrder = sortBy === column && order === 'desc' ? 'asc' : 'desc'
    patchParams({ sort_by: column, order: nextOrder, page: null })
  }

  /** One dropdown owns one column, so replacing its entry is enough. */
  const setFieldFilter = (column: string, expression: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      const kept = params.getAll(FILTER_PARAM).filter((value) => !value.startsWith(`${column}:`))

      params.delete(FILTER_PARAM)
      for (const value of kept) {
        params.append(FILTER_PARAM, value)
      }
      if (expression) {
        params.append(FILTER_PARAM, `${column}:${expression}`)
      }

      params.delete('page')
      return params
    })
  }

  const fieldFilterValue = (column: string): string => {
    const prefix = `${column}:`
    return fieldFilters.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? ''
  }

  const handleDelete = async (record: { id: number }) => {
    if (!window.confirm(`Удалить запись №${record.id}? Она скроется из списка, но останется в базе.`)) {
      return
    }

    const removed = await removeRecord(record.id, source)
    if (removed) {
      setSelected(null)
      fetchRecords()
    }
  }

  const hasActiveFilters = Boolean(search || createdFrom || createdTo || fieldFilters.length)

  const clearFilters = () => {
    setSearchInput('')
    pushSearch.clear()
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.delete(FILTER_PARAM)
      params.delete('search')
      params.delete('created_from')
      params.delete('created_to')
      params.delete('page')
      return params
    })
  }

  const panelProps = {
    loading,
    total,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: (page: number) => patchParams({ page: String(page) }),
    sortBy,
    order,
    onSort: handleSort,
    prefs,
    onPrefsChange: updatePrefs,
    onPrefsReset: resetPrefs,
    onDelete: canDelete ? handleDelete : undefined,
  }

  return (
    <MainLayout header={'Feedback'} fullWidth>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-1">Обратная связь</h1>
        <p className="text-stone-600">Ответы на опросы фестиваля и сообщения из формы обратной связи.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.source}
            onClick={() => handleTabChange(tab.source)}
            className={`px-4 py-2 rounded cursor-pointer ${
              source === tab.source ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200 mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={isFeedback ? 'Поиск по имени, email, сообщению' : 'Поиск по тексту ответов'}
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
                pushSearch(event.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm text-stone-600 flex items-center gap-2">
              С
              <input
                type="date"
                value={createdFrom}
                onChange={(event) => patchParams({ created_from: event.target.value, page: null })}
                className="px-3 py-2 border border-stone-300 rounded-md"
              />
            </label>
            <label className="text-sm text-stone-600 flex items-center gap-2">
              По
              <input
                type="date"
                value={createdTo}
                onChange={(event) => patchParams({ created_to: event.target.value, page: null })}
                className="px-3 py-2 border border-stone-300 rounded-md"
              />
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-stone-600 bg-stone-100 rounded hover:bg-stone-200 cursor-pointer whitespace-nowrap"
              >
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Answer filters, described by the questionnaire itself. */}
        {!isFeedback && spec.filters.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {spec.filters.map((filter) => (
              <label key={filter.id} className="text-sm text-stone-600 flex items-center gap-2">
                {filter.label}
                <select
                  value={fieldFilterValue(filter.column)}
                  onChange={(event) => setFieldFilter(filter.column, event.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-md bg-white"
                >
                  <option value="">Все</option>
                  {filter.options.map((option) => (
                    <option key={option.expression} value={option.expression}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        {!isFeedback && (
          <p className="text-xs text-stone-500">
            Текстовый поиск идёт по значениям в базе: роли и варианты помощи хранятся ключами
            (например, <code>feedback.roles.volunteer</code>), а не переведённым текстом — для них
            используйте фильтры выше.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded p-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchRecords}
            className="px-3 py-1 bg-white border border-red-200 rounded hover:bg-red-100 cursor-pointer"
          >
            Повторить
          </button>
        </div>
      )}

      {isFeedback ? (
        <RecordsPanel<FeedbackRecord>
          {...panelProps}
          columns={feedbackColumns}
          items={items as FeedbackRecord[]}
          onRowClick={setSelected}
          emptyText="Сообщений не найдено"
          loadingText="Загрузка сообщений..."
        />
      ) : (
        <RecordsPanel<SurveyRecord>
          {...panelProps}
          columns={surveyColumns}
          items={items as SurveyRecord[]}
          onRowClick={setSelected}
          emptyText="Ответов не найдено"
          loadingText="Загрузка ответов..."
        />
      )}

      {selected && (isSurveyRecord(selected) ? (
        <SurveyRecordModal
          record={selected}
          onClose={() => setSelected(null)}
          onDelete={canDelete ? handleDelete : undefined}
        />
      ) : (
        <FeedbackRecordModal
          record={selected}
          onClose={() => setSelected(null)}
          onDelete={canDelete ? handleDelete : undefined}
        />
      ))}
    </MainLayout>
  )
}

export default FeedbackPage
