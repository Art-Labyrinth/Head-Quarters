import React, {useState} from 'react'
import {ChevronDown} from 'lucide-react'
import {downloadQRCodes} from '../../../entities/ticket/api.qr'
import {triggerFileDownload} from './utils'

type Props = {
  accessToken?: string
}

export const QrCodeGeneration: React.FC<Props> = ({accessToken}) => {
  const [prefix, setPrefix] = useState('GST')
  const [part, setPart] = useState(10)
  const [quantity, setQuantity] = useState(10)
  const [loading, setLoading] = useState(false)

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await downloadQRCodes({prefix, part, quantity}, accessToken)

      if ('blob' in result && 'filename' in result) {
        triggerFileDownload(result.blob, result.filename)
      } else {
        throw result
      }
    } catch (err) {
      console.error(err)
      alert('File download error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="bg-stone-50 border border-stone-200 rounded-lg p-4 group">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Debug: QR Code Generation</h2>
          <p className="text-sm text-stone-500">Generate a new QR archive.</p>
        </div>
        <ChevronDown className="text-stone-500 transition-transform group-open:rotate-180" size={18} />
      </summary>

      <form className="flex flex-col gap-3 mt-4" onSubmit={handleDownload}>
        <div className="flex gap-2 items-center">
          <label className="w-24 font-medium">Prefix:</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            required
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="w-24 font-medium">Part:</label>
          <input
            type="number"
            value={part}
            min={1}
            onChange={(e) => setPart(Number(e.target.value))}
            className="border rounded px-2 py-1 flex-1"
            required
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="w-24 font-medium">Quantity:</label>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded px-2 py-1 flex-1"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Downloading...' : 'Generate and Download'}
        </button>
      </form>
    </details>
  )
}
