import React from 'react'
import { Trash2, X } from 'lucide-react'

import type { FeedbackRecord } from '../../entities/feedback'
import { displayText, EMPTY_VALUE, formatDateTime } from './lib'

type FeedbackRecordModalProps = {
  record: FeedbackRecord
  onClose: () => void
  onDelete?: (record: FeedbackRecord) => void
}

/** A contact message exists to be answered, so its address is actionable. */
const ContactLink: React.FC<{ value: string | null; toHref: (value: string) => string }> = ({ value, toHref }) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return <span className="text-stone-800">{EMPTY_VALUE}</span>
  }

  return (
    <a href={toHref(trimmed)} className="text-amber-700 hover:underline break-all">
      {trimmed}
    </a>
  )
}

/**
 * Sender fields, kept apart from the message body: who wrote, how to reach
 * them, and which page the form was submitted from.
 */
const CONTACT_FIELDS: Array<{ label: string; value: (record: FeedbackRecord) => React.ReactNode }> = [
  { label: 'Имя', value: (r) => <span className="text-stone-800 break-words">{displayText(r.name)}</span> },
  { label: 'Email', value: (r) => <ContactLink value={r.email} toHref={(value) => `mailto:${value}`} /> },
  { label: 'Телефон', value: (r) => <ContactLink value={r.phone} toHref={(value) => `tel:${value}`} /> },
  { label: 'Источник', value: (r) => <span className="text-stone-800 break-words">{displayText(r.dest)}</span> },
]

/**
 * Detail view for one contact-form message.
 *
 * The counterpart of `SurveyRecordModal` for the flat `feedback_forms` row:
 * same shell and same controls, but no questionnaire and no technical block —
 * that table stores nothing beyond the sender and the text.
 */
export const FeedbackRecordModal: React.FC<FeedbackRecordModalProps> = ({ record, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-stone-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Сообщение №{record.id}</h2>
            <p className="text-sm text-stone-500">{formatDateTime(record.created_at)}</p>
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
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {CONTACT_FIELDS.map((field) => (
              <div key={field.label}>
                <dt className="text-stone-500 mb-1">{field.label}</dt>
                <dd>{field.value(record)}</dd>
              </div>
            ))}
          </dl>

          <div>
            <div className="text-sm text-stone-500 mb-1">Сообщение</div>
            {/* Never truncated — reading the message in full is the point of opening this. */}
            <p className="text-stone-800 whitespace-pre-wrap break-words">{displayText(record.message)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
