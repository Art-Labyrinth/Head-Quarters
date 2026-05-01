import React, { useEffect, useState } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { getSalesStats, type SalesStatsData } from '../../../entities/dashboard'

export const SalesStats: React.FC = () => {
  const [data, setData] = useState<SalesStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await getSalesStats()

        if (response instanceof Error) {
          throw response
        }

        setData(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('SalesStats fetch error:', message, err)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <details open className="border border-stone-200 rounded-lg p-4">
        <summary className="font-semibold text-stone-900 cursor-pointer select-none">
          Статистика продаж
        </summary>
        <div className="mt-4 text-stone-500 text-sm">Загрузка...</div>
      </details>
    )
  }

  if (error || !data) {
    return (
      <details open className="border border-red-200 rounded-lg p-4 bg-red-50">
        <summary className="font-semibold text-stone-900 cursor-pointer select-none flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          Статистика продаж
        </summary>
        <div className="mt-4 text-red-700 text-sm">{error || 'Нет данных'}</div>
      </details>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'MDL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <details open className="border border-stone-200 rounded-lg p-4">
      <summary className="font-semibold text-stone-900 cursor-pointer select-none flex items-center justify-between">
        Статистика продаж
        <ChevronDown className="w-4 h-4" />
      </summary>

      <div className="mt-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <div className="text-xs text-stone-500 uppercase tracking-wide">Всего заказов</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{data.total_orders}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <div className="text-xs text-stone-500 uppercase tracking-wide">Сумма заказов</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(data.total_amount)}</div>
          </div>
          <div className="bg-stone-100 border border-stone-300 rounded p-3">
            <div className="text-xs text-stone-500 uppercase tracking-wide">Средний заказ</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(data.avg_order_amount)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-xs text-stone-500 uppercase tracking-wide">Конверсия в оплату</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{data.conversion_to_paid.toFixed(1)}%</div>
          </div>
        </div>

        {/* Paid Stats */}
        <div className="border-t border-stone-200 pt-4">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">Оплаченные заказы</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded p-3">
              <div className="text-xs text-stone-500 uppercase tracking-wide">Заказов</div>
              <div className="text-xl font-bold text-green-900 mt-1">{data.paid_orders}</div>
            </div>
            <div className="bg-green-50 rounded p-3">
              <div className="text-xs text-stone-500 uppercase tracking-wide">Сумма</div>
              <div className="text-xl font-bold text-green-900 mt-1">{formatCurrency(data.paid_amount)}</div>
            </div>
          </div>
        </div>

        {/* By Status */}
        <div className="border-t border-stone-200 pt-4">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">По статусам</h4>
          <div className="space-y-2">
            {data.by_status.map((status, idx) => (
              <div key={idx} className="border border-stone-200 rounded p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-stone-900 capitalize">{status.status}</div>
                  <div className="text-xs text-stone-500">{status.orders} заказов</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-stone-900">{formatCurrency(status.amount)}</div>
                  <div className="text-xs text-stone-500">({((status.amount / data.total_amount) * 100).toFixed(1)}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="border-t border-stone-200 pt-4 text-xs text-stone-500">
          Период: {formatDate(data.date_from)} — {formatDate(data.date_to)}
        </div>
      </div>
    </details>
  )
}
