import { useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'

import type { SortOrder } from '../../entities/feedback'
import { Pagination } from '../../shared/ui/Pagination'
import { ColumnSettingsModal } from './ColumnSettingsModal'
import { RecordsTable } from './RecordsTable'
import type { ColumnDef } from './columns'
import type { ColumnPrefs } from './settings'

type RecordsPanelProps<T extends { id: number }> = {
  /** Every column of this source; the panel hides the ones turned off. */
  columns: ColumnDef<T>[]
  items: T[]
  loading: boolean
  total: number
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  sortBy: string
  order: SortOrder
  onSort: (column: string) => void
  prefs: ColumnPrefs
  onPrefsChange: (patch: Partial<ColumnPrefs>) => void
  onPrefsReset: () => void
  onRowClick?: (record: T) => void
  onDelete?: (record: T) => void
  emptyText: string
  loadingText: string
}

/** Table plus its layout controls: column picker, widths, pagination. */
export function RecordsPanel<T extends { id: number }>({
  columns,
  items,
  loading,
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  sortBy,
  order,
  onSort,
  prefs,
  onPrefsChange,
  onPrefsReset,
  onRowClick,
  onDelete,
  emptyText,
  loadingText,
}: RecordsPanelProps<T>) {
  const [isSettingsOpen, setSettingsOpen] = useState(false)

  const isVisible = (column: ColumnDef<T>): boolean => prefs.visible[column.id] ?? column.defaultVisible
  const widthOf = (column: ColumnDef<T>): number => prefs.widths[column.id] ?? column.defaultWidth

  const visibleColumns = useMemo(
    () => columns.filter((column) => prefs.visible[column.id] ?? column.defaultVisible),
    [columns, prefs.visible],
  )

  const handleToggle = (columnId: string, visible: boolean) => {
    onPrefsChange({ visible: { ...prefs.visible, [columnId]: visible } })
  }

  const handleResize = (columnId: string, width: number) => {
    onPrefsChange({ widths: { ...prefs.widths, [columnId]: width } })
  }

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))
  const rangeStart = total ? (currentPage - 1) * itemsPerPage + 1 : 0
  const rangeEnd = Math.min(currentPage * itemsPerPage, total)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-200">
        <p className="text-sm text-stone-700">
          Показаны <span className="font-medium">{rangeStart}</span>–
          <span className="font-medium">{rangeEnd}</span> из <span className="font-medium">{total}</span>
        </p>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          title="Настроить колонки"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-600 bg-stone-100 rounded hover:bg-stone-200 cursor-pointer"
        >
          <Settings2 size={16} />
          Колонки
          <span className="text-stone-400">{visibleColumns.length}</span>
        </button>
      </div>

      <RecordsTable<T>
        columns={visibleColumns}
        items={items}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        widthOf={widthOf}
        onResize={handleResize}
        onRowClick={onRowClick}
        onDelete={onDelete}
        emptyText={emptyText}
        loadingText={loadingText}
      />

      <div className="bg-white px-4 py-3 border-t border-stone-200 sm:px-6">
        <div className="flex justify-end">
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={onPageChange} />
        </div>
      </div>

      {isSettingsOpen && (
        <ColumnSettingsModal<T>
          columns={columns}
          prefs={prefs}
          isVisible={isVisible}
          onToggle={handleToggle}
          onChange={onPrefsChange}
          onReset={onPrefsReset}
          onClose={() => setSettingsOpen(false)}
          hasZonesColumn={columns.some((column) => column.chipKind === 'zones')}
          hasHelpColumn={columns.some((column) => column.chipKind === 'help')}
        />
      )}
    </div>
  )
}
