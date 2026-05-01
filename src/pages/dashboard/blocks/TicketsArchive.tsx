import React, {useState} from 'react'
import {ChevronDown} from 'lucide-react'
import {downloadExistingTickets} from '../../../entities/ticket/api.qr'
import {triggerFileDownload} from './utils'

type TicketArchivePayload = {
  ids?: number[]
  ticket_ids?: string[]
  range_from?: number
  range_to?: number
  for_print?: boolean
}

type Props = {
  accessToken?: string
}

export const TicketsArchive: React.FC<Props> = ({accessToken}) => {
  const [idsInput, setIdsInput] = useState('')
  const [ticketIdsInput, setTicketIdsInput] = useState('')
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [forPrint, setForPrint] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()

    const hasIds = idsInput.trim().length > 0
    const hasTicketIds = ticketIdsInput.trim().length > 0
    const hasRange = rangeFrom !== '' || rangeTo !== ''
    const selectedVariantCount = [hasIds, hasTicketIds, hasRange].filter(Boolean).length

    if (selectedVariantCount !== 1) {
      alert('Use exactly one option: ids, ticket IDs, or range.')
      return
    }

    const payload: TicketArchivePayload = {}

    if (hasIds) {
      const ids = idsInput
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .map(Number)

      if (!ids.length || ids.some(Number.isNaN)) {
        alert('IDs must be a comma-separated list of numbers.')
        return
      }

      payload.ids = ids
    }

    if (hasTicketIds) {
      const ticketIds = ticketIdsInput
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)

      if (!ticketIds.length) {
        alert('Ticket IDs must be a comma-separated list of values.')
        return
      }

      payload.ticket_ids = ticketIds
    }

    if (hasRange) {
      if (rangeFrom !== '') payload.range_from = Number(rangeFrom)
      if (rangeTo !== '') payload.range_to = Number(rangeTo)

      if (
        (payload.range_from !== undefined && Number.isNaN(payload.range_from)) ||
        (payload.range_to !== undefined && Number.isNaN(payload.range_to))
      ) {
        alert('Range values must be numbers.')
        return
      }
    }

    if (forPrint) {
      payload.for_print = true
    }

    setLoading(true)

    try {
      const result = await downloadExistingTickets(payload, accessToken)

      if ('blob' in result && 'filename' in result) {
        triggerFileDownload(result.blob, result.filename)
      } else {
        throw result
      }
    } catch (err) {
      console.error(err)
      alert('Archive download error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Debug: Existing Tickets Archive</h2>
          <p className="text-sm text-stone-500">Download already created tickets by one filter only.</p>
        </div>
        <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
      </summary>

      <form className="flex flex-col gap-3 mt-4" onSubmit={handleDownload}>
        <p className="text-sm text-stone-500">
          Fill only one variant: <strong>ids</strong>, <strong>ticket IDs</strong>, or <strong>range</strong>.
        </p>

        <div className="flex gap-2 items-center">
          <label className="w-24 font-medium">IDs:</label>
          <input
            type="text"
            value={idsInput}
            onChange={(e) => setIdsInput(e.target.value)}
            placeholder="1, 2, 3"
            className="border rounded px-2 py-1 flex-1"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="w-24 font-medium">Ticket IDs:</label>
          <input
            type="text"
            value={ticketIdsInput}
            onChange={(e) => setTicketIdsInput(e.target.value)}
            placeholder="GST-10-1, GST-10-2"
            className="border rounded px-2 py-1 flex-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-2 items-center">
            <label className="w-24 font-medium">From:</label>
            <input
              type="number"
              min={1}
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              placeholder="100"
              className="border rounded px-2 py-1 flex-1"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="w-24 font-medium">To:</label>
            <input
              type="number"
              min={1}
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              placeholder="200"
              className="border rounded px-2 py-1 flex-1"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={forPrint}
            onChange={(e) => setForPrint(e.target.checked)}
          />
          For print
        </label>

        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Downloading...' : 'Download Existing Tickets'}
        </button>
      </form>
    </details>
  )
}
