import React from 'react'
import { ChevronDown, Trash2, X } from 'lucide-react'

import { getSurveyFormSpec, isKnownFormVersion, translateRole } from '../../entities/feedback'
import type { SurveyQuestion, SurveyRecord } from '../../entities/feedback'
import { HelpCell, ZonesCell } from './AnswerCells'
import {
  displayText,
  EMPTY_VALUE,
  formatDateTime,
  formatDimensions,
  formatFillTime,
  formatLanguages,
  formatUtm,
} from './lib'

type SurveyRecordModalProps = {
  record: SurveyRecord
  onClose: () => void
  onDelete?: (record: SurveyRecord) => void
}

/**
 * Technical fields, kept out of the answers block: useful for spotting bots and
 * traffic sources, noise for anyone reading actual feedback.
 */
const META_FIELDS: Array<{ label: string; value: (record: SurveyRecord) => string }> = [
  { label: 'Отправлено (клиент)', value: (r) => formatDateTime(r.submitted_at) },
  { label: 'Время заполнения', value: (r) => formatFillTime(r.fill_time_ms) },
  { label: 'Часовой пояс', value: (r) => displayText(r.timezone) },
  { label: 'Устройство', value: (r) => displayText(r.device_type) },
  { label: 'Экран', value: (r) => formatDimensions(r.screen) },
  { label: 'Окно', value: (r) => formatDimensions(r.viewport) },
  { label: 'Pixel ratio', value: (r) => displayText(r.device_pixel_ratio) },
  { label: 'Сеть', value: (r) => displayText(r.network_type) },
  { label: 'UTM', value: (r) => formatUtm(r.utm) },
  { label: 'Язык интерфейса', value: (r) => displayText(r.lang) },
  { label: 'Языки браузера', value: (r) => formatLanguages(r.languages) },
  { label: 'Accept-Language', value: (r) => displayText(r.accept_language) },
  { label: 'IP', value: (r) => displayText(r.ip) },
  { label: 'Страна', value: (r) => displayText(r.country) },
  { label: 'Referer', value: (r) => displayText(r.referer) },
  { label: 'User-Agent', value: (r) => displayText(r.user_agent) },
]

/** The detail view never truncates — that is the whole point of opening it. */
const AnswerValue: React.FC<{ question: SurveyQuestion; raw: string | null }> = ({ question, raw }) => {
  switch (question.kind) {
    case 'zone-ratings':
      return <ZonesCell raw={raw} mode="detailed" limit={0} />
    case 'help-offer':
      return <HelpCell raw={raw} mode="detailed" limit={0} />
    case 'i18n-key':
      return <span className="text-stone-800">{raw ? translateRole(raw) : EMPTY_VALUE}</span>
    default:
      return <span className="text-stone-800 whitespace-pre-wrap break-words">{displayText(raw)}</span>
  }
}

export const SurveyRecordModal: React.FC<SurveyRecordModalProps> = ({ record, onClose, onDelete }) => {
  const spec = getSurveyFormSpec(record.form_version)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-stone-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Ответ №{record.id}</h2>
            <p className="text-sm text-stone-500">
              {formatDateTime(record.created_at)} · версия формы {record.form_version}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(record)}
                className="text-stone-400 hover:text-red-600 cursor-pointer"
                title="Удалить запись"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              title="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {!isKnownFormVersion(record.form_version) && (
            <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded p-3">
              Версия формы «{record.form_version}» не описана в админке, ответы показаны как есть.
              Опишите её в <code>entities/feedback/form-versions.ts</code>.
            </div>
          )}

          {spec.questions.map((question) => (
            <div key={question.column}>
              <div className="text-sm text-stone-500 mb-1">
                {question.title} <span className="text-stone-400">({question.column})</span>
              </div>
              <AnswerValue question={question} raw={record[question.column]} />
            </div>
          ))}

          <details className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
              <span className="font-medium text-stone-700">Технические данные</span>
              <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
            </summary>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
              {META_FIELDS.map((field) => (
                <div key={field.label} className="flex gap-2">
                  <dt className="text-stone-500 shrink-0">{field.label}:</dt>
                  <dd className="text-stone-800 break-all">{field.value(record)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </div>
    </div>
  )
}
