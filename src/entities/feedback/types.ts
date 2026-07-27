/** Row of the legacy `feedback_forms` table — the plain contact form. */
export type FeedbackRecord = {
  id: number
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  dest: string | null
  created_at: string
  deleted_at: string | null
}

/**
 * Row of `survey_responses` — the structured questionnaire.
 *
 * `q1`..`q10` are version-agnostic answer slots: what each one holds is defined
 * by `form_version`, not by the column name. See `form-versions.ts` for the
 * mapping. Composite answers are stored as JSON-encoded strings.
 */
export type SurveyRecord = {
  id: number
  form_version: string
  q1: string | null
  q2: string | null
  q3: string | null
  q4: string | null
  q5: string | null
  q6: string | null
  q7: string | null
  q8: string | null
  q9: string | null
  q10: string | null
  submitted_at: string | null

  // Client-provided context; composite values arrive as JSON strings.
  timezone: string | null
  utm: string | null
  device_type: string | null
  screen: string | null
  viewport: string | null
  device_pixel_ratio: string | null
  languages: string | null
  network_type: string | null
  fill_time_ms: string | null

  // Server-derived metadata.
  ip: string | null
  country: string | null
  lang: string | null
  user_agent: string | null
  accept_language: string | null
  referer: string | null

  created_at: string
  deleted_at: string | null
}

/** Either table's row — the endpoint returns whichever the source selected. */
export type FeedbackAnyRecord = FeedbackRecord | SurveyRecord

/** `GET /feedback/records` response: one dataset, one page. */
export type TablePage<T> = {
  total: number
  items: T[]
}

/**
 * Which dataset to read. `'feedback'` is the contact-message table; any other
 * value is a survey `form_version` such as `'v2026'`. There is deliberately no
 * "everything" option — the two tables have nothing in common but a date.
 */
export const FEEDBACK_SOURCE = 'feedback'

export type RecordSource = string

export type SortOrder = 'asc' | 'desc'

export const isFeedbackSource = (source: RecordSource): boolean => source === FEEDBACK_SOURCE

/**
 * Which table a row came from. `form_version` is the honest discriminant: the
 * contact form has no such notion, and every survey row carries one.
 */
export const isSurveyRecord = (record: FeedbackAnyRecord): record is SurveyRecord =>
  'form_version' in record
