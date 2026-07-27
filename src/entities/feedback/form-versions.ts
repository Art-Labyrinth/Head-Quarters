/**
 * Meaning of the `q1`..`q10` answer slots per survey form version.
 *
 * `survey_responses` stores answers in fixed, unnamed columns so that a new
 * questionnaire never needs a migration — the price is that a column alone says
 * nothing about what it holds. This module is the missing half: it maps a
 * `form_version` onto human-readable questions, tells the UI how to decode each
 * stored value, and describes which filters that questionnaire supports.
 *
 * Keep it additive. When a new form version ships, add a spec instead of
 * editing an old one, otherwise previously collected answers start rendering
 * under the wrong questions. Each version is a separate tab in the admin UI,
 * because only answers from the same questionnaire are comparable.
 */

// ---------------------------------------------------------------------------
// Shape of a form description
// ---------------------------------------------------------------------------

/** The answer slot columns of `survey_responses`. */
export type SurveyAnswerColumn =
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'

export const SURVEY_ANSWER_COLUMNS: SurveyAnswerColumn[] = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
]

/** How a stored answer has to be decoded before it can be shown. */
export type SurveyAnswerKind =
  /** Free-form text, shown as-is. */
  | 'text'
  /** A public-site translation key, or free text when "other" was picked. */
  | 'i18n-key'
  /** JSON map of zone id -> 'good' | 'bad'. */
  | 'zone-ratings'
  /** JSON `{ contact, options[] }` — willingness to help next year. */
  | 'help-offer'

/**
 * Marks the few answers the list view surfaces as columns. Lookup by meaning
 * rather than by column name keeps the table correct when a later form version
 * moves an answer to a different slot.
 */
export type SurveyAnswerSemantic = 'name' | 'role' | 'zones' | 'help'

export type SurveyQuestion = {
  column: SurveyAnswerColumn
  /** Compact label for table headers and detail rows. */
  short: string
  /** Full wording as the respondent saw it on the public site. */
  title: string
  kind: SurveyAnswerKind
  semantic?: SurveyAnswerSemantic
}

/**
 * A dropdown filter over one answer column.
 *
 * Each option carries the expression the API expects after `column:` in
 * `field_filter`. Two forms exist:
 *   - a bare needle (`feedback.roles.volunteer`), matched as a substring of the
 *     stored value — right for option keys, which are unique and never a prefix
 *     of one another;
 *   - `key=value` (`volunteers=bad`), matched as an exact `"key": "value"`
 *     fragment of a JSON answer — right for the zone ratings map, e.g.
 *     `field_filter=q4:volunteers=bad` finds everyone who rated the volunteers
 *     zone poorly. Not wired into v2026's UI, but the API and this type support
 *     it whenever a questionnaire needs it.
 */
export type SurveyFilterOption = {
  /** Expression sent as `field_filter=<column>:<expression>`. */
  expression: string
  label: string
}

export type SurveyFilterSpec = {
  id: string
  label: string
  column: SurveyAnswerColumn
  options: SurveyFilterOption[]
}

export type SurveyFormSpec = {
  version: string
  /** Tab caption for this questionnaire. */
  title: string
  questions: SurveyQuestion[]
  filters: SurveyFilterSpec[]
}

// ---------------------------------------------------------------------------
// Answer keys used by the public site
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  'feedback.roles.guest': 'Гость',
  'feedback.roles.volunteer': 'Волонтёр',
  'feedback.roles.organizer': 'Организатор',
  'feedback.roles.coordinator': 'Координатор',
  'feedback.roles.musician': 'Музыкант',
  'feedback.roles.master': 'Мастер',
  'feedback.roles.artist': 'Художник',
  'feedback.roles.performer': 'Артист / Перформер',
  'feedback.roles.partner': 'Партнёр / Спонсор',
  'feedback.roles.other': 'Другое',
}

/** Picking "other" replaces the key with free text, so it can never be matched. */
const ROLE_OTHER_KEY = 'feedback.roles.other'

const HELP_OPTION_LABELS: Record<string, string> = {
  'feedback.help_options.organizer': 'Организатор',
  'feedback.help_options.coordinator': 'Координатор',
  'feedback.help_options.volunteer': 'Волонтёр',
  'feedback.help_options.master_class': 'Провести мастер-класс',
  'feedback.help_options.musician': 'Выступить как музыкант',
  'feedback.help_options.build': 'Строить фестиваль',
  'feedback.help_options.art_object': 'Создать арт-объект',
  'feedback.help_options.financial': 'Помочь финансово',
  'feedback.help_options.partner': 'Стать партнёром',
  'feedback.help_options.other': 'Другое',
}

/** Zone ratings are keyed by the site's short zone id, not by a translation key. */
const ZONE_LABELS: Record<string, string> = {
  parking: 'Парковка',
  welcome: 'Welcome Centre',
  info: 'Инфоцентр',
  kitchen: 'Кухня',
  volunteers: 'Волонтёры',
  culture: 'Культурная программа',
  stage_main: 'Главная сцена',
  stage_small: 'Малая сцена',
  yoga: 'Йога зона',
  master: 'Мастер град',
  sport: 'Спорт зона',
  kids: 'Детская зона',
  gallery: 'Арт-галерея',
  tea: 'Чайная',
  wc: 'Туалеты',
}

/** Preserves the order the zones are shown in on the public site. */
const ZONE_ORDER = Object.keys(ZONE_LABELS)

const translate = (dictionary: Record<string, string>, value: string): string =>
  dictionary[value] ?? value

/** Role answer: a known key becomes a label, anything else is the "other" free text. */
export const translateRole = (value: string): string => translate(ROLE_LABELS, value)

export const translateHelpOption = (value: string): string => translate(HELP_OPTION_LABELS, value)

export const translateZone = (zoneId: string): string => translate(ZONE_LABELS, zoneId)

const toFilterOptions = (dictionary: Record<string, string>, skip: string[] = []): SurveyFilterOption[] =>
  Object.entries(dictionary)
    .filter(([key]) => !skip.includes(key))
    .map(([expression, label]) => ({ expression, label }))

// ---------------------------------------------------------------------------
// Known questionnaires
// ---------------------------------------------------------------------------

/**
 * Festival 2026 questionnaire.
 *
 * Note the offset against the public site's translation keys: the site's
 * `q6_title` is stored in column `q5`, and so on — the name field took the
 * first slot. Trust this table, not the column numbers.
 */
const FORM_V2026: SurveyFormSpec = {
  version: 'v2026',
  title: 'Опрос 2026',
  questions: [
    { column: 'q1', short: 'Имя', title: 'Как вас зовут?', kind: 'text', semantic: 'name' },
    { column: 'q2', short: 'Роль', title: 'Ваша роль на фестивале', kind: 'i18n-key', semantic: 'role' },
    { column: 'q3', short: 'Понравилось', title: 'Что вам понравилось больше всего?', kind: 'text' },
    { column: 'q4', short: 'Зоны', title: 'Какие зоны или процессы работали хорошо / нуждаются в улучшении', kind: 'zone-ratings', semantic: 'zones' },
    { column: 'q5', short: 'Улучшить', title: 'Что можно улучшить на фестивале?', kind: 'text' },
    { column: 'q6', short: 'Слабое место', title: 'Что было самым слабым местом фестиваля?', kind: 'text' },
    { column: 'q7', short: 'Идеи', title: 'Если бы вы могли изменить или добавить что-то на фестивале, что бы это было?', kind: 'text' },
    { column: 'q8', short: 'Помощь', title: 'Хотите помочь фестивалю в будущем?', kind: 'help-offer', semantic: 'help' },
    { column: 'q9', short: 'Art-Labyrinth — это…', title: 'Art-Labyrinth для вас — это…', kind: 'text' },
  ],
  filters: [
    {
      id: 'role',
      label: 'Роль',
      column: 'q2',
      options: toFilterOptions(ROLE_LABELS, [ROLE_OTHER_KEY]),
    },
    {
      id: 'help',
      label: 'Готов помочь',
      column: 'q8',
      options: toFilterOptions(HELP_OPTION_LABELS),
    },
  ],
}

/** Newest first — this is the tab order in the admin UI. */
export const SURVEY_FORMS: SurveyFormSpec[] = [FORM_V2026]

const FORM_SPECS: Record<string, SurveyFormSpec> = Object.fromEntries(
  SURVEY_FORMS.map((spec) => [spec.version, spec]),
)

/**
 * Spec for a stored `form_version`.
 *
 * An unknown version degrades to raw `q1`..`q10` slots rather than hiding data:
 * a survey submitted by a newer public site must still be readable here before
 * anyone gets around to describing it.
 */
export const getSurveyFormSpec = (version: string | null | undefined): SurveyFormSpec => {
  const known = version ? FORM_SPECS[version] : undefined
  if (known) {
    return known
  }

  return {
    version: version || 'unknown',
    title: version || 'Без версии',
    questions: SURVEY_ANSWER_COLUMNS.map((column) => ({
      column,
      short: column,
      title: `Вопрос ${column} (версия формы неизвестна)`,
      kind: 'text' as const,
    })),
    filters: [],
  }
}

export const isKnownFormVersion = (version: string | null | undefined): boolean =>
  Boolean(version && FORM_SPECS[version])

/** Which column of this form version holds a given answer, if any. */
export const findAnswerColumn = (
  spec: SurveyFormSpec,
  semantic: SurveyAnswerSemantic,
): SurveyAnswerColumn | null =>
  spec.questions.find((question) => question.semantic === semantic)?.column ?? null

// ---------------------------------------------------------------------------
// Decoding of composite (JSON-encoded) answers
// ---------------------------------------------------------------------------

/**
 * Composite answers are JSON *inside* a string column, so anything can be in
 * there. Every parse below returns a usable value instead of throwing — one
 * malformed row must not blank out the whole table.
 */
const parseJson = <T,>(raw: string | null | undefined): T | null => {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export type ZoneRating = {
  id: string
  label: string
  rating: 'good' | 'bad'
}

/** Decode the zone ratings map, dropping zones the respondent skipped. */
export const parseZoneRatings = (raw: string | null | undefined): ZoneRating[] => {
  const parsed = parseJson<Record<string, unknown>>(raw)
  if (!parsed || typeof parsed !== 'object') {
    return []
  }

  const entries = Object.entries(parsed).filter(
    (entry): entry is [string, 'good' | 'bad'] => entry[1] === 'good' || entry[1] === 'bad',
  )

  return entries
    .sort(([a], [b]) => {
      const indexA = ZONE_ORDER.indexOf(a)
      const indexB = ZONE_ORDER.indexOf(b)
      return (indexA < 0 ? ZONE_ORDER.length : indexA) - (indexB < 0 ? ZONE_ORDER.length : indexB)
    })
    .map(([id, rating]) => ({ id, label: translateZone(id), rating }))
}

export type HelpOffer = {
  contact: string | null
  options: Array<{ key: string; label: string }>
}

/** Decode the "want to help next year" answer. */
export const parseHelpOffer = (raw: string | null | undefined): HelpOffer => {
  const parsed = parseJson<{ contact?: unknown; options?: unknown }>(raw)

  const contact = typeof parsed?.contact === 'string' && parsed.contact.trim() ? parsed.contact : null
  const options = Array.isArray(parsed?.options)
    ? parsed.options
      .filter((option): option is string => typeof option === 'string')
      .map((key) => ({ key, label: translateHelpOption(key) }))
    : []

  return { contact, options }
}

/** Decode a JSON object stored in a metadata column, e.g. `screen` or `utm`. */
export const parseMetaObject = (raw: string | null | undefined): Record<string, unknown> | null => {
  const parsed = parseJson<Record<string, unknown>>(raw)
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
}
