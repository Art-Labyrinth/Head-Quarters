import React from 'react'
import {ChevronDown} from 'lucide-react'

const TECHNICAL_SERIES = '00 — 09'

const SALES_SERIES = [
  { period: 'Апрель', websiteSeries: '97', cashSeries: '10' },
  { period: '1 Мая - 15 Мая', websiteSeries: '98', cashSeries: '11' },
  { period: '16 Мая - 15 Июня', websiteSeries: '99', cashSeries: '12' },
]

export const SeriesInfo: React.FC = () => {
  return (
    <details open className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Серии билетов</h2>
          <p className="text-sm text-stone-500">Справочник по диапазонам серий.</p>
        </div>
        <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
      </summary>

      <div className="mt-4 space-y-4 text-sm text-stone-700">
        <div>
          <h3 className="font-semibold text-stone-800 mb-1">Технические серии ({TECHNICAL_SERIES})</h3>
          <p>Зарезервированы под технические нужды: пробные билеты, образцы и прочее.</p>
        </div>

        <div>
          <h3 className="font-semibold text-stone-800 mb-2">Серии продаж</h3>
          <p className="mb-2 text-stone-500">Сопоставление серий по периодам: сайт + наличные.</p>
          <table className="text-sm border border-stone-200 rounded overflow-hidden">
            <thead>
              <tr className="bg-stone-100">
                <th className="py-1.5 px-4 text-left font-medium text-stone-600">Период</th>
                <th className="py-1.5 px-4 text-left font-medium text-stone-600">Сайт</th>
                <th className="py-1.5 px-4 text-left font-medium text-stone-600">Наличные</th>
              </tr>
            </thead>
            <tbody>
              {SALES_SERIES.map(({period, websiteSeries, cashSeries}) => (
                <tr key={period} className="border-t border-stone-100">
                  <td className="py-1.5 px-4">{period}</td>
                  <td className="py-1.5 px-4 font-mono font-semibold text-stone-800">{websiteSeries}</td>
                  <td className="py-1.5 px-4 font-mono font-semibold text-stone-800">{cashSeries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  )
}
