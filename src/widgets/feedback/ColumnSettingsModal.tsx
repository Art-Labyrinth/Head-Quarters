import React from 'react'
import { X } from 'lucide-react'

import { COLUMN_GROUP_LABELS } from './columns'
import type { ColumnDef, ColumnGroup } from './columns'
import type { ColumnPrefs, DisplayMode } from './settings'

type ColumnSettingsModalProps<T> = {
  /** Every column of the current source, visible or not. */
  columns: ColumnDef<T>[]
  prefs: ColumnPrefs
  isVisible: (column: ColumnDef<T>) => boolean
  onToggle: (columnId: string, visible: boolean) => void
  onChange: (patch: Partial<ColumnPrefs>) => void
  onReset: () => void
  onClose: () => void
  /** Chip-mode controls only make sense where such columns exist. */
  hasZonesColumn: boolean
  hasHelpColumn: boolean
}

const GROUP_ORDER: ColumnGroup[] = ['main', 'answers']

const ModeToggle: React.FC<{
  label: string
  value: DisplayMode
  onChange: (mode: DisplayMode) => void
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-stone-700">{label}</span>
    <div className="flex rounded overflow-hidden border border-stone-300">
      {(['compact', 'detailed'] as DisplayMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`px-3 py-1 text-sm cursor-pointer ${
            value === mode ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'
          }`}
        >
          {mode === 'compact' ? 'Счётчиком' : 'Подробно'}
        </button>
      ))}
    </div>
  </div>
)

export function ColumnSettingsModal<T>({
  columns,
  prefs,
  isVisible,
  onToggle,
  onChange,
  onReset,
  onClose,
  hasZonesColumn,
  hasHelpColumn,
}: ColumnSettingsModalProps<T>) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: columns.filter((column) => column.group === group),
  })).filter((entry) => entry.items.length > 0)

  const showChipControls = hasZonesColumn || hasHelpColumn

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-stone-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Настройка колонок</h2>
            <p className="text-sm text-stone-500">
              Выбор сохраняется в браузере отдельно для каждой вкладки. Ширину колонок можно тянуть за
              границу заголовка.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 cursor-pointer"
            title="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <h3 className="font-medium text-stone-800 mb-2">{COLUMN_GROUP_LABELS[group]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {items.map((column) => (
                  <label key={column.id} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible(column)}
                      onChange={(event) => onToggle(column.id, event.target.checked)}
                      className="w-4 h-4 border-stone-300 rounded cursor-pointer"
                    />
                    <span className="truncate" title={column.label}>{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {showChipControls && (
            <div className="space-y-3 border-t border-stone-200 pt-5">
              <h3 className="font-medium text-stone-800">Вид составных ответов</h3>

              {hasZonesColumn && (
                <ModeToggle
                  label="Зоны"
                  value={prefs.zonesMode}
                  onChange={(zonesMode) => onChange({ zonesMode })}
                />
              )}
              {hasHelpColumn && (
                <ModeToggle
                  label="Помощь"
                  value={prefs.helpMode}
                  onChange={(helpMode) => onChange({ helpMode })}
                />
              )}

              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-stone-700">
                  Пунктов в подробном виде
                  <span className="block text-xs text-stone-500">Остальные свернутся в «+N». 0 — показывать все.</span>
                </span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={prefs.detailedLimit}
                  onChange={(event) => onChange({ detailedLimit: Math.max(0, Number(event.target.value) || 0) })}
                  className="w-20 px-3 py-1 border border-stone-300 rounded-md"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 p-6 border-t border-stone-200 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-stone-600 bg-stone-100 rounded hover:bg-stone-200 cursor-pointer"
          >
            Сбросить к умолчаниям
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}
