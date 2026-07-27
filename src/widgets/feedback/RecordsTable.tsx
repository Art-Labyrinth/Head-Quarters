import React, { useCallback, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from 'lucide-react'

import type { SortOrder } from '../../entities/feedback'
import type { ColumnDef } from './columns'
import { clampWidth } from './settings'

const ACTIONS_WIDTH = 56

type RecordsTableProps<T extends { id: number }> = {
  /** Already filtered down to the visible columns, in display order. */
  columns: ColumnDef<T>[]
  items: T[]
  loading: boolean
  sortBy: string
  order: SortOrder
  onSort: (column: string) => void
  widthOf: (column: ColumnDef<T>) => number
  onResize: (columnId: string, width: number) => void
  onRowClick?: (record: T) => void
  onDelete?: (record: T) => void
  emptyText: string
  loadingText: string
}

/**
 * Fixed-layout table: every column has an explicit width, so no cell can stretch
 * the row on the strength of one long answer — text wraps inside its column and
 * the table scrolls horizontally instead of the page.
 *
 * Widths are draggable by the header's right edge. The drag is held in local
 * state and only handed back on mouse-up, so a resize writes the saved layout
 * once rather than on every mouse move.
 */
export function RecordsTable<T extends { id: number }>({
  columns,
  items,
  loading,
  sortBy,
  order,
  onSort,
  widthOf,
  onResize,
  onRowClick,
  onDelete,
  emptyText,
  loadingText,
}: RecordsTableProps<T>) {
  const [drag, setDrag] = useState<{ id: string; width: number } | null>(null)
  const dragRef = useRef<{ id: string; width: number } | null>(null)

  const startResize = useCallback(
    (event: React.MouseEvent, column: ColumnDef<T>) => {
      event.preventDefault()
      event.stopPropagation()

      const startX = event.clientX
      const startWidth = widthOf(column)

      const handleMove = (moveEvent: MouseEvent) => {
        const width = clampWidth(startWidth + moveEvent.clientX - startX)
        dragRef.current = { id: column.id, width }
        setDrag({ id: column.id, width })
      }

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''

        if (dragRef.current) {
          onResize(dragRef.current.id, dragRef.current.width)
        }

        dragRef.current = null
        setDrag(null)
      }

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [onResize, widthOf],
  )

  const effectiveWidth = (column: ColumnDef<T>): number =>
    drag && drag.id === column.id ? drag.width : widthOf(column)

  const totalWidth =
    columns.reduce((sum, column) => sum + effectiveWidth(column), 0) + (onDelete ? ACTIONS_WIDTH : 0)
  const columnCount = columns.length + (onDelete ? 1 : 0)

  return (
    <div className="overflow-x-auto">
      <table className="table-fixed divide-y divide-stone-200" style={{ width: totalWidth, minWidth: '100%' }}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.id} style={{ width: effectiveWidth(column) }} />
          ))}
          {onDelete && <col style={{ width: ACTIONS_WIDTH }} />}
        </colgroup>

        <thead className="bg-stone-50">
          <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
            {columns.map((column) => {
              const isActive = Boolean(column.sortColumn) && sortBy === column.sortColumn
              const Icon = isActive ? (order === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown

              return (
                <th key={column.id} className="relative px-4 py-3 align-bottom">
                  {column.sortColumn ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.sortColumn!)}
                      className={`flex items-center gap-1 text-left uppercase tracking-wider cursor-pointer hover:text-stone-700 ${
                        isActive ? 'text-amber-700' : 'text-stone-500'
                      }`}
                      title={column.label}
                    >
                      <span className="truncate">{column.label}</span>
                      <Icon size={14} className={isActive ? 'shrink-0' : 'shrink-0 opacity-40'} />
                    </button>
                  ) : (
                    <span className="block truncate" title={column.label}>{column.label}</span>
                  )}

                  {/* Drag handle sits on the column border, like a spreadsheet. */}
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    onMouseDown={(event) => startResize(event, column)}
                    className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-amber-400/60 active:bg-amber-500"
                  />
                </th>
              )
            })}
            {onDelete && <th className="px-4 py-3" />}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-stone-200">
          {loading && (
            <tr className="text-sm text-stone-500">
              <td className="px-4 py-4" colSpan={columnCount}>{loadingText}</td>
            </tr>
          )}

          {!loading && !items.length && (
            <tr className="text-sm text-stone-500">
              <td className="px-4 py-4" colSpan={columnCount}>{emptyText}</td>
            </tr>
          )}

          {!loading && items.map((record) => (
            <tr
              key={record.id}
              className={`text-sm text-stone-700 hover:bg-stone-100 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={onRowClick ? () => onRowClick(record) : undefined}
            >
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-3 align-top overflow-hidden">
                  {column.render(record)}
                </td>
              ))}

              {onDelete && (
                <td className="px-4 py-3 align-top">
                  <button
                    type="button"
                    title="Удалить запись"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(record)
                    }}
                    className="text-stone-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
