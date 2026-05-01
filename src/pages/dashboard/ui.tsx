import React, {useEffect, useMemo, useState} from 'react';
import {Check, Columns2, Columns3, GripVertical, LayoutDashboard, Settings2} from 'lucide-react';
import {MainLayout} from '../../widgets/layouts/main';
import {useUserStore} from '../../entities/user';
import {canAccessQrGeneration, canAccessTicketsArchive} from '../../shared/lib';
import {SeriesInfo} from './blocks/SeriesInfo';
import {QrCodeGeneration} from './blocks/QrCodeGeneration';
import {TicketsArchive} from './blocks/TicketsArchive';
import {SalesStats} from './blocks/SalesStats';

const LS_COLUMNS_KEY = 'dashboard_columns'
const LS_LAYOUT_KEY = 'dashboard_block_layout'
const DEFAULT_LAYOUT: Record<ColumnIndex, BlockId[]> = {
  1: ['series', 'qr', 'archive'],
  2: ['sales-stats'],
  3: [],
}

type ColumnCount = 1 | 2 | 3
type ColumnIndex = 1 | 2 | 3
type BlockId = 'series' | 'qr' | 'archive' | 'sales-stats'
type DropTarget = {column: ColumnIndex, index: number} | null
type DragItem = {id: BlockId, fromColumn: ColumnIndex, fromIndex: number} | null
type DashboardLayout = Record<ColumnIndex, BlockId[]>

const COLUMN_OPTIONS = [
  {value: 1 as ColumnCount, icon: LayoutDashboard, label: '1 колонка'},
  {value: 2 as ColumnCount, icon: Columns2, label: '2 колонки'},
  {value: 3 as ColumnCount, icon: Columns3, label: '3 колонки'},
]

const ACTIVE_COLUMNS: Record<ColumnCount, ColumnIndex[]> = {
  1: [1],
  2: [1, 2],
  3: [1, 2, 3],
}

const GRID_CLASS: Record<ColumnCount, string> = {
  1: 'grid grid-cols-1 gap-4 items-start',
  2: 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-start',
  3: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start',
}

const readColumnsFromStorage = (): ColumnCount => {
  const saved = localStorage.getItem(LS_COLUMNS_KEY)
  if (saved === '1') return 1
  if (saved === '3') return 3
  return 2
}

const isBlockId = (value: unknown): value is BlockId => value === 'series' || value === 'qr' || value === 'archive' || value === 'sales-stats'

const sanitizeLayout = (layout: DashboardLayout, available: BlockId[]): DashboardLayout => {
  const seen = new Set<BlockId>()
  const next: DashboardLayout = {1: [], 2: [], 3: []}

  for (const column of [1, 2, 3] as const) {
    for (const block of layout[column]) {
      if (available.includes(block) && !seen.has(block)) {
        next[column].push(block)
        seen.add(block)
      }
    }
  }

  for (const block of available) {
    if (!seen.has(block)) {
      next[1].push(block)
    }
  }

  return next
}

const readLayoutFromStorage = (available: BlockId[]): DashboardLayout => {
  try {
    const saved = localStorage.getItem(LS_LAYOUT_KEY) || JSON.stringify(DEFAULT_LAYOUT)
      const parsed = JSON.parse(saved) as unknown
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>
        const rawLayout: DashboardLayout = {
          1: Array.isArray(obj['1']) ? obj['1'].filter(isBlockId) : [],
          2: Array.isArray(obj['2']) ? obj['2'].filter(isBlockId) : [],
          3: Array.isArray(obj['3']) ? obj['3'].filter(isBlockId) : [],
        }
        return sanitizeLayout(rawLayout, available)
      }
  } catch { /* ignore */ }

  return sanitizeLayout({1: [...available], 2: [], 3: []}, available)
}

const persistLayout = (layout: DashboardLayout) => {
  localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify(layout))
}

const rebalanceLayoutByColumns = (layout: DashboardLayout, columnCount: ColumnCount): DashboardLayout => {
  const activeColumns = ACTIVE_COLUMNS[columnCount]
  const lastColumn = activeColumns[activeColumns.length - 1]
  const next: DashboardLayout = {1: [], 2: [], 3: []}

  for (const column of activeColumns) {
    next[column] = [...layout[column]]
  }

  for (const column of [1, 2, 3] as const) {
    if (!activeColumns.includes(column)) {
      next[lastColumn].push(...layout[column])
    }
  }

  return next
}

export const Dashboard: React.FC = () => {
  const {session} = useUserStore()
  const canUseQrGeneration = canAccessQrGeneration(session)
  const canUseTicketArchive = canAccessTicketsArchive(session)

  const availableBlocks = useMemo<BlockId[]>(() => {
    const blocks: BlockId[] = ['series', 'sales-stats']
    if (canUseQrGeneration) blocks.push('qr')
    if (canUseTicketArchive) blocks.push('archive')
    return blocks
  }, [canUseQrGeneration, canUseTicketArchive])

  const [columns, setColumns] = useState<ColumnCount>(readColumnsFromStorage)
  const [layout, setLayout] = useState<DashboardLayout>(() => readLayoutFromStorage(availableBlocks))
  const [editMode, setEditMode] = useState(false)
  const [dragItem, setDragItem] = useState<DragItem>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget>(null)

  useEffect(() => {
    const normalized = sanitizeLayout(layout, availableBlocks)
    const changed = JSON.stringify(normalized) !== JSON.stringify(layout)
    if (changed) {
      setLayout(normalized)
      persistLayout(normalized)
    }
  }, [availableBlocks, layout])

  const handleColumnChange = (value: ColumnCount) => {
    setColumns(value)
    localStorage.setItem(LS_COLUMNS_KEY, String(value))

    setLayout((prev) => {
      const normalized = sanitizeLayout(prev, availableBlocks)
      const rebalanced = sanitizeLayout(rebalanceLayoutByColumns(normalized, value), availableBlocks)
      persistLayout(rebalanced)
      return rebalanced
    })
  }

  const handleDragStart = (id: BlockId, fromColumn: ColumnIndex, fromIndex: number) => {
    setDragItem({id, fromColumn, fromIndex})
  }

  const handleDragOver = (e: React.DragEvent, column: ColumnIndex, index: number) => {
    e.preventDefault()
    if (dragItem) {
      setDropTarget({column, index})
    }
  }

  const handleDrop = (toColumn: ColumnIndex, toIndex: number) => {
    if (!dragItem) return

    setLayout((prev) => {
      const next: DashboardLayout = {
        1: [...prev[1]],
        2: [...prev[2]],
        3: [...prev[3]],
      }

      const fromList = next[dragItem.fromColumn]
      const originalIndex = fromList.indexOf(dragItem.id)
      if (originalIndex === -1) {
        return prev
      }

      fromList.splice(originalIndex, 1)

      const targetList = next[toColumn]
      const adjustedIndex = dragItem.fromColumn === toColumn && originalIndex < toIndex ? toIndex - 1 : toIndex
      const safeIndex = Math.max(0, Math.min(adjustedIndex, targetList.length))
      targetList.splice(safeIndex, 0, dragItem.id)

      const normalized = sanitizeLayout(next, availableBlocks)
      persistLayout(normalized)
      return normalized
    })

    setDragItem(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDragItem(null)
    setDropTarget(null)
  }

  const activeColumns = ACTIVE_COLUMNS[columns]

  const renderBlock = (id: BlockId) => {
    switch (id) {
      case 'series': return <SeriesInfo />
      case 'qr': return <QrCodeGeneration accessToken={session?.access_token} />
      case 'archive': return <TicketsArchive accessToken={session?.access_token} />
      case 'sales-stats': return <SalesStats />
      default: return null
    }
  }

  return (
    <MainLayout header={'Dashboard'}>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, {session?.username}!</h1>
          <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            title={editMode ? 'Готово' : 'Редактировать расположение'}
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editMode ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500 hover:text-stone-700'
            }`}
          >
            {editMode ? <Check size={18} /> : <Settings2 size={18} />}
          </button>

          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            {COLUMN_OPTIONS.map(({value, icon: Icon, label}) => (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => handleColumnChange(value)}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  columns === value
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {editMode && (
        <p className="text-sm text-stone-500 mb-4 flex items-center gap-1.5">
          <GripVertical size={14} className="shrink-0" />
          Перетащите блок в нужную колонку или в конец колонки через слот. Раскладка сохраняется автоматически.
        </p>
      )}

      <div className={GRID_CLASS[columns]}>
        {activeColumns.map((column) => (
          <div
            key={column}
            className="flex flex-col gap-4"
            onDragOver={editMode ? (e) => handleDragOver(e, column, layout[column].length) : undefined}
          >
            {layout[column].map((id, index) => {
              const isDragging = dragItem?.id === id
              const isDropTarget = dropTarget?.column === column && dropTarget.index === index && dragItem?.id !== id

              return (
                <div
                  key={id}
                  draggable={editMode}
                  onDragStart={editMode ? () => handleDragStart(id, column, index) : undefined}
                  onDragOver={editMode ? (e) => handleDragOver(e, column, index) : undefined}
                  onDrop={editMode ? () => handleDrop(column, index) : undefined}
                  onDragEnd={editMode ? handleDragEnd : undefined}
                  className={[
                    'relative transition-all duration-150',
                    editMode ? 'cursor-grab active:cursor-grabbing' : '',
                    isDragging ? 'opacity-30 scale-95' : '',
                    isDropTarget ? 'ring-2 ring-amber-400 ring-offset-2 rounded-lg' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {editMode && (
                    <div className="absolute top-3 right-3 z-10 bg-white/80 border border-stone-200 rounded p-1 text-stone-400 pointer-events-none">
                      <GripVertical size={16} />
                    </div>
                  )}
                  {renderBlock(id)}
                </div>
              )
            })}

            {editMode && (
              <div
                onDragOver={(e) => handleDragOver(e, column, layout[column].length)}
                onDrop={() => handleDrop(column, layout[column].length)}
                className={[
                  'h-9 rounded-lg border border-dashed transition-colors',
                  dropTarget?.column === column && dropTarget.index === layout[column].length
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-200 bg-transparent',
                ].join(' ')}
                title="Слот в конец колонки"
              />
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  )
}

